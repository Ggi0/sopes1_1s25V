Te ayudo a estructurar tu proyecto de manera clara y detallada. Vamos parte por parte:

## **PARTE 1: MÁQUINA VIRTUAL CON BACKEND COLLECTOR (GCP)**

### Función Principal:
Esta VM actúa como el **sistema objetivo** que será monitoreado y estresado durante las pruebas de carga.

### Componentes:
- **Máquina Virtual en GCP**: El servidor que queremos monitorear
- **Contenedor Docker**: Contiene la aplicación backend
- **Backend en Go**: Aplicación que lee las métricas del sistema
- **Módulos del Kernel**: 
  - Módulo CPU: Lee información de procesamiento
  - Módulo RAM: Lee información de memoria
  - Módulo Procesos: Lee estados de procesos (corriendo, durmiendo, zombie, parados)

### Flujo:
El backend de Go lee constantemente los archivos en `/proc` (que es donde Linux expone información del sistema) y a través de los módulos del kernel obtiene métricas como uso de CPU, RAM y estados de procesos. Esta información se expone mediante una API REST que responde con un JSON cuando recibe peticiones.

---

## **PARTE 2: GENERADOR DE TRÁFICO LOCAL (TU MÁQUINA)**

### Función Principal:
Simular usuarios reales haciendo peticiones al sistema para generar carga y recopilar datos de rendimiento.

### Cómo Funciona Locust:

**Primera Fase - Recolección de Datos:**
- Locust simula 300 usuarios virtuales
- Cada usuario hace peticiones HTTP a la VM (Parte 1) cada 1-2 segundos
- Cada petición obtiene un JSON con las métricas del sistema
- Durante 3 minutos se recopilan aproximadamente 2000 registros
- Todos estos JSONs se almacenan en un array local

**Segunda Fase - Generación de Tráfico:**
- Con los 2000 registros recopilados, Locust ahora simula 150 usuarios
- Estos usuarios envían los datos (no los solicitan) al sistema de Kubernetes
- Las peticiones van cada 1-4 segundos
- Cada petición envía uno de los JSONs recopilados al Ingress del cluster

### ¿Por qué dos fases?
1. **Recolectar**: Obtener datos reales del sistema bajo estrés
2. **Reproducir**: Usar esos datos para probar el sistema de procesamiento y almacenamiento

---

## **PARTE 3: CLUSTER KUBERNETES CON PROCESAMIENTO (GCP)**

### 3.1 INGRESS Y TRAFFIC SPLIT

**Función**: Punto de entrada y distribución de tráfico
- **Ingress**: Recibe todas las peticiones HTTP externas (desde Locust)
- **Traffic Split**: Divide el tráfico 50/50 entre dos rutas
- Actúa como un balanceador de carga inteligente

### 3.2 NAMESPACE: so1_fase2

**Función**: Contenedor lógico que agrupa todos los recursos relacionados
- Aísla los componentes del proyecto
- Facilita la gestión y organización

### 3.3 PODS Y CONTENEDORES

**¿Qué es un Pod?**
Un Pod es la unidad mínima de despliegue en Kubernetes. Contiene uno o más contenedores que comparten red y almacenamiento.

**Pod 1 - API Python:**
- Contenedor con aplicación Python
- Recibe 50% del tráfico del Ingress
- Procesa los JSONs recibidos
- Inserta datos en Cloud SQL

**Pod 2 - API NodeJS (Ruta 2):**
- Contenedor con aplicación NodeJS
- Recibe el otro 50% del tráfico
- Misma función que la API Python
- También inserta en Cloud SQL

**Pod 3 - API NodeJS con Socket.IO:**
- Contenedor con aplicación NodeJS
- Se conecta a Cloud SQL para consultar datos
- Expone WebSocket para comunicación en tiempo real
- Envía datos al frontend via Socket.IO

### 3.4 CLOUD SQL (FUERA DEL CLUSTER)

**Función**: Base de datos administrada por Google
- Almacena todas las métricas procesadas
- MySQL como motor de base de datos
- Escalable y administrada automáticamente
- Las tres APIs se conectan a esta base de datos

### 3.5 FRONTEND (FUERA DEL CLUSTER, EN CLOUD RUN)

**Función**: Interfaz de usuario para visualización
- Aplicación React desplegada en Cloud Run
- Se conecta via Socket.IO al Pod 3
- Muestra gráficas en tiempo real de CPU y RAM
- Muestra tabla con información de procesos

---

## **FLUJO COMPLETO DEL SISTEMA:**

1. **Locust** (local) → **VM** (GCP): Recolecta datos
2. **Locust** (local) → **Ingress** (Kubernetes): Envía datos
3. **Ingress** → **API Python/NodeJS** (50/50): Distribuye tráfico
4. **APIs** → **Cloud SQL**: Almacenan datos
5. **Frontend** ↔ **API Socket.IO** ↔ **Cloud SQL**: Visualización en tiempo real

