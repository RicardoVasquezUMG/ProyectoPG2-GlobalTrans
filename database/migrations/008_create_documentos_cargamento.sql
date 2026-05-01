-- Crear tabla documentos_cargamento
CREATE TABLE documentos_cargamento (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    cargamento_id UUID NOT NULL REFERENCES cargamentos(id) ON DELETE CASCADE,
    tipo VARCHAR(50) NOT NULL,
    url TEXT NOT NULL,
    fecha_subida TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE documentos_cargamento ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir todo el acceso a autenticados" ON documentos_cargamento
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);
