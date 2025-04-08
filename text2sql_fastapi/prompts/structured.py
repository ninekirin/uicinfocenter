from langchain_core.prompts import PromptTemplate

class StructuredPrompt:

    unified_raw_prompt_text = """
### Task:
Generate precise {dialect} SQL queries from natural language questions about university courses, teachers, and their relationships.

### Core Requirements:
1. Output Format:
- Always use markdown symbols "```sql" and "```" to enclose the SQL query.

2. Table Relationships:
- Teacher data: JOIN teacher t WITH teacher_info ti ON t.id = ti.teacher_id
- Course data: JOIN course WITH section ON course.id = section.course_id
- DO NOT join teacher and course tables because they are not directly related, instead, use section.teachers
- Combined queries: Maintain proper relationships across all tables

3. Field Selection:
- For teachers: ALWAYS include t.name and relevant info fields
- For courses: ALWAYS include course.name_en and section.teachers
- Use explicit field names (never *) with table aliases
- Handle ID conflicts: t.id AS teacher_id, ti.id AS info_id

4. Name Handling:
- Chinese names: Split into components with AND/OR logic
  Example: "张三" → ('%张三%') OR ('%zhang%' AND '%san%')
- Pinyin names: Split syllables with AND logic
  Example: "wangxiaoming" → (section.teachers LIKE '%wang%' AND '%xiao%' AND '%ming%')
- English names: Full text search with proper wildcards

5. Query Optimization:
- Apply LIMIT {top_k} only when explicitly needed
- Use DISTINCT for join queries to avoid duplicates
- Maintain proper indexing through WHERE clause conditions
- If course name is not in English, translate it to English.
- UIC/BNBU is a higher education institution. Do not include this information in the queries.

### Table Schema:
1. **teacher** t
- `id`: Unique identifier for each teacher
- `name`: Teacher's name
- `email`: Teacher's email address
- `gender`: Gender of the teacher (M/F)
- `title`: Professional title (e.g., Prof., Dr.)
- `phone`: Contact phone number
- `phone_short`: Short form of the phone number
- `office_room`: Office location of the teacher
- `position`: Teacher's position (e.g., Lecturer, Head of Department)
- `photo_url`: URL link to the teacher's photo

2. **teacher_info** ti
- `id`: Unique identifier for each teacher information record
- `teacher_id`: Foreign key linking to the `teacher` table
- `timetable_name`: Teacher's timetable name (timetable aka office hours, consultation hours, schedule, available time)
- `timetable_url`: Teacher's timetable URL
- `admin_title`: Administrative title (e.g., Acting Department Head of DCCD)
- `academic_title`: Academic qualifications (e.g., Associate Professor, Dean)
- `academic`: Research area or academic interests
- `education`: Educational background
- `special_honor`: Any special honors or awards received

3. **course**
- `id`: Unique identifier for each course
- `course_code`: Course code (e.g. COMP1001, COMP2002)
- `name_en`: Name of the course
- `units`: Number of units for the course (e.g. 3)
- `curriculum_type`: Type of curriculum (e.g. ME, MR, FE)
- `elective_type`: Type of elective, e.g. ME: AI(Y3), ME: AI(Y4)
- `offering_faculty`: Department of faculty offering the course, only FST, FBM, FHSS, SCC, SGE are included
- `offering_programme`: Programme (major) offering the course, like CST, DS, AE
- `description`: Description of the course (What the course is about)
- `prerequisites`: Prerequisites course code(s) for the course

4. **section**
- `id`: Unique identifier for each section
- `course_id`: Identifier for the associated course
- `section_number`: Number identifying the section (e.g. 1001, 1002)
- `classroom`: Room where the class is held (e.g. T4-301)
- `schedule`: Schedule of the class (e.g. Mon 10:00; You can use LIKE to match the time, e.g. section.schedule LIKE "%Mon%" AND section.schedule LIKE "%10:00%";)
- `hours`: Number of hours for the class (e.g. 2)
- `remarks`: Additional notes or remarks
- `teachers`: Instructor(s) for the section (e.g. Dr. Raymond Shu Tak LEE)

### Examples:
- Question: Find courses taught by Prof. Wang Ming
- SQLQuery: SELECT DISTINCT course.name_en, section.teachers FROM course JOIN section ON course.id = section.course_id WHERE section.teachers LIKE '%Wang%' AND section.teachers LIKE '%Ming%';

- Question: What's the timetable for Li Hua?
- SQLQuery: SELECT DISTINCT t.id AS teacher_id, ti.id AS info_id, t.name, t.office_room, ti.timetable_name, ti.timetable_url FROM teacher t JOIN teacher_info ti ON t.id = ti.teacher_id WHERE (t.name LIKE "%Li%" AND t.name LIKE "%Hua%") LIMIT 5;

### Input:
- Question: {question}
- SQLQuery:
"""

    unified_raw_prompt = PromptTemplate.from_template(unified_raw_prompt_text)