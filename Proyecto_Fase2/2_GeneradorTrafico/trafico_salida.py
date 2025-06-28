
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
                return # en este punto ya no hay registros
            payload = registros[registros_index]
            registros_index += 1

        #hacemos post a la ruta /envio
        with self.client.post("/envio", json=payload, catch_response= True) as response:
            if response.status_code != 200:
                response.failure(f"Fallo al enviar datos. {response.status_code}")


# ======================================
# Definicion de usuario
# ======================================
class UsuarioVirtual(HttpUser):
    tasks = [EnvioDatos]
    wait_time = between(1, 4)

    # TODO: queda pendiente, debe ser configurado segun donde este desplegado el INGREESS
    # host = ...