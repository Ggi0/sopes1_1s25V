
# FASE 2 - Reproduccion de trafico

from locust import HttpUser, TaskSet, task, between
import json
from threading import Lock

# carga de datos
with open("entrada.json", "r") as f:
    registros = json.load(f) # leer el json generado en la Fase1


if not isinstance(registros, list) or not registros:
    raise ValueError("El archivo no contiene una lista valida de datos.")

registros_index= 0 # indice global compartido
index_lock = Lock() # para controlar acceso en hilos


# ======================================
# comportamiento del usuario 
# ======================================
class EnvioDatos(TaskSet):
    @task
    def postearDatos(self):
        global registros_index
        
        # bloqueamos el acceso para tomar el siguiente registros en orden
        with index_lock:
            if registros_index >= len(registros):
                return  # en este punto ya no hay registros
            
            payload = registros[registros_index]
            registros_index += 1
        
        # CAMBIO: Enviar a /api/metrics (que SÍ existe en ambas APIs)
        # Y envolver en el formato que esperan las APIs
        data_formatted = payload
        
        # hacemos post a la ruta /api/metrics (que existe en ambas APIs)
        with self.client.post("/api/metrics", json=data_formatted, catch_response=True) as response:
            if response.status_code != 200:
                response.failure(f"Fallo al enviar datos. {response.status_code}")
            else:
                response.success()

# ======================================
# Definicion de usuario
# ======================================
class UsuarioVirtual(HttpUser):
    tasks = [EnvioDatos]
    wait_time = between(1, 4)
    
    # CAMBIO: El host debe ser la IP del Load Balancer
    # la IP externa del NGINX Ingress
    # kubectl get svc -n ingress-nginx `ingress-nginx-controller`
    host = "http://146.148.101.35"