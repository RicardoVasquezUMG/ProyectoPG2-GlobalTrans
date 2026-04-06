-- ============================================================
-- Migración 001: Crear tabla de roles del sistema
-- BD: BD-GlobalTrans_PG2
-- Descripción: Tabla de roles con 3 niveles jerárquicos
-- ============================================================

CREATE TABLE IF NOT EXISTS roles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para búsquedas por nombre de rol
CREATE INDEX IF NOT EXISTS idx_roles_name ON roles(name);

-- Habilitar RLS (sin políticas restrictivas por ahora, los roles son públicos de lectura)
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;

-- Política: cualquier usuario autenticado puede leer los roles
CREATE POLICY "roles_select_authenticated" ON roles
    FOR SELECT
    TO authenticated
    USING (true);

-- Política: solo service_role puede modificar roles
CREATE POLICY "roles_manage_service_role" ON roles
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);
