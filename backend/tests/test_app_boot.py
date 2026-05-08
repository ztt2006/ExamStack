from fastapi.testclient import TestClient

from app.main import create_app


def test_health_endpoint_uses_unified_response() -> None:
    client = TestClient(create_app())

    response = client.get("/api/v1/health")

    assert response.status_code == 200
    payload = response.json()
    assert payload["code"] == 0
    assert payload["message"] == "success"
    assert payload["data"]["service"] == "examstack-api"


def test_application_exception_is_handled() -> None:
    client = TestClient(create_app())

    response = client.get("/api/v1/dev/raise")

    assert response.status_code == 400
    payload = response.json()
    assert payload["code"] == 4000
    assert payload["message"] == "demo error"
    assert payload["data"] is None
