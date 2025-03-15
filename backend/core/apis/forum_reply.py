# -*- encoding: utf-8 -*-

from http import HTTPStatus
from flask import request
from flask_restx import Namespace, Resource, fields
from functools import wraps

from core.config import BaseConfig
from core.models import ForumThread, ForumReply

from .user import jwt_token_required, admin_required

forum_reply_ns = Namespace(name="Forum Reply", description="Forum Reply Related APIs")

"""
    Models
"""

add_reply_model = forum_reply_ns.model(
    "AddReply",
    {
        "thread_id": fields.Integer(required=True, description="Thread ID", example=1),
        "reply_text": fields.String(
            required=True, description="Reply text", example="Reply text"
        ),
    },
)

update_reply_model = forum_reply_ns.model(
    "UpdateReply",
    {
        "reply_id": fields.Integer(required=True, description="Reply ID", example=1),
        "reply_text": fields.String(
            required=True, description="Reply text", example="Reply text"
        ),
    },
)

delete_reply_model = forum_reply_ns.model(
    "DeleteReply",
    {"reply_id": fields.Integer(required=True, description="Reply ID", example=1)},
)

"""
    Flask-Restx routes
"""


@forum_reply_ns.route("/reply")
class ForumReplyApi(Resource):
    @forum_reply_ns.expect(add_reply_model)
    @jwt_token_required
    @admin_required
    def post(self, cls):
        data = request.json

        user_id = self.id
        thread_id = data.get("thread_id")
        reply_text = data.get("reply_text")

        if not user_id:
            return {
                "success": False,
                "code": "USER_ID_MISSING",
                "message": "User ID is required.",
            }, HTTPStatus.BAD_REQUEST

        if not thread_id:
            return {
                "success": False,
                "code": "THREAD_ID_MISSING",
                "message": "Thread ID is required.",
            }, HTTPStatus.BAD_REQUEST

        if not reply_text:
            return {
                "success": False,
                "code": "REPLY_TEXT_MISSING",
                "message": "Reply text is required.",
            }, HTTPStatus.BAD_REQUEST

        reply = ForumReply.add_reply(thread_id, user_id, reply_text)

        if reply:
            return {
                "success": True,
                "code": "REPLY_ADDED",
                "message": "Reply added successfully.",
                "data": reply.to_dict(),
            }, HTTPStatus.CREATED

        return {
            "success": False,
            "code": "REPLY_NOT_ADDED",
            "message": "Failed to add reply.",
        }, HTTPStatus.INTERNAL_SERVER_ERROR

    @jwt_token_required
    @forum_reply_ns.param("id", "Reply ID")
    def get(self, cls):
        data = request.args

        reply_id = data.get("id")

        if reply_id:
            reply = ForumReply.get_reply_by_id(reply_id)
            if reply:
                return {
                    "success": True,
                    "code": "REPLY_FOUND",
                    "message": "Success.",
                    "data": reply.to_dict(),
                }, HTTPStatus.OK

            return {
                "success": False,
                "code": "REPLY_NOT_FOUND",
                "message": "Reply not found.",
            }, HTTPStatus.NOT_FOUND

    @forum_reply_ns.expect(delete_reply_model)
    @jwt_token_required
    @admin_required
    def delete(self, cls):
        data = request.json

        id = data.get("id")

        if not id:
            return {
                "success": False,
                "code": "REPLY_ID_MISSING",
                "message": "Reply ID is required.",
            }, HTTPStatus.BAD_REQUEST

        reply = ForumReply.delete_reply(id)

        if reply:
            return {
                "success": True,
                "code": "REPLY_DELETED",
                "message": "Reply deleted successfully.",
            }, HTTPStatus.OK

        return {
            "success": False,
            "code": "REPLY_DELETE_FAILED",
            "message": "Failed to delete reply.",
        }, HTTPStatus.INTERNAL_SERVER_ERROR

    @forum_reply_ns.expect(update_reply_model)
    @jwt_token_required
    @admin_required
    def put(self, cls):
        data = request.json

        id = data.get("id")
        reply_text = data.get("reply_text")

        if not id:
            return {
                "success": False,
                "code": "REPLY_ID_MISSING",
                "message": "Reply ID is required.",
            }, HTTPStatus.BAD_REQUEST

        if not reply_text:
            return {
                "success": False,
                "code": "REPLY_TEXT_MISSING",
                "message": "Reply text is required.",
            }, HTTPStatus.BAD_REQUEST

        reply = ForumReply.update_reply(id, reply_text)

        if reply:
            return {
                "success": True,
                "code": "REPLY_UPDATED",
                "message": "Reply updated successfully.",
                "data": reply.to_dict(),
            }, HTTPStatus.OK

        return {
            "success": False,
            "code": "REPLY_UPDATE_FAILED",
            "message": "Failed to update reply.",
        }, HTTPStatus.INTERNAL_SERVER_ERROR


@forum_reply_ns.route("/replies")
class ForumRepliesApi(Resource):
    @forum_reply_ns.param(
        "thread_id", description="Thread ID", required=True, type="integer"
    )
    @forum_reply_ns.param(
        "current",
        description="Current page number",
        required=False,
        type="integer",
        default=1,
    )
    @forum_reply_ns.param(
        "pageSize",
        description="Page size",
        required=False,
        type="integer",
        default=BaseConfig.PAGE_SIZE,
    )
    @jwt_token_required
    def get(self, cls):
        data = request.args

        thread_id = data.get("thread_id")
        current = data.get("current")
        pageSize = data.get("pageSize")

        if not thread_id:
            return {
                "success": False,
                "code": "THREAD_ID_MISSING",
                "message": "Thread ID is required.",
            }, HTTPStatus.BAD_REQUEST

        if current:
            current = int(current)
        else:
            current = 1

        if pageSize:
            pageSize = int(pageSize)
        else:
            pageSize = BaseConfig.PAGE_SIZE

        replies, total = ForumReply.get_replies_by_thread_id_paginated(
            thread_id, current, pageSize
        )

        return {
            "success": True,
            "code": "SUCCESS",
            "message": "Success.",
            "data": {
                "replies": [reply.to_dict() for reply in replies],
                "pagination": {
                    "current": current,
                    "pageSize": pageSize,
                    "total": total,
                },
            },
        }, HTTPStatus.OK
