-- Crear tabla cargamentos
CREATE TABLE cargamentos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    furgon_id UUID NOT NULL REFERENCES furgones(id) ON DELETE RESTRICT,
    campania_id UUID NOT NULL REFERENCES campanias(id) ON DELETE RESTRICT,
    estado VARCHAR(20) NOT NULL DEFAULT 'creado' CHECK (estado IN ('creado', 'procesando', 'preparado', 'conciliado')),
    fecha_creacion TIMESTAMPTZ DEFAULT NOW(),
    fecha_cierre TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE cargamentos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir todo el acceso a autenticados" ON cargamentos
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);
