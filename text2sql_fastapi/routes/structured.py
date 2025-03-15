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
    UnifiedResponse,
)
from prompts import StructuredPrompt
from utils import strip, process_response
from llm import llm

structured_router = APIRouter()

@structured_router.post("/structured", response_model=UnifiedResponse)
async def get_structured_response(question: Question):
    question_text = question.question

    print(question_text)
    
    # Create execution chain
    sql_tool = QuerySQLDataBaseTool(db=langchain_db)
    
    write_query_chain = (
        StructuredPrompt.unified_raw_prompt 
        | llm.bind(stop=["\nSQLQuery:"]) 
        | StrOutputParser() 
        | strip 
        | process_response
    )
    
    execute_query = RunnablePassthrough.assign(query=write_query_chain).assign(
        result=itemgetter("query") | sql_tool
    )
    
    try:
        query_text = write_query_chain.invoke({
            "question": question_text,
            "dialect": langchain_db.dialect,
            "top_k": 5
        })
        print(query_text)
        
        results = polars.read_database(query_text, engine)
        print(results)
        
        if results.is_empty():
            return UnifiedResponse(
                success=False,
                code="NO_RESULTS_FOUND",
                message="No results found",
                data=None
            )
            
        # Format results
        results_str = "Question: " + question_text + "\n\nSQL Query Results: " + "\n\n".join([
            "\n".join([f"{k}: {v}" for k, v in item.items()])
            for item in results.to_dicts()
        ])
        
        return UnifiedResponse(
            success=True,
            code="RESULTS_FOUND",
            message="Query executed successfully",
            data=results_str
        )
        
    except Exception as e:
        return UnifiedResponse(
            success=False,
            code="QUERY_ERROR",
            message=f"SQL execution error: {str(e)}",
            data=None
        )