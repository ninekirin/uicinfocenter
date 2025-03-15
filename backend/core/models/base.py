# -*- encoding: utf-8 -*-

from datetime import datetime
from . import db

class Base(db.Model):
    __abstract__ = True
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True, unique=True)
    
    def __init__(self):
        pass
    
    def __repr__(self):
        return f"{self.__class__.__name__}"

    def save(self):
        db.session.add(self)
        db.session.commit()

    def delete(self):
        db.session.delete(self)
        db.session.commit()

    def to_dict(self):
        return {column.name: str(getattr(self, column.name)) for column in self.__table__.columns}