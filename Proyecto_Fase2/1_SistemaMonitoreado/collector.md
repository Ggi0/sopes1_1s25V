replicamos el backend de la fase 1 pero le agregamos a la logica el manejo para el modulo de de procesos.

lo que voy a detallar en este documento es la creacion de la maquina virtual en GCP

# hacer la maquina virtual en GCP

crear un proyecto nuevo, para poder trabajar sobre el

para las maquinas virtuales se utiliza:
    compute Engine

para crear una VM:
create instance

ponerle nombre a la vm

region: por defecto la que sale, en teoria es la mas cercana

esta es la info de nuesta maquina virtual, serie E2:
"
vCPUs       Memory      CPU Platform 
0.25 - 32 	1 - 128 GB 	Intel Broadwell 
"

en tipo de maquina seleccionamos la e2-micro 2vCPU, 1 core, 1GB memory

y creamos la maquina

la ip externa es efimera, cambia con cada reinicio de o apagado.

# Construir la imagen que reproduciremos en la Virtual Machine
---

para empezar debemos generar la imagen del Dockerfile del backend (collector)
estoy usando una multietapa para compilar el binario con Go y luego pasarlo a una imagen ligera basada en Alpine, para producir imágenes livianas y seguras.

## 1. construir la imagen localmente
`docker build -t <TU_USUARIO_DOCKERHUB>/nombre_imagen .`

## 2. iniciar sesion en docker 

`docker login` --> contrasenia y usuario de docker hub


## 3. subir la imagen a docker hub
docker push <TU_USUARIO_DOCKERHUB>/nombre_imagen




# Accediendo a la maquina virtual
---
se puede acceder desde una ventana que proporciona GCP.

Pero lo haremos de forma de correr la VM en terminus.

## 1. instalar terminus
para correr la maquina virtual utilizaremos `Termius` para ejecutar la VM.

## 2. New Host
en ip o hostname ingresar la ip publica (external ip) que proporciona el GCP de la VM
en usuario colocar el usuario que se utilizara en la VM

importante:
En GCP, si creaste tu VM sin usuarios personalizados, suele usarse tu propio nombre (de la cuenta), no otro personalizado, este ser el mismo o generara un error.

en password utilizaremos una clave ssh publica y privada

en linux ejecutar:
`ssh-keygen -t rsa`

accedemos al directoro /.shh
`cd ~/.ssh`

y deberian aver 2 archivos:
```bash
id_rsa      --> llave privada
id_rsa.pub ---> llave publica
```

entoces en password de terminus va la clave privada.
`create new key`

!IMPORTANTE , agregar la key publica en la parte de metadatos de GCP, en la parte de SSH keys.

---

cuando la VM ya este configurada en un entorno de trabaja, o se aya este instalado todo lo necesario para que nuestro contenedor funciones.

debemos 
### 1. descargar la imagen de docker hub
`docker pull <TU_USUARIO_DOCKERHUB>/nombre_imagen`

### 2. lanzarla:
(si ya existe el contenedor collector: sudo docker rm collector)
`docker run -d -p 8080:8080 --name collector <TU_USUARIO_DOCKERHUB>/nombre_imagen`

y ya estaremos listo para poder acceder a la pagina.
para acceder en vez de colocar el tipico: 

http://localhost:8080
sustituir localhost por la ip publica que propociona el GCP.

### 3. notas a tomar en cuenta
Recuerada que para poder ejecutar el `make` de los modulos es necesario tenerlo instalado, de lo contrario ejecutara.

### 4. notas importante con la RED

hay que crear una nueva regla firewall rule en GCP, para que escuche al puerto del backend
```
Cómo desbloquearlo paso a paso

    Ve a la 
    En el menú lateral, ve a "VPC network" → "Firewall rules".

    Crea una nueva regla (+ Create Firewall Rule):

    Name: nombre_red

    Direction: Ingress

    Targets: All instances in the network (o solo la VM si prefieres)

    Source filter: IP ranges

    Source IP ranges: 0.0.0.0/0 (para permitir desde cualquier IP, útil en pruebas)

    Protocols and ports: Marca “Specified protocols and ports” y escribe: tcp:8080

Guarda la regla.
```

Debes permitir el puerto 8080 en el firewall de GCP para que acepte tráfico externo.
