from . import db
from .base import Base

class Category(Base):
    __tablename__ = 'nav_category'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(255), nullable=False)
    name_en = db.Column(db.String(255), nullable=True)
    abbreviation = db.Column(db.String(255), nullable=True)
    dept_website = db.Column(db.String(255), nullable=True)
    cover = db.Column(db.String(255), nullable=True)

    web_addresses = db.relationship("WebAddress", backref="nav_category", lazy=True, cascade="all, delete-orphan")

    def __init__(self, name, name_en, abbreviation, dept_website, cover):
        self.name = name
        self.name_en = name_en
        self.abbreviation = abbreviation
        self.dept_website = dept_website
        self.cover = cover

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "name_en": self.name_en,
            "abbreviation": self.abbreviation,
            "dept_website": self.dept_website,
            "cover": self.cover,
            "web_addresses": [web_address.to_dict() for web_address in self.web_addresses]
        }
    
    @classmethod
    def get_category_by_id(cls, category_id):
        return cls.query.filter_by(id=category_id).first()
    
    @classmethod
    def get_category_by_name(cls, name):
        return cls.query.filter_by(name=name).first()
    
    @classmethod
    def search_category_by_name(cls, keyword):
        return cls.query.filter(cls.name.ilike(f"%{keyword}%") | cls.name_en.ilike(f"%{keyword}%")).all()
    
    @classmethod
    def get_all_categories(cls):
        return cls.query.all()
    
    @classmethod
    def add_category(cls, name, name_en, abbreviation, dept_website, cover):
        category = cls(name, name_en, abbreviation, dept_website, cover)
        cls.save(category)
        return category
    
    @classmethod
    def delete_category(cls, category_id):
        category = cls.query.filter_by(id=category_id).first()
        if category:
            cls.delete(category)
            return True
        return False
    
    @classmethod
    def update_category(cls, category_id, name, name_en, abbreviation, dept_website, cover):
        category = cls.query.filter_by(id=category_id).first()
        if category:
            category.name = name
            category.name_en = name_en
            category.abbreviation = abbreviation
            category.dept_website = dept_website
            category.cover = cover
            cls.save(category)
            return category
        return None


class WebAddress(Base):
    __tablename__ = 'nav_webaddr'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    category_id = db.Column(db.Integer, db.ForeignKey('nav_category.id'), nullable=False)
    url = db.Column(db.String(255), nullable=False)
    icon = db.Column(db.String(255), nullable=True)
    title = db.Column(db.String(255), nullable=False)
    title_en = db.Column(db.String(255), nullable=True)
    subtitle = db.Column(db.String(255), nullable=True)
    subtitle_en = db.Column(db.String(255), nullable=True)
    description = db.Column(db.Text, nullable=True)
    description_en = db.Column(db.Text, nullable=True)

    def __init__(self, category_id, url, icon, title, title_en, subtitle, subtitle_en, description, description_en):
        self.category_id = category_id
        self.url = url
        self.icon = icon
        self.title = title
        self.title_en = title_en
        self.subtitle = subtitle
        self.subtitle_en = subtitle_en
        self.description = description
        self.description_en = description_en

    def to_dict(self):
        return {
            "id": self.id,
            "category_id": self.category_id,
            "url": self.url,
            "icon": self.icon,
            "title": self.title,
            "title_en": self.title_en,
            "subtitle": self.subtitle,
            "subtitle_en": self.subtitle_en,
            "description": self.description,
            "description_en": self.description_en
        }

    @classmethod
    def get_web_address_by_id(cls, id):
        return cls.query.filter_by(id=id).first()
    
    @classmethod
    def get_web_address_by_url(cls, url):
        return cls.query.filter_by(url=url).first()
    
    @classmethod
    def get_web_addresses_by_category_id(cls, category_id):
        return cls.query.filter_by(category_id=category_id).all()
    
    @classmethod
    def get_all_web_addresses(cls):
        return cls.query.all()

    @classmethod
    def add_web_address(cls, category_id, url, icon, title, title_en, subtitle, subtitle_en, description, description_en):
        web_address = cls(category_id, url, icon, title, title_en, subtitle, subtitle_en, description, description_en)
        cls.save(web_address)
        return web_address
    
    @classmethod
    def delete_web_address(cls, id):
        web_address = cls.query.filter_by(id=id).first()
        if web_address:
            cls.delete(web_address)
            return True
        return False
    
    @classmethod
    def update_web_address(cls, id, category_id, url, icon, title, title_en, subtitle, subtitle_en, description, description_en):
        web_address = cls.query.filter_by(id=id).first()
        if web_address:
            web_address.category_id = category_id
            web_address.url = url
            web_address.icon = icon
            web_address.title = title
            web_address.title_en = title_en
            web_address.subtitle = subtitle
            web_address.subtitle_en = subtitle_en
            web_address.description = description
            web_address.description_en = description_en
            cls.save(web_address)
            return web_address
        return None
