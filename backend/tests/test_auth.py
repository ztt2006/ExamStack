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


def test_user_can_update_own_profile() -> None:
    client = TestClient(create_app())

    client.post(
        "/api/v1/auth/register",
        json={
            "username": "alice",
            "email": "alice@example.com",
            "password": "Password123",
            "school": "Example University",
        },
    )
    login_response = client.post(
        "/api/v1/auth/login",
        json={"account": "alice", "password": "Password123"},
    )
    token = login_response.json()["data"]["access_token"]

    update_response = client.put(
        "/api/v1/users/me/profile",
        json={
            "username": "alice_new",
            "email": "alice_new@example.com",
            "school": "Updated University",
        },
        headers={"Authorization": f"Bearer {token}"},
    )

    assert update_response.status_code == 200
    payload = update_response.json()["data"]
    assert payload["username"] == "alice_new"
    assert payload["email"] == "alice_new@example.com"
    assert payload["school"] == "Updated University"

    me_response = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert me_response.status_code == 200
    assert me_response.json()["data"]["username"] == "alice_new"


def test_update_profile_rejects_duplicate_username_or_email() -> None:
    client = TestClient(create_app())

    client.post(
        "/api/v1/auth/register",
        json={
            "username": "alice",
            "email": "alice@example.com",
            "password": "Password123",
            "school": "Example University",
        },
    )
    client.post(
        "/api/v1/auth/register",
        json={
            "username": "bob",
            "email": "bob@example.com",
            "password": "Password123",
            "school": "Example University",
        },
    )
    login_response = client.post(
        "/api/v1/auth/login",
        json={"account": "alice", "password": "Password123"},
    )
    token = login_response.json()["data"]["access_token"]

    duplicate_username_response = client.put(
        "/api/v1/users/me/profile",
        json={
            "username": "bob",
            "email": "alice_new@example.com",
            "school": "Updated University",
        },
        headers={"Authorization": f"Bearer {token}"},
    )
    assert duplicate_username_response.status_code == 400
    assert duplicate_username_response.json()["message"] == "username already exists"

    duplicate_email_response = client.put(
        "/api/v1/users/me/profile",
        json={
            "username": "alice_new",
            "email": "bob@example.com",
            "school": "Updated University",
        },
        headers={"Authorization": f"Bearer {token}"},
    )
    assert duplicate_email_response.status_code == 400
    assert duplicate_email_response.json()["message"] == "email already exists"
