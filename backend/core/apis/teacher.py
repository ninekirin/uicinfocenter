import requests
import json
from http import HTTPStatus
from flask import request
from flask_restx import Namespace, Resource
from sqlalchemy.exc import SQLAlchemyError
from core.models import Teacher, TeacherInfo
from core.models import db
from .user import jwt_token_required, admin_required
from sqlalchemy import text

teacher_ns = Namespace(name="Teacher", description="Teacher related APIs")


@teacher_ns.route("/import")
class TeacherImportApi(Resource):
    @jwt_token_required
    @admin_required
    def post(self, cls):
        """
        Import teachers from UIC website
        """
        try:
            # 从指定 URL 获取数据
            base_url = "https://staff.uic.edu.cn/teacher/teacher/list?access-token=&page={}&pageSize=500&key=&lang=en"
            page = 0
            teachers = []
            while True:
                response = requests.get(base_url.format(page))
                response.raise_for_status()  # 检查请求是否成功
                data = response.json()
                total = data.get("data", {}).get("total", 0)
                # print(f"Total teachers: {total}")
                # print(f"Page {page + 1}/{(total + 499) // 500}")
                page_teachers = data.get("data", {}).get("data", [])
                if not page_teachers:
                    break
                teachers.extend(page_teachers)
                page += 1
                if len(teachers) >= total:
                    break
            teachers.sort(key=lambda x: x.get("id"))  # 排序教师列表
            # debug: write teachers to file
            # with open('teacher-list.json', 'w', encoding='utf-8') as file:
            #     json.dump({"data": teachers}, file, ensure_ascii=False, indent=4)

            # for debug in teachers:
            #     print(teachers.index(debug), debug.get('username'))

            # 清空现有数据
            db.session.query(TeacherInfo).delete()
            db.session.query(Teacher).delete()

            # 判断数据库dialect，重置自增 ID
            print(db.engine.dialect.name)
            if db.engine.dialect.name == "mysql" or db.engine.dialect.name == "mariadb":
                db.session.execute(text("ALTER TABLE teacher_info AUTO_INCREMENT = 1"))
                db.session.execute(text("ALTER TABLE teacher AUTO_INCREMENT = 1"))

            for teacher in teachers:
                # 创建 Teacher 实例
                teacher_instance = Teacher(
                    id=None,
                    mis_id=teacher.get("id"),
                    name=(
                        teacher.get("name") + " " + teacher.get("name_en")
                        if teacher.get("name_en") != teacher.get("name")
                        else teacher.get("name_en")
                    ),
                    name_en=teacher.get("name_en"),
                    email=teacher.get("email"),
                    gender="M" if teacher.get("gender") == 1 else "F",
                    title=teacher.get("teacher_title", {}).get("title_en"),
                    first_name=teacher.get("first"),
                    middle_name=teacher.get("middle"),
                    last_name=teacher.get("last"),
                    username=teacher.get("username"),
                    nationality=teacher.get("nation"),
                    phone=teacher.get("telephone"),
                    phone_short=teacher.get("telephone_short"),
                    employee_number=teacher.get("number"),
                    office_room=teacher.get("room"),
                    position=teacher.get("position"),
                    photo_url=(
                        f"https://staff.uic.edu.cn{teacher.get('photo')}"
                        if teacher.get("photo")
                        else ""
                    ),
                )
                db.session.add(teacher_instance)
                db.session.flush()  # 获取教师 ID

                # 创建 TeacherInfo 实例
                if isinstance(teacher.get("info"), dict):
                    for lang, info in teacher["info"].items():
                        # print(teacher_instance.id, teacher_instance.mis_id)
                        # 防脏数据检查：检查 info 是否为 []，如果是，则转换为空 dict()
                        if isinstance(info, list):
                            # print("WARNING EMPTY INFO: lang={}, id={}, name={}".format(lang, teacher_instance.id, teacher_instance.name))
                            info = dict()
                        teacher_info_instance = TeacherInfo(
                            id=None,
                            teacher_id=teacher_instance.id,
                            lang=lang,
                            admin_title=(
                                teacher["teacher_title"].get("admin_title_en", "")
                                if lang == "en"
                                else teacher["teacher_title"].get("admin_title", "")
                            ),
                            academic_title=(
                                teacher["teacher_title"].get("title_en", "")
                                if lang == "en"
                                else teacher["teacher_title"].get("title", "")
                            ),
                            academic=info.get("academic", ""),
                            education=info.get("education", ""),
                            timetable_name=info.get("timetable", {}).get("name", ""),
                            timetable_url=(
                                f"https://staff.uic.edu.cn{info.get('timetable', {}).get('url', '')}"
                                if info.get("timetable", {}).get("url")
                                else ""
                            ),
                            tutor_type=info.get("tutor_type", ""),
                            timetable_file_name=info.get("timetable_file_name", ""),
                            research_file_url=info.get("research_file", ""),
                            research_file_name=info.get("research_file_name", ""),
                            publications_file_url=info.get("publications_file", ""),
                            publications_file_name=info.get(
                                "publications_file_name", ""
                            ),
                            special_honor=info.get("special_honor", ""),
                        )
                        db.session.add(teacher_info_instance)

            db.session.commit()
            return {
                "success": True,
                "code": "TEACHERS_IMPORTED",
                "message": "Teacher data imported.",
            }, HTTPStatus.OK

        except SQLAlchemyError as e:
            db.session.rollback()
            return {
                "success": False,
                "code": "IMPORT_FAILED",
                "message": str(e),
            }, HTTPStatus.INTERNAL_SERVER_ERROR
        except requests.RequestException as e:
            return {
                "success": False,
                "code": "NETWORK_ERROR",
                "message": str(e),
            }, HTTPStatus.BAD_REQUEST
        except Exception as e:
            return {
                "success": False,
                "code": "UNKNOWN_ERROR",
                "message": str(e),
            }, HTTPStatus.INTERNAL_SERVER_ERROR
