# ExamStack Implementation Plan

## Scope

Build a runnable full-stack ExamStack platform with:
- React 19 + React Router 7 + Tailwind CSS 4 + shadcn/ui + Mantine UI + axios + ahooks + zustand frontend
- FastAPI + PostgreSQL-ready SQLAlchemy + Pydantic + JWT backend
- layered backend architecture
- JWT auth, resource upload/download/preview, search/filter, profile, and points system

## File Map

Backend files to create or change:
- `backend/app/main.py`
- `backend/app/core/config.py`
- `backend/app/core/security.py`
- `backend/app/core/exceptions.py`
- `backend/app/core/deps.py`
- `backend/app/core/response.py`
- `backend/app/db/base.py`
- `backend/app/db/session.py`
- `backend/app/models/*.py`
- `backend/app/schemas/*.py`
- `backend/app/services/*.py`
- `backend/app/api/v1/endpoints/*.py`
- `backend/app/api/v1/router.py`
- `backend/app/utils/file.py`
- `backend/app/static/uploads/.gitkeep`
- `backend/tests/*.py`
- `backend/requirements.txt`
- `backend/.env.example`

Frontend files to create or change:
- `frontend/src/main.tsx`
- `frontend/src/App.tsx`
- `frontend/src/style/index.css`
- `frontend/src/api/*.ts`
- `frontend/src/components/**/*.tsx`
- `frontend/src/pages/**/*.tsx`
- `frontend/src/router/**/*.tsx`
- `frontend/src/store/**/*.ts`
- `frontend/src/utils/**/*.ts`
- `frontend/src/types/**/*.ts`

## Tasks

1. Create backend project skeleton.
   Files: backend app folders, `backend/requirements.txt`, `backend/.env.example`
   Failing test: import app package structure from a smoke test
   RED command: `backend\\.venv\\Scripts\\python.exe -m pytest backend/tests/test_smoke.py`
   Expected failure: pytest missing or app package missing
   Minimal implementation: create backend package tree and smoke app factory
   GREEN command: `backend\\.venv\\Scripts\\python.exe -m pytest backend/tests/test_smoke.py`
   Commit step: `git add backend docs/superpowers/plans/2026-05-08--examstack-build-plan.md`

2. Add backend config, DB session, unified response, and exception middleware.
   Files: `backend/app/core/*.py`, `backend/app/db/*.py`, `backend/tests/test_app_boot.py`
   Failing test: app returns unified response from health endpoint and handles app exceptions
   RED command: `backend\\.venv\\Scripts\\python.exe -m pytest backend/tests/test_app_boot.py`
   Expected failure: response helpers or handlers missing
   Minimal implementation: settings, app factory, response model, exception handler
   GREEN command: `backend\\.venv\\Scripts\\python.exe -m pytest backend/tests/test_app_boot.py`
   Commit step: `git add backend`

3. Implement auth data model and registration/login/current-user flow.
   Files: models, schemas, services, auth endpoints, tests
   Failing test: register, login, and `/me` flow with JWT
   RED command: `backend\\.venv\\Scripts\\python.exe -m pytest backend/tests/test_auth.py`
   Expected failure: endpoints or token validation missing
   Minimal implementation: user model, password hashing, JWT creation, auth endpoints
   GREEN command: `backend\\.venv\\Scripts\\python.exe -m pytest backend/tests/test_auth.py`
   Commit step: `git add backend`

4. Implement subject and resource creation/listing/search/filtering.
   Files: subject and resource modules plus tests
   Failing test: create subject, upload metadata, list with keyword/category filters
   RED command: `backend\\.venv\\Scripts\\python.exe -m pytest backend/tests/test_resources.py`
   Expected failure: models or query services missing
   Minimal implementation: normalized models, schemas, query params, service layer
   GREEN command: `backend\\.venv\\Scripts\\python.exe -m pytest backend/tests/test_resources.py`
   Commit step: `git add backend`

5. Implement file upload, preview, download, and points accounting.
   Files: file utility, resource service, points service, endpoints, tests
   Failing test: upload awards points, download deducts points, preview/download URLs work
   RED command: `backend\\.venv\\Scripts\\python.exe -m pytest backend/tests/test_file_points.py`
   Expected failure: upload storage or points logic missing
   Minimal implementation: upload persistence, file validation, transaction logic
   GREEN command: `backend\\.venv\\Scripts\\python.exe -m pytest backend/tests/test_file_points.py`
   Commit step: `git add backend`

6. Implement frontend foundation and routing.
   Files: `frontend/src/main.tsx`, `frontend/src/App.tsx`, router, layout, store, API client
   Failing test: build should fail before routes/providers exist
   RED command: `cd frontend && pnpm build`
   Expected failure: missing app structure
   Minimal implementation: app providers, route tree, auth guard, layout shell
   GREEN command: `cd frontend && pnpm build`
   Commit step: `git add frontend`

7. Implement auth pages and token persistence.
   Files: login/register pages, auth store, auth APIs
   Failing test: build with auth forms and guarded navigation
   RED command: `cd frontend && pnpm build`
   Expected failure: missing page modules or type errors
   Minimal implementation: forms, mutation hooks, protected route redirect
   GREEN command: `cd frontend && pnpm build`
   Commit step: `git add frontend`

8. Implement resource list, filter, upload, preview, and profile pages.
   Files: pages, components, APIs, types, utils
   Failing test: build with resource flow pages wired into router
   RED command: `cd frontend && pnpm build`
   Expected failure: missing component contracts or route imports
   Minimal implementation: responsive pages, filters, uploader, preview drawer/page, profile dashboard
   GREEN command: `cd frontend && pnpm build`
   Commit step: `git add frontend`

9. Verify end-to-end project basics and document run steps.
   Files: README if needed
   Failing test: backend and frontend builds/tests expose remaining gaps
   RED command: run current suites and build commands
   Expected failure: integration gaps
   Minimal implementation: fix issues, add setup notes
   GREEN command:
   - `backend\\.venv\\Scripts\\python.exe -m pytest backend/tests`
   - `cd frontend && pnpm build`
   Commit step: `git add .`
