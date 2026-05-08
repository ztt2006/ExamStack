from typing import Any

from fastapi.responses import JSONResponse


def success_response(data: Any = None, message: str = "success", status_code: int = 200) -> JSONResponse:
    return JSONResponse(
        status_code=status_code,
        content={"code": 0, "message": message, "data": data},
    )


def error_response(code: int, message: str, status_code: int, data: Any = None) -> JSONResponse:
    return JSONResponse(
        status_code=status_code,
        content={"code": code, "message": message, "data": data},
    )
