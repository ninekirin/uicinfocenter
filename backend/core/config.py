# -*- encoding: utf-8 -*-

import os
from datetime import timedelta


class BaseConfig():

    USE_SQLITE = False
    BASE_DIR = os.path.dirname(os.path.realpath(__file__))

    if USE_SQLITE:
        SQLALCHEMY_DATABASE_URI = 'sqlite:///' + os.path.join(BASE_DIR, 'uicinfocenter.db')
    else:
        HOSTNAME = os.getenv('MYSQLHOST', 'mariadb')
        PORT = os.getenv('MYSQLPORT', '3306')
        DATABASE = os.getenv('MYSQLDATABASE', 'uicinfocenter')
        USERNAME = os.getenv('MYSQLUSER', 'uicinfocenter')
        PASSWORD = os.getenv('MYSQLPASSWORD', 'backend_password')
        CHARSET = os.getenv('MYSQLCHARSET', 'utf8mb4')
        SQLALCHEMY_DATABASE_URI = 'mysql+pymysql://{}:{}@{}:{}/{}?charset={}'.format(
            USERNAME, PASSWORD, HOSTNAME, PORT, DATABASE, CHARSET)

    SQLALCHEMY_TRACK_MODIFICATIONS = False

    PAGE_SIZE = 10
    
    ALLOW_GUEST_REGISTER = True

    ADMIN_PASSWORD = os.getenv('ADMIN_PASSWORD', 'admin_password')
    SECRET_KEY = os.getenv('SECRET_KEY', 'your_secret_key')
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'jwt_secret_key')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=48)

    JWT_REGISTRATION_TOKEN_SECRET_KEY = os.getenv('JWT_REGISTRATION_TOKEN_SECRET_KEY', 'jwt_registration_token_secret_key')
    JWT_REGISTRATION_TOKEN_EXPIRES = timedelta(hours=1)

    ALLOWED_EXTENSIONS = set(['pdf', 'csv', 'xlsx', 'csv'])
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024

    MAIL_SERVER = os.getenv('MAIL_SERVER', 'smtp.example.com')
    MAIL_PORT = os.getenv('MAIL_PORT', 587)
    MAIL_USE_TLS = True
    MAIL_USE_SSL = False
    MAIL_USERNAME = os.getenv('MAIL_USERNAME', 'no-reply@example.com')
    MAIL_PASSWORD = os.getenv('MAIL_PASSWORD', 'mail_password')
    
    DIFY_API_BASE = os.getenv('DIFY_API_BASE', 'http://host.docker.internal:3439/v1')
    DIFY_APP_API_KEY = os.getenv('DIFY_APP_API_KEY', 'app-redacted')
    DIFY_DATASET_API_KEY = os.getenv('DIFY_DATASET_API_KEY', 'dataset-redacted')

    # LLM API Configuration
    CHATGPT_API_BASE = os.getenv('CHATGPT_API_BASE', 'https://api.gptapi.us/v1')
    CHATGPT_API_KEY = os.getenv('CHATGPT_API_KEY', 'sk-redacted')
    CHATGPT_API_MODEL = os.getenv('CHATGPT_API_MODEL', 'gpt-4o')

    SILICONFLOW_API_BASE = os.getenv('SILICONFLOW_API_BASE', 'https://api.siliconflow.cn/v1')
    SILICONFLOW_API_KEY = os.getenv('SILICONFLOW_API_KEY', 'sk-redacted')
    SILICONFLOW_API_MODEL = os.getenv('SILICONFLOW_API_MODEL', 'Qwen/Qwen2.5-Coder-32B-Instruct')