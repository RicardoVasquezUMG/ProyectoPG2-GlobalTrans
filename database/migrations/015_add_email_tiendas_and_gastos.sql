-- Migración 015: Añadir columna email a tiendas y tabla de gastos de viaje

-- 1. Añadir email a tiendas
ALTER TABLE tiendas ADD COLUMN IF NOT EXISTS email VARCHAR(255);

-- 2. Añadir fecha_esperada_llegada a viajes si no existe
ALTER TABLE viajes ADD COLUMN IF NOT EXISTS fecha_esperada_llegada TIMESTAMPTZ;

-- 3. Crear tabla de gastos de viajes si no existe
CREATE TABLE IF NOT EXISTS viaje_gastos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    viaje_id UUID REFERENCES viajes(id) ON DELETE CASCADE,
    flete_base NUMERIC(12, 2) DEFAULT 0.00,
    multas_aduana NUMERIC(12, 2) DEFAULT 0.00,
    viaticos_extra NUMERIC(12, 2) DEFAULT 0.00,
    parqueo_almacenaje NUMERIC(12, 2) DEFAULT 0.00,
    otros_imprevistos NUMERIC(12, 2) DEFAULT 0.00,
    notas TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
