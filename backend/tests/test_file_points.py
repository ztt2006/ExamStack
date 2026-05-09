from pathlib import Path

from fastapi.testclient import TestClient

from app.main import create_app


def _create_user_and_token(client: TestClient, username: str, email: str) -> str:
    client.post(
        "/api/v1/auth/register",
        json={
            "username": username,
            "email": email,
            "password": "Password123",
            "school": "Test University",
        },
    )
    login_response = client.post(
        "/api/v1/auth/login",
        json={"account": email, "password": "Password123"},
    )
    return login_response.json()["data"]["access_token"]


def test_upload_and_download_document() -> None:
    client = TestClient(create_app())

    uploader_token = _create_user_and_token(client, "uploader2", "uploader2@example.com")
    downloader_token = _create_user_and_token(client, "downloader", "downloader@example.com")

    sample_path = Path(__file__).resolve()
    with sample_path.open("rb") as file_obj:
        upload_response = client.post(
            "/api/v1/resources",
            data={
                "description": "Processes and memory",
            },
            files={"file": ("os-mock.pdf", file_obj, "application/pdf")},
            headers={"Authorization": f"Bearer {uploader_token}"},
        )

    assert upload_response.status_code == 201
    resource_payload = upload_response.json()["data"]
    resource_id = resource_payload["id"]
    assert resource_payload["preview_url"].endswith(f"/api/v1/resources/{resource_id}/preview")
    assert resource_payload["original_filename"] == "os-mock.pdf"

    download_response = client.post(
        f"/api/v1/resources/{resource_id}/download",
        headers={"Authorization": f"Bearer {downloader_token}"},
    )
    assert download_response.status_code == 200
    download_payload = download_response.json()["data"]
    assert download_payload["download_url"].endswith(f"/api/v1/resources/{resource_id}/file")
