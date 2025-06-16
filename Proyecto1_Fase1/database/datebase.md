

# instalar posgre sql 
sudo apt update
sudo apt install postgresql postgresql-client

# entar al usuario del Postgre SQL
sudo -u postgres psql

# hacer la base de datos
CREATE DATABASE so1p1;

# entrar a la db
\c so1p1 

# crear tablas:
-- Crear tabla para datos de RAM con todas las métricas
so1p1=# CREATE TABLE ram_data (
    id SERIAL PRIMARY KEY,
    total_gb REAL,
    libre_gb REAL,
    uso_gb REAL,
    porcentaje REAL,
    compartida_gb REAL,
    buffer_gb REAL,
    timestamp_og TIMESTAMPTZ
);


-- Crear tabla para datos de CPU con todas las métricas
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
    original_timestamp TIMESTAMPTZ
);


# verificar las tablas
so1p1=# \dt
 public | cpu_data | table | postgres
 public | ram_data | table | postgres

so1p1=# 


# verificar las tablas

so1p1=# \d ram_data
 id            | integer                  |           | not null | nextval('ram_data_id_seq'::regclass)
 total_gb      | real                     |           |          | 
 libre_gb      | real                     |           |          | 
 uso_gb        | real                     |           |          | 
 porcentaje    | real                     |           |          | 
 compartida_gb | real                     |           |          | 
 buffer_gb     | real                     |           |          | 
 timestamp_og  | timestamp with time zone |           |          | 

so1p1=# \d cpu_data
 id                  | integer                  |           | not null | nextval('cpu_data_id_seq'::regclass)
 carga_1min          | real                     |           |          | 
 carga_5min          | real                     |           |          | 
 carga_15min         | real                     |           |          | 
 frecuencia_mhz      | integer                  |           |          | 
 cpu_used            | real                     |           |          | 
 cpu_free            | real                     |           |          | 
 procesos_ejecutando | integer                  |           |          | 
 procesos_bloqueados | integer                  |           |          | 
 timestamp_og        | timestamp with time zone |           |          | 

so1p1=# 


# conectar la base de datos a la api para almacenar datos
npm install pg

# configuracion basica en la api
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'so1p1',
    password: 'gio21', // Cambia esto por tu contraseña de PostgreSQL
    port: 5432,
});



# ver los registros de una tabla
SELECT * FROM ram_data;



# dentro de docker para ver informacion

- si se quiere levantar solo la base de datos:

`sudo docker compose up -d db`

- ver si existe volumen
`docker volume ls`

- consultar los datos 
`docker exec -it db_sopes1p1 psql -U postgres -d so1p1`

- acceder a las tablas:
```
SELECT * FROM ram_data;
SELECT * FROM cpu_data;
```

- para bajar el contenedor:
`docker-compose down`

- parar y eliminar volumenes 
`docker compose down -v`

- reconstruir imagenes
`docker compose up -d --build`