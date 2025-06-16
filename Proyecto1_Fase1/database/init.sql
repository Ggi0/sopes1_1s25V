-- Crear la base de datos
-- CREATE DATABASE so1p1;

-- Conectarse a la base de datos
-- \c so1p1;

-- no es necesario crear la base de datos aquie porque 
-- ya crea la db especificada en POSTGRES_DB

-- Tabla para datos de RAM
CREATE TABLE ram_data (
  id SERIAL PRIMARY KEY,
  total_gb REAL,
  libre_gb REAL,
  uso_gb REAL,
  porcentaje REAL,
  compartida_gb REAL,
  buffer_gb REAL,
  timestamp_og TIMESTAMPTZ
);

-- Tabla para datos de CPU
CREATE TABLE cpu_data (
  id SERIAL PRIMARY KEY,
  carga_1min REAL,
  carga_5min REAL,
  carga_15min REAL,
  frecuencia_mhz INTEGER,
  cpu_used REAL,
  cpu_free REAL,
  procesos_ejecutando INTEGER,
  procesos_bloqueados INTEGER,
  timestamp_og TIMESTAMPTZ
);

-- Mensaje de confirmación
DO $$
BEGIN
    RAISE NOTICE 'Tablas creadas exitosamente en la base de datos so1p1';
END $$;
