-- Crear tabla campanias
CREATE TABLE campanias (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    descripcion TEXT NOT NULL,
    estado BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE campanias ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir todo el acceso a autenticados" ON campanias
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);
