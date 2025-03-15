# -*- encoding: utf-8 -*-

from . import db
from .base import Base

class Teacher(Base):

    __tablename__ = 'teacher'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True, unique=True)

    mis_id = db.Column(db.Integer, unique=True, nullable=True)  # 3
    name = db.Column(db.String(255), nullable=True)  # 汤涛
    name_en = db.Column(db.String(255), nullable=True)  # Tao TANG
    email = db.Column(db.String(255), unique=True, nullable=True)  # ttang@uic.edu.cn
    gender = db.Column(db.Enum('M', 'F'), nullable=True)  # 1 -> M, 2-> F
    title = db.Column(db.String(255), nullable=True)  # Mr., Ms., Dr., Prof.
    first_name = db.Column(db.String(255), nullable=True)  # Tao
    middle_name = db.Column(db.String(255), nullable=True)  # N/A
    last_name = db.Column(db.String(255), nullable=True)  # TANG
    username = db.Column(db.String(255), unique=True, nullable=True)  # ttang
    nationality = db.Column(db.String(255), nullable=True)  # Chinese (Hong Kong)
    phone = db.Column(db.String(255), nullable=True)  # 3620504
    phone_short = db.Column(db.String(255), nullable=True)  # 8504
    employee_number = db.Column(db.String(255), nullable=True)  # 200610078
    office_room = db.Column(db.String(255), nullable=True)  # T8-401-R7
    position = db.Column(db.String(255), nullable=True)  # Professor\Chief Student Affairs Officer
    photo_url = db.Column(db.String(255), nullable=True)  # /attachment/images/2023/09/09/image_1694246750_ob5RLbGP.jpeg
    info = db.relationship("TeacherInfo", backref="teacher", lazy=True, cascade="all, delete-orphan")

    def __init__(self, id, mis_id, name, name_en, email, gender, title, first_name, middle_name, last_name, username, nationality, phone, phone_short, employee_number, office_room, position, photo_url):
        self.id = id
        self.mis_id = mis_id
        self.name = name
        self.name_en = name_en
        self.email = email
        self.gender = gender # Copilot 卡了
        self.title = title
        self.first_name = first_name
        self.middle_name = middle_name
        self.last_name = last_name
        self.username = username
        self.nationality = nationality # Copilot 卡了
        self.phone = phone
        self.phone_short = phone_short
        self.employee_number = employee_number
        self.office_room = office_room
        self.position = position
        self.photo_url = photo_url

class TeacherInfo(Base):

    __tablename__ = 'teacher_info'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True, unique=True)

    teacher_id = db.Column(db.Integer, db.ForeignKey('teacher.id'), nullable=False)
    lang = db.Column(db.String(10), nullable=True)  # cn

    admin_title = db.Column(db.String(255), nullable=True)  # 社会工作硕士课程主任
    academic_title = db.Column(db.String(255), nullable=True)  # 教授
    academic = db.Column(db.Text(), nullable=True)  # 计算数学、\n数值分析、\n偏微分方程数值解
    education = db.Column(db.Text(), nullable=True)  # 英国利兹大学 数学 博士\n北京大学 数学 学士
    timetable_name = db.Column(db.String(255), nullable=True)  # N/A
    timetable_url = db.Column(db.String(255), nullable=True)  # N/A
    tutor_type = db.Column(db.String(255), nullable=True)  # N/A
    timetable_file_name = db.Column(db.String(255), nullable=True)  # N/A
    research_file_url = db.Column(db.String(255), nullable=True)  # N/A
    research_file_name = db.Column(db.String(255), nullable=True)  # N/A
    publications_file_url = db.Column(db.String(255), nullable=True)  # N/A
    publications_file_name = db.Column(db.String(255), nullable=True)  # N/A
    special_honor = db.Column(db.Text(), nullable=True)  # N/A

    def __init__(self, id, teacher_id, lang, admin_title, academic_title, academic, education, timetable_name, timetable_url, tutor_type, timetable_file_name, research_file_url, research_file_name, publications_file_url, publications_file_name, special_honor):
        self.id = id
        self.teacher_id = teacher_id
        self.lang = lang
        self.admin_title = admin_title
        self.academic_title = academic_title
        self.academic = academic
        self.education = education
        self.timetable_name = timetable_name
        self.timetable_url = timetable_url
        self.tutor_type = tutor_type
        self.timetable_file_name = timetable_file_name
        self.research_file_url = research_file_url
        self.research_file_name = research_file_name
        self.publications_file_url = publications_file_url
        self.publications_file_name = publications_file_name
        self.special_honor = special_honor