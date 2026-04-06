"""
Excepciones personalizadas de la aplicación.
Facilitan el manejo consistente de errores en servicios y routers.
"""
from fastapi import HTTPException, status


class AuthenticationError(HTTPException):
    """Error de autenticación — credenciales inválidas o token expirado."""
    def __init__(self, detail: str = "Credenciales inválidas"):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=detail,
            headers={"WWW-Authenticate": "Bearer"}
        )


class AuthorizationError(HTTPException):
    """Error de autorización — el usuario no tiene permisos suficientes."""
    def __init__(self, detail: str = "No posee los permisos necesarios para realizar esta acción"):
        super().__init__(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=detail
        )


class NotFoundError(HTTPException):
    """Recurso no encontrado."""
    def __init__(self, resource: str = "Recurso", detail: str = None):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=detail or f"{resource} no encontrado"
        )


class ConflictError(HTTPException):
    """Conflicto — el recurso ya existe."""
    def __init__(self, detail: str = "El recurso ya existe"):
        super().__init__(
            status_code=status.HTTP_409_CONFLICT,
            detail=detail
        )


class BadRequestError(HTTPException):
    """Solicitud inválida."""
    def __init__(self, detail: str = "Solicitud inválida"):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=detail
        )
