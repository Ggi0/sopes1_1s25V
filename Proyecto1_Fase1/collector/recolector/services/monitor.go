package services

/*
	logica del recolector de info
*/

import (
	"collector/models"
	"fmt"
	"log"
	"sync"
	"time"
)

// rutas a los archivos virtuales del sistema de archivos /proc creados por el modulo cpu / ram .ko
type MonitorService struct {
	ramFilePath string
	cpuFilePath string
}

// cera una nueva instancia del servicio de monitoreo
func NewMonitorService(ramPath, cpuPath string) *MonitorService {
	// TODO: cuando este en contenedores, las rutas serán /host/proc/ram_202100229 y /host/proc/cpu_202100229
	return &MonitorService{
		ramFilePath: ramPath,
		cpuFilePath: cpuPath,
	}
}

/*
1. crear canales para comunicacion entre gorutines
2. lanzar goroutines para leer ram y cpu concurrentemente
3. manejo de resultados
4. retornar las mtericas al sistema
*/
func (ms *MonitorService) GetSystemMetrics() (*models.SystemMetrics, error) {
	// canales para la comunicacion entre las goroutines
	ramChannel := make(chan models.RAMdata) // canal para datos de la ram
	cpuChannel := make(chan models.CPUdata) // canal para los datos de la cpu
	errorChannel := make(chan error, 2)     // canal para errore s, buffer de 2

	// WAITGROUP --> es como un contador que se incrementa cuando lanzamos una gorutine y se decrementa cuando termina
	// ---> ayuda a esperar que terminen todas las gorutinas
	var wg sync.WaitGroup

	// Inicializar la goroutine para leer informacionde ram
	wg.Add(1) // incrementar el contador
	go ms.readRAM(&wg, ramChannel, errorChannel)

	// inicializar la gorutine para leer informacion de cpu
	wg.Add(1)
	go ms.readCPU(&wg, cpuChannel, errorChannel)

	// para cerrar los canales cuando terminen las lecturas y no se queden esperando indefinidamente
	go func() {
		wg.Wait()           // espera que terminen todas las goroutines
		close(ramChannel)   // cerrar el canal de ram
		close(cpuChannel)   // cerrar el canal de cpu
		close(errorChannel) // cerrar el canal de errores
	}()

	// variables para recibir datos de los canales
	var ramRespuesta models.RAMdata
	var cpuRespuesta models.CPUdata
	var ramConfirmado, cpuConfirmado bool

	// bucle para recivir datos de los canales
	for !ramConfirmado || !cpuConfirmado {
		select {
		case data, ok := <-ramChannel:
			if ok { // si el canal no esta cerrado
				ramRespuesta = data
				ramConfirmado = true
				log.Println("Datos de la RAM Recibidos correctamente")
			}

		case data, ok := <-cpuChannel:
			if ok { // si el canal no esta cerrado
				cpuRespuesta = data
				cpuConfirmado = true
				log.Println("Datos de CPU recibidos correctamente")
			}

		case err := <-errorChannel:
			// si hay un error se retorna de inmediato
			log.Println("ERROR al leer los datos: %v", err)
			return nil, err

		case <-time.After(10 * time.Second):
			// si no se recibe datos en 10 seg hay un error
			return nil, fmt.Errorf("timeout: no se pudieron leer los datos en 10 segundos")

		}
	}

	// se crea la respuesta conbinando los datos de la ram y del cpu
	metrics := &models.SystemMetrics{
		TimeStamp: time.Now().Format(time.RFC3339), // formato iso 8601
		RAM:       ramRespuesta.RAM,                // informacion de la memoria, solo a de la ram
		CPU:       cpuRespuesta,                    // info completa del cpu
		Status:    "success",                       // recoleccion de datos correta
		Message:   "Lectura de datos correcta",
	}

	log.Println("Daos del sistema recolectadas exitosamente")
	return metrics, nil
}
