from app.database import get_supabase_admin
from app.models.tienda import TiendaCreate, TiendaUpdate
from fastapi import HTTPException, status

class TiendaService:
    @staticmethod
    async def get_all():
        """Obtiene todas las tiendas de la base de datos."""
        response = get_supabase_admin().table("tiendas").select("*").order("created_at", desc=True).execute()
        return response.data

    @staticmethod
    async def get_by_id(tienda_id: str):
        """Obtiene una tienda por su ID."""
        response = get_supabase_admin().table("tiendas").select("*").eq("id", tienda_id).execute()
        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Tienda no encontrada"
            )
        return response.data[0]

    @staticmethod
    async def create(data: TiendaCreate):
        """Crea una nueva tienda."""
        response = get_supabase_admin().table("tiendas").insert(data.model_dump()).execute()
        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Error al crear la tienda"
            )
        return response.data[0]

    @staticmethod
    async def update(tienda_id: str, data: TiendaUpdate):
        """Actualiza una tienda existente."""
        update_data = {k: v for k, v in data.model_dump().items() if v is not None}
        if not update_data:
            return await TiendaService.get_by_id(tienda_id)
            
        response = get_supabase_admin().table("tiendas").update(update_data).eq("id", tienda_id).execute()
        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Tienda no encontrada o no se pudo actualizar"
            )
        return response.data[0]

    @staticmethod
    async def delete(tienda_id: str):
        """Elimina una tienda."""
        response = get_supabase_admin().table("tiendas").delete().eq("id", tienda_id).execute()
        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Tienda no encontrada o no se pudo eliminar"
            )
        return True

