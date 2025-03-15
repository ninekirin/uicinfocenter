import os

class BaseConfig:
    USE_SQLITE = False
    BASE_DIR = os.path.dirname(os.path.realpath(__file__))

    if USE_SQLITE:
        SQLALCHEMY_DATABASE_URI = "sqlite:///" + os.path.join(
            BASE_DIR, "../backend/core/uicinfocenter.db"
        )
    else:
        HOSTNAME = os.getenv("MYSQLHOST", "mariadb")
        PORT = os.getenv("MYSQLPORT", "3306")
        DATABASE = os.getenv("MYSQLDATABASE", "uicinfocenter")
        USERNAME = os.getenv("MYSQLUSER_TEXT2SQL", "uicinfocenter_text2sql")
        PASSWORD = os.getenv("MYSQLPASSWORD_TEXT2SQL", "text2sql_password")
        CHARSET = os.getenv("MYSQLCHARSET", "utf8mb4")
        SQLALCHEMY_DATABASE_URI = "mysql+pymysql://{}:{}@{}:{}/{}?charset={}".format(
            USERNAME, PASSWORD, HOSTNAME, PORT, DATABASE, CHARSET
        )

    CHATGPT_API_BASE = os.getenv("CHATGPT_API_BASE", "https://api.gptapi.us/v1")
    CHATGPT_API_KEY = os.getenv("CHATGPT_API_KEY", "sk-redacted")
    CHATGPT_API_MODEL = os.getenv("CHATGPT_API_MODEL", "gpt-4o")

    SILICONFLOW_API_BASE = os.getenv("SILICONFLOW_API_BASE", "https://api.siliconflow.cn/v1")
    SILICONFLOW_API_KEY = os.getenv("SILICONFLOW_API_KEY", "sk-redacted")
    SILICONFLOW_API_MODEL = os.getenv("SILICONFLOW_API_MODEL", "Qwen/Qwen2.5-Coder-32B-Instruct")