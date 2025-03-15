# -*- encoding: utf-8 -*-

from . import db
from .base import Base

token_type_enum = db.Enum('token', 'vCode', name='token_type_enum')

class JWTTokenBlocklist(Base):

    __tablename__ = 'jwt_token_blocklist'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True, unique=True)

    jwt_token = db.Column(db.Text(), unique=True, nullable=False)
    token_type = db.Column(token_type_enum, nullable=False)

    def __init__(self, jwt_token, token_type):
        self.jwt_token = jwt_token
        self.token_type = token_type

    @classmethod
    def is_token_blocklisted(cls, token):
        return db.session.query(db.exists().where(cls.jwt_token == token)).scalar()