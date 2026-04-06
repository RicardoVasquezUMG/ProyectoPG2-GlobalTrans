-- ============================================================
-- Seed: Roles iniciales del sistema
-- BD: BD-GlobalTrans_PG2
-- Descripción: Inserta los 3 niveles de rol del sistema
-- ============================================================

INSERT INTO roles (name, description) VALUES
    ('LEVEL_1', 'Administrador del sistema — acceso completo a todos los módulos'),
    ('LEVEL_2', 'Operador — acceso a módulos operativos y de consulta'),
    ('LEVEL_3', 'Cliente — acceso a módulos de consulta y seguimiento')
ON CONFLICT (name) DO NOTHING;
