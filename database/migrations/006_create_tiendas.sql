-- Migration para la tabla tiendas
CREATE TABLE IF NOT EXISTS tiendas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    pais VARCHAR(100) NOT NULL,
    direccion TEXT NOT NULL,
    estado BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security (opcional dependiendo de los requerimientos, pero lo incluimos por seguridad)
ALTER TABLE tiendas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir todo el acceso a autenticados" ON tiendas
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);
