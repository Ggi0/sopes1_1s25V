#include <linux/init.h>         // inicializacion y limpieza del modulo
#include <linux/module.h>       // funciones para los modulos dle kernel
#include <linux/kernel.h>       // para printk() y niveles de log como kern_info
#include <linux/proc_fs.h>      // para las entrdas en el archvio /proc
#include <linux/seq_file.h>     // para manejar escritura inicial en archivos /proc
#include <linux/sched.h>        // para acceder a info de procesos y scheduling
#include <linux/cpufreq.h>      // para obtener frecuencias de cpu
#include <linux/sched/loadavg.h>// para acceder del load average del sistema
#include <linux/jiffies.h>      // para trabajar con tiempo del kernel
#include <linux/smp.h>          // para funciones de multiprocesamiento simetrico
#include <asm/processor.h>      // para informacion especifica del procesado
#include <linux/tick.h>         // para estadísticas de tiempo de CPU
#include <linux/kernel_stat.h>  // para estadísticas del kernel (CPU usage)



// metadatos del modulo
MODULE_LICENSE("GPL");  // la licencia gpl se requiere para acceder a simbolos del kernel
MODULE_AUTHOR("Gio");   
MODULE_DESCRIPTION("Module CPU - cpu_202100229");
MODULE_VERSION("2.0");

#define PROC_NAME "cpu_202100229" // nombre del modulo

/*
    Variables globales para calcular diferencias de tiempo CPU
    Necesitamos comparar con mediciones anteriores para obtener porcentajes precisos
*/
static u64 prev_idle_time = 0;
static u64 prev_total_time = 0;

// ======================== funciones auxiliares ==============================
/*
    Para obtener el tiempo total de CPU
    Suma todos los tipos de tiempo: user, nice, system, idle, iowait, irq, softirq
 */
static u64 get_cpu_total_time(void)
{
    int cpu;
    u64 user, nice, system, idle, iowait, irq, softirq, steal;
    u64 total = 0;

    // Iteramos sobre todos los CPUs del sistema
    for_each_possible_cpu(cpu) {
        // Obtenemos las estadísticas de tiempo para cada CPU
        user     = kcpustat_cpu(cpu).cpustat[CPUTIME_USER];
        nice     = kcpustat_cpu(cpu).cpustat[CPUTIME_NICE];
        system   = kcpustat_cpu(cpu).cpustat[CPUTIME_SYSTEM];
        idle     = kcpustat_cpu(cpu).cpustat[CPUTIME_IDLE];
        iowait   = kcpustat_cpu(cpu).cpustat[CPUTIME_IOWAIT];
        irq      = kcpustat_cpu(cpu).cpustat[CPUTIME_IRQ];
        softirq  = kcpustat_cpu(cpu).cpustat[CPUTIME_SOFTIRQ];
        steal    = kcpustat_cpu(cpu).cpustat[CPUTIME_STEAL];

        // Sumamos todos los tiempos
        total += user + nice + system + idle + iowait + irq + softirq + steal;
    }

    return total;
}


/*
    para obtener el tiempo idle (inactivo) de CPU
    El tiempo idle es cuando el CPU no está haciendo nada útil
*/
static u64 get_cpuSystem_idle_time(void)
{
    int cpu;
    u64 idle, iowait;
    u64 total_idle = 0;

    // Iteramos sobre todos los CPUs del sistema  
    for_each_possible_cpu(cpu) {
        idle   = kcpustat_cpu(cpu).cpustat[CPUTIME_IDLE];
        iowait = kcpustat_cpu(cpu).cpustat[CPUTIME_IOWAIT];
        
        // El tiempo idle incluye tanto idle puro como tiempo esperando I/O
        total_idle += idle + iowait;
    }

    return total_idle;
}

/*
    Función auxiliar para obtener el número de procesos en diferentes estados
    Recorre la lista de procesos del sistema y cuenta según su estado
 */
static void get_process_counts(unsigned long *running, unsigned long *blocked)
{
    struct task_struct *task;
    *running = 0;
    *blocked = 0;

    // Recorremos todos los procesos del sistema
    rcu_read_lock(); // Protección para lectura concurrente
    for_each_process(task) {
        // Verificamos el estado de cada proceso
        if (task->__state == TASK_RUNNING) {
            (*running)++;
        } else if (task->__state == TASK_UNINTERRUPTIBLE) {
            (*blocked)++;
        }
    }
    rcu_read_unlock(); // Liberamos la protección
}


/*
    esta funcion se ejecuta cuando alguien lee el archivo /proc/cpu_202100229
*/
static int cpu_show(struct seq_file *m, void *v)
{
    unsigned long load_avg1, load_avg5, load_avg15;     // variables para load average
    unsigned int cpu_freq = 0;                          // frecuencia actual de cpu
    unsigned long proc_running, proc_blocked;           // contadores de procesos
    u64 current_idle_time, current_total_time;          // tiempos actuales de CPU
    u64 idle_diff, total_diff;                          // diferencias de tiempo
    unsigned long cpu_usage_percent = 0;                // porcentaje de uso de CPU
    unsigned long cpu_free_percent = 0;                 // porcentaje libre de CPU

    //* --> LOAD AVERAGE

    // Convierte de formato fixed-point a decimal con 2 decimales
    load_avg1  = LOAD_INT(avenrun[0]) * 100 + LOAD_FRAC(avenrun[0]);
    load_avg5  = LOAD_INT(avenrun[1]) * 100 + LOAD_FRAC(avenrun[1]);  
    load_avg15 = LOAD_INT(avenrun[2]) * 100 + LOAD_FRAC(avenrun[2]);

    // * --> frecuencia del cpu
    //#ifdef CONFIG_CPU_FREQ
    //struct cpufreq_policy *policy = cpufreq_cpu_get(0);  // Obtiene política de frecuencia del CPU 0
    //if (policy) {
    //    cpu_freq = policy->cur;  // Frecuencia actual en KHz
    //    cpufreq_cpu_put(policy); // Libera la referencia
    //}
    //#endif

    /*
     * --> CÁLCULO DE CPU EN USO Y LIBRE
     Comparamos los tiempos actuales con los anteriores para calcular porcentajes
     */
    current_total_time = get_cpu_total_time();
    current_idle_time = get_cpuSystem_idle_time();

    // Calculamos las diferencias desde la última medición
    total_diff = current_total_time - prev_total_time;
    idle_diff = current_idle_time - prev_idle_time;

    // Calculamos porcentajes solo si hay diferencia temporal
    if (total_diff > 0) {
        cpu_free_percent = (idle_diff * 10000) / total_diff;  // Multiplicamos por 10000 para obtener 2 decimales
        cpu_usage_percent = 10000 - cpu_free_percent;         // El uso es 100% - libre%
    }

    // Actualizamos los valores previos para la próxima medición
    prev_total_time = current_total_time;
    prev_idle_time = current_idle_time;


    // *--> PROCESOS EN EJECUCION
    //  Los procesos en ejecución y bloqueados indican la actividad del sistema
    get_process_counts(&proc_running, &proc_blocked);


    seq_printf(m, "{\n");
    
    // Load average (indicador clave de estrés del sistema)
    seq_printf(m, "\t\"carga_avg\": {\n");
    seq_printf(m, "\t\t\"1min\": %lu.%02lu,\n", load_avg1 / 100, load_avg1 % 100);
    seq_printf(m, "\t\t\"5min\": %lu.%02lu,\n", load_avg5 / 100, load_avg5 % 100);
    seq_printf(m, "\t\t\"15min\": %lu.%02lu\n", load_avg15 / 100, load_avg15 % 100);
    seq_printf(m, "\t},\n");
    
    // Frecuencia actual del CPU (varía con la carga)
    seq_printf(m, "\t\"frecuencia\": {\n");
    if (cpu_freq >= 0) {
        seq_printf(m, "\t\t\"actual_mhz\": %u.%03u\n", cpu_freq / 1000, cpu_freq);
    } else {
        seq_printf(m, "\t\t\"actual_mhz\": \"indisponible\"\n");
    }
    seq_printf(m, "\t},\n");

    // Porcentaje de uso del CPU
    seq_printf(m, "\t\"uso\": {\n");
    seq_printf(m, "\t\t\"cpu_used\": %lu.%02lu,\n", cpu_usage_percent / 100, cpu_usage_percent % 100);
    seq_printf(m, "\t\t\"cpu_free\": %lu.%02lu\n", cpu_free_percent / 100, cpu_free_percent % 100);
    seq_printf(m, "\t},\n");
    
    // Información de procesos (indica actividad del sistema)
    seq_printf(m, "\t\"procesos\": {\n");
    seq_printf(m, "\t\t\"ejecutando\": %lu,\n", proc_running);
    seq_printf(m, "\t\t\"bloqueados\": %lu\n", proc_blocked);
    seq_printf(m, "\t}\n");
    
    seq_printf(m, "}\n");

    return 0;


}

/*
    Configura el archivo para usar seq_file, que es más eficiente para
    archivos /proc que pueden ser leídos múltiples veces
 */
static int cpu_open(struct inode *inode, struct file *file)
{
    return single_open(file, cpu_show, NULL);
}

/*
  Estructura que define las operaciones permitidas en nuestro archivo /proc
  Esta estructura le dice al kernel qué funciones llamar para cada operación
*/
static const struct proc_ops cpu_ops = {
    .proc_open    = cpu_open,        // Función a llamar al abrir el archivo
    .proc_read    = seq_read,        // Función estándar para leer (proporcionada por seq_file)
    .proc_lseek   = seq_lseek,       // Función para mover el puntero del archivo
    .proc_release = single_release   // Función para cerrar y limpiar recursos
};


/*
    Función de inicialización del módulo
    Se ejecuta cuando el módulo se carga en el kernel con 'insmod'
     __init indica que esta función solo se usa durante la inicialización
     y puede ser descargada de memoria después
 */
static int __init cpu_module_init(void)
{
    struct proc_dir_entry *entry;
    
    // Inicializamos las variables de tiempo para el cálculo de porcentajes
    prev_total_time = get_cpu_total_time();
    prev_idle_time = get_cpuSystem_idle_time();

    /*
         proc_create() crea una entrada en /proc
     */
    entry = proc_create(PROC_NAME, 0644, NULL, &cpu_ops);
    
    if (!entry) {
        printk(KERN_ERR "Error: No se pudo crear /proc/%s\n", PROC_NAME);
        return -ENOMEM; // Error de memoria insuficiente
    }
    
    // Log de éxito en el kernel (visible con dmesg)
    printk(KERN_INFO "Modulo CPU %s cargado exitosamente\n", PROC_NAME);
    printk(KERN_INFO "Archivo creado en /proc/%s\n", PROC_NAME);
    
    return 0;
}

/*
    Función de limpieza del módulo
    Se ejecuta cuando el módulo se descarga del kernel con 'rmmod'
    __exit indica que esta función solo se usa durante la limpieza
 */
static void __exit cpu_module_exit(void)
{
    // Elimina la entrada de /proc
    remove_proc_entry(PROC_NAME, NULL);
    
    // Log de limpieza en el kernel
    printk(KERN_INFO "Modulo CPU %s eliminado\n", PROC_NAME);
}

/*
    Macros que registran las funciones de inicio y salida del módulo
    El kernel usa estas macros para saber qué funciones llamar durante
    la carga y descarga del módulo
 */
module_init(cpu_module_init);   // Registra cpu_init() como función de inicialización
module_exit(cpu_module_exit);   // Registra cpu_exit() como función de limpieza
