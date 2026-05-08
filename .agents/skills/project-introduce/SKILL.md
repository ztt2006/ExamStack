Project: ExamStack - Campus Exam Material Sharing Platform

Tech Stack:
Frontend: React 19, React Router 7, Tailwind CSS 4, shadcn/ui, Mantine UI, Axios, ahooks, Zustand
Backend: FastAPI, PostgreSQL, JWT Authentication
File Storage: Local uploads folder
Build: Vite

Core Features:
- User registration, login, JWT auth
- Material upload (PDF, images, docs)
- Material list, search, filter by course/major/college
- Material detail, online preview, download
- Credit system (upload earns points, download costs points)
- User profile, my uploads, my credits
- Responsive layout for mobile & desktop
- Modern UI with shadcn/ui + Mantine mixed components

Project Structure:
Frontend:
src/
  api/          # Axios API requests
  components/   # Reusable UI components
  pages/        # Page components
  router/       # React Router routes
  store/        # Zustand global state
  utils/        # Helpers
  App.jsx
  main.jsx

Backend:
backend/
  main.py       # FastAPI entry
  database.py   # PostgreSQL connection
  models.py     # DB models
  schemas.py    # Pydantic validation
  routers/      # API routes
  uploads/      # Uploaded files

Coding Rules:
- Use functional components + hooks in React
- UI: shadcn/ui for base components, Mantine for upload/forms/notifications
- API: Axios with interceptors, token auto-injected
- State: Global user/auth via Zustand
- Routes: Public & protected routes separated
- Style: Tailwind CSS utility-first, responsive mobile-first
- Backend: RESTful API, standard JSON responses
- File upload: Mantine Dropzone, size & type validation
- Consistent naming, clean formatting, comments for key logic