# -*- encoding: utf-8 -*-

from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

from .course import Course
from .section import Section
from .teacher import Teacher, TeacherInfo
from .jwt_token_blocklist import JWTTokenBlocklist
from .forum_thread import ForumThread
from .forum_reply import ForumReply
from .user import User
from .navigator import Category, WebAddress