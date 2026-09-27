import os
from contextlib import asynccontextmanager

from a2wsgi import WSGIMiddleware
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

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
    description="Clean Architecture Doctor Appointment Booking API with in-app React Admin & Flask-Admin integration",
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

# 1. Mount REST API
app.include_router(api_router, prefix=settings.API_V1_STR)

# 2. Mount Flask-Admin application at /flask-admin
flask_admin_app = create_flask_admin_app()
app.mount("/flask-admin", WSGIMiddleware(flask_admin_app))

# 3. Serve Production Frontend if built
frontend_dist = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "../../frontend/dist")
)

if os.path.exists(frontend_dist):
    assets_dir = os.path.join(frontend_dist, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        # Exclude API, docs, and flask-admin routes from SPA fallback
        if (
            full_path.startswith("api/")
            or full_path.startswith("docs")
            or full_path.startswith("redoc")
            or full_path.startswith("openapi.json")
            or full_path.startswith("flask-admin")
        ):
            raise HTTPException(status_code=404, detail="Not Found")

        file_path = os.path.join(frontend_dist, full_path)
        if full_path and os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(frontend_dist, "index.html"))
else:
    @app.get("/")
    def root():
        return {
            "app": settings.PROJECT_NAME,
            "status": "online",
            "api_docs": "/docs",
            "flask_admin": "/flask-admin",
        }
