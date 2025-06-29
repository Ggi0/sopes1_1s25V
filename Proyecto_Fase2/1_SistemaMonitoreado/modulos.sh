#!/bin/bash
# #################################################
# SCRIPT PARA COMPILAR Y CARGAR MÓDULOS DEL KERNEL
# USANDO RUTAS RELATIVAS SEGURAS (DINÁMICAS)
# #################################################

# Obtener ruta absoluta del directorio donde está el script
#Proyecto_Fase2/1_SistemaMonitoreado/modulos.sh
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Definir rutas absolutas de CPU y RAM
CPU_DIR="$SCRIPT_DIR/./Modulos/cpu"
RAM_DIR="$SCRIPT_DIR/./Modulos/ram"
PROC_DIR="$SCRIPT_DIR/./Modulos/procesos"

# ========== MÓDULO CPU ==========
echo ">>> Compilando módulo CPU..."
cd "$CPU_DIR" || { echo "No se pudo acceder a $CPU_DIR"; exit 1; }
make

echo ">>> Cargando módulo CPU..."
sudo insmod moduleCPU.ko

# ========== MÓDULO RAM ==========
echo ">>> Compilando módulo RAM..."
cd "$RAM_DIR" || { echo "No se pudo acceder a $RAM_DIR"; exit 1; }
make

echo ">>> Cargando módulo RAM..."
sudo insmod moduleRAM.ko

# =========== MODULO PROCESOS =============
echo ">>> Compilando modulo procesos ..."
cd "$PROC_DIR" || { echo "No se pudo acceder a $PROC_DIR"; exit 1; }
make

echo ">>> Cargando moudlo Procesos ..."
sudo insmod modulePRO.ko


# ========== VERIFICACIONES ==========
echo -e "\n>>> Verificando módulos cargados..."
lsmod | grep moduleCPU
lsmod | grep moduleRAM
lsmod | grep modulePRO


echo ">>> Módulos compilados y cargados correctamente."
