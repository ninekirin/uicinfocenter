import re

def process_response(x: str) -> str:
    # print(x)
    # This function handles the regex search and returns the appropriate value.
    matches = re.findall(r'(?<=```sql)[\s\S]*?(?=```)', x)
    return matches[-1] if matches else x

def strip(text: str) -> str:
    return text.strip()