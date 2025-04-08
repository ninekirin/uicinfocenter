from langchain_core.prompts import PromptTemplate

class CoursePrompt:

    course_raw_prompt_text = """
### Task:
Convert natural language questions about courses and sections into precise {dialect} SQL queries.

### Core Requirements:
1. Output Format:
- Always use markdown symbols "```sql" and "```" to enclose the SQL query.
- Always include course.name_en and section.teachers in results to identify courses and teachers.
- If course name is not in English, translate it to English.
- Specify exact field names instead of using *
- UIC is a higher education institution. Do not include this information in the queries.

2. Name Handling:
- Chinese Course Names: Split and translate to English with OR conditions
  Example: "数据库" → WHERE (course.name_en LIKE '%Database%')
  
- Chinese Teacher Names: Split and translate to English with AND conditions
  Example: "张三" → WHERE (section.teachers LIKE '%Zhang%' AND section.teachers LIKE '%San%')
  
- Pinyin Names: Split into individual syllables
  Example: "wangxiaoming" → WHERE (section.teachers LIKE '%wang%' AND section.teachers LIKE '%xiao%' AND section.teachers LIKE '%ming%')
  
- Course Abbreviations: Use REGEXP for flexible matching
  Example: "OOP" → WHERE course.name_en REGEXP '(?i)O.* O.* P.*''

3. Query Structure:
- Use proper JOIN syntax for cross-table queries
- Apply LIMIT {top_k} only when explicitly needed
- Include essential table relationships (course.id = section.course_id)

### Table Structures and Field Meanings:
1. **course**
- `id`: Unique identifier for each course
- `course_code`: Course code (e.g. COMP1001, COMP2002)
- `name_en`: Name of the course
- `units`: Number of units for the course (e.g. 3)
- `curriculum_type`: Type of curriculum (e.g. ME, MR, FE)
- `elective_type`: Type of elective, e.g. ME: AI(Y3), ME: AI(Y4)
- `offering_faculty`: Department of faculty offering the course, like FST, FBM, FHSS, SCC
- `offering_programme`: Programme (major) offering the course, like CST, DS, AE
- `description`: Description of the course (What the course is about)
- `prerequisites`: Prerequisites course code(s) for the course

2. **section**
- `id`: Unique identifier for each section
- `course_id`: Identifier for the associated course
- `section_number`: Number identifying the section (e.g. 1001, 1002)
- `classroom`: Room where the class is held (e.g. T4-301)
- `schedule`: Schedule of the class (e.g. Mon 10:00; You can use LIKE to match the time, e.g. section.schedule LIKE "%Mon%" AND section.schedule LIKE "%10:00%";)
- `hours`: Number of hours for the class (e.g. 2)
- `remarks`: Additional notes or remarks
- `teachers`: Instructor(s) for the section (e.g. Dr. Raymond Shu Tak LEE)

### Example:
- Question: Find courses taught by Prof. Wang Ming
- SQLQuery: SELECT DISTINCT course.name_en, section.teachers FROM course JOIN section ON course.id = section.course_id WHERE section.teachers LIKE '%Wang%' AND section.teachers LIKE '%Ming%';

- Question: Find courses with the course code "COMP3003"
- SQLQuery: SELECT DISTINCT course.name_en, section.teachers FROM course JOIN section ON course.id = section.course_id WHERE course.course_code = 'COMP3003';

- Question: What does the course Computer Organisation cover?
- SQLQuery: SELECT DISTINCT course.name_en, course.description FROM course JOIN section ON course.id = section.course_id WHERE course.name_en LIKE '%Computer Organisation%';

### Input:
- Question: {question}
- SQLQuery: 
"""

    course_answer_prompt_text = """
- For content containing images, use the markdown embed image expression.
Given the following user question: {question}
Corresponding SQL query: {query}
SQL Result: {result}
Answer to the question: 
"""

    course_raw_prompt = PromptTemplate.from_template(course_raw_prompt_text)
    course_answer_prompt = PromptTemplate.from_template(course_answer_prompt_text)
