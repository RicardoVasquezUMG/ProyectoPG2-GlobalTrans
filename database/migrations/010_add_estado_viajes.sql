-- ============================================================
-- Migración 010: Agregar estado a viajes + tabla de checkpoints
-- BD: BD-GlobalTrans_PG2
-- Descripción: Modelo de estados del viaje y eventos/checkpoints GPS
-- ============================================================

-- Agregar campo estado a la tabla viajes
ALTER TABLE viajes ADD COLUMN IF NOT EXISTS estado VARCHAR(30) DEFAULT 'planificado'
  CHECK (estado IN ('planificado','en_ruta','en_aduana','entregado','retrasado','cancelado'));

-- Índice para filtrar por estado
CREATE INDEX IF NOT EXISTS idx_viajes_estado ON viajes(estado);

-- Tabla de checkpoints / eventos del viaje
CREATE TABLE IF NOT EXISTS viaje_checkpoints (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    viaje_id UUID NOT NULL REFERENCES viajes(id) ON DELETE CASCADE,
    estado VARCHAR(30) NOT NULL CHECK (estado IN ('planificado','en_ruta','en_aduana','entregado','retrasado','cancelado')),
    latitud NUMERIC(10, 7),
    longitud NUMERIC(10, 7),
    ubicacion_nombre VARCHAR(255),
    pais VARCHAR(50),
    notas TEXT,
    registrado_por UUID REFERENCES users(id),
    fecha_evento TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para búsquedas frecuentes
CREATE INDEX IF NOT EXISTS idx_checkpoint_viaje ON viaje_checkpoints(viaje_id);
CREATE INDEX IF NOT EXISTS idx_checkpoint_fecha ON viaje_checkpoints(fecha_evento);
CREATE INDEX IF NOT EXISTS idx_checkpoint_estado ON viaje_checkpoints(estado);

-- Habilitar Row Level Security
ALTER TABLE viaje_checkpoints ENABLE ROW LEVEL SECURITY;

-- Política: los usuarios autenticados pueden ver los checkpoints
CREATE POLICY "checkpoints_select_authenticated" ON viaje_checkpoints
    FOR SELECT
    TO authenticated
    USING (true);

-- Política: service_role tiene acceso completo (para el backend)
CREATE POLICY "checkpoints_manage_service_role" ON viaje_checkpoints
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);
