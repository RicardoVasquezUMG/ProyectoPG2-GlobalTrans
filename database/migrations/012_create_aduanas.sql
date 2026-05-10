-- Migration: 012_create_aduanas.sql
-- Descripción: Crea la tabla de aduanas para registrar puntos fronterizos en Centroamérica y añade datos semilla.

CREATE TABLE IF NOT EXISTS aduanas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    pais_origen VARCHAR(50) NOT NULL,
    pais_destino VARCHAR(50) NOT NULL,
    latitud NUMERIC(10, 6),
    longitud NUMERIC(10, 6),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE aduanas ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS
-- Administradores pueden gestionar aduanas
CREATE POLICY "Admins can manage aduanas" ON aduanas
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role_id IN (SELECT id FROM roles WHERE name = 'LEVEL_1')
        )
    );

-- Todos los usuarios logueados pueden ver aduanas (necesario para selects en frontend)
CREATE POLICY "Todos pueden ver aduanas" ON aduanas
    FOR SELECT
    USING (auth.role() = 'authenticated');

-- Datos Semilla (Aduanas principales Centroamericanas con coordenadas aproximadas)
INSERT INTO aduanas (nombre, pais_origen, pais_destino, latitud, longitud) VALUES
('Pedro de Alvarado', 'Guatemala', 'El Salvador', 13.840742, -90.040228),
('La Hachadura', 'El Salvador', 'Guatemala', 13.841315, -90.038472),
('Valle Nuevo (Las Chinamas)', 'Guatemala', 'El Salvador', 13.978051, -89.914271),
('San Cristóbal', 'Guatemala', 'El Salvador', 14.191599, -89.664426),
('Anguiatú', 'Guatemala', 'El Salvador', 14.414002, -89.444983),
('El Florido', 'Guatemala', 'Honduras', 14.819074, -89.176465),
('Agua Caliente', 'Guatemala', 'Honduras', 14.544158, -89.266299),
('Corinto', 'Guatemala', 'Honduras', 15.617937, -88.358245),
('El Amatillo', 'El Salvador', 'Honduras', 13.578631, -87.755497),
('Guasaule', 'Honduras', 'Nicaragua', 13.064506, -86.942738),
('El Espino', 'Honduras', 'Nicaragua', 13.483167, -86.726229),
('Las Manos', 'Honduras', 'Nicaragua', 13.785317, -86.564757),
('Peñas Blancas', 'Nicaragua', 'Costa Rica', 11.215570, -85.623190),
('Paso Canoas', 'Costa Rica', 'Panamá', 8.534825, -82.842792)
ON CONFLICT DO NOTHING;
