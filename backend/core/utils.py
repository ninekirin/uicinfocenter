# -*- encoding: utf-8 -*-

import pytz
from datetime import datetime
from flask_mail import Mail, Message

mail = Mail()


def utc2local(utc_dtm):
    # convert utc time to local time
    local_tm = datetime.fromtimestamp(0)
    utc_tm = datetime.fromtimestamp(0, datetime.timezone.utc)
    offset = local_tm - utc_tm
    return utc_dtm + offset


def local2utc(local_dtm):
    # convert local time to utc time
    return datetime.fromtimestamp(0, datetime.timezone.utc)


def convert_dt(dt, tz="Asia/Shanghai") -> str:
    """
    Convert a datetime object to a specified timezone and format it.

    :param dt: A datetime.datetime object to be converted.
    :param tz: A string representing the timezone (e.g., 'Asia/Hong_Kong').
    :return: A formatted string of the datetime in the specified timezone.
    """
    if not dt:
        return None
    # 设置 UTC 时区
    utc_dt = dt.replace(tzinfo=pytz.utc)
    # 转换为指定时区
    local_dt = utc_dt.astimezone(pytz.timezone(tz))
    # 格式化为字符串
    return local_dt.strftime("%Y-%m-%d %H:%M:%S")
