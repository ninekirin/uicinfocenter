# -*- encoding: utf-8 -*-

from datetime import datetime, timedelta
from sqlalchemy import func
from werkzeug.security import generate_password_hash, check_password_hash
from uuid import uuid4
from . import db
from .base import Base
from core.utils import convert_dt

user_type_enum = db.Enum(
    "ADMIN",
    "TEACHER",
    "STUDENT",
    "ALUMNI",
    "GUEST",
    name="user_type_enum",
    default="STUDENT",
)
account_status_enum = db.Enum(
    "ACTIVE", "INACTIVE", name="account_status_enum", default="ACTIVE"
)


class User(Base):

    __tablename__ = "user"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True, unique=True)
    uuid = db.Column(db.String(36), unique=True, nullable=False)
    username = db.Column(db.String(32), unique=True, nullable=False)
    email = db.Column(db.String(128), unique=True, nullable=False)
    password = db.Column(db.Text(), nullable=False)
    user_type = db.Column(user_type_enum, nullable=False)
    account_status = db.Column(account_status_enum, nullable=False)
    default_entrypoint = db.Column(db.String(128))
    jwt_auth_active = db.Column(db.Boolean())
    last_online = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=func.now(), nullable=False)
    updated_at = db.Column(
        db.DateTime,
        default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    def __init__(
        self,
        id,
        uuid,
        username,
        email,
        password,
        user_type,
        account_status,
        default_entrypoint,
    ):
        super(User, self).__init__()
        self.id = id
        self.uuid = uuid
        self.username = username
        self.email = email
        self.password = password
        self.user_type = user_type
        self.account_status = account_status
        self.default_entrypoint = default_entrypoint

    def get_id(self):
        return self.id

    def get_uuid(self):
        return self.uuid

    def get_username(self):
        return self.username

    def set_username(self, username):
        self.username = username

    def get_email(self):
        return self.email

    def set_email(self, email):
        self.email = email

    def check_password(self, password):
        return check_password_hash(self.password, password)

    def set_password(self, password):
        self.password = generate_password_hash(password)

    def get_user_type(self):
        return self.user_type

    def set_user_type(self, user_type):
        self.user_type = user_type

    def get_account_status(self):
        return self.account_status

    def set_account_status(self, account_status):
        self.account_status = account_status

    def get_default_entrypoint(self):
        return self.default_entrypoint

    def set_default_entrypoint(self, default_entrypoint):
        self.default_entrypoint = default_entrypoint

    def check_jwt_auth_active(self):
        return self.jwt_auth_active

    def set_jwt_auth_active(self, set_status):
        self.jwt_auth_active = set_status

    def get_last_online(self):
        return convert_dt(self.last_online)

    def set_last_online(self):
        self.last_online = func.now()

    def to_dict(self):
        return {
            "id": self.id,
            "uuid": self.uuid,
            "username": self.username,
            "email": self.email,
            "user_type": self.user_type,
            "account_status": self.account_status,
            "default_entrypoint": self.default_entrypoint,
            "last_online": convert_dt(self.last_online),
            "created_at": convert_dt(self.created_at),
            "updated_at": convert_dt(self.updated_at),
        }

    @classmethod
    def register(
        cls,
        username,
        email,
        password,
        user_type,
        account_status,
        default_entrypoint,
    ):
        user = cls(
            id=None,
            uuid=str(uuid4()),
            username=username,
            email=email,
            password=generate_password_hash(password),
            user_type=user_type,
            account_status=account_status,
            default_entrypoint=default_entrypoint,
        )
        try:
            cls.save(user)
            return True
        except Exception as e:
            return False

    @classmethod
    def delete_user(cls, user_id):
        user = cls.get_by_id(user_id)
        if user:
            cls.delete(user)
            return True
        return False

    @classmethod
    def get_by_email(cls, email):
        return cls.query.filter_by(email=email).first()

    @classmethod
    def get_by_id(cls, user_id):
        return cls.query.filter_by(id=user_id).first()
    
    @classmethod
    def get_by_uuid(cls, uuid):
        return cls.query.filter_by(uuid=uuid).first()

    @classmethod
    def get_by_username(cls, username):
        return cls.query.filter_by(username=username).first()

    @classmethod
    def get_all_users_paginated(cls, page, per_page):
        result = cls.query.paginate(page=page, per_page=per_page, error_out=False)
        return result.items, result.total
