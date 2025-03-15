# -*- encoding: utf-8 -*-

from . import db
from .base import Base
from .user import User


class ForumReply(Base):

    __tablename__ = "forum_reply"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True, unique=True)

    thread_id = db.Column(db.Integer, db.ForeignKey("forum_thread.id"), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    reply_text = db.Column(db.Text())

    def __init__(self, thread_id, user_id, reply_text):
        super(ForumReply, self).__init__()
        self.thread_id = thread_id
        self.user_id = user_id
        self.reply_text = reply_text

    def to_dict(self):
        return {
            "id": self.id,
            "thread_id": self.thread_id,
            "user_id": self.user_id,
            "username": User.get_by_id(self.user_id).username,
            "reply_text": self.reply_text,
        }

    @classmethod
    def get_reply_by_id(cls, reply_id):
        return cls.query.filter_by(id=reply_id).first()

    @classmethod
    def get_replies_by_thread_id(cls, thread_id):
        return cls.query.filter_by(thread_id=thread_id).all()

    @classmethod
    def get_replies_by_thread_id_paginated(cls, thread_id, page, per_page):
        result = cls.query.filter_by(thread_id=thread_id).paginate(
            page=page, per_page=per_page, error_out=False
        )
        return result.items, result.total

    @classmethod
    def add_reply(cls, thread_id, user_id, reply_text):
        reply = cls(thread_id, user_id, reply_text)
        cls.save(reply)

        return reply

    @classmethod
    def delete_reply(cls, reply_id):
        reply = cls.get_reply_by_id(reply_id)
        cls.delete(reply)

        return reply

    @classmethod
    def update_reply(cls, reply_id, reply_text):
        reply = cls.get_reply_by_id(reply_id)
        reply.reply_text = reply_text
        cls.save(reply)

        return reply
