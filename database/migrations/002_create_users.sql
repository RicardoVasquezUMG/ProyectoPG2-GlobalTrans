-- ============================================================
-- Migración 002: Crear tabla de usuarios
-- BD: BD-GlobalTrans_PG2
-- Descripción: Tabla de usuarios vinculada a Supabase Auth
-- ============================================================

CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    auth_id UUID UNIQUE,                              -- Referencia al usuario en Supabase Auth (auth.users.id)
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(200) NOT NULL,
    role_id UUID REFERENCES roles(id) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    avatar_url TEXT,
    phone VARCHAR(20) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para búsquedas frecuentes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_auth_id ON users(auth_id);
CREATE INDEX IF NOT EXISTS idx_users_role_id ON users(role_id);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para auto-actualizar updated_at
CREATE TRIGGER trigger_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Habilitar Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Política: los usuarios autenticados pueden ver su propio perfil
CREATE POLICY "users_select_own" ON users
    FOR SELECT
    TO authenticated
    USING (auth_id = auth.uid());

-- Política: los usuarios pueden actualizar su propio perfil
CREATE POLICY "users_update_own" ON users
    FOR UPDATE
    TO authenticated
    USING (auth_id = auth.uid())
    WITH CHECK (auth_id = auth.uid());

-- Política: service_role tiene acceso completo (para el backend)
CREATE POLICY "users_manage_service_role" ON users
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Política: permitir inserción desde anon para el registro
CREATE POLICY "users_insert_anon" ON users
    FOR INSERT
    TO anon
    WITH CHECK (true);

-- Política: permitir inserción desde authenticated
CREATE POLICY "users_insert_authenticated" ON users
    FOR INSERT
    TO authenticated
    WITH CHECK (true);
