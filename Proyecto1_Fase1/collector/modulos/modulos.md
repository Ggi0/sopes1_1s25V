# Modulos implentados:

¿Por qué usar /proc?
El sistema de archivos /proc es una interfaz virtual que permite acceder a información del kernel y del sistema. No contiene archivos reales, sino que genera contenido dinámicamente cuando se lee.
---

## Modulo de RAM

El módulo del kernel en C mostrará información sobre la memoria RAM del sistema, utilizando estructuras del propio kernel (`struct sysinfo`) y exponiéndola en un archivo dentro de `/proc/ram_202100229`. 
El formato de la información es simple y estructurado ya que el `Recolector` en Go lo convertira a formato JSON más adelante.

## Explicación de los términos de `/proc/meminfo`

### RAM

* **MemTotal**: RAM total del sistema (en KB).
* **MemFree**: RAM que no está en uso activo.
* **MemAvailable**: Estimación de RAM disponible para nuevos procesos sin usar swap.
* **Buffers**: RAM usada por el kernel como buffers temporales (e.g., operaciones de disco).
* **Cached**: RAM usada para cachear archivos.
* **Active/Inactive**: Páginas de memoria usadas recientemente / no usadas recientemente.
* **Shared**: RAM compartida entre procesos.
* **Mapped**: RAM mapeada en el espacio de usuario (archivos mapeados, bibliotecas).
* **Slab**: Memoria usada por estructuras internas del kernel.

### SWAP

* **SwapTotal**: Total de espacio de intercambio.
* **SwapFree**: Swap no utilizada.
* **SwapCached**: Datos en swap que también están en RAM (pueden eliminarse si es necesario).

---

## Modulo de CPU


     * LOAD AVERAGE
     * El load average representa cuántos procesos están esperando ser ejecutados
     * o están siendo ejecutados en un momento dado. Se mide en 3 intervalos:
     * - 1 minuto, 5 minutos, 15 minutos
     * 
     * Valores:
     * - 0.00: Sistema inactivo
     * - 1.00: Sistema completamente utilizado (para 1 core)
     * - >1.00: Sistema sobrecargado

     * FRECUENCIA DE CPU
     * La frecuencia varía según la carga de trabajo debido a tecnologías como:
     * - Intel SpeedStep
     * - AMD Cool'n'Quiet  
     * - CPU scaling governors (ondemand, performance, powersave, etc.)
     * 
     * Cuando hay más carga, la frecuencia aumenta para proporcionar más rendimiento

      PROCESOS EN EJECUCIÓN
     * nr_running: Procesos que están ejecutándose o esperando CPU
     * nr_uninterruptible: Procesos bloqueados esperando I/O
     * 
     * Estos números aumentan cuando el sistema está bajo estrés:
     * - Más procesos compitiendo por CPU
     * - Más procesos esperando recursos (disco, red, etc.)