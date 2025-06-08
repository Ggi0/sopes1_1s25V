# sopes1_1s25V
# Monitor de servicion Linux
---
Este proyecto automatiza tareas del sistema con scripts, mientras un recolector en Go analiza dichas tareas que envía datos a una API en Node.js. La información se transmite a un frontend en React y se almacena en PostgreSQL, permitiendo gestión eficiente de contenedores en Linux.
 
---

## **Componentes del Proyecto**

### 1. Recolector de Métricas (Go)

**Rol:** Agente de monitoreo
* Función:

  * Consulta periódicamente la carpeta `/proc`.
  * Extrae informacion relacionadas al uso de CPU y memoria RAM.
  * Convierte las métricas a formato JSON.
  * Expone estas métricas a través de un endpoint HTTP local.
* Entorno de ejecución: Contenedor Docker.

---

### 2. API REST (Node.js)

**Rol:** Backend web intermedio

* Función:

  * Consulta periódicamente al recolector.
  * Inserta las métricas en una base de datos PostgreSQL.
  * Expone endpoints REST para:

    * Obtener métricas actuales o históricas.
    * Consultar estadísticas desde el frontend.
* Entorno de ejecución: Contenedor Docker.
---

### 3. Base de Datos (PostgreSQL)

**Rol:** Almacenamiento persistente de métricas

* Función:

  * Almacena métricas de CPU y RAM recolectadas a lo largo del tiempo.
  * Permite consultas históricas.
  * Garantiza persistencia mediante volúmenes Docker.

* Volumen: Se define un volumen Docker (`db-data`) para persistencia.

---

### 4. Interfaz de Usuario (React)

**Rol:** Visualización en tiempo real de las métricas

* Función:

  * Se conecta a la API mediante HTTP.
  * Consulta y muestra métricas en tiempo real.
  * Visualiza históricos y gráficos (usando Chart.js).
* Entorno de ejecución: Contenedor Docker.

---

### 5. Orquestación (Docker Compose)

**Rol:** Coordinación de todos los servicios

* Docker Compose
* Función:

  * Define y levanta todos los contenedores en una sola instrucción.
  * Establece redes internas entre servicios.
  * Define volúmenes persistentes.
* Servicios definidos:

  * `collector` (Go)
  * `api` (Node.js)
  * `db` (PostgreSQL)
  * `frontend` (React)

---

## **Resumen por Carpetas**

```
/project-root
│
├── /collector          → Recolector (Go)
│   └── Dockerfile
│
├── /api                → API REST (Node.js)
│   └── Dockerfile
│
├── /frontend           → React App
│   └── Dockerfile
│
├── /database
│   └── init.sql        → Script de creación de tabla
│
├── docker-compose.yml → Orquestador de todos los servicios
└── README.md           → Documentación del proyecto
```

