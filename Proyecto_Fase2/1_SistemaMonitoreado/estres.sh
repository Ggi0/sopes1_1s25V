#!/bin/bash
# #################################################
# SCRIPT PARA DESPLEGAR 5 CONTENEDORES STRESS
# USANDO LA IMAGEN 'polinux/stress'
# Autor: Giovanni
# #################################################

# Definir número de contenedores a crear
NUM_CONTENEDORES=5

# Definir nombre base para los contenedores
NOMBRE_BASE="stress_container"

# Imagen a utilizar para el estrés
IMAGEN="polinux/stress"


# Descargar la imagen si no está disponible localmente
echo ">>> Verificando si la imagen '$IMAGEN' está disponible..."
sudo docker image inspect "$IMAGEN" > /dev/null 2>&1 || {
    echo ">>> Imagen no encontrada localmente. Descargando..."
    sudo docker pull "$IMAGEN"
}

# Bucle para crear y levantar los contenedores
for i in $(seq 1 $NUM_CONTENEDORES); do
    nombre="${NOMBRE_BASE}_${i}"
    echo ">>> Iniciando contenedor: $nombre"
    
    # los cambios se realizan para estresar la VM de 1Gb de RAM/2vCPU compartidos.
    sudo docker run -d --name "$nombre" --rm \
        --cpus="0.4" --memory="150m" \
        "$IMAGEN" \
        stress --cpu 1 --vm 1 --vm-bytes 80M --timeout 300s --verbose
done

echo ">>> Se han iniciado $NUM_CONTENEDORES contenedores para estresar CPU y RAM moderadamente."

# Mostrar contenedores activos
echo ">>> Contenedores activos:"
sudo docker ps --filter "name=${NOMBRE_BASE}"
