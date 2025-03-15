# -*- encoding: utf-8 -*-

from http import HTTPStatus
from flask import request
from flask_restx import Namespace, Resource, fields
from functools import wraps

from core.config import BaseConfig
from core.models import ForumThread, ForumReply

from .user import admin_required, jwt_token_required

forum_thread_ns = Namespace(name="Forum Thread", description="ForumThread Related APIs")

"""
    Models
"""

add_thread_model = forum_thread_ns.model(
    "AddThread",
    {
        "subject": fields.String(
            required=True, description="Subject", example="Subject"
        ),
        "thread_text": fields.String(
            required=True, description="Thread text", example="Thread text"
        ),
        "thread_category": fields.String(
            required=True, description="Thread category", example="MATH"
        ),
    },
)

update_thread_model = forum_thread_ns.model(
    "UpdateThread",
    {
        "id": fields.Integer(required=True, description="Thread ID", example=1),
        "subject": fields.String(
            required=True, description="Subject", example="Subject"
        ),
        "thread_text": fields.String(
            required=True, description="Thread text", example="Thread text"
        ),
        "thread_category": fields.String(
            required=True, description="Thread category", example="MATH"
        ),
    },
)

delete_thread_model = forum_thread_ns.model(
    "DeleteThread",
    {"id": fields.Integer(required=True, description="Thread ID", example=1)},
)


"""
    Flask-Restx routes
"""


@forum_thread_ns.route("/thread")
class ForumThreadApi(Resource):
    @forum_thread_ns.expect(add_thread_model)
    @jwt_token_required
    @admin_required
    def post(self, cls):
        data = request.json

        user_id = self.id
        thread_subject = data.get("thread_subject")
        thread_text = data.get("thread_text")
        thread_category = data.get("thread_category")

        if not user_id:
            return {
                "success": False,
                "code": "USER_ID_MISSING",
                "message": "User ID is required.",
            }, HTTPStatus.BAD_REQUEST

        if not thread_subject:
            return {
                "success": False,
                "code": "SUBJECT_MISSING",
                "message": "Subject is required.",
            }, HTTPStatus.BAD_REQUEST

        if not thread_text:
            return {
                "success": False,
                "code": "THREAD_TEXT_MISSING",
                "message": "Thread text is required.",
            }, HTTPStatus.BAD_REQUEST

        if not thread_category:
            return {
                "success": False,
                "code": "THREAD_CATEGORY_MISSING",
                "message": "Thread category is required.",
            }, HTTPStatus.BAD_REQUEST

        # add thread
        thread = ForumThread.add_thread(
            user_id, thread_subject, thread_text, thread_category
        )

        if thread:
            return {
                "success": True,
                "code": "THREAD_ADDED",
                "message": "Thread added successfully.",
                "data": thread.to_dict(),
            }, HTTPStatus.CREATED

        return {
            "success": False,
            "code": "THREAD_ADD_FAILED",
            "message": "Failed to add thread.",
        }, HTTPStatus.INTERNAL_SERVER_ERROR

    @forum_thread_ns.param("id", "Forum Thread ID")
    @jwt_token_required
    def get(self, cls):
        data = request.args

        id = data.get("id")

        if id and id.isdigit():
            thread = ForumThread.get_thread_by_id(id)
            if thread:
                return {
                    "success": True,
                    "code": "THREAD_FOUND",
                    "message": "Thread found.",
                    "data": thread.to_dict(),
                }, HTTPStatus.OK
            return {
                "success": False,
                "code": "THREAD_NOT_FOUND",
                "message": "Thread not found.",
            }, HTTPStatus.NOT_FOUND
        return {
            "success": False,
            "code": "THREAD_ID_MISSING",
            "message": "Thread ID is required.",
        }, HTTPStatus.BAD_REQUEST

    @forum_thread_ns.expect(update_thread_model)
    @jwt_token_required
    @admin_required
    def put(self, cls):
        data = request.json

        id = data.get("id")
        thread_subject = data.get("thread_subject")
        thread_text = data.get("thread_text")
        thread_category = data.get("thread_category")

        if not id:
            return {
                "success": False,
                "code": "THREAD_ID_MISSING",
                "message": "Thread ID is required.",
            }, HTTPStatus.BAD_REQUEST

        if not thread_subject:
            return {
                "success": False,
                "code": "SUBJECT_MISSING",
                "message": "Subject is required.",
            }, HTTPStatus.BAD_REQUEST

        if not thread_text:
            return {
                "success": False,
                "code": "THREAD_TEXT_MISSING",
                "message": "Thread text is required.",
            }, HTTPStatus.BAD_REQUEST

        if not thread_category:
            return {
                "success": False,
                "code": "THREAD_CATEGORY_MISSING",
                "message": "Thread category is required.",
            }, HTTPStatus.BAD_REQUEST

        # update thread
        thread = ForumThread.update_thread(
            id, thread_subject, thread_text, thread_category
        )

        if thread:
            return {
                "success": True,
                "code": "THREAD_UPDATED",
                "message": "Thread updated successfully.",
                "data": thread.to_dict(),
            }, HTTPStatus.OK

        return {
            "success": False,
            "code": "THREAD_UPDATE_FAILED",
            "message": "Failed to update thread.",
        }, HTTPStatus.INTERNAL_SERVER_ERROR

    @forum_thread_ns.expect(delete_thread_model)
    @jwt_token_required
    @admin_required
    def delete(self, cls):
        data = request.json

        id = data.get("id")

        if not id:
            return {
                "success": False,
                "code": "THREAD_ID_MISSING",
                "message": "Thread ID is required.",
            }, HTTPStatus.BAD_REQUEST

        if ForumThread.delete_thread(id):
            return {
                "success": True,
                "code": "THREAD_DELETED",
                "message": "Thread deleted successfully.",
            }, HTTPStatus.OK

        return {
            "success": False,
            "code": "THREAD_NOT_DELETED",
            "message": "Thread not deleted.",
        }, HTTPStatus.INTERNAL_SERVER_ERROR


@forum_thread_ns.route("/threads")
class ForumThreadsApi(Resource):
    @forum_thread_ns.param("keyword", "Search keyword")  # keyword: include everything!
    @forum_thread_ns.param("user_id", "Search by user ID")
    @forum_thread_ns.param("thread_subject", "Search by subject")
    @forum_thread_ns.param("thread_text", "Search by thread text")
    @forum_thread_ns.param("thread_category", "Search by thread category")
    @forum_thread_ns.param(
        "current",
        description="Current page number",
        required=False,
        type="integer",
        default=1,
    )
    @forum_thread_ns.param(
        "pageSize",
        description="Page size",
        required=False,
        type="integer",
        default=BaseConfig.PAGE_SIZE,
    )
    @jwt_token_required
    def get(self, cls):
        data = request.args

        keyword = data.get("keyword")
        user_id = data.get("user_id")
        thread_subject = data.get("thread_subject")
        thread_text = data.get("thread_text")
        thread_category = data.get("thread_category")

        current = data.get("current")
        pageSize = data.get("pageSize")

        if current and current.isdigit():
            current = int(current)
        else:
            current = 1

        if pageSize and pageSize.isdigit():
            pageSize = int(pageSize)
        else:
            pageSize = BaseConfig.PAGE_SIZE

        if keyword:
            threads, total = ForumThread.search_threads_and_replies(
                keyword, current, pageSize
            )
        elif user_id:
            threads, total = ForumThread.get_threads_by_user_id_paginated(
                user_id, current, pageSize
            )
        elif thread_subject:
            threads, total = ForumThread.get_threads_by_thread_subject_paginated(
                thread_subject, current, pageSize
            )
        elif thread_text:
            threads, total = ForumThread.get_threads_by_thread_text_paginated(
                thread_text, current, pageSize
            )
        elif thread_category:
            threads, total = ForumThread.get_threads_by_category_paginated(
                thread_category, current, pageSize
            )
        else:
            threads, total = ForumThread.get_threads_paginated(current, pageSize)

        return {
            "success": True,
            "code": "THREADS_FOUND",
            "message": "Success.",
            "data": {
                "threads": [thread.to_dict() for thread in threads],
                "pagination": {
                    "current": current,
                    "pageSize": pageSize,
                    "total": total,
                },
            },
        }, HTTPStatus.OK
