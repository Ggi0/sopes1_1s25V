#include <linux/init.h>     // macros para init y exit
#include <linux/module.h>   // Utilizara para todos los modulos del kernel
#include <linux/kernel.h>   // para printk y KERN_INFO
#include <linux/proc_fs.h>  // Para crear entradas en /proc
#include <linux/seq_file.h> // para manejar de mejor forma la escritura en /proc
#include <linux/mm.h>       // para utilizar si_meminfo()
#include <linux/sysinfo.h>  // estructura sysinfo

MODULE_LICENSE("GPL");
MODULE_AUTHOR("Ggi0");
MODULE_DESCRIPTION("Modulo RAM - ram_202100229");
MODULE_VERSION("3.0");

#define PROC_NAME "ram_202100229" // nombre del archivo en /proc

// esta funcion se ejecutara cuando se lee el archivo en /proc
static int ram_show(struct seq_file *m, void *v)
{
    struct sysinfo si;

    /*
    la RAM se mide en páginas de memoria, 
    y la función si_meminfo() obtiene los valores en número de páginas

    llenamos la estructura con la info del sistema

    linux usa paginas de memoria de 4KB por lo tanto:
    *   total_ram   = si.totalram * 4   --> kb
    *   total_ramMB = total_ram / 1024  --> mb
    *   total_ramGB = total_ramMB /1024 --> gb

    */ 
    si_meminfo(&si);

    unsigned long factor = 4 * 100;  // Página de 4KB, multiplicamos por 100 para conservar 2 decimales en enteros
    unsigned long div = 1024 * 1024;

    unsigned long total_ram = (si.totalram * factor) / (div);
    unsigned long free_ram = (si.freeram * factor) / (div);
    unsigned long used_ram = total_ram - free_ram;

    unsigned long shared_ram = (si.sharedram * factor) / (div);
    unsigned long buffer_ram = (si.bufferram * factor) / (div);

    unsigned long total_swap = (si.totalswap * factor) / (div);
    unsigned long free_swap = (si.freeswap * factor) / (div);
    unsigned long used_swap = total_swap - free_swap;

    // porcentaje de uso de ram y swap
    unsigned long porc_ram = total_ram ? (used_ram * 10000) / total_ram : 0;
    unsigned long porc_swp = total_swap? (used_swap * 10000) / total_swap : 0; 
    
    // salida:
    seq_printf(m, "{\n");

    seq_printf(m, "\t\"ram\": {\n");
    seq_printf(m, "\t\t\"total\": %lu.%02lu,\n", total_ram / 100, total_ram % 100);
    seq_printf(m, "\t\t\"libre\": %lu.%02lu,\n", free_ram / 100, free_ram % 100);
    seq_printf(m, "\t\t\"uso\"  : %lu.%02lu,\n", used_ram / 100, used_ram % 100);
    seq_printf(m, "\t\t\"porcentaje\": %lu.%02lu,\n", porc_ram / 100, porc_ram % 100);
    seq_printf(m, "\t\t\"compartida\": %lu.%02lu,\n", shared_ram / 100, shared_ram % 100);
    seq_printf(m, "\t\t\"buffer\": %lu.%02lu\n", buffer_ram / 100, buffer_ram % 100);
    seq_printf(m, "\t},\n");

    seq_printf(m, "\t\"swap\": {\n");
    seq_printf(m, "\t\t\"total\": %lu.%02lu,\n", total_swap / 100, total_swap % 100);
    seq_printf(m, "\t\t\"libre\": %lu.%02lu,\n", free_swap / 100, free_swap % 100);
    seq_printf(m, "\t\t\"uso\"  : %lu.%02lu,\n", used_swap / 100, used_swap % 100);
    seq_printf(m, "\t\t\"porcentaje\": %lu.%02lu\n", porc_swp / 100, porc_swp % 100);
    seq_printf(m, "\t}\n");

    seq_printf(m, "}\n");

    return 0;
}

// esta funcion se ejecuta cuando se abre el archivo /proc/ram_202100229
static int ram_open(struct inode *inode, struct file *file)
{
    return single_open(file, ram_show, NULL);
}

// Acciones permitidas sobre el archivo /proc
static const struct proc_ops ram_ops =
{
    .proc_open = ram_open,              // se ejecuta al abrir el archivo
    .proc_read = seq_read,              // se ejecuta al leerlo
    .proc_lseek = seq_lseek,            // permite desplazamiento en el archivo
    .proc_release = single_release       // se ejecuta al cerrar
};

// se llama al insertar el modulo : crea el archivo en /proc
static int __init ram_init(void)
{
    proc_create(PROC_NAME, 0, NULL, &ram_ops);
    printk(KERN_INFO "Modulo ram_202100229 cargado\n");
    return 0;
}

// Se llama al remover el módulo: elimina el archivo de /proc
static void __exit ram_exit(void)
{
    remove_proc_entry(PROC_NAME, NULL);
    printk(KERN_INFO "Modulo ram_202100229 eliminado\n");
}

// macros que registran las funciones de inicio y salida
module_init(ram_init);
module_exit(ram_exit);
