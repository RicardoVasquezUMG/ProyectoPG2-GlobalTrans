"""
Configuración de CORS.
Permite requests del frontend configurado en las variables de entorno.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import get_settings


def setup_cors(app: FastAPI) -> None:
    """Configura el middleware CORS en la aplicación FastAPI."""
    settings = get_settings()

    # Parsear los orígenes permitidos (separados por coma)
    origins = [origin.strip() for origin in settings.CORS_ORIGINS.split(",")]

    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
