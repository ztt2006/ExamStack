from fastapi.testclient import TestClient

from app.main import create_app


def test_subjects_are_exposed_on_v1_router() -> None:
    client = TestClient(create_app())

    response = client.get("/api/v1/subjects")

    assert response.status_code == 200
    payload = response.json()
    assert payload["code"] == 0
    assert payload["data"] == []
