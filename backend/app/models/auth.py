"""
Modelos Pydantic para autenticación.
Define los schemas de request/response para login, registro y tokens.
"""
from pydantic import BaseModel, EmailStr, Field
from typing import Optional


class LoginRequest(BaseModel):
    """Schema para la solicitud de login."""
    email: EmailStr
    password: str = Field(..., min_length=6, description="Contraseña del usuario")


class RegisterRequest(BaseModel):
    """Schema para la solicitud de registro."""
    email: EmailStr
    password: str = Field(..., min_length=6, description="Contraseña (mínimo 6 caracteres)")
    full_name: str = Field(..., min_length=2, max_length=200, description="Nombre completo")
    phone: str = Field(..., min_length=8, max_length=20, description="Número de teléfono")


class UserResponse(BaseModel):
    """Schema de respuesta con datos del usuario."""
    id: str
    email: str
    full_name: str
    role: str
    role_name: Optional[str] = None
    is_active: bool = True
    phone: Optional[str] = None
    avatar_url: Optional[str] = None


class MessageResponse(BaseModel):
    """Schema genérico para respuestas con mensaje."""
    message: str
    success: bool = True
