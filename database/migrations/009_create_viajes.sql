-- ============================================================
-- Migración 009: Crear tabla de viajes
-- BD: BD-GlobalTrans_PG2
-- Descripción: Tabla para almacenar la asignación de cargamentos a vehículos, tiendas y pilotos
-- ============================================================

CREATE TABLE IF NOT EXISTS viajes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    fecha_plan_salida TIMESTAMPTZ NOT NULL,
    observaciones TEXT,
    cargamento_id UUID REFERENCES cargamentos(id) NOT NULL,
    vehiculo_id UUID REFERENCES vehicles(id) NOT NULL,
    tienda_id UUID REFERENCES tiendas(id) NOT NULL,
    usuario_id UUID REFERENCES users(id) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para búsquedas frecuentes
CREATE INDEX IF NOT EXISTS idx_viajes_fecha_plan_salida ON viajes(fecha_plan_salida);
CREATE INDEX IF NOT EXISTS idx_viajes_cargamento_id ON viajes(cargamento_id);
CREATE INDEX IF NOT EXISTS idx_viajes_vehiculo_id ON viajes(vehiculo_id);
CREATE INDEX IF NOT EXISTS idx_viajes_tienda_id ON viajes(tienda_id);
CREATE INDEX IF NOT EXISTS idx_viajes_usuario_id ON viajes(usuario_id);

-- Trigger para auto-actualizar updated_at
CREATE TRIGGER trigger_viajes_updated_at
    BEFORE UPDATE ON viajes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Habilitar Row Level Security
ALTER TABLE viajes ENABLE ROW LEVEL SECURITY;

-- Política: los usuarios autenticados pueden ver los viajes
CREATE POLICY "viajes_select_authenticated" ON viajes
    FOR SELECT
    TO authenticated
    USING (true);

-- Política: service_role tiene acceso completo (para el backend)
CREATE POLICY "viajes_manage_service_role" ON viajes
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);
