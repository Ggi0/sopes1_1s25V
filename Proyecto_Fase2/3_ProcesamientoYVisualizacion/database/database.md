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