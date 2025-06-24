#!/bin/bash
# #################################################
# SCRIPT PARA DETENER CONTENEDORES DE STRESS
# #################################################

# Verificar si hay contenedores de stress ejecutándose
STRESS_CONTAINERS=$(sudo docker ps -q --filter "ancestor=polinux/stress")

if [ -z "$STRESS_CONTAINERS" ]; then
    echo ">>> No hay contenedores de stress ejecutándose."
    exit 0
fi

echo ">>> Deteniendo contenedores de stress..."
sudo docker stop $STRESS_CONTAINERS

echo ">>> Contenedores de stress detenidos."

# Mostrar contenedores activos restantes
echo ">>> Contenedores activos restantes:"
sudo docker ps

