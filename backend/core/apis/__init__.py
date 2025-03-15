# -*- encoding: utf-8 -*-

from flask_restx import Api

from .user import user_ns
from .course import course_ns
from .section import section_ns
from .teacher import teacher_ns
from .forum_thread import forum_thread_ns
from .forum_reply import forum_reply_ns
from .llmapi import llmapi_ns
from .dify import dify_ns
from .navigator import nav_ns

authorizations = {
    'Bearer Auth': {
        'type': 'apiKey',
        'in': 'Header',
        'name': 'Authorization',
        'description': 'Bearer token for authentication (JWT token required)'
    }
}

rest_api = Api(version="1.0", title="UIC Information Center API", prefix="/api/v1",
               description="UIC Information Center API", security="Bearer Auth",
               authorizations=authorizations, doc="/docs/")

rest_api.add_namespace(user_ns, path="/user")
rest_api.add_namespace(course_ns, path="/course")
rest_api.add_namespace(section_ns, path="/section")
rest_api.add_namespace(teacher_ns, path="/teacher")
rest_api.add_namespace(forum_thread_ns, path="/forum")
rest_api.add_namespace(forum_reply_ns, path="/forum")
rest_api.add_namespace(llmapi_ns, path="/llmapi")
rest_api.add_namespace(dify_ns, path="/dify")
rest_api.add_namespace(nav_ns, path="/navigator")