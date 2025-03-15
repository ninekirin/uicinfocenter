# -*- encoding: utf-8 -*-

from . import db
from .base import Base
from .course import Course


class Section(Base):

    __tablename__ = "section"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True, unique=True)

    course_id = db.Column(db.Integer, db.ForeignKey("course.id"), nullable=False)
    offer_semester = db.Column(
        db.Text, nullable=True
    )  # 2023-2024 Semester 1, 2023-2024 Semester 2, 2023-2024 Summer, 2023-2024 HKBU Summer Session, ...
    section_number = db.Column(db.String(255), nullable=False)  # 1001
    classroom = db.Column(db.String(255), nullable=True)  # T29-201, T8-307
    schedule = db.Column(
        db.String(255), nullable=True
    )  # Mon 10:00-11:50, Wed 10:00-11:50
    hours = db.Column(db.Integer, nullable=True)  # 3, 2, 1
    remarks = db.Column(
        db.Text, nullable=True
    )  # Y1&Y2&Y3&Y4, same schedule (1001) and (1002)
    teachers = db.Column(db.Text, nullable=True)  # Dr. Tao TANG & Dr. Weijia JIA

    def __init__(
        self,
        id,
        course_id,
        offer_semester,
        section_number,
        classroom,
        schedule,
        hours,
        remarks,
        teachers,
    ):
        super(Section, self).__init__()
        self.id = id
        self.course_id = course_id
        self.offer_semester = offer_semester
        self.section_number = section_number
        self.classroom = classroom
        self.schedule = schedule
        self.hours = hours
        self.remarks = remarks
        self.teachers = teachers

    def to_dict(self):
        return {
            "id": self.id,
            "course_id": self.course_id,
            "course_code": Course.get_course_by_id(self.course_id).course_code,
            "course_name": Course.get_course_by_id(self.course_id).name_en,
            "offer_semester": self.offer_semester,
            "section_number": self.section_number,
            "classroom": self.classroom,
            "schedule": self.schedule,
            "hours": self.hours,
            "remarks": self.remarks,
            "teachers": self.teachers,
        }

    @classmethod
    def get_section_by_id(cls, section_id):
        return cls.query.filter_by(id=section_id).first()

    @classmethod
    def get_sections_by_course_id(cls, course_id):
        return cls.query.filter_by(course_id=course_id).all()

    @classmethod
    def get_sections_by_course_id_paginated(cls, course_id, page, per_page):
        result = cls.query.filter_by(course_id=course_id).paginate(
            page=page, per_page=per_page, error_out=False
        )
        return result.items, result.total

    @classmethod
    def get_sections_by_course_code(cls, course_code):
        course = Course.get_course_by_code(course_code)
        if course:
            return cls.query.filter_by(course_id=course.id).all()
        return []

    @classmethod
    def get_sections_by_course_code_paginated(cls, course_code, page, per_page):
        course = Course.get_course_by_code(course_code)
        if course:
            result = cls.query.filter_by(course_id=course.id).paginate(
                page=page, per_page=per_page, error_out=False
            )
            return result.items, result.total
        return [], 0

    @classmethod
    def get_sections_by_keyword_paginated(cls, keyword, page, per_page):
        # 根据 course_name, course_code, section_number, classroom, schedule, hours, remarks, teachers 进行模糊查询
        result = (
            cls.query.join(Course, Course.id == cls.course_id)
            .filter(
                Course.name_en.ilike(f"%{keyword}%")
                | Course.course_code.ilike(f"%{keyword}%")
                | cls.classroom.ilike(f"%{keyword}%")
                | cls.teachers.ilike(f"%{keyword}%")
            )
            .paginate(page=page, per_page=per_page, error_out=False)
        )
        return result.items, result.total

    @classmethod
    def get_all_sections_paginated(cls, page, per_page):
        result = cls.query.paginate(page=page, per_page=per_page, error_out=False)
        return result.items, result.total

    @classmethod
    def add_section(
        cls,
        course_id,
        offer_semester,
        section_number,
        classroom,
        schedule,
        hours,
        remarks,
        teachers,
    ):
        section = cls(
            id=None,
            course_id=course_id,
            offer_semester=offer_semester,
            section_number=section_number,
            classroom=classroom,
            schedule=schedule,
            hours=hours,
            remarks=remarks,
            teachers=teachers,
        )
        cls.save(section)
        return section

    @classmethod
    def delete_section(cls, section_id):
        section = cls.query.filter_by(id=section_id).first()
        if section:
            cls.delete(section)
            return True
        return False

    @classmethod
    def update_section(
        cls,
        section_id,
        course_id,
        offer_semester,
        section_number,
        classroom,
        schedule,
        hours,
        remarks,
        teachers,
    ):
        section = cls.query.filter_by(id=section_id).first()
        if section:
            section.course_id = course_id
            section.offer_semester = offer_semester
            section.section_number = section_number
            section.classroom = classroom
            section.schedule = schedule
            section.hours = hours
            section.remarks = remarks
            section.teachers = teachers
            cls.save(section)
            return section.to_dict()
        return None
