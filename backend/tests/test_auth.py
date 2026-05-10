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


def test_login_accepts_trimmed_and_case_insensitive_email_account() -> None:
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
        json={"account": "  Alice@Example.com  ", "password": "Password123"},
    )

    assert login_response.status_code == 200
    assert login_response.json()["data"]["access_token"]


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


def test_user_can_upload_avatar() -> None:
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
    headers = {"Authorization": f"Bearer {token}"}

    upload_response = client.post(
        "/api/v1/users/me/avatar",
        files={"file": ("avatar.png", b"fake-png", "image/png")},
        headers=headers,
    )

    assert upload_response.status_code == 200
    avatar_url = upload_response.json()["data"]["avatar_url"]
    assert avatar_url.startswith("/static/")
    assert avatar_url.endswith(".png")

    profile_response = client.get("/api/v1/users/me/profile", headers=headers)
    assert profile_response.status_code == 200
    assert profile_response.json()["data"]["avatar_url"] == avatar_url

    me_response = client.get("/api/v1/auth/me", headers=headers)
    assert me_response.status_code == 200
    assert me_response.json()["data"]["avatar_url"] == avatar_url


def test_avatar_upload_rejects_non_image() -> None:
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

    upload_response = client.post(
        "/api/v1/users/me/avatar",
        files={"file": ("avatar.txt", b"not image", "text/plain")},
        headers={"Authorization": f"Bearer {token}"},
    )

    assert upload_response.status_code == 400
    assert upload_response.json()["message"] == "avatar must be an image"
