from langchain_openai.chat_models import ChatOpenAI
from langchain_ollama import ChatOllama
from config import BaseConfig
from langchain.llms.base import LLM
from langchain_community.llms.utils import enforce_stop_tokens
import requests
import os

class SiliconFlow(LLM):
    def __init__(self):
        super().__init__()

    @property
    def _llm_type(self) -> str:
        return "siliconflow"

    def siliconflow_completions(self, model: str, prompt: str) -> str:
        payload = {
            "model": model,
            "messages": [{"role": "user", "content": prompt}],
            "stream": False
        }
        headers = {
            "accept": "application/json",
            "content-type": "application/json",
            "authorization": f"Bearer {BaseConfig.SILICONFLOW_API_KEY}"
        }

        response = requests.post(BaseConfig.SILICONFLOW_API_BASE + "chat/completions", json=payload, headers=headers)
        response.raise_for_status()
        return response.json()["choices"][0]["message"]["content"]

    def _call(self, prompt: str, stop: list = None, model: str = BaseConfig.SILICONFLOW_API_MODEL) -> str:
        response = self.siliconflow_completions(model=model, prompt=prompt)
        if stop is not None:
            response = enforce_stop_tokens(response, stop)
        return response

llm_openai = ChatOpenAI(
    temperature=0.2,
    top_p=0.4,
    api_key=BaseConfig.CHATGPT_API_KEY,
    base_url=BaseConfig.CHATGPT_API_BASE,
    model=BaseConfig.CHATGPT_API_MODEL,
)

llm_qwen2_5_7b = ChatOllama(
    base_url="http://127.0.0.1:11434",
    model="qwen2.5:7b",
    temperature=0.2,
    top_p=0.4,
)

llm_deepseekr1_7b = ChatOllama(
    base_url="http://127.0.0.1:11434",
    model="deepseek-r1:7b",
    temperature=0.2,
    top_p=0.4,
)

llm_codellama_13b = ChatOllama(
    base_url="http://127.0.0.1:11434",
    model="codellama:13b",
    temperature=0.2,
    top_p=0.4,
)

llm_siliconflow = ChatOpenAI(
    temperature=0.2,
    top_p=0.4,
    api_key=BaseConfig.SILICONFLOW_API_KEY,
    base_url=BaseConfig.SILICONFLOW_API_BASE,
    model=BaseConfig.SILICONFLOW_API_MODEL,
)

llm_siliconflow_custom = SiliconFlow()

llm = llm_siliconflow