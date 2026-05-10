-- ============================================================
-- Migración 011: Tabla de posición en tiempo real
-- BD: BD-GlobalTrans_PG2
-- Descripción: Caché de última posición GPS conocida por viaje activo
-- ============================================================

CREATE TABLE IF NOT EXISTS viaje_posicion_actual (
    viaje_id UUID PRIMARY KEY REFERENCES viajes(id) ON DELETE CASCADE,
    latitud NUMERIC(10, 7) NOT NULL,
    longitud NUMERIC(10, 7) NOT NULL,
    velocidad NUMERIC(5, 1),
    rumbo NUMERIC(5, 1),
    precision_gps NUMERIC(5, 1),
    fecha_actualizacion TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar Row Level Security
ALTER TABLE viaje_posicion_actual ENABLE ROW LEVEL SECURITY;

-- Política: los usuarios autenticados pueden ver las posiciones
CREATE POLICY "posicion_select_authenticated" ON viaje_posicion_actual
    FOR SELECT
    TO authenticated
    USING (true);

-- Política: service_role tiene acceso completo
CREATE POLICY "posicion_manage_service_role" ON viaje_posicion_actual
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);
