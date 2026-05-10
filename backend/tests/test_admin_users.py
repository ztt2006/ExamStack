from fastapi.testclient import TestClient

from app.main import create_app


def _register_and_login(client: TestClient, username: str, email: str) -> str:
    client.post(
        "/api/v1/auth/register",
        json={
            "username": username,
            "email": email,
            "password": "Password123",
            "school": "Example University",
        },
    )
    response = client.post(
        "/api/v1/auth/login",
        json={"account": email, "password": "Password123"},
    )
    return response.json()["data"]["access_token"]


def test_admin_can_list_and_filter_users() -> None:
    client = TestClient(create_app())
    token = _register_and_login(client, "admin_user", "admin@example.com")
    _register_and_login(client, "alice", "alice@example.com")
    _register_and_login(client, "bob", "bob@example.com")

    response = client.get(
        "/api/v1/admin/users",
        params={"keyword": "ali", "page": 1, "page_size": 10},
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 200
    payload = response.json()["data"]
    assert payload["pagination"]["total"] == 1
    assert payload["items"][0]["username"] == "alice"
    assert payload["items"][0]["uploaded_count"] == 0


def test_admin_can_get_user_detail_and_adjust_points() -> None:
    client = TestClient(create_app())
    token = _register_and_login(client, "admin_user", "admin@example.com")
    _register_and_login(client, "alice", "alice@example.com")

    list_response = client.get(
        "/api/v1/admin/users",
        params={"keyword": "alice"},
        headers={"Authorization": f"Bearer {token}"},
    )
    user_id = list_response.json()["data"]["items"][0]["id"]

    detail_response = client.get(
        f"/api/v1/admin/users/{user_id}",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert detail_response.status_code == 200
    assert detail_response.json()["data"]["email"] == "alice@example.com"

    update_response = client.patch(
        f"/api/v1/admin/users/{user_id}/points",
        json={"points": 55, "reason": "admin_adjustment"},
        headers={"Authorization": f"Bearer {token}"},
    )

    assert update_response.status_code == 200
    payload = update_response.json()["data"]
    assert payload["points"] == 55
    assert payload["username"] == "alice"


def test_admin_can_update_user_profile_and_reset_password() -> None:
    client = TestClient(create_app())
    token = _register_and_login(client, "admin_user", "admin@example.com")
    _register_and_login(client, "alice", "alice@example.com")

    list_response = client.get(
        "/api/v1/admin/users",
        params={"keyword": "alice"},
        headers={"Authorization": f"Bearer {token}"},
    )
    user_id = list_response.json()["data"]["items"][0]["id"]

    update_response = client.put(
        f"/api/v1/admin/users/{user_id}",
        json={
            "username": "alice_updated",
            "email": "alice_updated@example.com",
            "school": "Updated University",
        },
        headers={"Authorization": f"Bearer {token}"},
    )

    assert update_response.status_code == 200
    updated_user = update_response.json()["data"]
    assert updated_user["username"] == "alice_updated"
    assert updated_user["email"] == "alice_updated@example.com"
    assert updated_user["school"] == "Updated University"

    reset_response = client.patch(
        f"/api/v1/admin/users/{user_id}/password",
        json={"password": "NewPassword123"},
        headers={"Authorization": f"Bearer {token}"},
    )

    assert reset_response.status_code == 200
    assert reset_response.json()["data"]["id"] == user_id

    old_login = client.post(
        "/api/v1/auth/login",
        json={"account": "alice_updated@example.com", "password": "Password123"},
    )
    assert old_login.status_code == 401

    new_login = client.post(
        "/api/v1/auth/login",
        json={"account": "alice_updated@example.com", "password": "NewPassword123"},
    )
    assert new_login.status_code == 200
    assert new_login.json()["data"]["access_token"]
