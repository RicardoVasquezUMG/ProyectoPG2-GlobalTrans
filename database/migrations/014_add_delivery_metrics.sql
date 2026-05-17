-- 014_add_delivery_metrics.sql
-- Agregar campos para cálculo de tiempos (ETA) y auditoría de entregas

ALTER TABLE viajes
ADD COLUMN fecha_esperada_llegada TIMESTAMPTZ DEFAULT NULL,
ADD COLUMN fecha_llegada_real TIMESTAMPTZ DEFAULT NULL;

-- View para facilitar el cálculo de tiempos por aduana
-- Uniendo eventos de LLEGADA y SALIDA de aduana del mismo viaje y misma aduana
CREATE OR REPLACE VIEW vw_tiempos_aduana AS
SELECT 
    v.id AS viaje_id,
    c_llegada.ubicacion_nombre AS nombre_aduana,
    c_llegada.fecha_evento AS fecha_llegada,
    c_salida.fecha_evento AS fecha_salida,
    EXTRACT(EPOCH FROM (c_salida.fecha_evento - c_llegada.fecha_evento)) / 3600.0 AS horas_en_aduana
FROM viajes v
JOIN viaje_checkpoints c_llegada ON v.id = c_llegada.viaje_id AND c_llegada.notas LIKE '%Llegada a Aduana%'
JOIN viaje_checkpoints c_salida ON v.id = c_salida.viaje_id AND c_salida.notas LIKE '%Salida de Aduana%' AND c_salida.ubicacion_nombre = c_llegada.ubicacion_nombre
WHERE c_salida.fecha_evento > c_llegada.fecha_evento;
