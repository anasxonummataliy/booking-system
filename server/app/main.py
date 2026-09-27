from contextlib import asynccontextmanager

from a2wsgi import WSGIMiddleware
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.admin.flask_admin_app import create_flask_admin_app
from app.api.router import api_router
from app.core.config import settings
from app.database import Base, engine
from app.seed import seed_database


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: ensure tables exist and seed demo data
    Base.metadata.create_all(bind=engine)
    try:
        seed_database()
    except Exception as e:
        print(f"Seed notice: {e}")
    yield


app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Clean Architecture Doctor Appointment Booking API with Flask-Admin integration",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount REST API
app.include_router(api_router, prefix=settings.API_V1_STR)

# Mount Flask-Admin application at /admin using WSGIMiddleware
flask_admin_app = create_flask_admin_app()
app.mount("/admin", WSGIMiddleware(flask_admin_app))


@app.get("/")
def root():
    return {
        "app": settings.PROJECT_NAME,
        "status": "online",
        "api_docs": "/docs",
        "admin_panel": "/admin",
    }
