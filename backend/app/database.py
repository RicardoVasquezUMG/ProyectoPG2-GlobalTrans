"""
Conexión a Supabase.
Provee la instancia del cliente para uso en toda la aplicación.
"""
from supabase import create_client, Client
from app.config import get_settings

settings = get_settings()

# Cliente Supabase con la clave anon (pública)
supabase: Client = create_client(
    settings.SUPABASE_URL,
    settings.SUPABASE_KEY
)


def get_supabase_admin() -> Client:
    """
    Retorna un cliente Supabase con la clave de servicio (service_role).
    Usar solo para operaciones administrativas que requieren bypass de RLS.
    """
    if not settings.SUPABASE_SERVICE_ROLE_KEY:
        # Si no hay service role key, usa el cliente normal
        return supabase
    return create_client(
        settings.SUPABASE_URL,
        settings.SUPABASE_SERVICE_ROLE_KEY
    )
