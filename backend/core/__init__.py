# -*- encoding: utf-8 -*-

import json

from flask import Flask
from flask_cors import CORS

from .models import db
from .apis import rest_api

from .utils import mail

app = Flask(__name__)

app.config.from_object('core.config.BaseConfig')

db.init_app(app)
rest_api.init_app(app)
mail.init_app(app)
CORS(app)

"""
    Database initialization
    Create tables if they don't exist
    WARNING: This will not create the database, only the tables.
    So, you need to create the database first. (MySQL only)
"""

@app.before_request
def initialize_database():
    db.create_all()

# """
#     Request handlers
# """

@app.after_request
def after_request(response):
    """
        after_request handler
    """
    if int(response.status_code) >= 400:
        response_data = json.loads(response.get_data())
        if "errors" in response_data: # flask-restx model validation error
            response_data = {"success": False,
                             "code": "VALIDATION_ERROR",
                             "message": list(response_data["errors"].items())[0][1]}
            response.set_data(json.dumps(response_data))
    return response


@app.errorhandler(404)
def not_found(error):

    return {"success": False,
            "message": "Not found."}, 404