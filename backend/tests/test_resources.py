from io import BytesIO
from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile

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


def test_create_and_filter_resources() -> None:
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
