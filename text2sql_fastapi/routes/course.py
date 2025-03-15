from operator import itemgetter
from fastapi import APIRouter

from langchain_core.runnables import (
    chain,
    RunnableParallel,
    RunnablePassthrough,
)  # 可运行的链
from langchain_core.output_parsers import StrOutputParser  # 输出解析器
from langchain_community.tools.sql_database.tool import QuerySQLDataBaseTool
from langchain.globals import set_debug

# set_debug(True)

import polars

from database import engine, langchain_db
from schemas import (
    Question,
    CourseJSON,
    CourseStructured,
    CourseAnswer,
)
from prompts import CoursePrompt
from utils import strip, process_response
from llm import llm

course_router = APIRouter()

@course_router.post("/json", response_model=CourseJSON)
async def GetCourseJSON(question: Question):
    question_text = question.question

    print(question_text)

    # Step 1: 定义 PromptTemplate 来生成 SQL 查询
    course_raw_prompt = CoursePrompt.course_raw_prompt

    # Step 2: 创建一个执行 SQL 的工具
    sql_tool = QuerySQLDataBaseTool(db=langchain_db)

    # Step 3: 创建 Chain
    write_query_chain = (
        course_raw_prompt | llm.bind(stop=["\nSQLQuery:"]) | StrOutputParser() | strip | process_response
    )

    # Step 4: 执行 Chain (optional)
    execute_query = RunnablePassthrough.assign(query=write_query_chain).assign(
        result=itemgetter("query") | sql_tool
    )

    query_text = write_query_chain.invoke(
        {"question": question_text, "dialect": langchain_db.dialect, "top_k": 5}
    )

    print(query_text)

    try:
        results = polars.read_database(query_text, engine)
    except Exception as e:
        return {
            "success": False,
            "code": "ERROR",
            "message": "SQL Query Error.",
            "data": [],
        }

    print(results)
    if results.is_empty():
        return {
            "success": False,
            "code": "NO_RESULTS_FOUND",
            "message": "No results found.",
            "data": [],
        }

    # 对于可能的每一条数据，将其转换为字典，然后将其添加到列表中
    results_dictlist = results.to_dicts()
    # print(results_dictlist)

    return {
        "success": True,
        "code": "RESULTS_FOUND",
        "message": "Results found.",
        "data": results_dictlist,
    }


@course_router.post("/structured", response_model=CourseStructured)
async def GetCourseStructured(question: Question):
    question_text = question.question

    print(question_text)

    # Step 1: 定义 PromptTemplate 来生成 SQL 查询
    course_raw_prompt = CoursePrompt.course_raw_prompt

    # Step 2: 创建一个执行 SQL 的工具
    sql_tool = QuerySQLDataBaseTool(db=langchain_db)

    # Step 3: 创建 Chain
    write_query_chain = (
        course_raw_prompt | llm.bind(stop=["\nSQLQuery:"]) | StrOutputParser() | strip | process_response
    )

    # Step 4: 执行 Chain (optional)
    execute_query = RunnablePassthrough.assign(query=write_query_chain).assign(
        result=itemgetter("query") | sql_tool
    )

    try:
        query_text = write_query_chain.invoke(
            {"question": question_text, "dialect": langchain_db.dialect}
        )
        print(query_text)

        results = polars.read_database(query_text, engine)
        print(results)
    except Exception as e:
        return {
            "success": False,
            "code": "ERROR",
            "message": "SQL Query Error.",
            "data": "SQL Query Error.",
        }

    if results.is_empty():
        return {
            "success": False,
            "code": "NO_RESULTS_FOUND",
            "message": "No results found.",
            "data": "no results found",
        }

    # 对于可能的每一条数据，将其转换为字典，然后将其添加到列表中
    results_dictlist = results.to_dicts()

    # 将其转换为<key, value>形式的字符串
    results_str = ""
    for result in results_dictlist:
        for key, value in result.items():
            results_str += f"{key}: {value}\n"
        results_str += "\n"

    return {
        "success": True,
        "code": "RESULTS_FOUND",
        "message": "Results found.",
        "data": results_str,
    }


@course_router.post("/answer", response_model=CourseAnswer)
async def GetCourseAnswer(question: Question):
    question_text = question.question

    # Step 1: 定义 PromptTemplate 来生成 SQL 查询
    course_raw_prompt = CoursePrompt.course_raw_prompt

    # Step 2: 创建一个执行 SQL 的工具
    sql_tool = QuerySQLDataBaseTool(db=langchain_db)

    # Step 3: 创建查询 Chain
    write_query_chain = (
        course_raw_prompt | llm.bind(stop=["\nSQLQuery:"]) | StrOutputParser() | strip | process_response
    )

    # Step 4: 数据库查询操作
    execute_query = QuerySQLDataBaseTool(db=langchain_db)

    # Step 5: 定义回答链
    answer_chain = CoursePrompt.course_answer_prompt | llm | StrOutputParser()

    # Step 6: 结果链
    get_answer = (
        RunnablePassthrough.assign(query=write_query_chain).assign(
            result=itemgetter("query") | execute_query
        )
        | answer_chain
    )

    answer_text = get_answer.invoke(
        {"question": question_text, "dialect": langchain_db.dialect, "top_k": 5}
    )

    return {
        "success": True,
        "code": "ANSWER_FOUND",
        "message": "Answer found.",
        "data": answer_text,
    }
