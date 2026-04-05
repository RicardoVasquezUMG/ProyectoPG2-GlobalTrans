# ProyectoPG2 — GlobalTrans

## Visión General

Aplicación web empresarial para gestión de transporte global. El sistema maneja operaciones logísticas con tres niveles de acceso diferenciados. La arquitectura separa frontend y backend en dos proyectos independientes dentro del mismo repositorio (monorepo).

---

## Stack Tecnológico

| Capa        | Tecnología                          | Versión mínima |
|-------------|-------------------------------------|----------------|
| Frontend    | React + Vite                        | React 18+      |
| UI Library  | PrimeReact + PrimeIcons + PrimeFlex | PrimeReact 10+ |
| Estado      | React Context + useReducer          | —              |
| HTTP Client | Axios                               | 1.x            |
| Backend     | Python + FastAPI                    | Python 3.11+   |
| ORM         | Supabase Python Client (`supabase-py`) | 2.x         |
| Auth        | Supabase Auth (JWT)                 | —              |
| Base de Datos | Supabase (PostgreSQL)             | —              |


---

## Estructura de Carpetas

```
ProyectoPG2/
├── .agents/                          # Configuración del agente
│   ├── AGENTS.md                     # ← Este archivo
│   └── skills/
│       └── frontend-design/
├── frontend/                         # Proyecto React + Vite
│   ├── public/
│   │   └── favicon.svg
│   ├── src/
│   │   ├── api/                      # Clientes HTTP y llamadas al backend
│   │   │   ├── axiosInstance.js       # Instancia Axios con interceptors
│   │   │   ├── authApi.js            # Endpoints de autenticación
│   │   │   ├── usersApi.js           # CRUD de usuarios
│   │   │   └── ...Api.js             # Un archivo por recurso
│   │   ├── assets/                   # Imágenes, fuentes, SVGs
│   │   │   ├── images/
│   │   │   └── styles/
│   │   │       ├── _variables.css    # Tokens de diseño (colores, spacing, radii)
│   │   │       ├── _typography.css   # Escala tipográfica y fuentes
│   │   │       ├── _overrides.css    # Overrides de PrimeReact
│   │   │       └── global.css        # Estilos globales base
│   │   ├── components/               # Componentes reutilizables
│   │   │   ├── common/               # Botones, inputs, modales genéricos
│   │   │   │   ├── AppTopbar.jsx
│   │   │   │   ├── AppSidebar.jsx
│   │   │   │   ├── AppFooter.jsx
│   │   │   │   ├── LoadingSpinner.jsx
│   │   │   │   └── ConfirmDialog.jsx
│   │   │   └── domain/               # Componentes específicos del negocio
│   │   │       ├── ShipmentCard.jsx
│   │   │       └── RouteMap.jsx
│   │   ├── context/                  # React Context providers
│   │   │   ├── AuthContext.jsx       # Estado de autenticación y usuario
│   │   │   ├── ThemeContext.jsx      # Modo claro/oscuro
│   │   │   └── ToastContext.jsx      # Notificaciones globales
│   │   ├── guards/                   # Protección de rutas
│   │   │   ├── PrivateRoute.jsx      # Requiere autenticación
│   │   │   └── RoleRoute.jsx         # Requiere rol específico
│   │   ├── hooks/                    # Custom hooks
│   │   │   ├── useAuth.js            # Hook para acceder al AuthContext
│   │   │   ├── useFetch.js           # Hook genérico para llamadas API
│   │   │   └── useRole.js            # Hook para verificar permisos
│   │   ├── layouts/                  # Layouts de página
│   │   │   ├── MainLayout.jsx        # Layout con sidebar + topbar (usuarios logueados)
│   │   │   └── AuthLayout.jsx        # Layout limpio para login/registro
│   │   ├── pages/                    # Páginas organizadas por rol/módulo
│   │   │   ├── auth/                 # Páginas públicas
│   │   │   │   ├── LoginPage.jsx
│   │   │   │   ├── RegisterPage.jsx
│   │   │   │   └── ForgotPasswordPage.jsx
│   │   │   ├── admin/                # Solo rol ADMIN
│   │   │   │   ├── DashboardPage.jsx
│   │   │   │   ├── UsersPage.jsx
│   │   │   │   ├── RolesPage.jsx
│   │   │   │   └── SettingsPage.jsx
│   │   │   ├── operator/             # Rol OPERADOR
│   │   │   │   ├── ShipmentsPage.jsx
│   │   │   │   ├── RoutesPage.jsx
│   │   │   │   └── ReportsPage.jsx
│   │   │   ├── client/               # Rol CLIENTE
│   │   │   │   ├── TrackingPage.jsx
│   │   │   │   ├── OrdersPage.jsx
│   │   │   │   └── ProfilePage.jsx
│   │   │   └── shared/               # Páginas compartidas entre roles
│   │   │       ├── NotFoundPage.jsx
│   │   │       ├── UnauthorizedPage.jsx
│   │   │       └── ProfilePage.jsx
│   │   ├── router/                   # Configuración de rutas
│   │   │   └── AppRouter.jsx         # React Router con rutas protegidas
│   │   ├── utils/                    # Funciones utilitarias
│   │   │   ├── constants.js          # Constantes de la app (roles, estados)
│   │   │   ├── formatters.js         # Formateo de fechas, moneda, etc.
│   │   │   └── validators.js         # Validaciones de formularios
│   │   ├── App.jsx                   # Componente raíz
│   │   ├── App.css                   # Estilos del componente raíz
│   │   └── main.jsx                  # Punto de entrada
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   └── .env.example                  # Variables de entorno (VITE_API_URL, etc.)
│
├── backend/                          # Proyecto Python + FastAPI
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                   # Punto de entrada FastAPI
│   │   ├── config.py                 # Configuración (Pydantic Settings)
│   │   ├── database.py               # Conexión a Supabase
│   │   ├── dependencies.py           # Dependencias inyectables (get_current_user, etc.)
│   │   ├── api/                      # Routers (endpoints)
│   │   │   ├── __init__.py
│   │   │   ├── auth.py               # /api/auth/login, /register, /logout
│   │   │   ├── users.py              # /api/users CRUD
│   │   │   ├── shipments.py          # /api/shipments
│   │   │   ├── routes.py             # /api/routes
│   │   │   └── reports.py            # /api/reports
│   │   ├── models/                   # Pydantic models (schemas)
│   │   │   ├── __init__.py
│   │   │   ├── auth.py               # LoginRequest, TokenResponse
│   │   │   ├── user.py               # UserCreate, UserRead, UserUpdate
│   │   │   ├── shipment.py           # ShipmentCreate, ShipmentRead
│   │   │   └── common.py             # PaginatedResponse, ErrorResponse
│   │   ├── services/                 # Lógica de negocio
│   │   │   ├── __init__.py
│   │   │   ├── auth_service.py       # Lógica de autenticación
│   │   │   ├── user_service.py       # Lógica de usuarios
│   │   │   └── shipment_service.py   # Lógica de envíos
│   │   ├── middleware/               # Middlewares
│   │   │   ├── __init__.py
│   │   │   ├── cors.py               # Configuración CORS
│   │   │   └── auth_middleware.py     # Verificación JWT
│   │   └── utils/                    # Utilidades del backend
│   │       ├── __init__.py
│   │       ├── security.py           # Hashing, JWT, encriptación
│   │       └── exceptions.py         # Excepciones personalizadas
│   ├── tests/                        # Tests del backend
│   │   ├── __init__.py
│   │   ├── conftest.py               # Fixtures compartidas
│   │   ├── test_auth.py
│   │   └── test_users.py
│   ├── requirements.txt              # Dependencias Python
│   ├── .env.example                  # Variables de entorno backend
│   └── Dockerfile                    # Containerización del backend
│
├── database/                         # Scripts y migraciones de BD
│   ├── migrations/                   # Scripts SQL de migración
│   │   ├── 001_create_users.sql
│   │   ├── 002_create_roles.sql
│   │   └── 003_create_shipments.sql
│   ├── seeds/                        # Datos iniciales
│   │   └── seed_roles.sql
│   └── schema.sql                    # Schema completo de referencia
│
├── .gitignore
├── .env.example                      # Variables compartidas
└── README.md
```

---

## Sistema de Roles y Permisos (Arquitectura Flexible)

El sistema soporta **3 niveles de rol** cuya nomenclatura final y permisos específicos se definirán más adelante. Para permitir cambios rápidos sin refactorizar el código, la arquitectura abstrae los nombres de los roles y la matriz de permisos mediante **constantes de configuración** y **nombres clave neutros (ej. `ROLE_LEVEL_1`, `ROLE_LEVEL_2`, `ROLE_LEVEL_3`)** o un mapeo dinámico.

---

### Configuración Centralizada de Roles (`src/utils/constants.js`)

Todos los componentes y guards deben referenciar los roles únicamente desde el objeto central `ROLES`. Si más adelante decides cambiar "ROLE_LEVEL_1" a "SUPER_ADMIN" o "LOGISTICS_MANAGER", solo cambias una línea de código.

```javascript
// frontend/src/utils/constants.js
export const ROLES = {
  LEVEL_1: 'LEVEL_1', // Ej. Administrador / SuperUser
  LEVEL_2: 'LEVEL_2', // Ej. Operador / Gestor
  LEVEL_3: 'LEVEL_3', // Ej. Cliente / Usuario Final
};

// Mapeo legible para la UI (Modificable en cualquier momento)
export const ROLE_LABELS = {
  [ROLES.LEVEL_1]: 'Nivel 1 (Administrador)',
  [ROLES.LEVEL_2]: 'Nivel 2 (Operador)',
  [ROLES.LEVEL_3]: 'Nivel 3 (Cliente)',
};

// Matriz de permisos por ruta (Fácilmente adaptable)
export const PERMISSIONS = {
  MODULE_ADMIN: [ROLES.LEVEL_1],
  MODULE_OPERATIONS: [ROLES.LEVEL_1, ROLES.LEVEL_2],
  MODULE_PUBLIC_OR_CLIENT: [ROLES.LEVEL_1, ROLES.LEVEL_2, ROLES.LEVEL_3],
};
```

---

### Matriz de Acceso Abstraída

| Módulo / Funcionalidad | `LEVEL_1` (Nivel 1) | `LEVEL_2` (Nivel 2) | `LEVEL_3` (Nivel 3) |
|------------------------|---------------------|---------------------|---------------------|
| Módulo Administración  | ✅                  | ❌                  | ❌                  |
| Módulo Operativo       | ✅                  | ✅                  | ❌                  |
| Módulo Consulta/Cliente| ✅                  | ✅                  | ✅                  |

---

### Implementación de Roles — Frontend Flexible

```jsx
// guards/RoleRoute.jsx — Protección desacoplada
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const RoleRoute = ({ allowedRoles = [], children }) => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;
  if (!allowedRoles.includes(user.role)) return <Navigate to="/unauthorized" replace />;

  return children;
};

export default RoleRoute;

// Uso en AppRouter.jsx con constantes importadas
import { ROLES, PERMISSIONS } from '../utils/constants';

<Route path="/admin/*" element={
  <RoleRoute allowedRoles={PERMISSIONS.MODULE_ADMIN}>
    <AdminDashboard />
  </RoleRoute>
} />
```

---

### Implementación de Roles — Backend Flexible (`backend/app/config.py`)

```python
# app/config.py
from enum import Enum

class UserRole(str, Enum):
    LEVEL_1 = "LEVEL_1"
    LEVEL_2 = "LEVEL_2"
    LEVEL_3 = "LEVEL_3"

# app/dependencies.py — Verificación genérica
from fastapi import Depends, HTTPException, status
from app.config import UserRole

def require_roles(*allowed_roles: UserRole):
    def role_checker(current_user = Depends(get_current_user)):
        if current_user.role not in [role.value for role in allowed_roles]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No posee los permisos necesarios para realizar esta acción"
            )
        return current_user
    return role_checker

# Uso en endpoints
@router.get("/reports")
async def get_reports(user = Depends(require_roles(UserRole.LEVEL_1, UserRole.LEVEL_2))):
    ...
```

---

## Convenciones de Código

### General

- Idioma del código: **inglés** (variables, funciones, clases, componentes).
- Idioma de la UI: **español** (labels, mensajes, tooltips).
- Idioma de comentarios: **español**.
- Cada archivo tiene una sola responsabilidad.
- No usar `any` como tipo en TypeScript. Si se usa JS, documentar los tipos esperados con JSDoc.

### Frontend — React + PrimeReact

#### Componentes
- Usar **componentes funcionales** con hooks. Nunca clases.
- Nombres de componentes en **PascalCase**: `ShipmentCard.jsx`.
- Un componente por archivo. El archivo lleva el mismo nombre que el componente.
- Los props se desestructuran en la firma de la función.
- Estado local con `useState`. Estado compartido con `useContext`.
- Efectos secundarios solo en `useEffect` con dependencias explícitas.

#### PrimeReact
- Usar los componentes de PrimeReact como primera opción antes de crear componentes custom.
- Componentes prioritarios: `DataTable`, `Dialog`, `Toast`, `Menu`, `Sidebar`, `Card`, `InputText`, `Dropdown`, `Calendar`, `Button`.
- Temas: usar el sistema de temas de PrimeReact (`lara-dark-blue` o `lara-light-blue` como base).
- Personalizar con CSS custom en `_overrides.css`, nunca modificar los archivos fuente de PrimeReact.
- Para formularios, usar los componentes de PrimeReact con validación manual o con una librería ligera como `react-hook-form`.

#### Estilos
- **No usar TailwindCSS.** Usar CSS vanilla + PrimeFlex para layout.
- Tokens de diseño centralizados en `_variables.css` usando CSS custom properties.
- Cada componente puede tener su propio `.css` si es necesario, nombrado igual: `ShipmentCard.css`.
- Los overrides de PrimeReact van en `_overrides.css` con selectores específicos.
- Colores, spacing y radii siempre referenciados desde variables CSS, nunca hardcodeados.

#### Estructura de una página típica

```jsx
// pages/admin/UsersPage.jsx
import { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { getUsers, deleteUser } from '../../api/usersApi';
import { useToast } from '../../hooks/useToast';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await getUsers();
      setUsers(data);
    } catch (error) {
      showError('Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="users-page">
      <div className="page-header">
        <h1>Gestión de Usuarios</h1>
        <Button label="Nuevo Usuario" icon="pi pi-plus" />
      </div>
      <DataTable value={users} loading={loading} paginator rows={10}>
        <Column field="name" header="Nombre" sortable />
        <Column field="email" header="Correo" sortable />
        <Column field="role" header="Rol" sortable />
      </DataTable>
    </div>
  );
}
```

### Backend — Python + FastAPI

#### Estructura de código
- Seguir el patrón **Router → Service → Database**.
- Los routers (`api/`) solo manejan HTTP: reciben request, llaman al service, retornan response.
- Los services (`services/`) contienen la lógica de negocio.
- La capa de datos (`database.py`) maneja la conexión con Supabase.
- Modelos Pydantic en `models/` para validación de entrada y serialización de salida.

#### Convenciones Python
- Usar **type hints** en todas las funciones.
- Docstrings en español para funciones públicas.
- Nombres de variables y funciones en `snake_case`.
- Clases en `PascalCase`.
- Constantes en `UPPER_SNAKE_CASE`.
- Usar `async/await` en todos los endpoints y llamadas a Supabase.
- Manejar errores con `HTTPException` y códigos de estado apropiados.

#### Patrón de un router típico

```python
# api/users.py
from fastapi import APIRouter, Depends, HTTPException, status
from app.models.user import UserCreate, UserRead, UserUpdate
from app.services.user_service import UserService
from app.dependencies import require_role

router = APIRouter(prefix="/api/users", tags=["users"])

@router.get("/", response_model=list[UserRead])
async def list_users(user=Depends(require_role("ADMIN"))):
    """Obtiene la lista de todos los usuarios."""
    return await UserService.get_all()

@router.post("/", response_model=UserRead, status_code=status.HTTP_201_CREATED)
async def create_user(data: UserCreate, user=Depends(require_role("ADMIN"))):
    """Crea un nuevo usuario."""
    return await UserService.create(data)

@router.put("/{user_id}", response_model=UserRead)
async def update_user(user_id: str, data: UserUpdate, user=Depends(require_role("ADMIN"))):
    """Actualiza un usuario existente."""
    return await UserService.update(user_id, data)

@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(user_id: str, user=Depends(require_role("ADMIN"))):
    """Elimina un usuario."""
    await UserService.delete(user_id)
```

#### Patrón de un servicio típico

```python
# services/user_service.py
from app.database import supabase
from app.models.user import UserCreate, UserUpdate
from fastapi import HTTPException, status

class UserService:
    @staticmethod
    async def get_all():
        """Obtiene todos los usuarios de la base de datos."""
        response = supabase.table("users").select("*").execute()
        return response.data

    @staticmethod
    async def create(data: UserCreate):
        """Crea un usuario nuevo en Supabase."""
        response = supabase.table("users").insert(data.model_dump()).execute()
        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Error al crear el usuario"
            )
        return response.data[0]
```

---

## Base de Datos — Supabase

### Tablas Principales

```sql
-- Roles del sistema
CREATE TABLE roles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,       -- ADMIN, OPERATOR, CLIENT
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Usuarios
CREATE TABLE users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(200) NOT NULL,
    role_id UUID REFERENCES roles(id) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    avatar_url TEXT,
    phone VARCHAR(20) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security: cada usuario solo ve sus datos, admin ve todo
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
```

### Convenciones de BD
- Nombres de tablas en `snake_case` y **plural**: `users`, `shipments`, `routes`.
- Nombres de columnas en `snake_case`: `created_at`, `full_name`.
- Usar `UUID` como primary key en todas las tablas.
- Toda tabla lleva `created_at` y `updated_at` con timestamps.
- Usar **Row Level Security (RLS)** de Supabase para control de acceso a nivel de fila.
- Las migraciones SQL se versionan con prefijo numérico: `001_`, `002_`, etc.
- Datos semilla (seed) separados en `database/seeds/`.

---

## Autenticación y Seguridad

### Flujo de Autenticación

1. El usuario envía credenciales al backend (`POST /api/auth/login`).
2. El backend valida contra Supabase Auth.
3. Si es válido, retorna un JWT con el `role` del usuario en el payload.
4. El frontend almacena el token en memoria (Context), **nunca en localStorage**.
5. Cada request del frontend incluye el token en el header `Authorization: Bearer <token>`.
6. El backend valida el JWT en cada request protegida con el middleware de auth.

### Reglas de Seguridad
- Los tokens JWT expiran en **1 hora**. Usar refresh tokens para renovación silenciosa.
- Las contraseñas se manejan exclusivamente a través de Supabase Auth; el backend nunca las almacena.
- CORS configurado para aceptar solo el dominio del frontend.
- Variables sensibles (claves de Supabase, secrets) **solo** en archivos `.env`, nunca en el código.
- Todo endpoint que modifique datos requiere autenticación. No hay escrituras anónimas.

---

## Variables de Entorno

### Frontend (`.env`)
```env
VITE_API_URL=http://localhost:8000
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxxxxxxxx
```

### Backend (`.env`)
```env
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_KEY=eyJxxxxxxxx
SUPABASE_SERVICE_ROLE_KEY=eyJxxxxxxxx
JWT_SECRET=clave-secreta-larga-y-segura
CORS_ORIGINS=http://localhost:5173
ENVIRONMENT=development
```

---

## Estilo Visual y Diseño

### Filosofía de Diseño
Seguir los principios del skill [frontend-design](file:///c:/Users/RicardoV/Downloads/ProyectoPG2/.agents/skills/frontend-design/SKILL.md): diseño distintivo, intencional, que no se vea genérico ni como plantilla predeterminada. Cada decisión visual debe justificarse desde la identidad del producto.

### Directrices
- **Tema base**: Partir de un tema oscuro de PrimeReact (`lara-dark-blue`) y personalizarlo fuertemente.
- **Paleta de colores**: Definir 4-6 colores con nombre en `_variables.css`. No usar colores genéricos sin contexto.
- **Tipografía**: Usar Google Fonts con intención. Una fuente display para títulos y una fuente body para texto. Definir escala tipográfica completa.
- **Espaciado**: Sistema de spacing basado en múltiplos de 4px o 8px, definido en variables CSS.
- **Animaciones**: Micro-animaciones sutiles para transiciones de página, hover en cards, y feedback de acciones. No animar por animar.
- **Responsive**: Mobile-first. El sidebar colapsa en dispositivos pequeños. Las DataTables usan scroll horizontal.
- **Modo oscuro/claro**: Implementar toggle con ThemeContext que cambia las CSS custom properties.
- **Accesibilidad**: Focus visible en todos los interactivos. Contraste mínimo AA. Labels en todos los inputs.

---

## Comandos de Desarrollo

### Frontend
```bash
cd frontend
npm install            # Instalar dependencias
npm run dev            # Servidor de desarrollo (Vite, puerto 5173)
npm run build          # Build de producción
npm run preview        # Preview del build
```

### Backend
```bash
cd backend
python -m venv .venv          # Crear entorno virtual
.venv/Scripts/activate        # Activar (Windows)
pip install -r requirements.txt   # Instalar dependencias
uvicorn app.main:app --reload     # Servidor de desarrollo (puerto 8000)
```

---

## Reglas para el Agente de IA

1. **Antes de crear un componente**, verificar si PrimeReact ya ofrece uno que resuelva la necesidad.
2. **Nunca hardcodear** colores, tamaños o spacing. Siempre usar las variables CSS definidas.
3. **Cada endpoint nuevo** debe incluir: validación con Pydantic, protección de rol, manejo de errores.
4. **Los archivos API del frontend** (`api/*.js`) deben usar la instancia centralizada de Axios con interceptors para token y manejo de errores.
5. **No instalar dependencias** sin justificación. PrimeReact + PrimeFlex + Axios cubren la mayoría de necesidades del frontend.
6. **Las respuestas del backend** deben seguir un formato consistente. Errores con `{ detail: "mensaje" }`, listas con paginación cuando aplique.
7. **Las migraciones SQL** nunca se modifican una vez aplicadas. Crear una nueva migración para cambios.
8. **El código nuevo** debe seguir los patrones ya establecidos en el proyecto. Revisar archivos existentes antes de crear nuevos.
9. **Toda página** debe tener un título descriptivo (`<title>`) y una estructura semántica con `<h1>` único.
10. **Los formularios** usan componentes PrimeReact con validación del lado cliente y del lado servidor.
