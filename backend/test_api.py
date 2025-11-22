import requests
import sys

BASE_URL = "http://localhost:8000"

def test_api():
    print(f"Testing API at {BASE_URL}...")

    # 1. Create User
    email = "test@example.com"
    password = "password123"
    print(f"\n1. Creating user ({email})...")
    try:
        response = requests.post(f"{BASE_URL}/users", data={"username": email, "password": password})
        if response.status_code == 200:
            print("   User created successfully.")
        elif response.status_code == 400 and "already registered" in response.text:
            print("   User already exists.")
        else:
            print(f"   Failed to create user: {response.status_code} - {response.text}")
            return
    except requests.exceptions.ConnectionError:
        print("   Error: Could not connect to the server. Is it running?")
        print("   Run: uvicorn backend.main:app --reload")
        return

    # 2. Login
    print(f"\n2. Logging in...")
    response = requests.post(f"{BASE_URL}/token", data={"username": email, "password": password})
    if response.status_code != 200:
        print(f"   Login failed: {response.status_code} - {response.text}")
        return
    
    token = response.json()["access_token"]
    print("   Login successful. Token received.")

    # 3. Translate Text
    print(f"\n3. Testing Translation (English -> Hindi)...")
    headers = {"Authorization": f"Bearer {token}"}
    data = {
        "text": "Hello, how are you?",
        "target_language": "Hindi"
    }
    
    response = requests.post(f"{BASE_URL}/translate/text", data=data, headers=headers)
    
    if response.status_code == 200:
        result = response.json()
        print(f"   Success!")
        print(f"   Original: {data['text']}")
        print(f"   Translated: {result.get('translated_text')}")
    else:
        print(f"   Translation failed: {response.status_code} - {response.text}")

if __name__ == "__main__":
    test_api()
