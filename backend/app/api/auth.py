"""
Router de autenticación.
Endpoints para login, registro, logout y obtener usuario actual.
"""
from fastapi import APIRouter, Depends
from app.models.auth import (
    LoginRequest,
    RegisterRequest,
    UserResponse
)
from app.services.auth_service import AuthService
from app.dependencies import get_current_user

router = APIRouter(prefix="/api/auth", tags=["autenticación"])


@router.post("/login", response_model=UserResponse)
async def login(data: LoginRequest):
    """
    Inicia sesión con email y contraseña.
    Retorna directamente los datos del usuario.
    """
    return await AuthService.login(data)


@router.post("/register", response_model=UserResponse)
async def register(data: RegisterRequest):
    """
    Registra un nuevo usuario con rol LEVEL_3 (Cliente).
    Retorna directamente los datos del usuario creado.
    """
    return await AuthService.register(data)
