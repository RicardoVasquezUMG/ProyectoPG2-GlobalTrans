"""
Configuración central de la aplicación.
Carga variables de entorno y define enums de roles.
"""
from enum import Enum
from pydantic_settings import BaseSettings
from functools import lru_cache


class UserRole(str, Enum):
    """Roles del sistema con 3 niveles jerárquicos."""
    LEVEL_1 = "LEVEL_1"
    LEVEL_2 = "LEVEL_2"
    LEVEL_3 = "LEVEL_3"


class Settings(BaseSettings):
    """Configuración cargada desde variables de entorno."""
    SUPABASE_URL: str
    SUPABASE_KEY: str
    SUPABASE_SERVICE_ROLE_KEY: str = ""
    JWT_SECRET: str = "default-secret-change-in-production"
    CORS_ORIGINS: str = "http://localhost:5173"
    ENVIRONMENT: str = "development"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache()
def get_settings() -> Settings:
    """Retorna instancia cacheada de la configuración."""
    return Settings()
