import requests
import sys
import time
import os

API_URL = "https://bimmerbase-api.onrender.com/api/options"
# Замените на ваш токен полного доступа
TOKEN = "a77965dd86efcc8ab097e93a6a2476df521de9f988cd1c5280825cfe1e1711da4168678aba25090d834eb2cde070e4f2933f47167e8dd99db46618fdab910c0b1e22e78587536c6f015d16f37e6819ea8957fae2be65be4595327b7c4a6372f9a06e62161b35fbaf7d0240e4b09aa91b5c5049b3c77dd524894c1604e6c48c35"
INPUT_FILE = "options.txt"

def parse_line(line):
    """Извлекает SA-код и название из строки."""
    line = line.strip()
    if not line:
        return None, None
    parts = line.split(' ', 1)
    if len(parts) != 2:
        return None, None
    return parts[0].strip(), parts[1].strip()

def create_option(sa_code, title):
    """Отправляет POST-запрос на создание опции."""
    headers = {
        "Authorization": f"Bearer {TOKEN}",
        "Content-Type": "application/json"
    }
    payload = {
        "data": {
            "sa_code": sa_code,
            "title": title
        }
    }
    try:
        response = requests.post(API_URL, json=payload, headers=headers)
        if response.status_code == 200 or response.status_code == 201:
            print(f"✅ {sa_code}: {title}")
        else:
            print(f"❌ {sa_code}: {response.text}")
    except Exception as e:
        print(f"❌ {sa_code}: {str(e)}")

def main():
    if not os.path.exists(INPUT_FILE):
        print(f"Файл {INPUT_FILE} не найден.")
        sys.exit(1)

    with open(INPUT_FILE, "r", encoding="utf-8") as f:
        lines = f.readlines()

    total = len(lines)
    for i, line in enumerate(lines, 1):
        code, title = parse_line(line)
        if code and title:
            print(f"[{i}/{total}] ", end="")
            create_option(code, title)
            # Небольшая задержка, чтобы не перегрузить сервер
            time.sleep(0.05)
        else:
            print(f"⚠ Пропущена строка {i}: {line.strip()}")

if __name__ == "__main__":
    main()