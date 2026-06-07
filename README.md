# Từ Tâm Phục - E-Commerce Website

> Website thương mại điện tử chuyên bán đồ lam, pháp phục, áo tràng, túi vải.

## Tech Stack

### Frontend
- React + Vite
- TailwindCSS + shadcn/ui
- React Router DOM
- Axios + TanStack Query
- Zustand (State Management)
- Framer Motion
- React Hook Form + Zod

### Backend
- Python FastAPI
- SQLAlchemy + Alembic
- PostgreSQL
- JWT Authentication
- Pydantic v2

## Getting Started

### Prerequisites
- Node.js >= 18
- Python >= 3.11
- PostgreSQL >= 15
- Docker (optional)

### Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

### Backend Setup
```bash
cd backend
python -m venv venv
venv\Scripts\activate   # Windows
pip install -r requirements.txt
cp .env.example .env
alembic upgrade head
uvicorn app.main:app --reload
```

### Docker Setup
```bash
docker-compose up -d
```

## Project Structure
```
Tu_Tam_Phuc_E_Commerce_Website/
├── frontend/          # React + Vite application
├── backend/           # FastAPI application
├── docker-compose.yml
└── README.md
```
