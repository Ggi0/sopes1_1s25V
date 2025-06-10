# Modulos implentados:
---

---

## Modulo de RAM

El módulo del kernel en C mostrará información sobre la memoria RAM del sistema, utilizando estructuras del propio kernel (`struct sysinfo`) y exponiéndola en un archivo dentro de `/proc/ram_202100229`. 
El formato de la información es simple y estructurado ya que el `Recolector` en Go lo convertira a formato JSON más adelante.