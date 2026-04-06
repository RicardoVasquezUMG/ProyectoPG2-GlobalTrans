"""
Dependencias inyectables de FastAPI.
Provee funciones para extraer el usuario actual y verificar roles.
"""
from fastapi import Depends, Header
from app.services.auth_service import AuthService
from app.models.auth import UserResponse
from app.config import UserRole
from app.utils.exceptions import AuthenticationError, AuthorizationError
from typing import Optional


async def get_current_user() -> Optional[UserResponse]:
    """
    Función dummy que ya no extrae ni valida tokens.
    """
    return None

def require_roles(*allowed_roles: UserRole):
    """
    Factory que genera un dependency checker de roles.
    Como la autenticación JWT fue eliminada, esto es un dummy que no valida nada en el backend.
    """
    async def role_checker() -> None:
        pass
    return role_checker
