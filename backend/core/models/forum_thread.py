# -*- encoding: utf-8 -*-

from core.models.forum_reply import ForumReply
from . import db
from .base import Base
from .user import User

class ForumThread(Base):
    
    __tablename__ = 'forum_thread'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True, unique=True)
    
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    thread_subject = db.Column(db.String(255), nullable=False)
    thread_text = db.Column(db.Text())
    thread_category = db.Column(db.String(255), nullable=False)

    thread_replies = db.relationship('ForumReply', backref='forum_thread', lazy=True, cascade='all, delete-orphan')

    def __init__(self, user_id, thread_subject, thread_text, thread_category):
        super(ForumThread, self).__init__()
        self.user_id = user_id
        self.thread_subject = thread_subject
        self.thread_text = thread_text
        self.thread_category = thread_category

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "username": User.get_by_id(self.user_id).username,
            "thread_subject": self.thread_subject,
            "thread_text": self.thread_text,
            "thread_category": self.thread_category
        }
    
    @classmethod
    def get_thread_by_id(cls, thread_id):
        return cls.query.filter_by(id=thread_id).first()
    
    @classmethod
    def get_threads_by_user_id(cls, user_id):
        return cls.query.filter_by(user_id=user_id).all()
    
    @classmethod
    def get_threads_by_user_id_paginated(cls, user_id, page, per_page):
        result = cls.query.filter_by(user_id=user_id).paginate(page=page, per_page=per_page, error_out=False)
        return result.items, result.total
    
    @classmethod
    def get_threads_by_thread_subject(cls, thread_subject):
        return cls.query.filter_by(thread_subject=thread_subject).all()
    
    @classmethod
    def get_threads_by_thread_subject_paginated(cls, thread_subject, page, per_page):
        result = cls.query.filter_by(thread_subject=thread_subject).paginate(page=page, per_page=per_page, error_out=False)
        return result.items, result.total
    
    @classmethod
    def get_threads_by_thread_text(cls, thread_text):
        return cls.query.filter_by(thread_text=thread_text).all()
    
    @classmethod
    def get_threads_by_thread_text_paginated(cls, thread_text, page, per_page):
        result = cls.query.filter_by(thread_text=thread_text).paginate(page=page, per_page=per_page, error_out=False)
        return result.items, result.total
    
    @classmethod
    def get_threads_by_category(cls, thread_category):
        return cls.query.filter_by(thread_category=thread_category).all()
    
    @classmethod
    def get_threads_by_category_paginated(cls, thread_category, page, per_page):
        result = cls.query.filter_by(thread_category=thread_category).paginate(page=page, per_page=per_page, error_out=False)
        return result.items, result.total
    
    @classmethod
    def get_threads(cls):
        return cls.query.all()
    
    @classmethod
    def get_threads_paginated(cls, page, per_page):
        result = cls.query.paginate(page=page, per_page=per_page, error_out=False)
        return result.items, result.total
    
    @classmethod
    def search_threads(cls, keyword, page, per_page):
        result = cls.query.filter(cls.thread_subject.contains(keyword) | cls.thread_text.contains(keyword) | cls.thread_category.contains(keyword)).paginate(page=page, per_page=per_page, error_out=False)
        return result.items, result
    
    # 有问题
    @classmethod
    def search_threads_and_replies(cls, keyword, page, per_page):
        # 同时查询主题和帖子回复，返回符合要求的帖子
        threads = cls.query.filter(cls.thread_subject.contains(keyword) | cls.thread_text.contains(keyword) | cls.thread_category.contains(keyword) | cls.thread_replies.any(ForumReply.reply_text.contains(keyword))).paginate(page=page, per_page=per_page, error_out=False)
        return threads.items, threads.total
    
    @classmethod
    def add_thread(cls, user_id, thread_subject, thread_text, thread_category):
        thread = cls(user_id, thread_subject, thread_text, thread_category)
        cls.save(thread)

        return thread
    
    @classmethod
    def delete_thread(cls, thread_id):
        thread = cls.query.filter_by(id=thread_id).first()
        if thread:
            cls.delete(thread)
            return True
        return False
    
    @classmethod
    def update_thread(cls, thread_id, thread_subject, thread_text, thread_category):
        thread = cls.query.filter_by(id=thread_id).first()
        if thread:
            thread.thread_subject = thread_subject
            thread.thread_text = thread_text
            thread.thread_category = thread_category
            cls.save(thread)
            return thread
        return None