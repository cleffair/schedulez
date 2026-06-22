# Schedulez

Schedulez is a modern, AI-powered project and task management application. It allows you to rapidly generate complex project schedules using AI, visualize them on a calendar, and track your progress in real time.

## Tech Stack
- **Frontend**: React, TypeScript, Vite, Tailwind CSS, shadcn/ui, TanStack Query, Zustand
- **Backend**: FastAPI, Python, SQLAlchemy (async), Pydantic, PostgreSQL
- **Authentication**: Supabase Auth

## Getting Started

### 1. Environment Setup
You will need to configure environment variables for both the frontend and backend.

**Backend (`/backend/.env`)**
```env
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/schedulez
SUPABASE_JWT_SECRET=your_supabase_jwt_secret
ENVIRONMENT=development
```

**Frontend (`/frontend/.env.local`)**
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```