# -*- encoding: utf-8 -*-

from . import db
from .base import Base


class Course(Base):

    __tablename__ = "course"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True, unique=True)

    course_code = db.Column(db.String(255), unique=True, nullable=False)  # AIM3083
    name_en = db.Column(db.String(255), nullable=False)  # 2D Computer Animation
    name_cn = db.Column(db.String(255), nullable=True)  # 2D Computer Animation
    units = db.Column(db.Integer, nullable=False, default=3)  # 3 or 1
    curriculum_type = db.Column(
        db.String(255), nullable=False
    )  # MR, ME, FE, UC, GE2021, ...
    elective_type = db.Column(
        db.String(255), nullable=True
    )  # UCHL (Group 1), ME: ELLS(Y1), GTCU/GTSC/GTSU, ...
    offering_faculty = db.Column(
        db.String(255), nullable=True
    )  # FST, FBM, FHSS, SCC, SGE, ...
    offering_programme = db.Column(
        db.String(255), nullable=True
    )  # CST, STAT, ELC, CLC, ...
    description = db.Column(db.Text, nullable=True)
    prerequisites = db.Column(
        db.Text, nullable=True
    )  # (需曾修读过：ACCT2013 或者 需曾修读过：ACCT2053) 同时满足 不能修读过：ACCT4073 同时满足 P=2906

    sections = db.relationship(
        "Section", backref="course", lazy=True, cascade="all, delete-orphan"
    )  # One-to-Many relationship with Section

    def __init__(
        self,
        id,
        course_code,
        name_en,
        name_cn,
        units,
        curriculum_type,
        elective_type,
        offering_faculty,
        offering_programme,
        description,
        prerequisites,
    ):
        super(Course, self).__init__()
        self.id = id
        self.course_code = course_code
        self.name_en = name_en
        self.name_cn = name_cn
        self.units = units
        self.curriculum_type = curriculum_type
        self.elective_type = elective_type
        self.offering_faculty = offering_faculty
        self.offering_programme = offering_programme
        self.description = description
        self.prerequisites = prerequisites

    def to_dict(self):
        return {
            "id": self.id,
            "course_code": self.course_code,
            "name_en": self.name_en,
            "name_cn": self.name_cn,
            "units": self.units,
            "curriculum_type": self.curriculum_type,
            "elective_type": self.elective_type,
            "offering_faculty": self.offering_faculty,
            "offering_programme": self.offering_programme,
            "description": self.description,
            "prerequisites": self.prerequisites,
        }

    @classmethod
    def get_course_by_id(cls, course_id):
        return cls.query.filter_by(id=course_id).first()

    @classmethod
    def get_course_by_code(cls, course_code):
        # Capitalize the course code
        course_code = course_code.upper()
        return cls.query.filter_by(course_code=course_code).first()

    @classmethod
    def get_course_by_name_en(cls, name_en):
        return cls.query.filter_by(name_en=name_en).first()

    @classmethod
    def get_course_by_curriculum_type(cls, curriculum_type):
        return cls.query.filter_by(curriculum_type=curriculum_type).first()

    @classmethod
    def get_courses_by_name_or_code(cls, keyword):
        return cls.query.filter(
            cls.name_en.ilike(f"%{keyword}%") | cls.course_code.ilike(f"%{keyword}%")
        ).all()

    @classmethod
    def get_courses_by_name_or_code_paginated(cls, name_or_code, page, per_page):
        result = cls.query.filter(
            cls.name_en.ilike(f"%{name_or_code}%")
            | cls.course_code.ilike(f"%{name_or_code}%")
        ).paginate(page=page, per_page=per_page, error_out=False)
        return result.items, result.total

    @classmethod
    def get_courses_by_keyword_paginated(cls, keyword, page, per_page):
        from .section import Section

        result = (
            cls.query.join(Section, Section.course_id == cls.id)
            .filter(
                cls.name_en.ilike(f"%{keyword}%")
                | cls.course_code.ilike(f"%{keyword}%")
                | cls.offering_faculty.ilike(f"%{keyword}%")
                | cls.offering_programme.ilike(f"%{keyword}%")
                # | cls.description.ilike(f"%{keyword}%") # No course desc to avoid irrelevant results
                | Section.teachers.ilike(f"%{keyword}%")
                | Section.classroom.ilike(f"%{keyword}%")
            )
            .distinct()
            .paginate(page=page, per_page=per_page, error_out=False)
        )
        return result.items, result.total

    @classmethod
    def get_all_courses(cls):
        return cls.query.all()

    @classmethod
    def get_all_courses_paginated(cls, page, per_page):
        result = cls.query.paginate(page=page, per_page=per_page, error_out=False)
        return result.items, result.total

    @classmethod
    def get_courses_by_ids(cls, ids):
        return cls.query.filter(cls.id.in_(ids)).all()

    @classmethod
    def add_course(
        cls,
        course_code,
        name_en,
        name_cn,
        units,
        curriculum_type,
        elective_type,
        offering_faculty,
        offering_programme,
        description,
        prerequisites,
    ):
        course = cls(
            id=None,
            course_code=course_code,
            name_en=name_en,
            name_cn=name_cn,
            units=units,
            curriculum_type=curriculum_type,
            elective_type=elective_type,
            offering_faculty=offering_faculty,
            offering_programme=offering_programme,
            description=description,
            prerequisites=prerequisites,
        )
        cls.save(course)
        return course

    @classmethod
    def delete_course(cls, course_id):
        course = cls.query.filter_by(id=course_id).first()
        if course:
            cls.delete(course)
            return True
        return False

    @classmethod
    def update_course(
        cls,
        course_id,
        course_code,
        name_en,
        name_cn,
        units,
        curriculum_type,
        elective_type,
        offering_faculty,
        offering_programme,
        description,
        prerequisites,
    ):
        course = cls.query.filter_by(id=course_id).first()
        if course:
            course.course_code = course_code
            course.name_en = name_en
            course.name_cn = name_cn
            course.units = units
            course.curriculum_type = curriculum_type
            course.elective_type = elective_type
            course.offering_faculty = offering_faculty
            course.offering_programme = offering_programme
            course.description = description
            course.prerequisites = prerequisites
            cls.save(course)
            return course.to_dict()
        return None
