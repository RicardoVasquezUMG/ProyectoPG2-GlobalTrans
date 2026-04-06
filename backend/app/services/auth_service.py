"""
Servicio de autenticación.
Maneja login, registro y verificación de sesión contra Supabase Auth.
"""
from app.database import supabase, get_supabase_admin
from app.models.auth import LoginRequest, RegisterRequest, UserResponse
from app.utils.exceptions import AuthenticationError, ConflictError, BadRequestError
from app.config import UserRole
from gotrue.errors import AuthApiError


class AuthService:
    """Lógica de negocio para autenticación de usuarios."""

    @staticmethod
    async def login(data: LoginRequest) -> UserResponse:
        """
        Autentica un usuario con email y contraseña.
        Retorna tokens JWT y datos del usuario con su rol.
        """
        try:
            # Autenticar contra Supabase Auth
            auth_response = supabase.auth.sign_in_with_password({
                "email": data.email,
                "password": data.password
            })
        except AuthApiError as e:
            raise AuthenticationError(detail="Correo o contraseña incorrectos")
        except Exception as e:
            raise AuthenticationError(detail="Error al iniciar sesión. Verifica tus credenciales.")

        if not auth_response.user:
            raise AuthenticationError(detail="Correo o contraseña incorrectos")

        # Obtener datos del usuario de la tabla users con su rol
        user_data = await AuthService._get_user_with_role(auth_response.user.id)

        if not user_data:
            raise AuthenticationError(detail="Usuario no encontrado en el sistema")

        if not user_data.get("is_active", True) is True:
            raise AuthenticationError(detail="Tu cuenta se encuentra desactivada. Contacta al administrador.")

        # Construir respuesta
        user_response = UserResponse(
            id=user_data["id"],
            email=user_data["email"],
            full_name=user_data["full_name"],
            role=user_data["roles"]["name"] if user_data.get("roles") else "LEVEL_3",
            role_name=user_data["roles"]["description"] if user_data.get("roles") else None,
            is_active=user_data["is_active"],
            phone=user_data.get("phone"),
            avatar_url=user_data.get("avatar_url")
        )

        return user_response

    @staticmethod
    async def register(data: RegisterRequest) -> UserResponse:
        """
        Registra un nuevo usuario.
        Crea cuenta en Supabase Auth e inserta registro en tabla users con rol LEVEL_3.
        """
        # Verificar si el email ya existe en la tabla users
        existing = get_supabase_admin().table("users").select("id").eq("email", data.email).execute()
        if existing.data:
            raise ConflictError(detail="Ya existe una cuenta registrada con este correo electrónico")

        # Obtener el rol LEVEL_3 (cliente) por defecto
        role_response = get_supabase_admin().table("roles").select("id").eq("name", UserRole.LEVEL_3.value).execute()
        if not role_response.data:
            raise BadRequestError(detail="Error de configuración: rol por defecto no encontrado. Contacta al administrador.")

        default_role_id = role_response.data[0]["id"]

        try:
            # Crear usuario en Supabase Auth
            auth_response = supabase.auth.sign_up({
                "email": data.email,
                "password": data.password
            })
        except AuthApiError as e:
            error_msg = str(e)
            if "already registered" in error_msg.lower():
                raise ConflictError(detail="Ya existe una cuenta registrada con este correo electrónico")
            raise BadRequestError(detail=f"Error al crear la cuenta: {error_msg}")
        except Exception as e:
            raise BadRequestError(detail="Error inesperado al crear la cuenta. Intenta de nuevo.")

        if not auth_response.user:
            raise BadRequestError(detail="No se pudo crear la cuenta. Intenta de nuevo.")

        # Insertar en la tabla users
        try:
            user_insert = get_supabase_admin().table("users").insert({
                "auth_id": str(auth_response.user.id),
                "email": data.email,
                "full_name": data.full_name,
                "phone": data.phone,
                "role_id": default_role_id,
                "is_active": True
            }).execute()
        except Exception as e:
            # Si falla el insert en users, intentar limpiar el usuario de auth
            # (best effort — no siempre es posible sin service_role)
            raise BadRequestError(detail="Error al completar el registro. Intenta de nuevo.")

        if not user_insert.data:
            raise BadRequestError(detail="Error al guardar los datos del usuario")

        # Si Supabase Auth retornó sesión (no requiere confirmación por email)
        if auth_response.session:
            user_data = user_insert.data[0]
            user_response = UserResponse(
                id=user_data["id"],
                email=user_data["email"],
                full_name=user_data["full_name"],
                role=UserRole.LEVEL_3.value,
                role_name="Cliente",
                is_active=True,
                phone=user_data.get("phone"),
                avatar_url=user_data.get("avatar_url")
            )

            return user_response

        # Si se requiere confirmación de email, retornar sin tokens
        user_data = user_insert.data[0]
        user_response = UserResponse(
            id=user_data["id"],
            email=user_data["email"],
            full_name=user_data["full_name"],
            role=UserRole.LEVEL_3.value,
            role_name="Cliente",
            is_active=True,
            phone=user_data.get("phone")
        )

        return user_response


    @staticmethod
    async def _get_user_with_role(auth_id: str) -> dict | None:
        """
        Obtiene los datos de un usuario junto con su rol desde la tabla users.
        Busca por auth_id (ID de Supabase Auth).
        """
        response = get_supabase_admin().table("users") \
            .select("*, roles(name, description)") \
            .eq("auth_id", str(auth_id)) \
            .execute()

        if response.data and len(response.data) > 0:
            return response.data[0]
        return None
