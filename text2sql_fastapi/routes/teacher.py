from operator import itemgetter
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse, FileResponse, Response
from typing import Optional
from sqlalchemy import text

from langchain_core.runnables import (
    chain,
    RunnableParallel,
    RunnablePassthrough,
)  # 可运行的链
from langchain_core.messages import HumanMessage
from langchain_core.output_parsers import StrOutputParser  # 输出解析器
from langchain_community.tools.sql_database.tool import QuerySQLDataBaseTool
from langchain_community.agent_toolkits import create_sql_agent

from langchain.globals import set_debug

# set_debug(True)

import polars
import pandas as pd  # For handling CSV
import requests

from database import SessionLocal, engine, langchain_db
from schemas import (
    Question,
    TeacherJSON,
    TeacherStructured,
    TeacherTimetableURL,
    TeacherAnswer,
)
from prompts import TeacherPrompt
from utils import strip, process_response, pdf_to_combined_image, image_to_vision_base64
from llm import llm

teacher_router = APIRouter()


@teacher_router.post("/json", response_model=TeacherJSON)
async def GetTeacherJSON(question: Question):
    question_text = question.question

    print(question_text)

    # Step 1: 定义 PromptTemplate 来生成 SQL 查询
    teacher_raw_prompt = TeacherPrompt.teacher_raw_prompt

    # Step 2: 创建一个执行 SQL 的工具
    sql_tool = QuerySQLDataBaseTool(db=langchain_db)

    # Step 3: 创建 Chain
    write_query_chain = (
        teacher_raw_prompt | llm.bind(stop=["\nSQLQuery:"]) | StrOutputParser() | strip | process_response
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

    return {
        "success": True,
        "code": "RESULTS_FOUND",
        "message": "Results found.",
        "data": results_dictlist,
    }



@teacher_router.post("/structured", response_model=TeacherStructured)
async def GetTeacherStructured(question: Question):
    question_text = question.question

    print(question_text)

    # Step 1: 定义 PromptTemplate 来生成 SQL 查询
    teacher_raw_prompt = TeacherPrompt.teacher_raw_prompt

    # Step 2: 创建一个执行 SQL 的工具
    sql_tool = QuerySQLDataBaseTool(db=langchain_db)

    # Step 3: 创建 Chain
    write_query_chain = (
        teacher_raw_prompt | llm.bind(stop=["\nSQLQuery:"]) | StrOutputParser() | strip | process_response
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
            "data": "SQL Query Error.",
        }

    print(results)
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


@teacher_router.post("/timetable/url", response_model=TeacherTimetableURL)
async def GetTeacherTimetableURL(question: Question):
    question_text = question.question

    print(question_text)

    # Step 1: 定义 PromptTemplate 来生成 SQL 查询
    teacher_raw_prompt = TeacherPrompt.teacher_raw_prompt

    # Step 2: 创建一个执行 SQL 的工具
    sql_tool = QuerySQLDataBaseTool(db=langchain_db)

    # Step 3: 创建 Chain
    write_query_chain = (
        TeacherPrompt.teacher_timetable_prompt
        | llm.bind(stop=["\nSQLQuery:"])
        | StrOutputParser()
        | strip | process_response
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
            "data": "",
        }

    # 对于可能的每一条数据，将其转换为字典，然后将其添加到列表中
    results_dictlist = results.to_dicts()

    # 提取第一条数据的timetable_url
    results_str = results_dictlist[0]["timetable_url"]

    return {
        "success": True,
        "code": "RESULTS_FOUND",
        "message": "Results found.",
        "data": results_str,
    }


@teacher_router.get(
    "/timetable/image",
    response_description="Get the teacher's timetable imagefile",
    responses={200: {"content": {"image/jpeg": {}}}},
    response_class=FileResponse,
)
async def GetTeacherTimetableImage(
    question: Optional[str] = None, name: Optional[str] = None
):
    if name:
        name_tokens = name.split(" ")

        # 使用参数化查询来防止 SQL 注入
        name_conditions = " AND ".join(
            [
                f"(t.name_en LIKE :name{str(i)} OR t.name LIKE :name{str(i)})"
                for i in range(len(name_tokens))
            ]
        )

        query_text = text(
            f"SELECT t.id AS teacher_id, ti.id AS info_id, t.name, t.name_en, ti.timetable_url "
            f"FROM teacher t JOIN teacher_info ti ON t.id = ti.teacher_id "
            f"WHERE ({name_conditions}) AND ti.lang = 'cn' LIMIT 5;"
        )

        params = {f"name{i}": f"%{token}%" for i, token in enumerate(name_tokens)}
        print(params)

        results = pd.read_sql_query(query_text, engine, params=params)
        print(results)

        if results.empty:
            raise HTTPException(status_code=404, detail="No results found.")

        # 提取第一条数据的timetable_url
        timetable_url = results["timetable_url"].iloc[0]
    else:
        question_text = question

        # Step 1: 定义 PromptTemplate 来生成 SQL 查询
        teacher_raw_prompt = TeacherPrompt.teacher_raw_prompt

        # Step 2: 创建一个执行 SQL 的工具
        sql_tool = QuerySQLDataBaseTool(db=langchain_db)

        # Step 3: 创建 Chain
        write_query_chain = (
            TeacherPrompt.teacher_timetable_prompt
            | llm.bind(stop=["\nSQLQuery:"])
            | StrOutputParser()
            | strip | process_response
        )

        # Step 4: 执行 Chain (optional)
        execute_query = RunnablePassthrough.assign(query=write_query_chain).assign(
            result=itemgetter("query") | sql_tool
        )

        query_text = write_query_chain.invoke(
            {"question": question_text, "dialect": langchain_db.dialect}
        )

        print(query_text)

        try:
            results = polars.read_database(query_text, engine)
            print(results)
            if results.is_empty():
                raise HTTPException(status_code=404, detail="No results found.")
        except Exception as e:
            raise HTTPException(status_code=404, detail="SQL Query Error.")

        # 提取第一条数据的timetable_url
        results_dictlist = results.to_dicts()
        timetable_url = results_dictlist[0]["timetable_url"]

    # 从 URL 下载 PDF 文件
    response = requests.get(timetable_url)
    if response.status_code != 200:
        raise HTTPException(status_code=404, detail="Failed to download the PDF.")

    # 将 PDF 转换为合并的图片
    img_byte_array = pdf_to_combined_image(response.content)

    return Response(content=img_byte_array.getvalue(), media_type="image/jpeg")


@teacher_router.post("/answer", response_model=TeacherAnswer)
async def GetTeacherAnswer(question: Question):
    question_text = question.question

    print(question_text)

    # Step 1: 定义 PromptTemplate 来生成 SQL 查询
    teacher_raw_prompt = TeacherPrompt.teacher_raw_prompt

    # Step 2: 创建一个执行 SQL 的工具
    sql_tool = QuerySQLDataBaseTool(db=langchain_db)

    # Step 3: 创建查询 Chain
    write_query_chain = (
        teacher_raw_prompt | llm.bind(stop=["\nSQLQuery:"]) | StrOutputParser() | strip | process_response
    )

    # Step 4: 数据库查询操作
    execute_query = QuerySQLDataBaseTool(db=langchain_db)

    # Step 5: 定义回答链
    answer_chain = TeacherPrompt.teacher_answer_prompt | llm | StrOutputParser()

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
