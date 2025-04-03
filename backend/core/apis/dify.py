# -*- encoding: utf-8 -*-

from http import HTTPStatus
from flask import request, jsonify, Response, stream_with_context
from flask_restx import Namespace, Resource, fields
from functools import wraps
import requests

from core.config import BaseConfig

from .user import jwt_token_required, admin_required

dify_ns = Namespace(name="Dify API", description="A Proxy API for the Dify API")

"""
    Models
"""


"""
    Flask-Restx routes
"""


@dify_ns.route("/chat-messages")
class DIFYChatMessagesProxy(Resource):
    @jwt_token_required
    def post(self, cls):
        data = request.json
        data["user"] = self.get_uuid()
        # print(data)

        headers = {
            "Authorization": "Bearer " + BaseConfig.DIFY_APP_API_KEY,
            "Content-Type": "application/json",
        }

        response_mode = data.get("response_mode", "")
        stream = response_mode == "streaming"
        dify_api_endpoint = BaseConfig.DIFY_API_BASE + "/chat-messages"

        response = requests.post(
            url=dify_api_endpoint,
            headers=headers,
            json=data,
            stream=stream,
            verify=False,
        )

        if stream:

            def generate():
                for chunk in response.iter_content(chunk_size=1024):
                    yield chunk

            return Response(
                stream_with_context(generate()),
                content_type=response.headers["Content-Type"],
            )
        else:
            return response.json()


# 获取对话历史消息
@dify_ns.route("/messages")
class DIFYMessagesProxy(Resource):
    @jwt_token_required
    def get(self, cls):
        data = request.args.to_dict()
        data["user"] = self.get_uuid()

        headers = {
            "Authorization": "Bearer " + BaseConfig.DIFY_APP_API_KEY,
        }

        dify_api_endpoint = BaseConfig.DIFY_API_BASE + "/messages"

        response = requests.get(
            url=dify_api_endpoint, headers=headers, params=data, verify=False
        )

        return response.json()


# 获取对话历史消息-分享
@dify_ns.route("/shared-messages")
class DIFYSharedMessagesProxy(Resource):
    def get(cls):
        data = request.args.to_dict()

        conversation_id = data["conversation_id"]
        user = data["user"]

        if not conversation_id:
            return {
                "success": False,
                "message": "conversation_id is required",
            }, HTTPStatus.BAD_REQUEST
        if not user:
            return {
                "success": False,
                "message": "user is required",
            }, HTTPStatus.BAD_REQUEST

        new_data = {
            "conversation_id": conversation_id,
            "user": user,
        }  # 防止用户传入其他参数

        headers = {
            "Authorization": "Bearer " + BaseConfig.DIFY_APP_API_KEY,
        }

        dify_api_endpoint = BaseConfig.DIFY_API_BASE + "/messages"

        response = requests.get(
            url=dify_api_endpoint, headers=headers, params=new_data, verify=False
        )

        return response.json()


# 获取下一轮建议问题列表
@dify_ns.route("/messages/<string:message_id>/suggested")
class DIFYMetaProxy(Resource):
    @jwt_token_required
    def get(self, cls, message_id):
        data = dict()
        data["user"] = self.get_uuid()

        headers = {
            "Authorization": "Bearer " + BaseConfig.DIFY_APP_API_KEY,
        }

        dify_api_endpoint = (
            BaseConfig.DIFY_API_BASE + "/messages/" + message_id + "/suggested"
        )

        response = requests.get(
            url=dify_api_endpoint, headers=headers, params=data, verify=False
        )

        return response.json()


# 获取会话列表
@dify_ns.route("/conversations")
class DIFYConversationsProxy(Resource):
    @jwt_token_required
    def get(self, cls):
        data = request.args.to_dict()
        data["user"] = self.get_uuid()
        # print(data)

        headers = {
            "Authorization": "Bearer " + BaseConfig.DIFY_APP_API_KEY,
        }

        dify_api_endpoint = BaseConfig.DIFY_API_BASE + "/conversations"

        response = requests.get(
            url=dify_api_endpoint, headers=headers, params=data, verify=False
        )

        return response.json()


# 重命名会话
@dify_ns.route("/conversations/<string:conversation_id>/name")
class DIFYConversationsRenameProxy(Resource):
    @jwt_token_required
    def post(self, cls, conversation_id):
        data = request.json
        data["user"] = self.get_uuid()
        # print(data)

        headers = {
            "Authorization": "Bearer " + BaseConfig.DIFY_APP_API_KEY,
            "Content-Type": "application/json",
        }

        dify_api_endpoint = (
            BaseConfig.DIFY_API_BASE + "/conversations/" + conversation_id + "/name"
        )

        response = requests.post(
            url=dify_api_endpoint, headers=headers, json=data, verify=False
        )

        return response.json()


# 删除会话
@dify_ns.route("/conversations/<string:conversation_id>")
class DIFYConversationsDeteleProxy(Resource):
    @jwt_token_required
    @admin_required
    def delete(self, cls, conversation_id):
        # data = request.json
        data = dict()
        data["user"] = self.get_uuid()
        # print(data)

        headers = {
            "Authorization": "Bearer " + BaseConfig.DIFY_APP_API_KEY,
            "Content-Type": "application/json",
        }

        dify_api_endpoint = (
            BaseConfig.DIFY_API_BASE + "/conversations/" + conversation_id
        )

        response = requests.delete(
            url=dify_api_endpoint, headers=headers, json=data, verify=False
        )

        return response.json()


# 知识库列表
@dify_ns.route("/datasets")
class DIFYDatasetsProxy(Resource):
    @jwt_token_required
    @admin_required
    def get(self, cls):
        data = request.args.to_dict()

        headers = {
            "Authorization": "Bearer " + BaseConfig.DIFY_DATASET_API_KEY,
        }

        dify_api_endpoint = BaseConfig.DIFY_API_BASE + "/datasets"

        response = requests.get(
            url=dify_api_endpoint, headers=headers, params=data, verify=False
        )

        return response.json()


# 知识库文档列表
@dify_ns.route("/datasets/<string:dataset_id>/documents")
class DIFYDatasetsDocumentsProxy(Resource):
    @jwt_token_required
    @admin_required
    def get(self, cls, dataset_id):
        data = request.args.to_dict()

        headers = {
            "Authorization": "Bearer " + BaseConfig.DIFY_DATASET_API_KEY,
        }

        dify_api_endpoint = (
            BaseConfig.DIFY_API_BASE + "/datasets/" + dataset_id + "/documents"
        )

        response = requests.get(
            url=dify_api_endpoint, headers=headers, params=data, verify=False
        )
        # print (response)
        return response.json()


# 删除文档
@dify_ns.route("/datasets/<string:dataset_id>/documents/<string:document_id>")
class DIFYDatasetsDocumentsDeleteProxy(Resource):
    @jwt_token_required
    @admin_required
    def delete(self, cls, dataset_id, document_id):

        headers = {
            "Authorization": "Bearer " + BaseConfig.DIFY_DATASET_API_KEY,
        }

        dify_api_endpoint = (
            BaseConfig.DIFY_API_BASE
            + "/datasets/"
            + dataset_id
            + "/documents/"
            + document_id
        )

        response = requests.delete(url=dify_api_endpoint, headers=headers, verify=False)

        return response.json()


# 通过文件创建文档
@dify_ns.route("/datasets/<string:dataset_id>/document/create-by-file")
class DIFYDatasetsDocumentsCreateByFileProxy(Resource):
    @jwt_token_required
    @admin_required
    def post(self, cls, dataset_id):
        data = request.form.copy()
        file = request.files["file"]

        headers = {
            "Authorization": "Bearer " + BaseConfig.DIFY_DATASET_API_KEY,
        }

        dify_api_endpoint = (
            BaseConfig.DIFY_API_BASE
            + "/datasets/"
            + dataset_id
            + "/document/create-by-file"
        )

        files = {"file": (file.filename, file, file.content_type)}

        response = requests.post(
            url=dify_api_endpoint, headers=headers, data=data, files=files, verify=False
        )

        return response.json()


"""
For demo only, not used in production
"""

@dify_ns.route("/demo/chat-messages")
class DIFYChatMessagesProxy(Resource):
    def post(cls):
        data = request.json
        data["user"] = "demo_user"
        # print(data)

        headers = {
            "Authorization": "Bearer " + BaseConfig.DIFY_APP_API_KEY,
            "Content-Type": "application/json",
        }

        response_mode = data.get("response_mode", "")
        stream = response_mode == "streaming"
        dify_api_endpoint = BaseConfig.DIFY_API_BASE + "/chat-messages"

        response = requests.post(
            url=dify_api_endpoint,
            headers=headers,
            json=data,
            stream=stream,
            verify=False,
        )

        if stream:

            def generate():
                for chunk in response.iter_content(chunk_size=1024):
                    yield chunk

            return Response(
                stream_with_context(generate()),
                content_type=response.headers["Content-Type"],
            )
        else:
            return response.json()


# 获取对话历史消息
@dify_ns.route("/demo/messages")
class DIFYMessagesProxy(Resource):
    def get(cls):
        data = request.args.to_dict()
        data["user"] = "demo_user"

        headers = {
            "Authorization": "Bearer " + BaseConfig.DIFY_APP_API_KEY,
        }

        dify_api_endpoint = BaseConfig.DIFY_API_BASE + "/messages"

        response = requests.get(
            url=dify_api_endpoint, headers=headers, params=data, verify=False
        )

        return response.json()


# 获取下一轮建议问题列表
@dify_ns.route("/demo/messages/<string:message_id>/suggested")
class DIFYMetaProxy(Resource):
    def get(cls, message_id):
        data = dict()
        data["user"] = "demo_user"

        headers = {
            "Authorization": "Bearer " + BaseConfig.DIFY_APP_API_KEY,
        }

        dify_api_endpoint = (
            BaseConfig.DIFY_API_BASE + "/messages/" + message_id + "/suggested"
        )

        response = requests.get(
            url=dify_api_endpoint, headers=headers, params=data, verify=False
        )

        return response.json()


# 获取会话列表
@dify_ns.route("/demo/conversations")
class DIFYConversationsProxy(Resource):
    def get(cls):
        data = request.args.to_dict()
        data["user"] = "demo_user"
        # print(data)

        headers = {
            "Authorization": "Bearer " + BaseConfig.DIFY_APP_API_KEY,
        }

        dify_api_endpoint = BaseConfig.DIFY_API_BASE + "/conversations"

        response = requests.get(
            url=dify_api_endpoint, headers=headers, params=data, verify=False
        )

        return response.json()