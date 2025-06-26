#include <linux/init.h>         // macros para init y exit
#include <linux/module.h>       // utilizara para todos los modulos del kernel
#include <linux/kernel.h>       // para printk
#include <linux/proc_fs.h>      // para crear entrada a /proc
#include <linux/seq_file.h>     // para manejar la escritura en /proc
#include <linux/sched.h>        // para acceder a infor de procesos y scheduling
#include <linux/sched/signal.h> // para trabajar con senales de procesos

// metadatos del modulo
MODULE_LICENSE("GPL"); // la licencia gpl se requiere para acceder a simbolos del kernel
MODULE_AUTHOR("Gio");
MODULE_DESCRIPTION("Module CPU - procesos_202100229");
MODULE_VERSION("1.0");

#define PROC_NAME "procesos_202100229" // nombre del modulo

/*
    Funcion auxiliar para contar procesos segun su estaod
    recorre todos los porcesos del sistema y los calcisifca por estado

*/
static void get_process_stats(unsigned long *running,
                              unsigned long *sleeping,
                              unsigned long *stopped,
                              unsigned long *zombie,
                              unsigned long *total)
{
    struct task_struct *task; // estructura que representa los procesos

    // todos los contadodes iran en 0
    *running = 0;
    *sleeping = 0;
    *stopped = 0;
    *zombie = 0;
    *total = 0;

    /*
        rcu_read_lock() --> portege el acceso concurrente a la lista de porcesos
        RCU (read copy y update) es un mecanismo de sincronizacion del kernel
        que perminte lecturas concurrentes sin bloqueos
    */
    rcu_read_lock();

    /*
        for_each_process()---> es una macro que itera sobre todos los porcesos del sistema
        Internamente recorre la lista circular de procesos
        que mantiene el kernel
    */
    for_each_process(task)
    {
        /*
            task --> __state contiene el estado actual del porceso
            se incrementa el contador total para cada proceso encontrado
        */
        (*total)++;

        /*
            Clasificamos cada proceso segun su estado actual
            utilizamos switch para hacer la clasificacion mas eficiente
        */
        switch (task->__state)
        {
        case TASK_RUNNING:
            /*
                 Incluye porcesos que estan:
                 * ejecutandose actualmente en un cpu
                 * en la cola de procesos listo para ejecutarse
             */
            (*running)++;
            break;

        case TASK_INTERRUPTIBLE:
            /*
                son procesos durminedo que pueden ser despertados por senales
                * esperando entrada de usuario
                * esperando que  termine una operccion de E/S
            */
            (*sleeping)++;

            break;

        case TASK_UNINTERRUPTIBLE:
            /*
                son procesos en sleep profundo que no pueden ser interrumpidos por senales.
                * Usualmente operaciones criticas de hardware
            */
            (*sleeping)++;

            break;

        case TASK_STOPPED:
            /*
                son procesos detenidos
                * senal SIGSTOP
                * depurador --> debugger
                * contro de trabajos --> job control
            */
            (*stopped)++;
            break;

        case EXIT_ZOMBIE:
            /*
                son procesos que han terminado su ejecucion pero su entrada en la tabla de procesos
                aun no ha sido leida por el porceso padre
            */
            (*zombie)++;
            break;
        }
    }

    // libreamos el lock RCU --> para permitir que otros procesos
    // puedan acceder a la lista de procesos
    rcu_read_unlock();
}

static int proc_show(struct seq_file *m, void *v) {
    unsigned long running, sleeping, stopped, zombie, total;

    // funcion para obtener las estadisticas de todos los procesos
    get_process_stats(&running, &sleeping, &stopped, &zombie, &total);

    // salida --> seq_printf(m, "", runnig) escrive al /proc
    seq_printf(m, "{\n");
    seq_printf(m, "\t\"corriendo\": %lu,\n", running);
    seq_printf(m, "\t\"total\":     %lu,\n", total);
    seq_printf(m, "\t\"durmiendo\": %lu,\n", sleeping);
    seq_printf(m, "\t\"zombie\":    %lu,\n", zombie);
    seq_printf(m, "\t\"parados\":   %lu\n", stopped);
    seq_printf(m, "}\n");

    return 0;
}


/*
    Esta funcion se ejecuta cuando se abre el archivo /proc/proc_202100229
    Configura el archivo para usar la interfaz seq_file que es mas
    eficiente para archivos /proc que pueden ser leidos multiples veces
    
    single_open() configura el archivo para mostrar contenido de una sola vez
*/
static int proc_open(struct inode *inode, struct file *file)
{
    return single_open(file, proc_show, NULL);
}


/*
    Estructura que define las operaciones permitidas sobre nuestro archivo /proc
    Esta estructura le dice al kernel que funciones llamar para cada operacion
    
*/
static const struct proc_ops proc_ops = {
    .proc_open    = proc_open,      // funcion a llamar al abrir el archivo
    .proc_read    = seq_read,       // funcion estandar para leer (seq_file)
    .proc_lseek   = seq_lseek,      // funcion para mover el puntero del archivo
    .proc_release = single_release  // funcion para cerrar y limpiar recursos
};


/*
inicializacion del modulo --> se ejecuta cuando el modulo se carga en el kernel (insmod)
*/
static int __init proc_init(void) {
    struct proc_dir_entry *entry;

    // crear una entrad en el sistema de achivos /proc
    // nombre del modulo
    // 0644 --> permisos lectura y escritura
    // directorio padre (null = /proc/)
    // escritura de todas las operaciones permitidas
    entry = proc_create(PROC_NAME, 0644, NULL, &proc_ops);

    if(!entry){
        printk(KERN_ERR "ERROR: no se pudeo crear /proc/%s\n", PROC_NAME);
        return -ENOMEM; // codigo de error: memoria insuficiente
    }

    // info que se ve cuando se ejecutas dmesg
    printk(KERN_INFO "Modulo procesos_202100229 cargado exitosamente\n");
    printk(KERN_INFO "Archivo creado en /proc/%s\n", PROC_NAME);

    return 0;
}

/*
    funciones de limpieza del modulo (rmmod)
*/
static void __exit proc_exit(void) {
    remove_proc_entry(PROC_NAME, NULL); // eliman la entrad del sistema /roc --> para evitar memory leaks o referencias colgantes

    printk(KERN_INFO "Modulo procesos_202100229 elimidado \n");
}

/*
    macros para registrar las funciones de inicio y salida del modulo
    el kernel usa estas macros para saber que funciones llamar durante la carga y descarga del modulo
*/

module_init(proc_init);
module_exit(proc_exit);