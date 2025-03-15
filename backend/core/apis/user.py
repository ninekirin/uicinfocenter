# -*- encoding: utf-8 -*-

from datetime import datetime
from http import HTTPStatus
import re
from flask import request, render_template
from flask_mail import Message
from flask_restx import Namespace, Resource, fields
from functools import wraps
import jwt

from core.config import BaseConfig
from core.models import User, JWTTokenBlocklist

from core.utils import mail

user_ns = Namespace(name="User", description="User Related APIs")

"""
    Models
"""

email_verification_model = user_ns.model("EmailVerification", {
    "email": fields.String(required=True, max_length=128, description="Email", example="r130006001@mail.uic.edu.cn")
})

vcode_verification_model = user_ns.model("VCodeVerification", {
    "vCode": fields.String(required=True, description="Verification code", example="")
})

register_model = user_ns.model("Register", {
    "vCode": fields.String(required=True, description="Verification code", example=""),
    "username": fields.String(required=True, max_length=32, description="Username", example="r130006001"),
    "password": fields.String(required=True, max_length=128, description="Password", example="EubYFst9pk09pBPhGis5")
})

register_old_model = user_ns.model("RegisterOld", {
    "username": fields.String(required=True, max_length=32, description="Username", example="r130006001"),
    "email": fields.String(required=True, max_length=128, description="Email", example="r130006001@mail.uic.edu.cn"),
    "password": fields.String(required=True, max_length=128, description="Password", example="EubYFst9pk09pBPhGis5")
})

login_model = user_ns.model("Login", {
    "email": fields.String(required=True, max_length=128, description="Email", example="r130006001@mail.uic.edu.cn"),
    "password": fields.String(required=True, max_length=128, description="Password", example="EubYFst9pk09pBPhGis5")
})

change_password_model = user_ns.model("ChangePassword", {
    "old_password": fields.String(required=True, max_length=128, description="Old password"),
    "new_password": fields.String(required=True, max_length=128, description="New password")
})

change_user_by_id_model = user_ns.model("ChangeUserById", {
    "username": fields.String(required=True, description="Username", example="r130006001"),
    "user_type": fields.String(required=True, description="User type", example="TEACHER"),
    "account_status": fields.String(required=True, description="Account status", example="ACTIVE")
})

change_user_model = user_ns.model("ChangeUser", {
    "id": fields.Integer(required=True, description="User ID", example=1),
    "username": fields.String(required=True, description="Username", example="r130006001"),
    "user_type": fields.String(required=True, description="User type", example="TEACHER"),
    "account_status": fields.String(required=True, description="Account status", example="ACTIVE")
})

delete_user_model = user_ns.model("DeleteUser", {
    "id": fields.Integer(required=True, description="User ID", example=1)
})

change_account_status_model = user_ns.model("ChangeAccountStatus", {
    "account_status": fields.String(required=True, description="Account status", example="ACTIVE")
})

change_default_entrypoint_model = user_ns.model("ChangeDefaultEntrypoint", {
    "default_entrypoint": fields.String(required=True, description="Default entrypoint", example="chat")
})

change_user_type_model = user_ns.model("ChangeUserType", {
    "user_type": fields.String(required=True, description="User type", example="TEACHER")
})

"""
   JWT token required
"""
def jwt_token_required(func):
    """
       Decorator function to check if the user is authenticated
    """
    @wraps(func)
    def wrapper(*args, **kwargs):
        token = request.headers.get("Authorization")
        
        if not token:
            return {"success": False, "code": "NO_TOKEN", "message": "No token provided."}, 401
        
        # check if the token starts with "Bearer "
        if not token.startswith("Bearer "):
            return {"success": False, "code": "INVALID_TOKEN", "message": "Invalid token format."}, 401
        
        # extract the token value
        token = token.split(" ")[1]
        
        try:
            token_data = jwt.decode(token, BaseConfig.JWT_SECRET_KEY, algorithms=["HS256"])
        except jwt.ExpiredSignatureError:
            return {"success": False, "code": "EXPIRED_TOKEN", "message": "Expired token."}, 401
        except jwt.InvalidTokenError:
            return {"success": False, "code": "INVALID_TOKEN", "message": "Invalid token."}, 401
        
        # check if the token is in the blocklist
        user = User.get_by_email(token_data["email"])
        
        # check if the user exists
        if not user:
            return {"success": False, "code": "INVALID_TOKEN", "message": "Invalid user."}, 401
        # check if the token is in the blocklist
        if JWTTokenBlocklist.is_token_blocklisted(token):
            return {"success": False, "code": "INVALID_TOKEN", "message": "Token is in the blocklist. The user has already logged out."}, 401
        # check if the user is active
        if not user.check_jwt_auth_active():
            return {"success": False, "code": "INVALID_TOKEN", "message": "Token is invalid. The user has already logged out."}, 401
        
        return func(user, *args, **kwargs)
    return wrapper

"""
    Admin required
"""
def admin_required(func):
    """
       Decorator function to check if the user is an admin
    """
    @wraps(func)
    def wrapper(*args, **kwargs):
        user = args[0]
        
        if user.get_user_type() != "ADMIN":
            return {"success": False, "code": "NO PERMISSION", "message": "No permission."}, 403
        
        return func(*args, **kwargs)
    return wrapper

"""
    Teacher required
"""
def teacher_required(func):
    """
       Decorator function to check if the user is a teacher
    """
    @wraps(func)
    def wrapper(*args, **kwargs):
        user = args[0]
        
        if user.get_user_type() != "TEACHER" and user.get_user_type() != "ADMIN":
            return {"success": False, "code": "NO PERMISSION", "message": "No permission."}, 403
        
        return func(*args, **kwargs)
    return wrapper

"""
    Student required
"""
def student_required(func):
    """
       Decorator function to check if the user is a student
    """
    @wraps(func)
    def wrapper(*args, **kwargs):
        user = args[0]
        
        if user.get_user_type() != "STUDENT":
            return {"success": False, "code": "NO PERMISSION", "message": "No permission."}, 403
        
        return func(*args, **kwargs)
    return wrapper

"""
    Flask-Restx routes
"""

@user_ns.route("/email-verification")
class EmailVerificationApi(Resource):
    @user_ns.expect(email_verification_model, validate=True)
    @user_ns.response(200, "Registration link sent successfully")
    @user_ns.response(400, "Failed to send registration link due to invalid email")
    @user_ns.response(404, "User not found")
    @user_ns.response(409, "Email already exists")
    @user_ns.response(500, "Failed to send registration link due to internal server error")
    def post(self):
        """
           Get registration link
        """
        # get the data from the request
        data = request.json
        email = data.get("email")

        host_url = request.host_url
        
        # check if the email is valid using RegEx
        if not re.match(r"[^@]+@[^@]+\.[^@]+", email):
            return {"success": False, "code": "EMAIL_INVALID", "message": "Invalid email."}, HTTPStatus.BAD_REQUEST

        # check if the email already exists
        user = User.get_by_email(email)
        if user:
            return {"success": False, "code": "EMAIL_ALREADY_EXISTS", "message": "Email already exists."}, HTTPStatus.CONFLICT
        
        # check if the email valid and decide the user type
        if re.match(r"[^@]+@[^@]+\.[^@]+", email):
            if not BaseConfig.ALLOW_GUEST_REGISTER:
                return {"success": False, "code": "EMAIL_INVALID", "message": "You are not allowed to register with this email."}, HTTPStatus.BAD_REQUEST
        else:
            return {"success": False, "code": "EMAIL_INVALID", "message": "Invalid email. Please use a valid UIC email."}, HTTPStatus.BAD_REQUEST
        
        # generate a registration link using the email
        vCode = jwt.encode({"email": email, "exp": datetime.now() + BaseConfig.JWT_REGISTRATION_TOKEN_EXPIRES}, BaseConfig.JWT_REGISTRATION_TOKEN_SECRET_KEY, algorithm="HS256")

        # send the registration link
        msg = Message("Registration Link", sender=("UIC Information Center", BaseConfig.MAIL_USERNAME), recipients=[email])

        # HTML template for the email
        html_content = render_template('email_template.html', registration_url=f"{host_url}register?code={vCode}")

        msg.html = html_content
        mail.send(msg)
        
        return {"success": True, "code": "REGISTRATION_LINK_SENT", "message": "Registration link sent successfully."}, HTTPStatus.OK


@user_ns.route("/vcode-verification")
class VCodeVerificationApi(Resource):
    @user_ns.expect(vcode_verification_model, validate=True)
    @user_ns.response(200, "vCode verified successfully")
    @user_ns.response(400, "vCode verification failed due to invalid input")
    @user_ns.response(404, "vCode not found")
    @user_ns.response(500, "vCode verification failed due to internal server error")
    @user_ns.doc(security=None)
    def post(self):
        """
           Verify vCode
        """
        # get the data from the request
        data = request.json
        vCode = data.get("vCode")
        
        # check vCode
        if not vCode:
            return {"success": False, "code": "VCODE_MISSING", "message": "vCode is missing."}, HTTPStatus.BAD_REQUEST
        
        # check whether the vCode is in the blocklist
        if JWTTokenBlocklist.is_token_blocklisted(vCode):
            return {"success": False, "code": "VCODE_USED", "message": "vCode has already been used."}, HTTPStatus.BAD_REQUEST

        try:
            vCode_data = jwt.decode(vCode, BaseConfig.JWT_REGISTRATION_TOKEN_SECRET_KEY, algorithms=["HS256"])
        except jwt.ExpiredSignatureError:
            return {"success": False, "code": "VCODE_EXPIRED", "message": "vCode is expired."}, HTTPStatus.BAD_REQUEST
        except jwt.InvalidTokenError:
            return {"success": False, "code": "VCODE_INVALID", "message": "vCode is invalid."}, HTTPStatus.BAD_REQUEST
        
        # get the email from the vCode
        email = vCode_data["email"]
        
        return {"success": True, "code": "VCODE_VALID", "message": "vCode is valid.", "data": {"email": email}}, HTTPStatus.OK


@user_ns.route("/register")
class RegisterApi(Resource):
    @user_ns.expect(register_model, validate=True)
    @user_ns.response(201, "User registered successfully")
    @user_ns.response(400, "Registration failed due to invalid input")
    @user_ns.response(409, "Username already exists")
    @user_ns.response(500, "Registration failed due to internal server error")
    @user_ns.doc(security=None)
    def post(self):
        """
           Register a new user
        """
        # get the data from the request
        data = request.json
        vCode = data.get("vCode")
        username = data.get("username")
        password = data.get("password")

        # check vCode
        if not vCode:
            return {"success": False, "code": "VCODE_MISSING", "message": "vCode is missing."}, HTTPStatus.BAD_REQUEST
        
        # check whether the vCode is in the blocklist
        if JWTTokenBlocklist.is_token_blocklisted(vCode):
            return {"success": False, "code": "VCODE_USED", "message": "vCode has already been used."}, HTTPStatus.BAD_REQUEST

        try:
            vCode_data = jwt.decode(vCode, BaseConfig.JWT_REGISTRATION_TOKEN_SECRET_KEY, algorithms=["HS256"])
        except jwt.ExpiredSignatureError:
            return {"success": False, "code": "VCODE_EXPIRED", "message": "vCode is expired."}, HTTPStatus.BAD_REQUEST
        except jwt.InvalidTokenError:
            return {"success": False, "code": "VCODE_INVALID", "message": "vCode is invalid."}, HTTPStatus.BAD_REQUEST
        
        # get the email from the vCode
        email = vCode_data["email"]
        
        # check if the email is valid using RegEx
        if not re.match(r"[^@]+@[^@]+\.[^@]+", email):
            return {"success": False, "code": "EMAIL_INVALID", "message": "Invalid email."}, HTTPStatus.BAD_REQUEST

        # check if the email already exists
        user = User.get_by_email(email)
        if user:
            return {"success": False, "code": "EMAIL_ALREADY_EXISTS", "message": "Email already exists."}, HTTPStatus.CONFLICT
        
        # check if the username already exists
        user = User.get_by_username(username)
        if user:
            return {"success": False, "code": "USERNAME_ALREADY_EXISTS", "message": "Username already exists."}, HTTPStatus.CONFLICT
        
        # check if the password is strong enough
        if len(password) < 8:
            return {"success": False, "code": "PASSWORD_INVALID", "message": "Password is too short."}, HTTPStatus.BAD_REQUEST
        elif not any(char.isdigit() for char in password):
            return {"success": False, "code": "PASSWORD_INVALID", "message": "Password must contain at least one digit."}, HTTPStatus.BAD_REQUEST
        elif not any(char.isupper() for char in password):
            return {"success": False, "code": "PASSWORD_INVALID", "message": "Password must contain at least one uppercase letter."}, HTTPStatus.BAD_REQUEST
        elif not any(char.islower() for char in password):
            return {"success": False, "code": "PASSWORD_INVALID", "message": "Password must contain at least one lowercase letter."}, HTTPStatus.BAD_REQUEST
        
        user_type = ""

        # check if the email valid and decide the user type
        if re.match(r"[^@]+@[^@]+\.[^@]+", email):
            if password == BaseConfig.ADMIN_PASSWORD:
                user_type = "ADMIN"
            elif email.endswith("@uic.edu.cn") or email.endswith("@uic.edu.hk"):
                user_type = "TEACHER"
            elif email.endswith("@mail.uic.edu.cn") or email.endswith("@mail.uic.edu.hk"):
                user_type = "STUDENT"
            elif email.endswith("@alumni.uic.edu.cn") or email.endswith("@alumni.uic.edu.hk"):
                user_type = "ALUMNI"
            else:
                if BaseConfig.ALLOW_GUEST_REGISTER:
                    user_type = "GUEST"
                else:
                    return {"success": False, "code": "EMAIL_INVALID", "message": "You are not allowed to register with this email."}, HTTPStatus.BAD_REQUEST
        else:
            return {"success": False, "code": "EMAIL_INVALID", "message": "Invalid email. Please use a valid email."}, HTTPStatus.BAD_REQUEST
        
        # set the account status
        account_status = "ACTIVE"
        
        # set the default entrypoint
        default_entrypoint = "chat"
        
        # create the user
        if User.register(username, email, password, user_type, account_status, default_entrypoint):
            # make vCode invalid
            jwt_block = JWTTokenBlocklist(jwt_token=vCode, token_type="vCode")
            jwt_block.save()
            return {"success": True, "code": "REGISTRATION_SUCCESSFUL", "message": "User registered successfully."}, HTTPStatus.CREATED
        else:
            return {"success": False, "code": "REGISTRATION_FAILED", "message": "User registration failed."}, HTTPStatus.INTERNAL_SERVER_ERROR


@user_ns.route("/register-old")
class RegisterOldApi(Resource):
    @user_ns.expect(register_old_model, validate=True)
    @user_ns.response(201, "User registered successfully")
    @user_ns.response(400, "Registration failed due to invalid input")
    @user_ns.response(409, "Email or username already exists")
    @user_ns.response(500, "Registration failed due to internal server error")
    @user_ns.doc(security=None)
    def post(self):
        """
           Register a new user
        """
        # get the data from the request
        data = request.json
        username = data.get("username")
        email = data.get("email")
        password = data.get("password")

        # check if any of the fields are empty
        # actually, the fields are already validated by the model, so this check is not necessary
        if not username:
            return {"success": False, "code": "USERNAME_MISSING", "message": "Username missing."}, HTTPStatus.BAD_REQUEST
        if not email:
            return {"success": False, "code": "EMAIL_MISSING", "message": "Email missing."}, HTTPStatus.BAD_REQUEST
        if not password:
            return {"success": False, "code": "PASSWORD_MISSING", "message": "Password missing."}, HTTPStatus.BAD_REQUEST

        # check if the email is valid using RegEx
        if not re.match(r"[^@]+@[^@]+\.[^@]+", email):
            return {"success": False, "code": "EMAIL_INVALID", "message": "Invalid email."}, HTTPStatus.BAD_REQUEST

        # check if the email already exists
        user = User.get_by_email(email)
        if user:
            return {"success": False, "code": "EMAIL_ALREADY_EXISTS", "message": "Email already exists."}, HTTPStatus.CONFLICT
        
        # check if the username already exists
        user = User.get_by_username(username)
        if user:
            return {"success": False, "code": "USERNAME_ALREADY_EXISTS", "message": "Username already exists."}, HTTPStatus.CONFLICT
                
        # check if the email valid and decide the user type
        if re.match(r"[^@]+@[^@]+\.[^@]+", email):
            if password == BaseConfig.ADMIN_PASSWORD:
                user_type = "ADMIN"
            elif email.endswith("@uic.edu.cn") or email.endswith("@uic.edu.hk"):
                user_type = "TEACHER"
            elif email.endswith("@mail.uic.edu.cn") or email.endswith("@mail.uic.edu.hk"):
                user_type = "STUDENT"
            elif email.endswith("@alumni.uic.edu.cn") or email.endswith("@alumni.uic.edu.hk"):
                user_type = "ALUMNI"
            else:
                if BaseConfig.ALLOW_GUEST_REGISTER:
                    user_type = "GUEST"
                else:
                    return {"success": False, "code": "EMAIL_INVALID", "message": "You are not allowed to register with this email."}, HTTPStatus.BAD_REQUEST
        else:
            return {"success": False, "code": "EMAIL_INVALID", "message": "Invalid email. Please use a valid UIC email."}, HTTPStatus.BAD_REQUEST
        
        # check if the password is strong enough
        if len(password) < 8:
            return {"success": False, "code": "PASSWORD_INVALID", "message": "Password is too short."}, HTTPStatus.BAD_REQUEST
        elif not any(char.isdigit() for char in password):
            return {"success": False, "code": "PASSWORD_INVALID", "message": "Password must contain at least one digit."}, HTTPStatus.BAD_REQUEST
        elif not any(char.isupper() for char in password):
            return {"success": False, "code": "PASSWORD_INVALID", "message": "Password must contain at least one uppercase letter."}, HTTPStatus.BAD_REQUEST
        elif not any(char.islower() for char in password):
            return {"success": False, "code": "PASSWORD_INVALID", "message": "Password must contain at least one lowercase letter."}, HTTPStatus.BAD_REQUEST
        
        # set the account status
        account_status = 'ACTIVE'
        
        # set the default entrypoint
        default_entrypoint = "chat"
        
        # create the user
        if User.register(username, email, password, user_type, account_status, default_entrypoint):
            return {"success": True, "code": "REGISTRATION_SUCCESSFUL", "message": "User registered successfully."}, HTTPStatus.CREATED
        else:
            return {"success": False, "code": "REGISTRATION_FAILED", "message": "User registration failed."}, HTTPStatus.INTERNAL_SERVER_ERROR


@user_ns.route("/login")
class LoginApi(Resource):
    @user_ns.expect(login_model, validate=True)
    @user_ns.response(200, "User logged in successfully")
    @user_ns.response(400, "Login failed due to invalid email or password")
    @user_ns.doc(security=None)
    def post(self):
        """
           Login a user
        """
        # get the data from the request
        data = request.json
        email = data.get("email")
        password = data.get("password")
        
        # check if the email exists
        user = User.get_by_email(email)
        if not user:
            return {"success": False, "code": "USER_INVALID", "message": "Invalid user."}, HTTPStatus.BAD_REQUEST
        
        # check if the password is correct
        if not user.check_password(password):
            return {"success": False, "code": "PASSWORD_INVALID", "message": "Invalid password."}, HTTPStatus.BAD_REQUEST
        
        # check if the user is active
        if user.get_account_status() == 'INACTIVE':
            return {"success": False, "code": "ACCOUNT_INACTIVE", "message": "Account is inactive."}, HTTPStatus.BAD_REQUEST
        
        # create access token using JWT
        token = jwt.encode({"email": email, "exp": datetime.now() + BaseConfig.JWT_ACCESS_TOKEN_EXPIRES}, BaseConfig.JWT_SECRET_KEY, algorithm="HS256")
        
        # set the last online time
        user.set_last_online()
        
        # set the jwt auth active status
        user.set_jwt_auth_active(True)
        
        # login the user
        user.save()
        
        return {"success": True, "code": "LOGIN_SUCCESSFUL", "message": "User logged in successfully.", "data": {"userToken": token, "user": user.to_dict()}}, HTTPStatus.OK


@user_ns.route("/logout")
class LogoutApi(Resource):
    @user_ns.response(200, "User logged out successfully")
    @user_ns.response(400, "Logout failed due to invalid token")
    @jwt_token_required
    def post(self, cls): # user is passed from the jwt_token_required decorator
        """
           Logout a user
        """
        _jwt_token = request.headers.get("Authorization")
        
        if not _jwt_token:
            return {"success": False, "code": "TOKEN_MISSING", "message": "Token missing."}, HTTPStatus.BAD_REQUEST
                
        # check if the token starts with "Bearer "
        if not _jwt_token.startswith("Bearer "):
            return {"success": False, "code": "TOKEN_INVALID", "message": "Invalid token format."}, HTTPStatus.BAD_REQUEST
        
        # extract the token value
        _jwt_token = _jwt_token.split(" ")[1]
        
        # put the jwt token in the blocklist
        jwt_block = JWTTokenBlocklist(jwt_token=_jwt_token, token_type="token")
        jwt_block.save()
        
        # set the jwt auth active status
        self.set_jwt_auth_active(False)
        self.save()
        
        return {"success": True, "code": "LOGOUT_SUCCESSFUL", "message": "User logged out successfully."}, HTTPStatus.OK



@user_ns.route("")
class UserApi(Resource):
    @user_ns.response(200, "User found")
    @user_ns.response(401, "Unauthorized")
    @user_ns.response(404, "User not found")
    @user_ns.response(500, "Get user failed due to internal server error")
    @user_ns.param("id", "User ID", type=int, required=True)
    @jwt_token_required
    def get(self, cls):
        """
           Get the current user
        """
        data = request.args
        id = data.get("id", type=int)
        # get the user
        user = User.get_by_id(id)
        if not user:
            return {"success": False, "code": "USER_NOT_FOUND", "message": "User not found."}, HTTPStatus.NOT_FOUND
        
        return {"success": True, "code": "USER_FOUND", "message": "User found.", "data": user.to_dict()}, HTTPStatus.OK

    @user_ns.response(200, "User updated successfully")
    @user_ns.response(400, "Update user failed due to invalid input")
    @user_ns.response(401, "Unauthorized")
    @user_ns.response(500, "Update user failed due to internal server error")
    @user_ns.expect(change_user_model, validate=True)
    @jwt_token_required
    @admin_required
    def patch(self, cls):
        """
           Update the current user
        """
        data = request.json
        id = data.get("id")
        username = data.get("username")
        email = data.get("email")
        user_type = data.get("user_type")
        account_status = data.get("account_status")
        default_entrypoint = data.get("default_entrypoint")

        # get the user
        user = User.get_by_id(id)
        if not user:
            return {"success": False, "code": "USER_NOT_FOUND", "message": "User not found."}, HTTPStatus.NOT_FOUND
        
        # check if the username already exists
        if username and username != user.get_username():
            _user = User.get_by_username(username)
            if _user:
                return {"success": False, "code": "USERNAME_ALREADY_EXISTS", "message": "Username already exists."}, HTTPStatus.BAD_REQUEST
            
        # check if the email already exists
        if email and email != user.get_email():
            _user = User.get_by_email(email)
            if _user:
                return {"success": False, "code": "EMAIL_ALREADY_EXISTS", "message": "Email already exists."}, HTTPStatus.BAD_REQUEST

        # check if the user type is valid
        if user_type and user_type not in ["ADMIN", "TEACHER", "STUDENT", "ALUMNI", "GUEST"]:
            return {"success": False, "code": "USER_TYPE_INVALID", "message": "Invalid user type."}, HTTPStatus.BAD_REQUEST
        
        # check if the account status is valid
        if account_status and account_status not in ["ACTIVE", "INACTIVE"]:
            return {"success": False, "code": "ACCOUNT_STATUS_INVALID", "message": "Invalid account status."}, HTTPStatus.BAD_REQUEST
        
        # update the user info
        if username:
            user.set_username(username)
        if email:
            user.set_email(email)
        if user_type:
            user.set_user_type(user_type)
        if account_status:
            user.set_account_status(account_status)
        if default_entrypoint:
            user.set_default_entrypoint(default_entrypoint)

        user.save()

        return {"success": True, "code": "USER_UPDATED", "message": "User updated successfully."}, HTTPStatus.OK
    
    @user_ns.response(200, "User deleted successfully")
    @user_ns.response(401, "Unauthorized")
    @user_ns.response(404, "User not found")
    @user_ns.response(500, "Delete user failed due to internal server error")
    @user_ns.expect(delete_user_model, validate=True)
    @jwt_token_required
    @admin_required
    def delete(self, cls):
        """
           Delete the user by ID
        """
        data = request.json

        id = data.get("id")

        # get the user
        user = User.get_by_id(id)

        if not user:
            return {"success": False, "code": "USER_NOT_FOUND", "message": "User not found."}, HTTPStatus.NOT_FOUND
        
        # delete the user
        user.delete()
        
        return {"success": True, "code": "USER_DELETED", "message": "User deleted successfully."}, HTTPStatus.OK


@user_ns.route("/<int:id>")
class UserByIdApi(Resource):
    @user_ns.response(200, "User found")
    @user_ns.response(404, "User not found")
    @jwt_token_required
    def get(self, cls, id):
        """
           Get user info
        """
        # get the user
        user = User.get_by_id(id)
        if not user:
            return {"success": False, "code": "USER_NOT_FOUND", "message": "User not found."}, HTTPStatus.NOT_FOUND
        
        return {"success": True, "code": "USER_FOUND", "message": "User found.", "data": user.to_dict()}, HTTPStatus.OK
    
    @user_ns.expect(change_user_by_id_model, validate=True)
    @user_ns.response(200, "User updated successfully")
    @user_ns.response(400, "Update user failed due to invalid input")
    @user_ns.response(401, "Unauthorized")
    @user_ns.response(404, "User not found")
    @user_ns.response(500, "Update user failed due to internal server error")
    @jwt_token_required
    @admin_required
    def patch(self, cls, id):
        """
           Update user info
        """
        # get the user
        user = User.get_by_id(id)
        if not user:
            return {"success": False, "code": "USER_NOT_FOUND", "message": "User not found."}, HTTPStatus.NOT_FOUND
        
        # get the data from the request
        data = request.json
        username = data.get("username")
        email = data.get("email")
        user_type = data.get("user_type")
        account_status = data.get("account_status")
        
        # check if the username already exists
        if username and username != user.get_username():
            _user = User.get_by_username(username)
            if _user:
                return {"success": False, "code": "USERNAME_ALREADY_EXISTS", "message": "Username already exists."}, HTTPStatus.BAD_REQUEST
        
        # check if the email already exists
        if email and email != user.get_email():
            _user = User.get_by_email(email)
            if _user:
                return {"success": False, "code": "EMAIL_ALREADY_EXISTS", "message": "Email already exists."}, HTTPStatus.BAD_REQUEST

        # check if the user type is valid
        if user_type and user_type not in ["ADMIN", "TEACHER", "STUDENT", "ALUMNI", "GUEST"]:
            return {"success": False, "code": "USER_TYPE_INVALID", "message": "Invalid user type."}, HTTPStatus.BAD_REQUEST
        
        # check if the account status is valid
        if account_status and account_status not in ["ACTIVE", "INACTIVE"]:
            return {"success": False, "code": "ACCOUNT_STATUS_INVALID", "message": "Invalid account status."}, HTTPStatus.BAD_REQUEST
        
        # update the user info
        if username:
            user.set_username(username)
        if email:
            user.set_email(email)
        if user_type:
            user.set_user_type(user_type)
        if account_status:
            user.set_account_status(account_status)
        
        user.save()
        
        return {"success": True, "code": "USER_UPDATED", "message": "User updated successfully."}, HTTPStatus.OK
    

    @user_ns.response(200, "User deleted successfully")
    @user_ns.response(401, "Unauthorized")
    @user_ns.response(404, "User not found")
    @user_ns.response(500, "Delete user failed due to internal server error")
    @jwt_token_required
    @admin_required
    def delete(self, cls, id):
        """
           Delete a user
        """
        # get the user
        user = User.get_by_id(id)

        if not user:
            return {"success": False, "code": "USER_NOT_FOUND", "message": "User not found."}, HTTPStatus.NOT_FOUND
        
        # delete the user
        user.delete()
        
        return {"success": True, "code": "USER_DELETED", "message": "User deleted successfully."}, HTTPStatus.OK
    

@user_ns.route("/<string:uuid>/username")
class UsernameByUuidApi(Resource):
    @user_ns.response(200, "Username found")
    @user_ns.response(404, "Username not found")
    def get(cls, uuid):
        """
           Get username by UUID
        """
        # get the username
        username = User.get_by_uuid(uuid).username
        if not username:
            return {"success": False, "code": "USERNAME_NOT_FOUND", "message": "Username not found."}, HTTPStatus.NOT_FOUND
        
        return {"success": True, "code": "USERNAME_FOUND", "message": "Username found.", "data": {"username": username}}, HTTPStatus.OK

@user_ns.route("/<int:id>/password")
class ChangePasswordApi(Resource):
    @user_ns.expect(change_password_model, validate=True)
    @user_ns.response(200, "Password changed successfully")
    @user_ns.response(400, "Change password failed due to invalid input")
    @user_ns.response(401, "Unauthorized")
    @user_ns.response(404, "User not found")
    @user_ns.response(500, "Change password failed due to internal server error")
    @jwt_token_required
    def patch(self, cls, id):
        """
           Change password
        """
        # check if the user is authorized
        if self.get_id() != id:
            return {"success": False, "code": "UNAUTHORIZED", "message": "Unauthorized."}, HTTPStatus.UNAUTHORIZED
        
        # get the data from the request
        data = request.json
        old_password = data.get("old_password")
        new_password = data.get("new_password")
        
        # check if the old password is correct
        if not self.check_password(old_password):
            return {"success": False, "code": "PASSWORD_INVALID", "message": "Invalid old password."}, HTTPStatus.BAD_REQUEST
        
        # check if the new password is strong enough
        if len(new_password) < 8:
            return {"success": False, "code": "PASSWORD_INVALID", "message": "New password is too short."}, HTTPStatus.BAD_REQUEST
        elif not any(char.isdigit() for char in new_password):
            return {"success": False, "code": "PASSWORD_INVALID", "message": "New password must contain at least one digit."}, HTTPStatus.BAD_REQUEST
        elif not any(char.isupper() for char in new_password):
            return {"success": False, "code": "PASSWORD_INVALID", "message": "New password must contain at least one uppercase letter."}, HTTPStatus.BAD_REQUEST
        elif not any(char.islower() for char in new_password):
            return {"success": False, "code": "PASSWORD_INVALID", "message": "New password must contain at least one lowercase letter."}, HTTPStatus.BAD_REQUEST
        
        # set the new password
        self.set_password(new_password)
        self.save()
        
        return {"success": True, "code": "PASSWORD_CHANGED", "message": "Password changed successfully."}, HTTPStatus.OK

@user_ns.route("/<int:id>/account-status")
class AccountStatusApi(Resource):
    @user_ns.response(200, "Account status updated successfully")
    @user_ns.response(400, "Update account status failed due to invalid input")
    @user_ns.response(401, "Unauthorized")
    @user_ns.response(404, "User not found")
    @user_ns.response(500, "Update account status failed due to internal server error")
    @user_ns.expect(change_account_status_model, validate=True)
    @jwt_token_required
    @admin_required
    def patch(self, cls, id):
        """
           Update account status
        """
        # get the user
        user = User.get_by_id(id)
        if not user:
            return {"success": False, "code": "USER_NOT_FOUND", "message": "User not found."}, HTTPStatus.NOT_FOUND
        
        # get the data from the request
        data = request.json
        account_status = data.get("account_status")
        
        # check if the account status is valid
        if account_status not in ["ACTIVE", "INACTIVE"]:
            return {"success": False, "code": "ACCOUNT_STATUS_INVALID", "message": "Invalid account status."}, HTTPStatus.BAD_REQUEST
        
        # set the account status
        user.set_account_status(account_status)
        user.save()
        
        return {"success": True, "code": "ACCOUNT_STATUS_UPDATED", "message": "Account status updated successfully."}, HTTPStatus.OK
    
@user_ns.route("/<int:id>/user-type")
class UserTypeApi(Resource):
    @user_ns.response(200, "User type updated successfully")
    @user_ns.response(400, "Update user type failed due to invalid input")
    @user_ns.response(401, "Unauthorized")
    @user_ns.response(404, "User not found")
    @user_ns.response(500, "Update user type failed due to internal server error")
    @user_ns.expect(change_user_type_model, validate=True)
    @jwt_token_required
    @admin_required
    def patch(self, cls, id):
        """
           Update user type
        """
        # get the user
        user = User.get_by_id(id)
        if not user:
            return {"success": False, "code": "USER_NOT_FOUND", "message": "User not found."}, HTTPStatus.NOT_FOUND
        
        # get the data from the request
        data = request.json
        user_type = data.get("user_type")
        
        # check if the user type is valid
        if user_type not in ["ADMIN", "TEACHER", "STUDENT", "ALUMNI", "GUEST"]:
            return {"success": False, "code": "USER_TYPE_INVALID", "message": "Invalid user type."}, HTTPStatus.BAD_REQUEST
        
        # set the user type
        user.set_user_type(user_type)
        user.save()
        
        return {"success": True, "code": "USER_TYPE_UPDATED", "message": "User type updated successfully."}, HTTPStatus.OK


@user_ns.route("/<int:id>/default-entrypoint")
class DefaultEntrypointApi(Resource):
    @user_ns.response(200, "Default entrypoint updated successfully")
    @user_ns.response(400, "Update default entrypoint failed due to invalid input")
    @user_ns.response(401, "Unauthorized")
    @user_ns.response(404, "User not found")
    @user_ns.response(500, "Update default entrypoint failed due to internal server error")
    @user_ns.expect(change_default_entrypoint_model, validate=True)
    @jwt_token_required
    def patch(self, cls, id):
        """
           Update default entrypoint
        """
        # get the user
        user = User.get_by_id(id)
        if not user:
            return {"success": False, "code": "USER_NOT_FOUND", "message": "User not found."}, HTTPStatus.NOT_FOUND
        
        # get the data from the request
        data = request.json
        default_entrypoint = data.get("default_entrypoint")
        
        # check if the default entrypoint is valid
        if default_entrypoint not in ["home", "chat", "profile"]:
            return {"success": False, "code": "DEFAULT_ENTRYPOINT_INVALID", "message": "Invalid default entrypoint."}, HTTPStatus.BAD_REQUEST
        
        # set the default entrypoint
        user.set_default_entrypoint(default_entrypoint)
        user.save()
        
        return {"success": True, "code": "DEFAULT_ENTRYPOINT_UPDATED", "message": "Default entrypoint updated successfully."}, HTTPStatus.OK


@user_ns.route("s")
class UserListApi(Resource):
    @user_ns.response(200, "Users found")
    @user_ns.response(404, "Users not found")
    @user_ns.response(500, "Get users failed due to internal server error")
    @user_ns.param("current", "Current page", type=int, default=1)
    @user_ns.param("pageSize", "Page size", type=int, default=BaseConfig.PAGE_SIZE)
    @jwt_token_required
    @admin_required
    def get(self, cls):
        """
           Get all users
        """
        data = request.args

        current = data.get("current", 1, type=int)
        pageSize = data.get("pageSize", BaseConfig.PAGE_SIZE, type=int)

        # get all users
        users, total = User.get_all_users_paginated(current, pageSize)
        if not users:
            return {"success": False, "code": "USERS_NOT_FOUND", "message": "Users not found."}, HTTPStatus.NOT_FOUND
        
        return {"success": True, "code": "USERS_FOUND", "message": "Users found.", "data": {"users": [user.to_dict() for user in users], "pagination": {"total": total, "current": current, "pageSize": pageSize}}}, HTTPStatus.OK
    
