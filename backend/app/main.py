"""
Punto de entrada de la aplicación FastAPI — GlobalTrans API.
Configura la app, middlewares y routers.
"""
from fastapi import FastAPI
from app.api.auth import router as auth_router
from app.api.users import router as users_router
from app.api.roles import router as roles_router
from app.middleware.cors import setup_cors

# Crear la aplicación FastAPI
app = FastAPI(
    title="GlobalTrans API",
    description="API para el sistema de gestión de transporte global GlobalTrans",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configurar CORS
setup_cors(app)

# Registrar routers
app.include_router(auth_router)
app.include_router(users_router)
app.include_router(roles_router)


@app.get("/", tags=["health"])
async def health_check():
    """Endpoint de verificación de estado de la API."""
    return {
        "status": "online",
        "service": "GlobalTrans API",
        "version": "1.0.0"
    }
