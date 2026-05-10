-- 013_update_tiendas_lat_long.sql
-- Agregar latitud y longitud a la tabla de tiendas para ruteo de GPS.

ALTER TABLE tiendas
ADD COLUMN latitud VARCHAR(50) DEFAULT NULL,
ADD COLUMN longitud VARCHAR(50) DEFAULT NULL;
