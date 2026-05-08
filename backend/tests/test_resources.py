from pathlib import Path

from fastapi.testclient import TestClient

from app.main import create_app


def _register_and_login(client: TestClient) -> str:
    client.post(
        "/api/v1/auth/register",
        json={
            "username": "uploader",
            "email": "uploader@example.com",
            "password": "Password123",
            "school": "Test University",
        },
    )
    response = client.post(
        "/api/v1/auth/login",
        json={"account": "uploader@example.com", "password": "Password123"},
    )
    return response.json()["data"]["access_token"]


def test_create_subject_and_filter_resources() -> None:
    client = TestClient(create_app())
    token = _register_and_login(client)
    headers = {"Authorization": f"Bearer {token}"}

    subject_response = client.post(
        "/api/v1/subjects",
        json={"name": "Data Structures", "code": "CS202", "category": "Computer Science"},
        headers=headers,
    )
    assert subject_response.status_code == 201
    subject_id = subject_response.json()["data"]["id"]

    sample_path = Path(__file__).resolve()
    with sample_path.open("rb") as file_obj:
        create_response = client.post(
            "/api/v1/resources",
            data={
                "title": "Final Review Notes",
                "description": "Binary trees and graphs",
                "subject_id": str(subject_id),
                "term": "2026 Spring",
                "resource_type": "document",
                "tags": "final,review",
            },
            files={"file": ("review-notes.txt", file_obj, "text/plain")},
            headers=headers,
        )

    assert create_response.status_code == 201
    resource_id = create_response.json()["data"]["id"]

    list_response = client.get(
        "/api/v1/resources",
        params={"keyword": "Review", "subject_id": subject_id, "resource_type": "document"},
    )
    assert list_response.status_code == 200
    items = list_response.json()["data"]["items"]
    assert len(items) == 1
    assert items[0]["title"] == "Final Review Notes"

    detail_response = client.get(f"/api/v1/resources/{resource_id}")
    assert detail_response.status_code == 200
    assert detail_response.json()["data"]["id"] == resource_id

    my_uploads_response = client.get(
        "/api/v1/users/me/resources",
        headers=headers,
    )
    assert my_uploads_response.status_code == 200
    assert my_uploads_response.json()["data"]["items"][0]["id"] == resource_id
