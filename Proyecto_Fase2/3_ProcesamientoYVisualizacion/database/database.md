tablas:

``` sql
CREATE TABLE ram_table (
  total        NUMERIC(5, 2),
  libre        NUMERIC(5, 2),
  uso          NUMERIC(5, 2),
  porcentaje   NUMERIC(5, 2),
  compartida   NUMERIC(5, 2),
  buffer       NUMERIC(5, 2),
  hora         TIMESTAMP,
  api          TEXT
);
```

```sql
CREATE TABLE cpu_table (
  min_1        NUMERIC(5, 2),
  min_5        NUMERIC(5, 2),
  min_15       NUMERIC(5, 2),
  actual_mhz   NUMERIC(5, 2),
  used         NUMERIC(5, 2),
  free         NUMERIC(5, 2),
  hora         TIMESTAMP,
  api          TEXT
);
```

```sql
CREATE TABLE proc_table (
  corriendo    INTEGER,
  total        INTEGER,
  durmiendo    INTEGER,
  zombie       INTEGER,
  parados      INTEGER,
  hora         TIMESTAMP,
  api          TEXT
);
```



creando la base con Cloude sql

ir a el servicio de Cloude SQl en GCP

seleccionar `crear instancia con creditos gratuitos`
se despliegan 3 opciones:
* MySQL
* PosgreSQL
* SQL Server

seleccionar la deseada.
en este caso se utilizara MySQL

utilizar la version Enterprise, por costos y debido a que la Plus proporsiona cosas innecesarias para este proyecto.
para ajuste predeterminados de edicion seleccionar `zona de prueba (sandbox)` 

version a utilizar MySQL 8.0

instancia ID:  sopes1
contrasenia: xxxxxxxxx

region: por defecto us-central1(iowa)
Disponibilidad zonal: zona unica


en perzonalizar la instancia, en la parte de conexiones
en la parte de new network utilice la ip de mi computador. y la llame casa
quedo asi casa(----.---.---.)

en este mismo apartado es en donde se agre las IPs de las apis o cuaquier cosa que se quiera conectar a la base de datos.

en instance IP assignment quedo seleccionado Public IP

en proteccion de datos
eliminar, desseleccionar la opcion de backups diarios, la de borrar la instancia y la de retener copias de seguridad despues de la eliminacion de la instancia.


adema una configuracion que hay que hacer para conectarnos, es en la parte de Usuarios:
al usuario de root que viene por defecto le agrego una contrasenia.