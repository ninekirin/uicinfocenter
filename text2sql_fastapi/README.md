## Text to SQL - FastAPI

This is a FastAPI application that uses LLM to convert natural language questions to SQL queries.

### Installation

1. Install the requirements

```bash
pip install -r requirements.txt
```

Install `poppler-utils` for pdf2image (optional)

```bash
sudo apt-get install poppler-utils
```

If you are using Windows, you can download the binaries from [here](https://github.com/oschwartz10612/poppler-windows) and add the path to the environment variables.

If you are using MacOS, you can install it using Homebrew

```bash
brew install poppler
```

2. Run the application on port 3278 with auto-reload

```bash
uvicorn main:app --port 3278 --reload
```

3. Open the browser and go to `http://127.0.0.1:3278/docs` to see the Swagger UI.

If you want to run the application on 0.0.0.0, you can use the following command:

```bash
uvicorn main:app --host 0.0.0.0 --port 3278 --reload
```

### LangChain Tips

- `chain.get_prompts()[0].pretty_print()` to see the prompt

### Integration with Dify

- Add tools by fetching from `http://host.docker.internal:7788/text2sql/openapi.json`.
