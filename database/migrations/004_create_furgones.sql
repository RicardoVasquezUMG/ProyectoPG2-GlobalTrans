-- Crear tabla furgones (contenedores)
CREATE TABLE furgones (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    numero_contenedor VARCHAR(20) UNIQUE NOT NULL,
    codigo_tamano_tipo VARCHAR(10) NOT NULL,
    peso_bruto_maximo NUMERIC(10, 2) NOT NULL,
    peso_tara NUMERIC(10, 2) NOT NULL,
    carga_util NUMERIC(10, 2) NOT NULL,
    codigo_propietario VARCHAR(4) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE furgones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir todo el acceso a autenticados" ON furgones
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);
