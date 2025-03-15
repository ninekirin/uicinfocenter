from fastapi import FastAPI
from routes import teacher_router, course_router, structured_router


app = FastAPI(
    title="Text2SQL API",
    description="An API to interact with the database using natural language",
    version="0.1",
    servers=[
        {"url": "http://172.17.0.1:7788/text2sql"}, # for docker-compose internal network, linux
        {"url": "http://host.docker.internal:7788/text2sql"}, # for docker-compose internal network, win&mac debug
        {"url": "http://text2sql-fastapi:3278/text2sql"}, # for internal network
        {"url": "http://localhost:3278/text2sql"}, # for local development
        {"url": "http://127.0.0.1:3278/text2sql"}, # for local development
        {"url": "http://172.16.179.179/text2sql"}, # for uic intranet
        {"url": "http://192.168.192.10/text2sql"}, # for zerotier intranet
        {"url": "http://100.117.117.106/text2sql"}, # for tailscale intranet
    ],
    root_path="/text2sql",
    root_path_in_servers=False,
)

app.include_router(teacher_router, prefix="/teacher", tags=["teacher"])
app.include_router(course_router, prefix="/course", tags=["course"])
app.include_router(structured_router, prefix="/structured", tags=["structured"])
