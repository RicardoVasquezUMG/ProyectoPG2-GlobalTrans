-- Crear tabla vehicles
CREATE TABLE vehicles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tipo VARCHAR(50) NOT NULL,
    tonelaje NUMERIC(10, 2) NOT NULL,
    placas VARCHAR(20) UNIQUE NOT NULL,
    estado VARCHAR(50) DEFAULT 'Disponible',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security: permitir a los admins todo el acceso. En este sistema general, usaremos un acceso protegido desde el backend a través de la service role key, o podemos definir políticas RLS. 
-- Según las convenciones del repositorio, el backend usa el get_supabase_admin() para ciertas operaciones, pero habilitaremos RLS por buenas prácticas.
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;

-- Política simple temporal para acceso desde el backend autenticado
CREATE POLICY "Permitir todo el acceso a autenticados" ON vehicles
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);
