"""
Router de autenticación.
Endpoints para login, registro, logout y obtener usuario actual.
"""
from fastapi import APIRouter, Depends
from app.models.auth import (
    LoginRequest,
    RegisterRequest,
    TokenResponse,
    UserResponse,
    MessageResponse
)
from app.services.auth_service import AuthService
from app.dependencies import get_current_user

router = APIRouter(prefix="/api/auth", tags=["autenticación"])


@router.post("/login", response_model=TokenResponse)
async def login(data: LoginRequest):
    """
    Inicia sesión con email y contraseña.
    Retorna tokens JWT y datos del usuario.
    """
    return await AuthService.login(data)


@router.post("/register", response_model=TokenResponse)
async def register(data: RegisterRequest):
    """
    Registra un nuevo usuario con rol LEVEL_3 (Cliente).
    Retorna tokens JWT y datos del usuario creado.
    """
    return await AuthService.register(data)


@router.post("/logout", response_model=MessageResponse)
async def logout():
    """
    Cierra la sesión del usuario.
    El frontend debe eliminar el token de su estado.
    """
    return MessageResponse(
        message="Sesión cerrada exitosamente",
        success=True
    )


@router.get("/me", response_model=UserResponse)
async def get_current_user_data(
    current_user: UserResponse = Depends(get_current_user)
):
    """
    Obtiene los datos del usuario autenticado.
    Requiere token JWT válido en el header Authorization.
    """
    return current_user
