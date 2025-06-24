#!/bin/bash
# #################################################
# SCRIPT PARA APAGAR TODO EL SISTEMA
# #################################################

echo ">>> Deteniendo Docker Compose..."
# Cambiar al directorio padre donde está el docker-compose.yml
cd ..

# Verificar si existe el archivo docker-compose.yml
if [ -f "docker-compose.yml" ]; then
    sudo docker compose down
    echo ">>> Docker Compose detenido."
else
    echo ">>> No se encontró docker-compose.yml, saltando..."
fi

# Volver al directorio de scripts
cd scripts

echo ">>> Removiendo módulos del kernel..."
# Remover módulo CPU
if lsmod | grep -q "moduleCPU"; then
    sudo rmmod moduleCPU
    echo ">>> Módulo CPU removido."
else
    echo ">>> Módulo CPU no estaba cargado."
fi

# Remover módulo RAM
if lsmod | grep -q "moduleRAM"; then
    sudo rmmod moduleRAM
    echo ">>> Módulo RAM removido."
else
    echo ">>> Módulo RAM no estaba cargado."
fi


echo ">>> Sistema completamente apagado y limpio."