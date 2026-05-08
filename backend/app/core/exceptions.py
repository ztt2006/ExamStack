from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.core.response import error_response


class AppException(Exception):
    def __init__(self, message: str, code: int = 4000, status_code: int = 400):
        self.message = message
        self.code = code
        self.status_code = status_code
        super().__init__(message)


def register_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(AppException)
    async def handle_app_exception(_: Request, exc: AppException):
        return error_response(code=exc.code, message=exc.message, status_code=exc.status_code)

    @app.exception_handler(RequestValidationError)
    async def handle_validation_exception(_: Request, exc: RequestValidationError):
        return error_response(code=4220, message="request validation failed", status_code=422, data=exc.errors())

    @app.exception_handler(StarletteHTTPException)
    async def handle_http_exception(_: Request, exc: StarletteHTTPException):
        return error_response(code=exc.status_code, message=str(exc.detail), status_code=exc.status_code)

    @app.exception_handler(Exception)
    async def handle_unknown_exception(_: Request, __: Exception):
        return error_response(code=5000, message="internal server error", status_code=500)
