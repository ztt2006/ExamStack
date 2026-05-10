from io import BytesIO
from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile

import pytest
from fastapi.testclient import TestClient

from app.main import create_app


@pytest.fixture(autouse=True)
def fake_cos_storage(monkeypatch):
    from app.utils import cos as cos_utils

    stored_objects: dict[str, dict[str, bytes | str]] = {}

    def fake_upload(*, key: str, body: bytes, content_type: str) -> None:
        stored_objects[key] = {"body": body, "content_type": content_type}

    def fake_download(key: str) -> tuple[bytes, str]:
        if key not in stored_objects:
            raise FileNotFoundError(key)
        payload = stored_objects[key]
        return payload["body"], payload["content_type"]  # type: ignore[return-value]

    def fake_stream(key: str):
        if key not in stored_objects:
            raise FileNotFoundError(key)
        payload = stored_objects[key]
        return BytesIO(payload["body"]), payload["content_type"]  # type: ignore[return-value]

    def fake_delete(key: str) -> None:
        stored_objects.pop(key, None)

    monkeypatch.setattr(cos_utils, "upload_bytes", fake_upload)
    monkeypatch.setattr(cos_utils, "download_bytes", fake_download)
    monkeypatch.setattr(cos_utils, "download_stream", fake_stream)
    monkeypatch.setattr(cos_utils, "delete_object", fake_delete)
    yield stored_objects


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


def test_create_and_filter_resources(fake_cos_storage) -> None:
    client = TestClient(create_app())
    token = _register_and_login(client)
    headers = {"Authorization": f"Bearer {token}"}

    sample_path = Path(__file__).resolve()
    with sample_path.open("rb") as file_obj:
        create_response = client.post(
            "/api/v1/resources",
            data={
                "description": "Binary trees and graphs",
            },
            files={"file": ("review-notes.txt", file_obj, "text/plain")},
            headers=headers,
        )

    assert create_response.status_code == 201
    resource_id = create_response.json()["data"]["id"]
    assert create_response.json()["data"]["download_url"].endswith(f"/api/v1/resources/{resource_id}/file")
    assert len(fake_cos_storage) == 1
    assert next(iter(fake_cos_storage)).startswith("examstack/uploads/")

    list_response = client.get(
        "/api/v1/resources",
        params={"keyword": "Binary"},
    )
    assert list_response.status_code == 200
    items = list_response.json()["data"]["items"]
    assert len(items) == 1
    assert items[0]["original_filename"] == "review-notes.txt"
    assert items[0]["description"] == "Binary trees and graphs"

    detail_response = client.get(f"/api/v1/resources/{resource_id}")
    assert detail_response.status_code == 200
    assert detail_response.json()["data"]["id"] == resource_id

    my_uploads_response = client.get(
        "/api/v1/users/me/resources",
        headers=headers,
    )
    assert my_uploads_response.status_code == 200
    assert my_uploads_response.json()["data"]["items"][0]["id"] == resource_id


def test_direct_upload_rejects_files_larger_than_50mb(fake_cos_storage) -> None:
    client = TestClient(create_app())
    token = _register_and_login(client)
    headers = {"Authorization": f"Bearer {token}"}

    oversized_content = b"x" * (50 * 1024 * 1024 + 1)
    create_response = client.post(
        "/api/v1/resources",
        data={"description": "Oversized upload"},
        files={"file": ("huge.pdf", oversized_content, "application/pdf")},
        headers=headers,
    )

    assert create_response.status_code == 400
    assert create_response.json()["message"] == "file too large"
    assert fake_cos_storage == {}


def test_direct_upload_accepts_files_up_to_50mb(fake_cos_storage) -> None:
    client = TestClient(create_app())
    token = _register_and_login(client)
    headers = {"Authorization": f"Bearer {token}"}

    content = b"x" * (30 * 1024 * 1024)
    create_response = client.post(
        "/api/v1/resources",
        data={"description": "Large but allowed upload"},
        files={"file": ("large.pdf", content, "application/pdf")},
        headers=headers,
    )

    assert create_response.status_code == 201
    assert create_response.json()["data"]["file_size"] == len(content)
    assert len(fake_cos_storage) == 1


def test_chunked_upload_can_resume_and_complete(fake_cos_storage) -> None:
    client = TestClient(create_app())
    token = _register_and_login(client)
    headers = {"Authorization": f"Bearer {token}"}
    file_key = "resume-demo-key"
    full_content = b"hello " + b"chunked " + b"upload"

    init_response = client.post(
        "/api/v1/resources/chunked/init",
        json={
            "file_key": file_key,
            "filename": "resume.txt",
            "file_size": len(full_content),
            "mime_type": "text/plain",
            "chunk_size": 8,
        },
        headers=headers,
    )
    assert init_response.status_code == 200
    init_payload = init_response.json()["data"]
    assert init_payload["upload_id"]
    assert init_payload["uploaded_chunks"] == []

    upload_id = init_payload["upload_id"]
    first_chunk_response = client.post(
        "/api/v1/resources/chunked/chunk",
        data={"upload_id": upload_id, "chunk_index": 0},
        files={"file": ("chunk-0", full_content[:8], "application/octet-stream")},
        headers=headers,
    )
    assert first_chunk_response.status_code == 200
    assert first_chunk_response.json()["data"]["uploaded_chunks"] == [0]

    resume_response = client.post(
        "/api/v1/resources/chunked/init",
        json={
            "file_key": file_key,
            "filename": "resume.txt",
            "file_size": len(full_content),
            "mime_type": "text/plain",
            "chunk_size": 8,
        },
        headers=headers,
    )
    assert resume_response.status_code == 200
    assert resume_response.json()["data"]["upload_id"] == upload_id
    assert resume_response.json()["data"]["uploaded_chunks"] == [0]

    second_chunk_response = client.post(
        "/api/v1/resources/chunked/chunk",
        data={"upload_id": upload_id, "chunk_index": 1},
        files={"file": ("chunk-1", full_content[8:16], "application/octet-stream")},
        headers=headers,
    )
    assert second_chunk_response.status_code == 200
    assert second_chunk_response.json()["data"]["uploaded_chunks"] == [0, 1]

    third_chunk_response = client.post(
        "/api/v1/resources/chunked/chunk",
        data={"upload_id": upload_id, "chunk_index": 2},
        files={"file": ("chunk-2", full_content[16:], "application/octet-stream")},
        headers=headers,
    )
    assert third_chunk_response.status_code == 200
    assert third_chunk_response.json()["data"]["uploaded_chunks"] == [0, 1, 2]

    complete_response = client.post(
        "/api/v1/resources/chunked/complete",
        json={
            "upload_id": upload_id,
            "description": "Resumable upload",
        },
        headers=headers,
    )

    assert complete_response.status_code == 201
    payload = complete_response.json()["data"]
    assert payload["description"] == "Resumable upload"
    assert payload["original_filename"] == "resume.txt"
    assert payload["file_size"] == len(full_content)
    assert len(fake_cos_storage) == 1
    stored_object = next(iter(fake_cos_storage.values()))
    assert stored_object["body"] == full_content


def test_user_can_update_and_delete_own_resource(fake_cos_storage) -> None:
    client = TestClient(create_app())
    token = _register_and_login(client)
    headers = {"Authorization": f"Bearer {token}"}

    sample_path = Path(__file__).resolve()
    with sample_path.open("rb") as file_obj:
        create_response = client.post(
            "/api/v1/resources",
            data={"description": "Original description"},
            files={"file": ("notes.txt", file_obj, "text/plain")},
            headers=headers,
        )

    resource_id = create_response.json()["data"]["id"]
    original_object_key = next(iter(fake_cos_storage))

    update_response = client.put(
        f"/api/v1/users/me/resources/{resource_id}",
        data={"description": "Updated description"},
        headers=headers,
    )

    assert update_response.status_code == 200
    assert update_response.json()["data"]["description"] == "Updated description"
    assert next(iter(fake_cos_storage)) == original_object_key

    with sample_path.open("rb") as file_obj:
        replace_response = client.put(
            f"/api/v1/users/me/resources/{resource_id}",
            data={"description": "Updated with replacement"},
            files={"file": ("replacement.pdf", file_obj, "application/pdf")},
            headers=headers,
        )

    assert replace_response.status_code == 200
    payload = replace_response.json()["data"]
    assert payload["description"] == "Updated with replacement"
    assert payload["original_filename"] == "replacement.pdf"
    assert payload["mime_type"] == "application/pdf"
    assert original_object_key not in fake_cos_storage
    assert len(fake_cos_storage) == 1

    get_response = client.get(f"/api/v1/users/me/resources/{resource_id}", headers=headers)
    assert get_response.status_code == 200
    assert get_response.json()["data"]["id"] == resource_id

    delete_response = client.delete(f"/api/v1/users/me/resources/{resource_id}", headers=headers)
    assert delete_response.status_code == 200
    assert delete_response.json()["data"]["id"] == resource_id
    assert fake_cos_storage == {}

    detail_after_delete = client.get(f"/api/v1/resources/{resource_id}")
    assert detail_after_delete.status_code == 404
    assert detail_after_delete.json()["message"] == "resource not found"


def test_user_cannot_manage_other_users_resources(fake_cos_storage) -> None:
    client = TestClient(create_app())

    owner_token = _register_and_login(client)
    owner_headers = {"Authorization": f"Bearer {owner_token}"}

    client.post(
        "/api/v1/auth/register",
        json={
            "username": "viewer",
            "email": "viewer@example.com",
            "password": "Password123",
            "school": "Test University",
        },
    )
    viewer_login = client.post(
        "/api/v1/auth/login",
        json={"account": "viewer@example.com", "password": "Password123"},
    )
    viewer_headers = {"Authorization": f"Bearer {viewer_login.json()['data']['access_token']}"}

    sample_path = Path(__file__).resolve()
    with sample_path.open("rb") as file_obj:
        create_response = client.post(
            "/api/v1/resources",
            data={"description": "Private owner upload"},
            files={"file": ("owner.txt", file_obj, "text/plain")},
            headers=owner_headers,
        )

    resource_id = create_response.json()["data"]["id"]

    detail_response = client.get(
        f"/api/v1/users/me/resources/{resource_id}",
        headers=viewer_headers,
    )
    assert detail_response.status_code == 404
    assert detail_response.json()["message"] == "resource not found"

    update_response = client.put(
        f"/api/v1/users/me/resources/{resource_id}",
        data={"description": "Hacked"},
        headers=viewer_headers,
    )
    assert update_response.status_code == 404
    assert update_response.json()["message"] == "resource not found"

    delete_response = client.delete(
        f"/api/v1/users/me/resources/{resource_id}",
        headers=viewer_headers,
    )
    assert delete_response.status_code == 404
    assert delete_response.json()["message"] == "resource not found"


def test_preview_pdf_is_inline() -> None:
    client = TestClient(create_app())
    token = _register_and_login(client)
    headers = {"Authorization": f"Bearer {token}"}

    sample_path = Path(__file__).resolve()
    with sample_path.open("rb") as file_obj:
        create_response = client.post(
            "/api/v1/resources",
            data={"description": "Preview PDF inline"},
            files={"file": ("lecture.pdf", file_obj, "application/pdf")},
            headers=headers,
        )

    resource_id = create_response.json()["data"]["id"]
    preview_response = client.get(f"/api/v1/resources/{resource_id}/preview")

    assert preview_response.status_code == 200
    assert preview_response.headers["content-type"].startswith("application/pdf")
    assert "inline" in preview_response.headers.get("content-disposition", "").lower()


def test_preview_docx_returns_html() -> None:
    client = TestClient(create_app())
    token = _register_and_login(client)
    headers = {"Authorization": f"Bearer {token}"}

    buffer = BytesIO()
    with ZipFile(buffer, "w", ZIP_DEFLATED) as archive:
        archive.writestr(
            "[Content_Types].xml",
            """<?xml version="1.0" encoding="UTF-8"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>""",
        )
        archive.writestr(
            "_rels/.rels",
            """<?xml version="1.0" encoding="UTF-8"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>""",
        )
        archive.writestr(
            "word/document.xml",
            """<?xml version="1.0" encoding="UTF-8"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p><w:r><w:t>Chapter 1</w:t></w:r></w:p>
    <w:p><w:r><w:t>Sorting and searching notes</w:t></w:r></w:p>
  </w:body>
</w:document>""",
        )
    docx_bytes = buffer.getvalue()

    create_response = client.post(
        "/api/v1/resources",
        data={"description": "Preview DOCX inline"},
        files={
            "file": (
                "outline.docx",
                docx_bytes,
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            )
        },
        headers=headers,
    )

    resource_id = create_response.json()["data"]["id"]
    preview_response = client.get(f"/api/v1/resources/{resource_id}/preview")

    assert preview_response.status_code == 200
    assert preview_response.headers["content-type"].startswith("text/html")
    assert "Sorting and searching notes" in preview_response.text


def test_preview_returns_404_when_cos_object_missing(fake_cos_storage) -> None:
    client = TestClient(create_app())
    token = _register_and_login(client)
    headers = {"Authorization": f"Bearer {token}"}

    sample_path = Path(__file__).resolve()
    with sample_path.open("rb") as file_obj:
        create_response = client.post(
            "/api/v1/resources",
            data={"description": "Missing COS preview"},
            files={"file": ("missing.pdf", file_obj, "application/pdf")},
            headers=headers,
        )

    resource_id = create_response.json()["data"]["id"]
    fake_cos_storage.clear()

    preview_response = client.get(f"/api/v1/resources/{resource_id}/preview")
    file_response = client.get(f"/api/v1/resources/{resource_id}/file")

    assert preview_response.status_code == 404
    assert preview_response.json()["message"] == "resource file not found"
    assert file_response.status_code == 404
    assert file_response.json()["message"] == "resource file not found"


def test_preview_handles_non_ascii_filename() -> None:
    client = TestClient(create_app())
    token = _register_and_login(client)
    headers = {"Authorization": f"Bearer {token}"}

    sample_path = Path(__file__).resolve()
    with sample_path.open("rb") as file_obj:
        create_response = client.post(
            "/api/v1/resources",
            data={"description": "中文文件名预览"},
            files={"file": ("算法笔记.pdf", file_obj, "application/pdf")},
            headers=headers,
        )

    resource_id = create_response.json()["data"]["id"]
    preview_response = client.get(f"/api/v1/resources/{resource_id}/preview")

    assert preview_response.status_code == 200
    assert "filename*" in preview_response.headers.get("content-disposition", "")


def test_preview_prefers_resource_mime_type_when_cos_content_type_is_generic(fake_cos_storage) -> None:
    client = TestClient(create_app())
    token = _register_and_login(client)
    headers = {"Authorization": f"Bearer {token}"}

    sample_path = Path(__file__).resolve()
    with sample_path.open("rb") as file_obj:
        create_response = client.post(
            "/api/v1/resources",
            data={"description": "PDF preview should stay inline"},
            files={"file": ("preview.pdf", file_obj, "application/pdf")},
            headers=headers,
        )

    resource_id = create_response.json()["data"]["id"]
    object_key = next(iter(fake_cos_storage))
    fake_cos_storage[object_key]["content_type"] = "application/octet-stream"

    preview_response = client.get(f"/api/v1/resources/{resource_id}/preview")

    assert preview_response.status_code == 200
    assert preview_response.headers["content-type"].startswith("application/pdf")
    assert "inline" in preview_response.headers.get("content-disposition", "").lower()
