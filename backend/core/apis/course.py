# -*- encoding: utf-8 -*-

from http import HTTPStatus
from flask import request
from flask_restx import Namespace, Resource, fields
from sqlalchemy import text
from werkzeug.datastructures import FileStorage
from werkzeug.utils import secure_filename
from sqlalchemy.exc import SQLAlchemyError

import pandas as pd
import re
import fitz  # PyMuPDF for PDF processing
import string
import csv

from core.config import BaseConfig
from core.models import Course, Section
from core.models import db

from .user import jwt_token_required, admin_required

course_ns = Namespace(name="Course", description="Course Related APIs")

# Input File upload configuration
file_upload_parser = course_ns.parser()
file_upload_parser.add_argument(
    "file", location="files", type=FileStorage, required=True, help="File to upload"
)

# Course data
course_data = pd.DataFrame()

# Initialize lists to store the data
course_list = []
section_list = []

semester = str()
course_desc_dict = dict()

# Boolean flag to indicate if the course data has been processed
course_data_processed = False
course_desc_processed = False


"""
    Models
"""

add_course_model = course_ns.model(
    "AddCourse",
    {
        "course_code": fields.String(
            required=True, description="Course code", example="COMP1023"
        ),
        "name_en": fields.String(
            required=True,
            description="Course name (English)",
            example="Foundation of C Programming",
        ),
        "name_cn": fields.String(
            description="Course name (Chinese)", example="C程序设计基础"
        ),
        "units": fields.Integer(required=True, description="Course units", example=3),
        "curriculum_type": fields.String(
            required=True, description="Curriculum type", example="MR"
        ),
        "elective_type": fields.String(description="Elective type", example="UCHL"),
        "offering_faculty": fields.String(
            description="Offering faculty", example="FST"
        ),
        "offering_programme": fields.String(
            description="Offering programme", example="CST"
        ),
        "description": fields.String(
            description="Course description",
            example="This course covers basic concepts of C programming.",
        ),
        "prerequisites": fields.String(
            description="Course prerequisites", example="ACCT2013 or ACCT2053"
        ),
    },
)

delete_course_model = course_ns.model(
    "DeleteCourse",
    {"id": fields.Integer(required=True, description="Course ID", example=1)},
)

update_course_model = course_ns.model(
    "UpdateCourse",
    {
        "id": fields.Integer(required=True, description="Course ID", example=1),
        "course_code": fields.String(
            required=True, description="Course code", example="COMP1023"
        ),
        "name_en": fields.String(
            required=True,
            description="Course name (English)",
            example="Foundation of C Programming",
        ),
        "name_cn": fields.String(
            description="Course name (Chinese)", example="C程序设计基础"
        ),
        "units": fields.Integer(required=True, description="Course units", example=3),
        "curriculum_type": fields.String(
            required=True, description="Curriculum type", example="MR"
        ),
        "elective_type": fields.String(description="Elective type", example="UCHL"),
        "offering_faculty": fields.String(
            description="Offering faculty", example="FST"
        ),
        "offering_programme": fields.String(
            description="Offering programme", example="CST"
        ),
        "description": fields.String(
            description="Course description",
            example="This course covers basic concepts of C programming.",
        ),
        "prerequisites": fields.String(
            description="Course prerequisites", example="ACCT2013 or ACCT2053"
        ),
    },
)

"""
    Flask-Restx routes
"""


@course_ns.route("")
class CourseApi(Resource):
    @course_ns.expect(add_course_model)
    @jwt_token_required
    @admin_required
    def post(self, cls):
        data = request.json

        course_code = data.get("course_code")
        name_en = data.get("name_en")
        name_cn = data.get("name_cn")
        units = data.get("units")
        curriculum_type = data.get("curriculum_type")
        elective_type = data.get("elective_type")
        offering_faculty = data.get("offering_faculty")
        offering_programme = data.get("offering_programme")
        description = data.get("description")
        prerequisites = data.get("prerequisites")

        # check if required fields are provided
        if not course_code:
            return {
                "success": False,
                "code": "COURSE_CODE_MISSING",
                "message": "Course code is required.",
            }, HTTPStatus.BAD_REQUEST

        if not name_en:
            return {
                "success": False,
                "code": "COURSE_NAME_EN_MISSING",
                "message": "Course name (English) is required.",
            }, HTTPStatus.BAD_REQUEST

        if not units:
            return {
                "success": False,
                "code": "COURSE_UNITS_MISSING",
                "message": "Course units are required.",
            }, HTTPStatus.BAD_REQUEST

        if not curriculum_type:
            return {
                "success": False,
                "code": "CURRICULUM_TYPE_MISSING",
                "message": "Curriculum type is required.",
            }, HTTPStatus.BAD_REQUEST

        # check if any attribute already exists
        course = Course.get_course_by_code(course_code)
        if course:
            return {
                "success": False,
                "code": "COURSE_CODE_EXISTS",
                "message": "Course code already exists.",
            }, HTTPStatus.BAD_REQUEST

        course = Course.get_course_by_name_en(name_en)
        if course:
            return {
                "success": False,
                "code": "COURSE_NAME_EN_EXISTS",
                "message": "Course name (English) already exists.",
            }, HTTPStatus.BAD_REQUEST

        course = Course.add_course(
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
        )
        if course:
            return {
                "success": True,
                "code": "COURSE_ADDED",
                "message": "Course added.",
                "data": course.to_dict(),
            }, HTTPStatus.CREATED
        else:
            return {
                "success": False,
                "code": "COURSE_ADD_FAILED",
                "message": "Failed to add course.",
            }, HTTPStatus.INTERNAL_SERVER_ERROR

    @course_ns.param("id", "Course ID")
    @course_ns.param("course_code", "Course code")
    @jwt_token_required
    def get(self, cls):
        data = request.args

        id = data.get("id")
        course_code = data.get("course_code")

        if id and id.isdigit():
            course = Course.get_course_by_id(id)
            if course:
                return {
                    "success": True,
                    "code": "SUCCESS",
                    "message": "Success.",
                    "data": course.to_dict(),
                }, HTTPStatus.OK
            else:
                return {
                    "success": False,
                    "code": "COURSE_NOT_FOUND",
                    "message": "Course not found.",
                }, HTTPStatus.NOT_FOUND
        elif id:
            return {
                "success": False,
                "code": "COURSE_ID_MISSING",
                "message": "Course ID is required.",
            }, HTTPStatus.BAD_REQUEST

        if course_code:
            course = Course.get_course_by_code(course_code)
            if course:
                return {
                    "success": True,
                    "code": "SUCCESS",
                    "message": "Success.",
                    "data": course.to_dict(),
                }, HTTPStatus.OK
            else:
                return {
                    "success": False,
                    "code": "COURSE_NOT_FOUND",
                    "message": "Course not found.",
                }, HTTPStatus.NOT_FOUND

    @course_ns.expect(update_course_model)
    @jwt_token_required
    @admin_required
    def put(self, cls):
        data = request.json

        id = data.get("id")
        course_code = data.get("course_code")
        name_en = data.get("name_en")
        name_cn = data.get("name_cn")
        units = data.get("units")
        curriculum_type = data.get("curriculum_type")
        elective_type = data.get("elective_type")
        offering_faculty = data.get("offering_faculty")
        offering_programme = data.get("offering_programme")
        description = data.get("description")
        prerequisites = data.get("prerequisites")

        if not id:
            return {
                "success": False,
                "code": "COURSE_ID_MISSING",
                "message": "Course ID is required.",
            }, HTTPStatus.BAD_REQUEST

        if not course_code:
            return {
                "success": False,
                "code": "COURSE_CODE_MISSING",
                "message": "Course code is required.",
            }, HTTPStatus.BAD_REQUEST

        if not name_en:
            return {
                "success": False,
                "code": "COURSE_NAME_EN_MISSING",
                "message": "Course name (English) is required.",
            }, HTTPStatus.BAD_REQUEST

        if not units:
            return {
                "success": False,
                "code": "COURSE_UNITS_MISSING",
                "message": "Course units are required.",
            }, HTTPStatus.BAD_REQUEST

        if not curriculum_type:
            return {
                "success": False,
                "code": "CURRICULUM_TYPE_MISSING",
                "message": "Curriculum type is required.",
            }, HTTPStatus.BAD_REQUEST

        # check if course exists
        course = Course.get_course_by_id(id)
        if not course:
            return {
                "success": False,
                "code": "COURSE_NOT_FOUND",
                "message": "Course not found.",
            }, HTTPStatus.NOT_FOUND

        # update course
        course = Course.update_course(
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
        )

        if course:
            return {
                "success": True,
                "code": "COURSE_UPDATED",
                "message": "Course updated.",
                "data": course,
            }, HTTPStatus.OK
        else:
            return {
                "success": False,
                "code": "COURSE_UPDATE_FAILED",
                "message": "Failed to update course.",
            }, HTTPStatus.INTERNAL_SERVER_ERROR

    @course_ns.expect(delete_course_model)
    @jwt_token_required
    @admin_required
    def delete(self, cls):
        data = request.json

        id = data.get("id")

        if not id:
            return {
                "success": False,
                "code": "COURSE_ID_MISSING",
                "message": "Course ID is required.",
            }, HTTPStatus.BAD_REQUEST

        # check if course exists
        course = Course.get_course_by_id(id)
        if not course:
            return {
                "success": False,
                "code": "COURSE_NOT_FOUND",
                "message": "Course not found.",
            }, HTTPStatus.NOT_FOUND

        # delete course
        deleted = Course.delete_course(id)

        if deleted:
            return {
                "success": True,
                "code": "COURSE_DELETED",
                "message": "Course deleted.",
            }, HTTPStatus.OK
        else:
            return {
                "success": False,
                "code": "COURSE_DELETE_FAILED",
                "message": "Failed to delete course.",
            }, HTTPStatus.INTERNAL_SERVER_ERROR


@course_ns.route("s")
class CoursesApi(Resource):
    @course_ns.param("ids", "List of course IDs")
    @course_ns.param("keyword", "Search keyword")
    @course_ns.param(
        "current",
        description="Current page number",
        required=False,
        type="integer",
        default=1,
    )
    @course_ns.param(
        "pageSize",
        description="Page size",
        required=False,
        type="integer",
        default=BaseConfig.PAGE_SIZE,
    )
    @jwt_token_required
    def get(self, cls):
        data = request.args

        ids = data.get("ids")
        # convert string to list
        if ids:
            ids = [int(id) for id in ids.split(",")]
            return {
                "success": True,
                "code": "SUCCESS",
                "message": "Success.",
                "data": {
                    "courses": [
                        course.to_dict() for course in Course.get_courses_by_ids(ids)
                    ]
                },
            }, HTTPStatus.OK

        keyword = data.get("keyword")
        current = data.get("current", 1, type=int)
        pageSize = data.get("pageSize", BaseConfig.PAGE_SIZE, type=int)

        if keyword:
            courses, total = Course.get_courses_by_keyword_paginated(
                keyword, current, pageSize
            )
        else:
            courses, total = Course.get_all_courses_paginated(current, pageSize)

        return {
            "success": True,
            "code": "SUCCESS",
            "message": "Success.",
            "data": {
                "courses": [course.to_dict() for course in courses],
                "pagination": {
                    "total": total,
                    "current": current,
                    "pageSize": pageSize,
                },
            },
        }, HTTPStatus.OK


@course_ns.route("/upload")
class CourseUploadApi(Resource):
    @course_ns.expect(file_upload_parser)
    @jwt_token_required
    @admin_required
    def post(self, cls):
        args = file_upload_parser.parse_args()
        uploaded_file = args["file"]

        if not uploaded_file or uploaded_file.filename == "":
            return {
                "success": False,
                "code": "FILE_MISSING",
                "message": "File is required.",
            }, HTTPStatus.BAD_REQUEST

        # Ensure the filename is safe
        filename = secure_filename(uploaded_file.filename)

        # print("Uploaded file:", filename)

        if uploaded_file.mimetype not in [
            "text/csv",
            "application/vnd.ms-excel",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "application/pdf",
        ]:
            return {
                "success": False,
                "code": "FILE_TYPE_NOT_ALLOWED",
                "message": "File type not allowed.",
            }, HTTPStatus.BAD_REQUEST

        # Process PDF file to extract course descriptions
        if uploaded_file.mimetype == "application/pdf":
            try:
                callback_msg = process_pdf(uploaded_file)
            except Exception as e:
                return {
                    "success": False,
                    "code": "FILE_PROCESSING_ERROR",
                    "message": str(e),
                }, HTTPStatus.BAD_REQUEST
        # Process Excel or CSV to get course data
        elif uploaded_file.mimetype in [
            "text/csv",
            "application/vnd.ms-excel",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        ]:
            # try:
                # 使用 global 关键字在函数内部读写全局变量
            global semester
            match = re.search(r"Semester_\d{1}_of_AY(\d{4}-\d{2})", filename)
            print(match)
            if match:
                semester = match.group(0).replace("_", " ")
            else:
                return {
                    "success": False,
                    "code": "SEMESTER_NOT_FOUND",
                    "message": "Semester information not found in the filename.",
                }, HTTPStatus.BAD_REQUEST
            callback_msg = process_course_data(uploaded_file)
            # except Exception as e:
            #     return {
            #         "success": False,
            #         "code": "FILE_PROCESSING_ERROR",
            #         "message": str(e),
            #     }, HTTPStatus.BAD_REQUEST

        return {
            "success": True,
            "code": "FILE_UPLOADED",
            "message": 'File "'
            + uploaded_file.filename
            + '" uploaded and processed successfully.',
            "data": {
                "semester": semester,
                "course_data_processed": course_data_processed,
                "course_desc_processed": course_desc_processed,
                "callback_msg": callback_msg,
            },
        }, HTTPStatus.OK


def process_course_data(uploaded_xlsx) -> str:
    # 使用 global 关键字在函数内部读写全局变量
    global course_data, course_list, section_list, semester, course_data_processed
    # Clean up if there is any existing data
    course_list = []
    section_list = []
    course_data = pd.read_excel(uploaded_xlsx, sheet_name=0, skiprows=1)
    course_data.columns = [
        "Course Code",
        "Course Title & Session",
        "Offering Unit",
        "Offering Programme",
        "Units",
        "Curriculum Type",
        "Elective Type",
        "Teachers",
        "Class Schedule",
        "Hours",
        "Classroom",
        "Requirements",
        "Remarks",
    ]
    course_ids = {}
    next_course_id = 1
    section_id = 1

    for _, row in course_data.iterrows():
        course_code = row["Course Code"]
        if course_code not in course_ids:
            course_ids[course_code] = next_course_id
            course_list.append(
                {
                    "id": next_course_id,
                    "course_code": course_code,
                    "name_en": row["Course Title & Session"][:-7] if re.search(r"\(\d+\)", row["Course Title & Session"]) else row["Course Title & Session"], # remove section number
                    "name_cn": None,
                    "units": 3 if pd.isna(row["Units"]) else int(row["Units"]),
                    "curriculum_type": (
                        ""
                        if pd.isna(row["Curriculum Type"])
                        else str(row["Curriculum Type"])
                    ),
                    "elective_type": (
                        ""
                        if pd.isna(row["Elective Type"])
                        else str(row["Elective Type"])
                    ),
                    "offering_faculty": (
                        ""
                        if pd.isna(row["Offering Unit"])
                        else str(row["Offering Unit"])
                    ),
                    "offering_programme": (
                        ""
                        if pd.isna(row["Offering Programme"])
                        else str(row["Offering Programme"])
                    ),
                    "description": "",  # description_dict.get(course_code, ''),
                    "prerequisites": (
                        "" if pd.isna(row["Requirements"]) else str(row["Requirements"])
                    ),
                }
            )
            next_course_id += 1

        section_number_match = re.search(r"\((\d+)\)", row["Course Title & Session"])
        section_number = section_number_match.group(1) if section_number_match else "1001 (default)"
        # if not section_number:
        #     raise Exception(
        #         f"Section number not found in {row['Course Title & Session']}"
        #     )
        section_list.append(
            {
                "id": section_id,
                "course_id": course_ids[course_code],
                "offer_semester": semester,
                "section_number": section_number,
                "classroom": "" if pd.isna(row["Classroom"]) else str(row["Classroom"]),
                "schedule": (
                    "" if pd.isna(row["Class Schedule"]) else str(row["Class Schedule"])
                ),
                "hours": -1 if pd.isna(row["Hours"]) or not str(row["Hours"]).isdigit() else str(row["Hours"]),
                "remarks": "" if pd.isna(row["Remarks"]) else str(row["Remarks"]),
                "teachers": "" if pd.isna(row["Teachers"]) else str(row["Teachers"]),
            }
        )
        # print(section_list[-1])
        section_id += 1

    course_data_processed = True

    # # Create DataFrames (debug)
    # course_df = pd.DataFrame(course_list)
    # section_df = pd.DataFrame(section_list)

    # # 输出course_df的前几行 (debug)
    # print(course_df.head())
    # print(course_list[0])

    # 输出总共有多少门课程 (debug)
    # print(f"Total {len(course_list)} courses found in the uploaded file.")
    # print(f"Total {len(section_list)} sections found in the uploaded file.")
    return f"Total {len(course_list)} courses and {len(section_list)} sections found in the uploaded file."


def process_pdf(uploaded_pdf):
    # 使用 global 关键字在函数内部读写全局变量
    global course_desc_dict, course_desc_processed
    # Clean up if there is any existing data
    course_desc_dict = dict()

    # PDF_FILENAME = uploaded_pdf.filename
    # print(f"Loading PDF {PDF_FILENAME}")
    # FILENAME_PREFIX = PDF_FILENAME.split('.')[0]

    # Remove non-printable characters
    printable = set(string.printable)

    printable.remove("\t")
    printable.remove("\n")
    printable.remove("\x0b")
    printable.remove("\x0c")
    printable.remove("\r")

    # Read PDF and extract course descriptions
    text = ""
    with fitz.open(stream=uploaded_pdf.read(), filetype="pdf") as doc:
        text = chr(12).join([page.get_text() for page in doc])
        text = text.split("\n")
        text = ["".join(filter(lambda x: x in printable, l)) for l in text][6:]

    # # begin of raw lines (debugging)
    # RAW_FILENAME = f"{FILENAME_PREFIX}-raw_lines.txt"
    # print(f"There are {len(text)} lines of text in the PDF, saving to {RAW_FILENAME}")
    # with open(RAW_FILENAME, 'w',encoding='utf-8-sig') as fp:
    #     for item in text:
    #         # write each item on a new line
    #         fp.write("%s\n" % item)
    #     print("Done")
    # # end of raw lines (debugging)

    pattern = r"([A-Z]{2,4}\d{4})"  # Simple Course Code Pattern
    course_code_dict = dict()  # Course Code Dictionary
    for i in text:
        # print(i)
        if re.match(pattern, i):
            result = re.search(pattern, i)
            try:
                course_code_dict[result.group(1)] += 1
            except KeyError:
                course_code_dict[result.group(1)] = 1

    # print(f"Found {len(course_code_dict.keys())} matched course code.") # debug

    pattern = "^([A-Z]{2,4}\d{4}) ([0-9A-Z\s\-\(\)&\+\?,:]*)$"  # Course Code with Course Name Pattern

    course_name_list = list()  # Course Name List
    course_desc_list = list()  # Course Description List

    new_flag = 0
    temp_c_list = list()
    for k, i in enumerate(text):
        if re.match(pattern, i):  # A new course pattern like string
            if new_flag == 1:  # *Course Description* flag not meet
                temp_c_list.append(i)  # Just another line
            else:  # *Course Description* flag meet
                if course_name_list:
                    course_desc_list.append(temp_c_list)  # Save previous raw data
                    temp_c_list = list()
                new_flag = 1
                course_name_list.append(i)  # Save new course name
        elif (
            "Course Description:" in i
            or "Course  Description" in i
            or "Description:" in i
            or "Course Description" in i
        ):
            new_flag = 0
            temp_c_list.append(i)
        else:
            temp_c_list.append(i)
    course_desc_list.append(temp_c_list)

    # print(f"Found {len(course_name_list)} Course Name, {len(course_desc_list)} Course Description (If not equal, there must be a problem)") # debug

    # 判断数据是否正确，如果Course Code、Course Name、Course Description有一项为空，则报错
    if (
        len(course_name_list) == 0
        or len(course_desc_list) == 0
        or len(course_code_dict.keys()) == 0
    ):
        # print("Data Error: No Course Name, Course Description or Course Code Found.")
        raise Exception(
            "Data Error: No Course Name, Course Description or Course Code Found."
        )

    # !!! BEGIN Parsing Functions !!!
    def hanging_course_name(course_raw):
        buffer = list()
        for i in course_raw:
            if "(" in i:
                break
            if i:
                buffer.append(i)
        return buffer

    def get_course_code(course_name):
        pattern = r"([A-Z]{2,4}\d{4})"
        result = re.search(pattern, course_name)
        return result.group(1)

    def get_course_name(course_name, course_raw):
        raw_course_name = course_name.replace(get_course_code(course_name), "")
        hanging = hanging_course_name(course_raw)
        lower_course_name = " ".join([raw_course_name.strip()] + hanging).strip()
        return "".join(lower_course_name)

    def get_course_unit(course_raw):
        for i in course_raw:
            if re.match(
                r"\(\d{1}\s*(unit|UNIT).*\)", i.strip()
            ):  # A new course pattern like string
                # if "(" in i and ("unit" in i or "UNIT" in i):
                return i.strip()[1:2]

    def get_course_desc(course_raw):
        buffer = list()
        start = 0
        for i in course_raw:
            if (
                "Course Description:" in i
                or "Course  Description" in i
                or "Description:" in i
                or "Course Description" in i
            ):
                start = 1
            if start:
                buffer.append(i)
        return buffer

    def get_course_pre(course_raw):
        buffer = list()
        start = 0
        for i in course_raw:
            if "Pre-requisite(s):" in i:
                start = 1
            if (
                "Course Description:" in i
                or "Course  Description" in i
                or "Description:" in i
                or "Course Description" in i
            ):
                start = 0
                break
            if start:
                if "Pre-requisite(s):" in i:
                    buffer.append(i.replace("Pre-requisite(s):", ""))
                else:
                    buffer.append(i)
        return "".join(buffer)

    # !!! END Parsing Functions !!!

    course_dict = dict()
    for n, r in zip(course_name_list, course_desc_list):
        cc = get_course_code(n)
        payload = {
            "course_code": cc,
            "course_name": get_course_name(n, r),
            "unit": get_course_unit(r),
            "prerequisite": get_course_pre(r),
            "description": get_course_desc(r),
        }
        course_dict[cc] = payload

    # # begin of course records (debugging)
    # print("Saving Course Records")
    # with open(f'{FILENAME_PREFIX}-records.csv', 'w', newline='',encoding='utf-8-sig') as csvfile:
    #     writer = csv.writer(csvfile, delimiter=',', lineterminator='\n')
    #     writer.writerow(["course_code","course_name","prerequisite","unit"])
    #     for k, v in course_dict.items():
    #         temp_prereq = v['prerequisite'].strip()
    #         if "None" in temp_prereq or "None Course" in temp_prereq:
    #             temp_prereq = "N/A"
    #         writer.writerow([v['course_code'], v['course_name'], temp_prereq, v['unit']])
    # # eng of course records (debugging)

    code_desc_dict = dict()
    for k, v in course_dict.items():
        code_desc_dict[k] = v["description"]

    for k, v in code_desc_dict.items():
        tv = [
            line for line in v if not re.match(r"\d+ / \d+", line.strip())
        ]  # Clean up page number pattern
        temp = "".join("".join(tv).split(":")[1:]).strip()
        code_desc_dict[k] = temp

    # # begin of course desc (debugging)
    # print("Saving Course Descriptions")
    # with open(f'{FILENAME_PREFIX}-description.csv', 'w', newline='',encoding='utf-8-sig') as csvfile:
    #     writer = csv.writer(csvfile, delimiter=',', lineterminator='\n')
    #     writer.writerow(["course_code","course_description"])
    #     for k, v in code_desc_dict.items():
    #         writer.writerow([k, v])
    # # end of course desc (debugging)

    course_desc_dict = code_desc_dict
    course_desc_processed = True

    # print("Done, Exiting") # debug

    return f"Total {len(course_desc_dict.keys())} course descriptions found in the uploaded file."


@course_ns.route("/import")
class CourseImportApi(Resource):
    @jwt_token_required
    @admin_required
    def post(self, cls):
        global course_data, course_list, section_list, semester, course_desc_dict, course_data_processed, course_desc_processed
        # Check if course_list, section_list is not empty
        if not course_list or not section_list:
            return {
                "success": False,
                "code": "COURSE_MISSING",
                "message": "Required data is missing, please make sure that all required files have been uploaded and processed.",
            }, HTTPStatus.BAD_REQUEST
        try:
            # Drop existing data
            db.session.query(Section).delete()
            db.session.query(Course).delete()

            # Reset auto increment ID
            print(db.engine.dialect.name)
            if db.engine.dialect.name == "mysql" or db.engine.dialect.name == "mariadb":
                db.session.execute(text("ALTER TABLE section AUTO_INCREMENT = 1"))
                db.session.execute(text("ALTER TABLE course AUTO_INCREMENT = 1"))

            # Convert to SQLAlchemy model objects and commit to the database
            for course_data in course_list:
                # Append course description if available
                course_data["description"] = course_desc_dict.get(
                    course_data["course_code"], None
                )
                try:
                    course = Course(**course_data)
                    db.session.add(course)
                except SQLAlchemyError as e:
                    db.session.rollback()
                    print(f"Failed to add course: {course_data}")
                    return {
                        "success": False,
                        "code": "COURSE_IMPORT_FAILED",
                        "message": str(e),
                    }, HTTPStatus.INTERNAL_SERVER_ERROR

            for section_data in section_list:
                section = Section(**section_data)
                db.session.add(section)

            db.session.commit()
        except SQLAlchemyError as e:
            db.session.rollback()
            return {
                "success": False,
                "code": "COURSE_IMPORT_FAILED",
                "message": str(e),
            }, HTTPStatus.INTERNAL_SERVER_ERROR

        # Reset the data
        course_data = pd.DataFrame()
        course_list = []
        section_list = []
        semester = str()
        course_desc_dict = dict()
        course_data_processed = False
        course_desc_processed = False

        return {
            "success": True,
            "code": "COURSE_IMPORTED",
            "message": "Course data imported.",
        }, HTTPStatus.OK
