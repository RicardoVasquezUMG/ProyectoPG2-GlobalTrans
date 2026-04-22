from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

response = client.get("/api/campanias/")
print('STATUS:', response.status_code)
print('DATA:', response.json())
