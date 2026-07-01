import requests
import sys

API_URL = "https://bimmerbase-api.onrender.com/api/options"
TOKEN = "a77965dd86efcc8ab097e93a6a2476df521de9f988cd1c5280825cfe1e1711da4168678aba25090d834eb2cde070e4f2933f47167e8dd99db46618fdab910c0b1e22e78587536c6f015d16f37e6819ea8957fae2be65be4595327b7c4a6372f9a06e62161b35fbaf7d0240e4b09aa91b5c5049b3c77dd524894c1604e6c48c35"

headers = {"Authorization": f"Bearer {TOKEN}"}

def get_all_options():
    """Получает все записи Option (до 10000)"""
    ids = []
    page = 1
    while True:
        resp = requests.get(f"{API_URL}?pagination[pageSize]=100&pagination[page]={page}", headers=headers)
        if resp.status_code != 200:
            print(f"Ошибка получения: {resp.text}")
            break
        data = resp.json()
        items = data.get("data", [])
        if not items:
            break
        ids.extend(item["documentId"] for item in items)
        if len(items) < 100:
            break
        page += 1
    return ids

def delete_option(doc_id):
    resp = requests.delete(f"{API_URL}/{doc_id}", headers=headers)
    return resp.status_code == 200

if __name__ == "__main__":
    print("Получаем список опций...")
    ids = get_all_options()
    print(f"Найдено {len(ids)} записей. Удаляем...")
    for i, doc_id in enumerate(ids, 1):
        success = delete_option(doc_id)
        print(f"[{i}/{len(ids)}] {'✅' if success else '❌'} {doc_id}")
    print("Готово.")