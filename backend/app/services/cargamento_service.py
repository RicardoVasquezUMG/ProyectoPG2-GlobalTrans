from app.database import get_supabase_admin
from app.models.cargamento import CargamentoCreate, CargamentoUpdate
from app.utils.exceptions import BadRequestError
from datetime import datetime, timezone
import uuid
import mimetypes
import urllib.parse

class CargamentoService:
    @staticmethod
    async def get_all():
        try:
            # We want to join with furgones to get numero_contenedor and campanias for descripcion, and documentos_cargamento for types
            response = get_supabase_admin().table("cargamentos").select(
                "*, furgones!inner(numero_contenedor), campanias!inner(descripcion), documentos_cargamento(tipo)"
            ).order("created_at", desc=True).execute()
            
            # Map the response to flatten the nested relation data for the frontend
            data = response.data
            for row in data:
                furgon = row.pop('furgones', {})
                campania = row.pop('campanias', {})
                documentos = row.pop('documentos_cargamento', [])
                row['numero_contenedor'] = furgon.get('numero_contenedor') if furgon else None
                row['descripcion_campania'] = campania.get('descripcion') if campania else None
                row['documentos'] = [doc.get('tipo') for doc in documentos] if documentos else []
                
            return data
        except Exception as e:
            raise BadRequestError(detail=f"Error al obtener cargamentos: {str(e)}")

    @staticmethod
    async def create(data: CargamentoCreate):
        try:
            insert_data = data.model_dump()
            # The estado will default to 'creado' per DB and Model defaults
            # However, pydantic model defaults aren't in model_dump unless explicitly set or if we use exclude_unset=False
            response = get_supabase_admin().table("cargamentos").insert(insert_data).execute()
            if not response.data:
                raise BadRequestError(detail="Error al crear el cargamento")
            return response.data[0]
        except Exception as e:
            raise BadRequestError(detail=f"Error al crear cargamento: {str(e)}")

    @staticmethod
    async def update(cargamento_id: str, data: CargamentoUpdate):
        update_data = data.model_dump()
        if not update_data:
            return None
            
        update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
        
        if update_data.get("estado") == "conciliado":
            update_data["fecha_cierre"] = datetime.now(timezone.utc).isoformat()
            
        try:
            response = get_supabase_admin().table("cargamentos").update(update_data).eq("id", cargamento_id).execute()
        except Exception as e:
            raise BadRequestError(detail=f"Error al actualizar el cargamento: {str(e)}")
            
        if not response.data:
            raise BadRequestError(detail="Cargamento no encontrado o error en DB")
            
        return response.data[0]

    @staticmethod
    async def delete(cargamento_id: str):
        try:
            response = get_supabase_admin().table("cargamentos").delete().eq("id", cargamento_id).execute()
            if not response.data:
                raise BadRequestError(detail="Cargamento no encontrado")
            return response.data[0]
        except Exception as e:
            raise BadRequestError(detail=f"Error al eliminar cargamento: {str(e)}")

    @staticmethod
    async def get_documents(cargamento_id: str):
        try:
            response = get_supabase_admin().table("documentos_cargamento").select("*").eq("cargamento_id", cargamento_id).order("fecha_subida", desc=True).execute()
            return response.data
        except Exception as e:
            raise BadRequestError(detail=f"Error al obtener documentos: {str(e)}")

    @staticmethod
    async def upload_document(cargamento_id: str, file_bytes: bytes, file_name: str, content_type: str, tipo: str):
        try:
            # Generate unique filename
            ext = mimetypes.guess_extension(content_type) or ".pdf"
            if not file_name.endswith(ext):
                file_name += ext
            unique_filename = f"{cargamento_id}/{uuid.uuid4()}_{file_name}"

            # Upload to Supabase Storage
            supabase = get_supabase_admin()
            storage_response = supabase.storage.from_("documentos").upload(
                file=file_bytes,
                path=unique_filename,
                file_options={"content-type": content_type}
            )

            # Get public URL
            public_url = supabase.storage.from_("documentos").get_public_url(unique_filename)

            # Insert into DB
            doc_data = {
                "cargamento_id": cargamento_id,
                "tipo": tipo,
                "url": public_url
            }
            db_response = supabase.table("documentos_cargamento").insert(doc_data).execute()
            if not db_response.data:
                raise BadRequestError(detail="Error al guardar registro del documento")
            
            return db_response.data[0]
        except Exception as e:
            raise BadRequestError(detail=f"Error al subir documento: {str(e)}")

    @staticmethod
    async def delete_document(documento_id: str):
        try:
            supabase = get_supabase_admin()
            
            # 1. Obtener el documento para conocer su URL
            doc_response = supabase.table("documentos_cargamento").select("*").eq("id", documento_id).execute()
            if not doc_response.data:
                raise BadRequestError(detail="Documento no encontrado")
            
            doc_url = doc_response.data[0]["url"]
            
            # 2. Extraer el path del storage (después de /public/documentos/)
            path_prefix = "/public/documentos/"
            if path_prefix in doc_url:
                storage_path = doc_url.split(path_prefix)[-1]
                # Quitar parámetros de consulta si los hay (ej. ?t=...)
                storage_path = storage_path.split("?")[0]
                # Decodificar URL (por si tiene espacios %20 u otros caracteres especiales)
                storage_path = urllib.parse.unquote(storage_path)
                # Intentar eliminar del storage (no fallar si no existe)
                res = supabase.storage.from_("documentos").remove([storage_path])
                print("Supabase Storage Remove Response:", res)
                
            # 3. Eliminar de la base de datos
            del_response = supabase.table("documentos_cargamento").delete().eq("id", documento_id).execute()
            if not del_response.data:
                raise BadRequestError(detail="Error al eliminar el registro del documento")
                
            return del_response.data[0]
        except Exception as e:
            raise BadRequestError(detail=f"Error al eliminar documento: {str(e)}")
