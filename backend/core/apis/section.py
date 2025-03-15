# -*- encoding: utf-8 -*-

from http import HTTPStatus
from flask import request
from flask_restx import Namespace, Resource, fields

from core.config import BaseConfig
from core.models import Course, Section
from core.models import db

from .user import jwt_token_required, admin_required

section_ns = Namespace(name="Section", description="Section Related APIs")

"""
    Models
"""

add_section_model = section_ns.model(
    "AddSection",
    {
        "course_id": fields.Integer(required=True, description="Course ID", example=1),
        "offer_semester": fields.String(
            description="Offer semester", example="2021-2022 Semester 1"
        ),
        "section_number": fields.String(
            required=True, description="Section number", example="1"
        ),
        "classroom": fields.String(description="Classroom", example="Room 101"),
        "schedule": fields.String(description="Schedule", example="Monday 9:00-12:00"),
        "hours": fields.Integer(description="Hours", example=3),
        "remarks": fields.String(
            description="Remarks", example="This section is for Year 1 students."
        ),
        "teachers": fields.String(
            description="Teachers", example="Dr. Tao TANG & Dr. Weijia JIA"
        ),
    },
)

delete_section_model = section_ns.model(
    "DeleteSection",
    {"id": fields.Integer(required=True, description="Section ID", example=1)},
)

update_section_model = section_ns.model(
    "UpdateSection",
    {
        "id": fields.Integer(required=True, description="Section ID", example=1),
        "course_id": fields.Integer(required=True, description="Course ID", example=1),
        "offer_semester": fields.String(
            description="Offer semester", example="2021-2022 Semester 1"
        ),
        "section_number": fields.String(
            required=True, description="Section number", example="1"
        ),
        "classroom": fields.String(description="Classroom", example="Room 101"),
        "schedule": fields.String(description="Schedule", example="Monday 9:00-12:00"),
        "hours": fields.Integer(description="Hours", example=3),
        "remarks": fields.String(
            description="Remarks", example="This section is for Year 1 students."
        ),
        "teachers": fields.String(
            description="Teachers", example="Dr. Tao TANG & Dr. Weijia JIA"
        ),
    },
)

"""
    Flask-Restx routes
"""


@section_ns.route("")
class SectionApi(Resource):
    @section_ns.param("id", "Section ID")
    @jwt_token_required
    def get(self, cls):
        data = request.args

        id = data.get("id")

        if not id:
            return {
                "success": False,
                "code": "SECTION_ID_MISSING",
                "message": "Section ID is required.",
            }, HTTPStatus.BAD_REQUEST

        if id:
            section = Section.get_section_by_id(id)
        else:
            return {
                "success": False,
                "code": "COURSE_IDENTIFIER_MISSING",
                "message": "Course ID or course code is required.",
            }, HTTPStatus.BAD_REQUEST

        if section:
            return {
                "success": True,
                "code": "SUCCESS",
                "message": "Success.",
                "data": section.to_dict(),
            }, HTTPStatus.OK
        else:
            return {
                "success": False,
                "code": "SECTION_NOT_FOUND",
                "message": "Section not found.",
            }, HTTPStatus.NOT_FOUND

    @section_ns.expect(add_section_model)
    @jwt_token_required
    @admin_required
    def post(self, cls):
        data = request.json

        course_code = data.get("course_code")

        course_id = data.get("course_id")
        offer_semester = data.get("offer_semester")
        section_number = data.get("section_number")
        classroom = data.get("classroom")
        schedule = data.get("schedule")
        hours = data.get("hours")
        remarks = data.get("remarks")
        teachers = data.get("teachers")

        if not course_id and not course_code:
            return {
                "success": False,
                "code": "COURSE_ID_MISSING",
                "message": "Course ID is required.",
            }, HTTPStatus.BAD_REQUEST

        # course_code mode
        if not course_id and course_code:
            course = Course.get_course_by_code(course_code)
            if course:
                course_id = course.id
            else:
                return {
                    "success": False,
                    "code": "COURSE_NOT_FOUND",
                    "message": "Course not found.",
                }, HTTPStatus.NOT_FOUND

        # course_id mode
        if course_id and not course_code:
            course = Course.get_course_by_id(course_id)
            if not course:
                return {
                    "success": False,
                    "code": "COURSE_NOT_FOUND",
                    "message": "Course not found.",
                }, HTTPStatus.NOT_FOUND

        if not section_number:
            return {
                "success": False,
                "code": "SECTION_NUMBER_MISSING",
                "message": "Section number is required.",
            }, HTTPStatus.BAD_REQUEST

        section = Section.add_section(
            course_id,
            offer_semester,
            section_number,
            classroom,
            schedule,
            hours,
            remarks,
            teachers,
        )

        if section:
            return {
                "success": True,
                "code": "SECTION_ADDED",
                "message": "Section added.",
                "data": section.to_dict(),
            }, HTTPStatus.CREATED
        else:
            return {
                "success": False,
                "code": "SECTION_ADD_FAILED",
                "message": "Failed to add section.",
            }, HTTPStatus.INTERNAL_SERVER_ERROR

    @section_ns.expect(update_section_model)
    @jwt_token_required
    @admin_required
    def put(self, cls):
        data = request.json

        course_code = data.get("course_code")

        section_id = data.get("id")
        course_id = data.get("course_id")
        offer_semester = data.get("offer_semester")
        section_number = data.get("section_number")
        classroom = data.get("classroom")
        schedule = data.get("schedule")
        hours = data.get("hours")
        remarks = data.get("remarks")
        teachers = data.get("teachers")

        if not section_id:
            return {
                "success": False,
                "code": "SECTION_ID_MISSING",
                "message": "Section ID is required.",
            }, HTTPStatus.BAD_REQUEST

        if not course_id and not course_code:
            return {
                "success": False,
                "code": "COURSE_ID_MISSING",
                "message": "Course ID is required.",
            }, HTTPStatus.BAD_REQUEST

        # course_code mode
        if not course_id and course_code:
            course = Course.get_course_by_code(course_code)
            if course:
                course_id = course.id
            else:
                return {
                    "success": False,
                    "code": "COURSE_NOT_FOUND",
                    "message": "Course not found.",
                }, HTTPStatus.NOT_FOUND

        # course_id mode
        if course_id and not course_code:
            course = Course.get_course_by_id(course_id)
            if not course:
                return {
                    "success": False,
                    "code": "COURSE_NOT_FOUND",
                    "message": "Course not found.",
                }, HTTPStatus.NOT_FOUND

        if not section_number:
            return {
                "success": False,
                "code": "SECTION_NUMBER_MISSING",
                "message": "Section number is required.",
            }, HTTPStatus.BAD_REQUEST

        # check if section exists
        section = Section.get_section_by_id(section_id)
        if not section:
            return {
                "success": False,
                "code": "SECTION_NOT_FOUND",
                "message": "Section not found.",
            }, HTTPStatus.NOT_FOUND

        # update section
        section = Section.update_section(
            section_id,
            course_id,
            offer_semester,
            section_number,
            classroom,
            schedule,
            hours,
            remarks,
            teachers,
        )

        if section:
            return {
                "success": True,
                "code": "SECTION_UPDATED",
                "message": "Section updated.",
                "data": section,
            }, HTTPStatus.OK
        else:
            return {
                "success": False,
                "code": "SECTION_UPDATE_FAILED",
                "message": "Failed to update section.",
            }, HTTPStatus.INTERNAL_SERVER_ERROR

    @section_ns.expect(delete_section_model)
    @jwt_token_required
    @admin_required
    def delete(self, cls):
        data = request.json

        section_id = data.get("id")

        if not section_id:
            return {
                "success": False,
                "code": "SECTION_ID_MISSING",
                "message": "Section ID is required.",
            }, HTTPStatus.BAD_REQUEST

        # check if section exists
        section = Section.get_section_by_id(section_id)
        if not section:
            return {
                "success": False,
                "code": "SECTION_NOT_FOUND",
                "message": "Section not found.",
            }, HTTPStatus.NOT_FOUND

        # delete section
        deleted = Section.delete_section(section_id)

        if deleted:
            return {
                "success": True,
                "code": "SECTION_DELETED",
                "message": "Section deleted.",
            }, HTTPStatus.OK
        else:
            return {
                "success": False,
                "code": "SECTION_DELETE_FAILED",
                "message": "Failed to delete section.",
            }, HTTPStatus.INTERNAL_SERVER_ERROR


@section_ns.route("s")
class SectionsApi(Resource):
    @section_ns.param("course_id", "Course ID")
    @section_ns.param("course_code", "Course code")
    @section_ns.param("keyword", "Search keyword")
    @section_ns.param(
        "current",
        description="Current page number",
        required=False,
        type="integer",
        default=1,
    )
    @section_ns.param(
        "pageSize",
        description="Page size",
        required=False,
        type="integer",
        default=BaseConfig.PAGE_SIZE,
    )
    @jwt_token_required
    def get(self, cls):
        data = request.args

        course_id = data.get("course_id")
        course_code = data.get("course_code")
        keyword = data.get("keyword")

        current = data.get("current", 1, type=int)
        pageSize = data.get("pageSize", BaseConfig.PAGE_SIZE, type=int)

        # if not course_id and not course_code:
        #     return {"success": False, "code": "COURSE_IDENTIFIER_MISSING", "message": "Course ID or course code is required."}, HTTPStatus.BAD_REQUEST

        if course_id and course_id != "null":
            sections, total = Section.get_sections_by_course_id_paginated(
                course_id, current, pageSize
            )
        elif course_code and course_code != "null":
            sections, total = Section.get_sections_by_course_code_paginated(
                course_code, current, pageSize
            )
        elif keyword:
            sections, total = Section.get_sections_by_keyword_paginated(
                keyword, current, pageSize
            )
        else:
            sections, total = Section.get_all_sections_paginated(current, pageSize)

        return {
            "success": True,
            "code": "SUCCESS",
            "message": "Success.",
            "data": {
                "sections": [section.to_dict() for section in sections],
                "pagination": {
                    "total": total,
                    "current": current,
                    "pageSize": pageSize,
                },
            },
        }, HTTPStatus.OK
