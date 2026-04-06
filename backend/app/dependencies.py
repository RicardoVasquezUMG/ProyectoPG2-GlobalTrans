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


async def get_current_user(
    authorization: Optional[str] = Header(None)
) -> UserResponse:
    """
    Extrae y valida el token JWT del header Authorization.
    Retorna el usuario autenticado o lanza 401.
    """
    if not authorization:
        raise AuthenticationError(detail="Token de autenticación requerido")

    # Extraer el token del formato "Bearer <token>"
    parts = authorization.split(" ")
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise AuthenticationError(detail="Formato de token inválido. Use: Bearer <token>")

    token = parts[1]
    return await AuthService.get_user_by_token(token)


def require_roles(*allowed_roles: UserRole):
    """
    Factory que genera un dependency checker de roles.
    Verifica que el usuario autenticado tenga uno de los roles permitidos.

    Uso:
        @router.get("/admin-only")
        async def admin_endpoint(user = Depends(require_roles(UserRole.LEVEL_1))):
            ...
    """
    async def role_checker(
        current_user: UserResponse = Depends(get_current_user)
    ) -> UserResponse:
        if current_user.role not in [role.value for role in allowed_roles]:
            raise AuthorizationError()
        return current_user
    return role_checker
