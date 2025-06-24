#!/bin/bash
# #################################################
# SCRIPT PARA LEVANTAR DOCKER-COMPOSE
# #################################################


# Cambiar al directorio padre donde está el docker-compose.yml
cd ..

# Verificar si existe el archivo docker-compose.yml
if [ ! -f "docker-compose.yml" ]; then
    echo "Error: No se encontró el archivo docker-compose.yml"
    exit 1
fi

echo ">>> Construyendo y levantando todos los servicios..."
sudo docker compose up --build -d