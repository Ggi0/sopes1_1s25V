Te explico detalladamente la Parte 3 del proyecto:

## **¿QUÉ ES GOOGLE CLOUD PLATFORM (GCP)?**

GCP es como un "centro de datos virtual" donde puedes crear y gestionar recursos de infraestructura:

**Estructura jerárquica:**
```
GCP
├── Recursos dentro del cluster
│   └── Cluster Kubernetes
│       └── Namespace: so1_fase2
│           ├── Ingress
│           ├── Pod API1 (Python)
│           ├── Pod API2 (NodeJS)
│           └── Pod API3 (NodeJS + Socket.IO)
├── Recursos fuera del cluster (pero dentro de GCP)
│   ├── Cloud SQL (Base de datos)
│   └── Cloud Run (Frontend)
└── Redes y configuraciones
```


## **ESTRUCTURA DE PODS Y CONTENEDORES**

### **API1 (Python) - Arquitectura:**
```
Pod API1
└── Contenedor Python
    ├── Aplicación Flask/FastAPI
    ├── Puerto interno: 5000
    └── Conexión a Cloud SQL
```

### **API2 (NodeJS) - Arquitectura:**
```
Pod API2
└── Contenedor NodeJS
    ├── Aplicación Express
    ├── Puerto interno: 3000
    └── Conexión a Cloud SQL
```

**SÍ, tu entendimiento es CORRECTO:**
- Cada API está en un contenedor
- Cada contenedor está dentro de un Pod
- Los Pods están en el namespace so1_fase2

## **¿CÓMO FUNCIONAN LAS CONEXIONES?**

### **1. Conexión Ingress → APIs:**

**NO hay puertos específicos para cada API individual.** El flujo es:

```
Internet → Load Balancer (Puerto 80/443) → Ingress → Service → Pod
```

**Cada API tiene un Service asociado:**
```yaml
# Service para API1
apiVersion: v1
kind: Service
metadata:
  name: api1-service
  namespace: so1_fase2
spec:
  selector:
    app: api1
  ports:
  - port: 80
    targetPort: 5000  # Puerto interno del contenedor Python
```

### **2. Conexión APIs → Cloud SQL:**

Cloud SQL proporciona:
- **IP privada:** Para conexiones desde GCP (más seguro)
- **IP pública:** Para conexiones desde internet
- **Puerto:** 3306 (MySQL estándar)
- **Credenciales:** Usuario, password, nombre de base de datos


## **FLUJO COMPLETO DE CONEXIONES:**

```
1. trafico_salida.py → http://INGRESS_IP:80/api
2. Ingress → Traffic Split (50/50)
3. 50% → Service API1 → Pod API1:5000
4. 50% → Service API2 → Pod API2:3000
5. API1/API2 → Cloud SQL:3306 (INSERT datos)
6. API3 → Cloud SQL:3306 (SELECT datos)
7. Frontend → API3 via Socket.IO
```

## **¿CÓMO OBTENER LA IP DEL INGRESS?**

Después de desplegar el Ingress en GCP:

```bash
kubectl get ingress -n so1_fase2
# Output mostrará la EXTERNAL-IP
```

Esta IP es la que se usa en `trafico_salida.py`.

