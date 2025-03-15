# -*- encoding: utf-8 -*-

from http import HTTPStatus
from flask import request, jsonify, Response, stream_with_context
from flask_restx import Namespace, Resource, fields
from functools import wraps
import requests

from core.config import BaseConfig

from .user import jwt_token_required, admin_required, teacher_required

llmapi_ns = Namespace(name="LLM API", description="A Proxy API for the LLMs")

"""
    Models
"""

# Define the request model for the LLM API
chatgpt_request_model = llmapi_ns.model('ChatGPTRequest', {
    'model': fields.String(required=True, description="Model to use", example="gpt-3.5-turbo"),
    'messages': fields.List(fields.Nested(llmapi_ns.model('Message', {
        'role': fields.String(required=True, description="Role of the message", example="user"),
        'content': fields.String(required=True, description="Content of the message", example="who are you?")
    }))),
    'stream': fields.Boolean(required=True, description="Stream the response", example=False),
    'presence_penalty': fields.Float(required=False, description="Presence penalty", example=0.0),
    'frequency_penalty': fields.Float(required=False, description="Frequency penalty", example=0.0),
    'temperature': fields.Float(required=False, description="Temperature", example=0.7),
    'max_tokens': fields.Integer(required=False, description="Maximum tokens", example=2048)
})

"""
    Flask-Restx routes
"""

@llmapi_ns.route("/chatgpt/chat/completions")
class ChatGPTAPIProxy(Resource):
    @llmapi_ns.expect(chatgpt_request_model)
    @jwt_token_required
    def post(self, cls):
        data = request.json
        
        headers = {
            'Authorization': 'Bearer ' + BaseConfig.CHATGPT_API_KEY,
            'Content-Type': 'application/json'
        }

        stream = data.get('stream', False)
        chatgpt_api_endpoint = BaseConfig.CHATGPT_API_BASE + "/chat/completions"
        
        response = requests.post(chatgpt_api_endpoint, headers=headers, json=data, stream=stream)

        if stream:
            def generate():
                for chunk in response.iter_content(chunk_size=1024):
                    yield chunk

            return Response(stream_with_context(generate()), content_type=response.headers['Content-Type'])
        else:
            return jsonify(response.json())
