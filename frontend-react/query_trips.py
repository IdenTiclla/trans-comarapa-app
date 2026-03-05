import requests

try:
    # First login to get the cookie
    session = requests.Session()
    login_data = {"username": "admin@example.com", "password": "password123"}
    r = session.post("http://localhost:8000/api/v1/auth/login", json=login_data)
    
    # Then query trips
    r = session.get("http://localhost:8000/api/v1/trips?limit=2")
    print(r.json())
except Exception as e:
    print("Error:", e)
