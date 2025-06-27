from locust import HttpUser, TaskSet, task, between, events
from datetime import datetime
import json
import threading
import os


# Archivo en donde se almacenara las peticiones
entradaTrafico = "entrada.json"

# Var que nos permite controlar si estamos agregando el primer registro
primera = True

# usamos un lock para que multiples hilos no escriban al archivo simultaneamente
lock = threading.Lock() # Se usa un lock para evitar que dos hilos escriban al mismo tiempo, lo que corrompería el archivo.

# si ya existe el archivo,  creoa o reinicia el contenido
if os.path.exists(entradaTrafico):
    os.remove(entradaTrafico)

# Escribir al inicio del archivo
with open(entradaTrafico, 'w') as f:
    f.write("[\n")

"""
    del get a /metrics tomar la respuesta completa del backend 
    parasearla al json con formato establecido
"""
def obtenerDatos(json_raw):
    return{
        "data": {
            "ram": json_raw.get("ram", {}),
            "cpu": json_raw.get("cpu", {}),
            "procesos": json_raw.get("procesos", {}),
            "hora": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }
    }

"""
    Esta clase representa las acciones que un "usuario virtual" puede ejecutar. Dentro de ella colocamos todas las tareas (@task) que el usuario simulará.
    Define las tareas que realizara cada usuario simulado
"""
class UserBehavior(TaskSet):
    
    @task # este metodo se ejecutar continuamente por cada usuario virtual ---> con una pausa entre cada ejecución definida por wait_time.
    def obtenerMetricas(self):
        global primera # es la primera solicitud?
        # REalizar la solicitud GET a /metrics
        with self.client.get("/metrics", catch_response=True) as response:
            if response.status_code == 200:
                try:
                    data = obtenerDatos(response.json())

                    #Guardar la respuesta en un archivo JSON
                    with lock:
                        with open(entradaTrafico, "a") as f:
                            if not primera: # si no es la primera se separa por una coma
                                f.write(",\n") # 
                            json.dump(data, f)
                            primera = False # apartir de aqui ya no es la primera peticion

                    response.success()
                except Exception as e:
                    response.failure(f"ERROR procesando respuesta: {str(e)}")
            else:
                response.failure(f"ERROR http {response.status_code}")


# este evento se ejecuta automaticamente cuando el locust finaliza
@events.test_stop.add_listener
def cerrarJSON(**kwargs):
    with lock:
        with open(entradaTrafico, "a") as f:
            f.write("\n]")

"""
    REpresenta un usuario virtual completo
"""
class WebsiteUser(HttpUser):
    tasks = [UserBehavior] # Qué conjunto de tareas va a ejecutar este usuario

    # timpo de espera entra cada tarea
    wait_time = between(1,2)

    # directorio base
    # TODO cambiar cuando este en la vm en GCP
    host = "http://localhost:8080"