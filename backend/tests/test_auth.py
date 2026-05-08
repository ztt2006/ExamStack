from fastapi.testclient import TestClient

from app.main import create_app


def test_register_login_and_me_flow() -> None:
    client = TestClient(create_app())

    register_response = client.post(
        "/api/v1/auth/register",
        json={
            "username": "alice",
            "email": "alice@example.com",
            "password": "Password123",
            "school": "Example University",
        },
    )
    assert register_response.status_code == 201
    register_payload = register_response.json()
    assert register_payload["data"]["username"] == "alice"
    assert register_payload["data"]["points"] == 20

    login_response = client.post(
        "/api/v1/auth/login",
        json={"account": "alice", "password": "Password123"},
    )
    assert login_response.status_code == 200
    token = login_response.json()["data"]["access_token"]
    assert token

    me_response = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert me_response.status_code == 200
    me_payload = me_response.json()
    assert me_payload["data"]["email"] == "alice@example.com"
    assert me_payload["data"]["school"] == "Example University"
