from langchain_core.prompts import PromptTemplate


class TeacherPrompt:

    teacher_raw_prompt_text = """
### Task:
Given an input question "{question}", generate syntactically correct and precise enough {dialect} query that retrieve specific fields from these tables. 

### Requirements:
- Always use markdown symbols "```sql" and "```" to enclose the SQL query.
- Always use the relationships between the `teacher` and `teacher_info` tables to enhance your queries. "FROM teacher t JOIN teacher_info ti ON t.id = ti.teacher_id"
- In the SELECT statement, avoid using `*`; instead, specify the exact fields needed for the results. Avoid using inexistent fields.
- Always include the `name` field from the `teacher` table to identify the teacher.
- Ensure that any `id` columns are aliased to avoid duplication in the result set, for example: `t.id AS teacher_id` and `ti.id AS info_id`.
- If the user needs specific results, use the `LIMIT` clause to limit the number of results to {top_k}. If the user needs as many results as possible, no limit is needed.
- If the name provided contains multiple words, like "Raymond Lee", query for the teacher's name with separated words, like "Raymond" and "Lee". For example, `WHERE (t.name LIKE "%raymond%" AND t.name LIKE "%lee%")`.

### Table Structures and Field Meanings:
1. **teacher** t
- `id`: Unique identifier for each teacher
- `name`: Teacher's name.
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

### Example:
- Question: What's the timetable for Raymond Lee?
- SQLQuery: SELECT DISTINCT t.id AS teacher_id, ti.id AS info_id, t.name, t.office_room, ti.timetable_name, ti.timetable_url FROM teacher t JOIN teacher_info ti ON t.id = ti.teacher_id WHERE (t.name LIKE "%raymond%" AND t.name LIKE "%lee%") LIMIT 5;

### Start:
- Question: {question}
- SQLQuery: 
"""

    teacher_timetable_prompt_text = """
### Task:
Given an input question "{question}", generate a syntactically correct and precise enough {dialect} query that retrieves the timetable URL for a specific teacher. Please ignore user requests other than to view timetable.

### Requirements:
- Always use markdown symbols "```sql" and "```" to enclose the SQL query.
- Use the relationships between the `teacher` and `teacher_info` tables to enhance your queries.
- In the SELECT statement, avoid using `*`; instead, specify the exact field names needed for the results, including `timetable_url`.
- Ensure that any `id` columns are aliased to avoid duplication in the result set, for example: `t.id AS teacher_id` and `ti.id AS info_id`.
- If the name provided contains multiple words, like "Raymond Lee", query for the teacher's name with separated words, like "Raymond" and "Lee". For example, `WHERE (t.name LIKE "%raymond%" AND t.name LIKE "%lee%")`.

### Table Structures and Field Meanings:
1. **teacher**
- `id`: Unique identifier for each teacher (INTEGER, NOT NULL)
- `name`: Name of the teacher (VARCHAR(255))
- Other fields...
2. **teacher_info**
- `id`: Unique identifier for each teacher information record (INTEGER, NOT NULL)
- `teacher_id`: Foreign key linking to the `teacher` table (INTEGER, NOT NULL)
- `timetable_url`: URL link to the timetable (VARCHAR(255))
- Other fields...

### Example:
- Question: 查询raymond lee的timetable
- SQLQuery: SELECT t.id AS teacher_id, ti.id AS info_id, t.name, t.name, ti.timetable_url FROM teacher t JOIN teacher_info ti ON t.id = ti.teacher_id WHERE (t.name LIKE "%raymond%" AND t.name LIKE "%lee%") AND ti.lang = "cn" LIMIT 5;

### Start:
- Question: {question}
- SQLQuery: 
"""

    teacher_answer_prompt_text = """
- For content containing images, use the markdown embed image expression.
Given the following user question: {question}
Corresponding SQL query: {query}
SQL Result: {result}
Answer to the question: 
"""

    teacher_timetable_answer_prompt_text = """
Given the following user question: {question}
Given the teacher's timetable image, try to answer the user's question.
"""

    teacher_raw_prompt = PromptTemplate.from_template(teacher_raw_prompt_text)
    teacher_timetable_prompt = PromptTemplate.from_template(
        teacher_timetable_prompt_text
    )
    teacher_answer_prompt = PromptTemplate.from_template(teacher_answer_prompt_text)
    teacher_timetable_answer_prompt = PromptTemplate.from_template(
        teacher_timetable_answer_prompt_text
    )
