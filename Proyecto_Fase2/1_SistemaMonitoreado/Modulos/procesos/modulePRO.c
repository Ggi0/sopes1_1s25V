#include <linux/init.h> // macros para init y exit
#include <linux/module.h> // utilizara para todos los modulos del kernel
#include <linux/kernel.h> // para printk
#include <linux/proc_fs.h> // para crear entrada a /proc
#include <linux/seq_file.h> // para manejar la escritura en /proc
#include <linux/sched.h> // para acceder a infor de procesos y scheduling
#include <linux/sched/signal.h> // para trabajar con senales de procesos

// metadatos del modulo
MODULE_LICENSE("GPL");  // la licencia gpl se requiere para acceder a simbolos del kernel
MODULE_AUTHOR("Gio");   
MODULE_DESCRIPTION("Module CPU - procesos_202100229");
MODULE_VERSION("1.0");


#define PROC_NAME "procesos_202100229" // nombre del modulo