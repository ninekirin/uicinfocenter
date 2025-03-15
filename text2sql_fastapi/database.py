from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from config import BaseConfig
from langchain_community.utilities import SQLDatabase

DATABASE_URI = BaseConfig.SQLALCHEMY_DATABASE_URI
engine = create_engine(DATABASE_URI)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
langchain_db = SQLDatabase.from_uri(BaseConfig.SQLALCHEMY_DATABASE_URI)