# -*- encoding: utf-8 -*-

from http import HTTPStatus
from flask import request
from flask_restx import Namespace, Resource, fields

from core.config import BaseConfig
from core.models import Category, WebAddress

from .user import jwt_token_required, admin_required

nav_ns = Namespace('Navigator', description='Navigator APIs')

"""
    Models
"""

# Model for creating a new category
add_category_model = nav_ns.model('AddCategory', {
    'name': fields.String(required=True, description='Category name'),
    'name_en': fields.String(description='Category name in English'),
    'abbreviation': fields.String(description='Abbreviation for the category'),
    'dept_website': fields.String(description='Department website'),
    'cover': fields.String(description='Cover for the category')
})

# Model for updating a category
update_category_model = nav_ns.model('UpdateCategory', {
    'id': fields.Integer(required=True, description='Category ID'),
    'name': fields.String(required=True, description='Category name'),
    'name_en': fields.String(description='Category name in English'),
    'abbreviation': fields.String(description='Abbreviation for the category'),
    'dept_website': fields.String(description='Department website'),
    'cover': fields.String(description='Cover for the category')
})

# Model for updating a category (ID in URL)
update_category_model_by_id = nav_ns.model('UpdateCategoryById', {
    'name': fields.String(required=True, description='Category name'),
    'name_en': fields.String(description='Category name in English'),
    'abbreviation': fields.String(description='Abbreviation for the category'),
    'dept_website': fields.String(description='Department website'),
    'cover': fields.String(description='Cover for the category')
})

# Model for deleting a category
delete_category_model = nav_ns.model('DeleteCategory', {
    'id': fields.Integer(required=True, description='Category ID')
})

# Model for creating a new web_address
add_web_address_model = nav_ns.model('AddWebAddress', {
    'category_id': fields.Integer(required=True, description='Category ID'),
    'url': fields.String(required=True, description='Web address URL'),
    'icon': fields.String(description='Web Address icon'),
    'title': fields.String(required=True, description='Web address title'),
    'title_en': fields.String(description='Web address title in English'),
    'subtitle': fields.String(description='Web address subtitle'),
    'subtitle_en': fields.String(description='Web address subtitle in English'),
    'description': fields.String(description='Description of the web address'),
    'description_en': fields.String(description='Description of the web address in English')
})

# Model for updating a web_address
update_web_address_model = nav_ns.model('UpdateWebAddress', {
    'id': fields.Integer(required=True, description='Web address ID'),
    'category_id': fields.Integer(description='Category ID'),
    'url': fields.String(required=True, description='Web address URL'),
    'icon': fields.String(description='Web address icon'),
    'title': fields.String(required=True, description='Web address title'),
    'title_en': fields.String(description='Web address title in English'),
    'subtitle': fields.String(description='Web address subtitle'),
    'subtitle_en': fields.String(description='Web address subtitle in English'),
    'description': fields.String(description='Desription of the web address'),
    'description_en': fields.String(description='Description of the web address in English')
})

# Model for updating a web address (ID in URL)
update_web_address_model_by_id = nav_ns.model('UpdateWebAddressById', {
    'category_id': fields.Integer(description='Category ID'),
    'url': fields.String(required=True, description='Web address URL'),
    'icon': fields.String(description='Web address icon'),
    'title': fields.String(required=True, description='Web address title'),
    'title_en': fields.String(description='Web address title in English'),
    'subtitle': fields.String(description='Web address subtitle'),
    'subtitle_en': fields.String(description='Web address subtitle in English'),
    'description': fields.String(description='Description of the web address'),
    'description_en': fields.String(description='Description of the web address in English')
})

# Model for deleting a category
delete_category_model = nav_ns.model('DeleteCategory', {
    'id': fields.Integer(required=True, description='Category ID')
})

"""
    Flask-Restx routes
"""

@nav_ns.route("/category")
class CategoryApi(Resource):
    @nav_ns.expect(add_category_model)
    @jwt_token_required
    @admin_required
    def post(self, cls):
        data = request.json
        
        name = data.get('name')
        name_en = data.get('name_en')
        abbreviation = data.get('abbreviation')
        dept_website = data.get('dept_website')
        cover = data.get('cover')

        # check if required fields are provided
        if not name:
            return {"success": False, "code": "NAME_MISSING", "message": "Category name is required."}, HTTPStatus.BAD_REQUEST
        
        # check if category already exists
        category = Category.get_category_by_name(name)
        if category:
            return {"success": False, "code": "CATEGORY_EXISTS", "message": "Category already exists."}, HTTPStatus.BAD_REQUEST
        
        category = Category.add_category(name, name_en, abbreviation, dept_website, cover)
        if category:
            return {"success": True, "code": "CATEGORY_ADDED", "message": "Category added.", "category": category.to_dict()}, HTTPStatus.CREATED
        else:
            return {"success": False, "code": "CATEGORY_NOT_ADDED", "message": "Category not added."}, HTTPStatus.INTERNAL_SERVER_ERROR
        
    @jwt_token_required
    def get(self, cls):
        data = request.args

        category_id = data.get('id')

        if not category_id:
            return {"success": False, "code": "CATEGORY_ID_MISSING", "message": "Category ID is required."}, HTTPStatus.BAD_REQUEST

        category = Category.get_category_by_id(category_id)
        if not category:
            return {"success": False, "code": "CATEGORY_NOT_FOUND", "message": "Category not found."}, HTTPStatus.NOT_FOUND
        else:
            return {"success": True, "code": "CATEGORY_FOUND", "data": category.to_dict()}, HTTPStatus.OK
        
    @nav_ns.expect(update_category_model)
    @jwt_token_required
    @admin_required
    def put(self, cls):
        data = request.json
        
        category_id = data.get('id')
        name = data.get('name')
        name_en = data.get('name_en')
        abbreviation = data.get('abbreviation')
        dept_website = data.get('dept_website')
        cover = data.get('cover')

        # check if required fields are provided
        if not category_id or not name:
            return {"success": False, "code": "NAME_MISSING", "message": "Category name is required."}, HTTPStatus.BAD_REQUEST
        
        category = Category.get_category_by_id(category_id)
        if not category:
            return {"success": False, "code": "CATEGORY_NOT_FOUND", "message": "Category not found."}, HTTPStatus.NOT_FOUND
        
        category = Category.update_category(category_id, name, name_en, abbreviation, dept_website, cover)
        if category:
            return {"success": True, "code": "CATEGORY_UPDATED", "message": "Category updated.", "data": category.to_dict()}, HTTPStatus.OK
        else:
            return {"success": False, "code": "CATEGORY_NOT_UPDATED", "message": "Category not updated."}, HTTPStatus.INTERNAL_SERVER_ERROR

    @nav_ns.expect(delete_category_model)
    @jwt_token_required
    @admin_required
    def delete(self, cls):
        data = request.json

        category_id = data.get('id')
        if not category_id:
            return {"success": False, "code": "CATEGORY_ID_MISSING", "message": "Category ID is required."}, HTTPStatus.BAD_REQUEST
        
        category = Category.get_category_by_id(category_id)
        if not category:
            return {"success": False, "code": "CATEGORY_NOT_FOUND", "message": "Category not found."}, HTTPStatus.NOT_FOUND
        
        if Category.delete_category(category_id):
            return {"success": True, "code": "CATEGORY_DELETED", "message": "Category deleted."}, HTTPStatus.OK
        else:
            return {"success": False, "code": "CATEGORY_NOT_DELETED", "message": "Category not deleted."}, HTTPStatus.INTERNAL_SERVER_ERROR
    


@nav_ns.route("/category/<int:id>")
class CategoryByIdApi(Resource):
    @jwt_token_required
    def get(self, cls, id):
        category = Category.get_category_by_id(id)
        if not category:
            return {"success": False, "code": "CATEGORY_NOT_FOUND", "message": "Category not found."}, HTTPStatus.NOT_FOUND
        return {"success": True, "code": "CATEGORY_FOUND", "data": category.to_dict()}, HTTPStatus.OK

    @nav_ns.expect(update_category_model_by_id)
    @jwt_token_required
    @admin_required
    def put(self, cls, id):
        data = request.json
        
        name = data.get('name')
        name_en = data.get('name_en')
        abbreviation = data.get('abbreviation')
        dept_website = data.get('dept_website')
        cover = data.get('cover')

        # check if required fields are provided
        if not name or not name_en:
            return {"success": False, "code": "NAME_MISSING", "message": "Category name is required."}, HTTPStatus.BAD_REQUEST
        
        category = Category.get_category_by_id(id)
        if not category:
            return {"success": False, "code": "CATEGORY_NOT_FOUND", "message": "Category not found."}, HTTPStatus.NOT_FOUND
        
        category = Category.update_category(id, name, name_en, abbreviation, dept_website, cover)
        if category:
            return {"success": True, "code": "CATEGORY_UPDATED", "message": "Category updated.", "data": category.to_dict()}, HTTPStatus.OK
        else:
            return {"success": False, "code": "CATEGORY_NOT_UPDATED", "message": "Category not updated."}, HTTPStatus.INTERNAL_SERVER_ERROR
    
    @nav_ns.expect(delete_category_model)
    @jwt_token_required
    @admin_required
    def delete(self, cls, id):
        category = Category.get_category_by_id(id)
        if not category:
            return {"success": False, "code": "CATEGORY_NOT_FOUND", "message": "Category not found."}, HTTPStatus.NOT_FOUND
        
        if Category.delete_category(id):
            return {"success": True, "code": "CATEGORY_DELETED", "message": "Category deleted."}, HTTPStatus.OK
        else:
            return {"success": False, "code": "CATEGORY_NOT_DELETED", "message": "Category not deleted."}, HTTPStatus.INTERNAL_SERVER_ERROR


@nav_ns.route("/categories")
class CategoriesApi(Resource):
    @jwt_token_required
    def get(self, cls):
        categories = Category.get_all_categories()
        if categories:
            return {"success": True, "code": "CATEGORIES_FOUND", "data": [category.to_dict() for category in categories]}, HTTPStatus.OK
        else:
            return {"success": False, "code": "CATEGORIES_NOT_FOUND", "message": "No categories found."}, HTTPStatus.NOT_FOUND


@nav_ns.route("/webaddress")
class WebAddressApi(Resource):
    @nav_ns.expect(add_web_address_model)
    @jwt_token_required
    @admin_required
    def post(self, cls):
        data = request.json
        
        category_id = data.get('category_id')
        url = data.get('url')
        icon = data.get('icon')
        title = data.get('title')
        title_en = data.get('title_en')
        subtitle = data.get('subtitle')
        subtitle_en = data.get('subtitle_en')
        description = data.get('description')
        description_en = data.get('description_en')

        # 检查必填字段是否提供
        if not category_id or not url or not title:
            return {"success": False, "code": "FIELD_MISSING", "message": "Required field is missing."}, HTTPStatus.BAD_REQUEST

        # 检查网址是否已存在
        web_address = WebAddress.get_web_address_by_url(url)
        if web_address:
            return {"success": False, "code": "WEBADDR_EXISTS", "message": "Web address already exists."}, HTTPStatus.BAD_REQUEST
        
        # 添加新网址
        web_address = WebAddress.add_web_address(category_id, url, icon, title, title_en, subtitle, subtitle_en, description, description_en)
        if web_address:
            return {"success": True, "code": "WEBADDR_ADDED", "message": "Web address added.", "web_address": web_address.to_dict()}, HTTPStatus.CREATED
        else:
            return {"success": False, "code": "WEBADDR_NOT_ADDED", "message": "Web address not added."}, HTTPStatus.INTERNAL_SERVER_ERROR

    @jwt_token_required
    def get(self, cls):
        data = request.args

        category_id = data.get('category_id')

        if not category_id:
            return {"success": False, "code": "CATEGORY_ID_MISSING", "message": "Category ID is required."}, HTTPStatus.BAD_REQUEST

        web_addresses = WebAddress.get_web_addresses_by_category_id(category_id)
        if web_addresses:
            return {"success": True, "code": "web_addresses_FOUND", "data": [web_address.to_dict() for web_address in web_addresses]}, HTTPStatus.OK
        else:
            return {"success": False, "code": "web_addresses_NOT_FOUND", "message": "No web addresses found."}, HTTPStatus.NOT_FOUND
        
    @nav_ns.expect(update_web_address_model)
    @jwt_token_required
    @admin_required
    def put(self, cls):
        data = request.json

        id = data.get('id')
        category_id = data.get('category_id')
        url = data.get('url')
        icon = data.get('icon')
        title = data.get('title')
        title_en = data.get('title_en')
        subtitle = data.get('subtitle')
        subtitle_en = data.get('subtitle_en')
        description = data.get('description')
        description_en = data.get('description_en')

        # 检查必填字段是否提供
        if not url or not title:
            return {"success": False, "code": "FIELD_MISSING", "message": "Required field is missing."}, HTTPStatus.BAD_REQUEST
        
        if not category_id:
            category_id = WebAddress.get_web_address_by_id(id).category_id

        web_address = WebAddress.get_web_address_by_id(id)
        if not web_address:
            return {"success": False, "code": "WEBADDR_NOT_FOUND", "message": "Web address not found."}, HTTPStatus.NOT_FOUND

        # 更新网址
        web_address = WebAddress.update_web_address(id, category_id, url, icon, title, title_en, subtitle, subtitle_en, description, description_en)
        if web_address:
            return {"success": True, "code": "WEBADDR_UPDATED", "message": "Web address updated.", "data": web_address.to_dict()}, HTTPStatus.OK
        else:
            return {"success": False, "code": "WEBADDR_NOT_UPDATED", "message": "Web address not updated."}, HTTPStatus.INTERNAL_SERVER_ERROR
    
    @nav_ns.expect(delete_category_model)
    @jwt_token_required
    @admin_required
    def delete(self, cls):
        data = request.json

        id = data.get('id')
        if not id:
            return {"success": False, "code": "WEBADDR_ID_MISSING", "message": "Web address ID is required."}, HTTPStatus.BAD_REQUEST
        
        web_address = WebAddress.get_web_address_by_id(id)
        if not web_address:
            return {"success": False, "code": "WEBADDR_NOT_FOUND", "message": "Web address not found."}, HTTPStatus.NOT_FOUND
        
        if WebAddress.delete_web_address(id):
            return {"success": True, "code": "WEBADDR_DELETED", "message": "Web address deleted."}, HTTPStatus.OK
        else:
            return {"success": False, "code": "WEBADDR_NOT_DELETED", "message": "Web address not deleted."}, HTTPStatus.INTERNAL_SERVER_ERROR

@nav_ns.route("/webaddress/<int:id>")
class WebAddressByIdApi(Resource):
    @jwt_token_required
    def get(self, cls, id):
        # 获取指定ID的网址
        web_address = WebAddress.get_web_address_by_id(id)
        if not web_address:
            return {"success": False, "code": "WEBADDR_NOT_FOUND", "message": "Web address not found."}, HTTPStatus.NOT_FOUND
        return {"success": True, "code": "WEBADDR_FOUND", "data": web_address.to_dict()}, HTTPStatus.OK

    @nav_ns.expect(update_web_address_model_by_id)
    @jwt_token_required
    @admin_required
    def put(self, cls, id):
        data = request.json

        category_id = data.get('category_id')
        url = data.get('url')
        icon = data.get('icon')
        title = data.get('title')
        title_en = data.get('title_en')
        subtitle = data.get('subtitle')
        subtitle_en = data.get('subtitle_en')
        description = data.get('description')
        description_en = data.get('description_en')

        # 检查必填字段是否提供
        if not url or not title:
            return {"success": False, "code": "FIELD_MISSING", "message": "Required field is missing."}, HTTPStatus.BAD_REQUEST
        
        if not category_id:
            category_id = WebAddress.get_web_address_by_id(id).category_id

        web_address = WebAddress.get_web_address_by_id(id)
        if not web_address:
            return {"success": False, "code": "WEBADDR_NOT_FOUND", "message": "Web address not found."}, HTTPStatus.NOT_FOUND

        # 更新网址
        web_address = WebAddress.update_web_address(id, category_id, url, icon, title, title_en, subtitle, subtitle_en, description, description_en)
        if web_address:
            return {"success": True, "code": "WEBADDR_UPDATED", "message": "Web address updated.", "data": web_address.to_dict()}, HTTPStatus.OK
        else:
            return {"success": False, "code": "WEBADDR_NOT_UPDATED", "message": "Web address not updated."}, HTTPStatus.INTERNAL_SERVER_ERROR

    @nav_ns.expect(delete_category_model)
    @jwt_token_required
    @admin_required
    def delete(self, cls, id):
        web_address = WebAddress.get_web_address_by_id(id)
        if not web_address:
            return {"success": False, "code": "WEBADDR_NOT_FOUND", "message": "Web address not found."}, HTTPStatus.NOT_FOUND

        if WebAddress.delete_web_address(id):
            return {"success": True, "code": "WEBADDR_DELETED", "message": "Web address deleted."}, HTTPStatus.OK
        else:
            return {"success": False, "code": "WEBADDR_NOT_DELETED", "message": "Web address not deleted."}, HTTPStatus.INTERNAL_SERVER_ERROR


@nav_ns.route("/webaddresses")
class web_addressesApi(Resource):
    @nav_ns.param("category_id", "Category ID")
    @jwt_token_required
    def get(self, cls):
        data = request.args

        category_id = data.get('category_id')

        if category_id:
            web_addresses = WebAddress.get_web_addresses_by_category_id(category_id)
        else:
            web_addresses = WebAddress.get_all_web_addresses()

        if web_addresses:
            return {"success": True, "code": "web_addresses_FOUND", "data": [web_address.to_dict() for web_address in web_addresses]}, HTTPStatus.OK
        else:
            return {"success": False, "code": "web_addresses_NOT_FOUND", "message": "No web addresses found."}, HTTPStatus.NOT_FOUND
        

@nav_ns.route("/all")
class AllApi(Resource):
    @jwt_token_required
    def get(self, cls):
        categories = Category.get_all_categories()
        web_addresses = WebAddress.get_all_web_addresses()

        data = []
        for category in categories:
            data.append({
                "name": category.name,
                "name_en": category.name_en,
                "cover": category.cover,
                "web_addresses": web_addresses
            })
        
        return {"success": True, "code": "DATA_FOUND", "data": data}, HTTPStatus.OK
