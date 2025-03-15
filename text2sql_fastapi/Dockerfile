FROM python:3.11-slim

WORKDIR /app

COPY . /app

RUN pip install --no-cache-dir -r /app/requirements.txt -i https://pypi.tuna.tsinghua.edu.cn/simple

EXPOSE 3278

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "3278"]