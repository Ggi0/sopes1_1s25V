package services

/*
	logica del recolector de info
*/

import (
	"collector/models"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"sync"
	"time"
)

// rutas a los archivos virtuales del sistema de archivos /proc creados por el modulo cpu / ram / procesos .ko
type MonitorService struct {
	ramFilePath  string
	cpuFilePath  string
	procFilePath string
}

// cera una nueva instancia del servicio de monitoreo
func NewMonitorService(ramPath, cpuPath, procPath string) *MonitorService {
	return &MonitorService{
		ramFilePath:  ramPath,
		cpuFilePath:  cpuPath,
		procFilePath: procPath,
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
	ramChannel := make(chan models.RAMdata)   // canal para datos de la ram
	cpuChannel := make(chan models.CPUdata)   // canal para los datos de la cpu
	procChannel := make(chan models.ProcData) // canal para los datos de los procesos
	errorChannel := make(chan error, 2)       // canal para errore s, buffer de 2

	// WAITGROUP --> es como un contador que se incrementa cuando lanzamos una gorutine y se decrementa cuando termina
	// ---> ayuda a esperar que terminen todas las gorutinas
	var wg sync.WaitGroup

	// Inicializar la goroutine para leer informacionde ram
	wg.Add(1) // incrementar el contador
	go ms.readRAM(&wg, ramChannel, errorChannel)

	// inicializar la gorutine para leer informacion de cpu
	wg.Add(1)
	go ms.readCPU(&wg, cpuChannel, errorChannel)

	// inicializar la gorutine para leer informacion de los procesos
	wg.Add(1)
	go ms.readPROC(&wg, procChannel, errorChannel)

	// para cerrar los canales cuando terminen las lecturas y no se queden esperando indefinidamente
	go func() {
		wg.Wait()           // espera que terminen todas las goroutines
		close(ramChannel)   // cerrar el canal de ram
		close(cpuChannel)   // cerrar el canal de cpu
		close(procChannel)  // cerrar el canal de los procesos
		close(errorChannel) // cerrar el canal de errores
	}()

	// variables para recibir datos de los canales
	var ramRespuesta models.RAMdata
	var cpuRespuesta models.CPUdata
	var procRespuesta models.ProcData
	var ramConfirmado, cpuConfirmado, procConfirmado bool

	// bucle para recivir datos de los canales
	for !ramConfirmado || !cpuConfirmado || !procConfirmado {
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

		case data, ok := <-procChannel:
			if ok {
				procRespuesta = data
				procConfirmado = true
				log.Println("Datos de PROCESOS recibidos correctamente")
			}

		case err := <-errorChannel:
			// si hay un error se retorna de inmediato
			log.Printf("ERROR al leer los datos: %v", err)
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
		PROC:      procRespuesta,                   // info de los procesos
		Status:    "success",                       // recoleccion de datos correta
		Message:   "Lectura de datos correcta",
	}

	log.Println("Datos del sistema recolectadas exitosamente")
	return metrics, nil
}

/*
======================= RAM ====================================

lee el archivo de informacion de ram usando una gorourine

wg  -> waitgroup para sincornizacion
ramChannel --> canal paa enviar los datos de la ram
errorChannel ---> canal para enviar errores
*/
func (ms *MonitorService) readRAM(wg *sync.WaitGroup, ramChannel chan<- models.RAMdata, errorChannel chan<- error) {
	defer wg.Done() // al terminar la funcion, decrementamos el contador del waitgroup

	log.Printf("Leyendo datos de la RAM desde: %s", ms.ramFilePath)

	// leer todo el contenido del archivo
	data, err := ioutil.ReadFile(ms.ramFilePath)
	if err != nil {
		errMsg := fmt.Sprintf("error al leer archivo ram %s: %v", ms.ramFilePath, err)
		log.Printf("%s", errMsg)
		errorChannel <- fmt.Errorf(errMsg)
		return
	}

	// parseamos el JSON a nuestra estructura RAMdata
	var ramRespuesta models.RAMdata
	if err := json.Unmarshal(data, &ramRespuesta); err != nil {
		errorMsg := fmt.Sprintf("error al parsear a JSON de RAM: %v", err)
		log.Printf("%s", errorMsg)
		errorChannel <- fmt.Errorf(errorMsg)
		return
	}

	// enviamos los datos por el canal
	ramChannel <- ramRespuesta
	log.Printf("Datos de RAM enviados al canal")

	//log.Printf("Datos de RAM enviados al canal - Uso: %.2f%%, Total: %.2f GB", ramData.RAM.Porcentaje, ramData.RAM.Total)
}

/*
======================= CPU ====================================

lee el archivo de información de CPU usando una goroutine
*/
func (ms *MonitorService) readCPU(wg *sync.WaitGroup, cpuChannel chan<- models.CPUdata, errorChannel chan<- error) {
	defer wg.Done() // al terminar la funcion decrementamos el contador del waitgroup

	log.Printf("Leyendo datos de CPU desde: %s", ms.cpuFilePath)

	// Leemos todo el contenido del archivo
	data, err := ioutil.ReadFile(ms.cpuFilePath)
	if err != nil {
		errorMsg := fmt.Sprintf("error al leer archivo de CPU %s: %v", ms.cpuFilePath, err)
		log.Printf("%s", errorMsg)
		errorChannel <- fmt.Errorf(errorMsg)
		return
	}

	// Parseamos el JSON a nuestra estructura CPUData
	var cpuData models.CPUdata
	if err := json.Unmarshal(data, &cpuData); err != nil {
		errorMsg := fmt.Sprintf("error al parsear JSON de CPU: %v", err)
		log.Printf("%s", errorMsg)
		errorChannel <- fmt.Errorf(errorMsg)
		return
	}

	// Enviamos los datos por el canal
	cpuChannel <- cpuData
	log.Printf("Datos del CPU enviados al canal")
	//log.Printf(" Datos de CPU enviados al canal - Uso: %.2f%%, Frecuencia: %.0f MHz", cpuData.Uso.CPUUsed, cpuData.Frecuencia.ActualMhz)

}

/*
======================= PROCESOS ==================================

lee el archivo virtual que esta en /proc que tiene informacion de los procesos
utilizando una goroutine
*/
func (ms *MonitorService) readPROC(wg *sync.WaitGroup, procChannel chan<- models.ProcData, errorChannel chan<- error) {
	defer wg.Done() // al terminar la funcion decrementamos el contador del waitgroup

	log.Printf("Leyendo datos de los PROCESOS desde : %s", ms.procFilePath)

	// leemos el contenido del archivos
	data, err := ioutil.ReadFile(ms.procFilePath)
	if err != nil {
		errorMsg := fmt.Sprintf("Error al leer archivo de PROCESOS %s: %v", ms.procFilePath, err)
		log.Printf("%s", errorMsg)
		errorChannel <- fmt.Errorf(errorMsg)
		return
	}

	// parseamos el json a nuestra estructura ProcData
	var procRespuesta models.ProcData
	if err := json.Unmarshal(data, &procRespuesta); err != nil {
		errorMsg := fmt.Sprintf("error al parsear a JSON de PROCESOS: %v", err)
		log.Printf("%s", errorMsg)
		errorChannel <- fmt.Errorf(errorMsg)
		return
	}

	// enviamos los datos por el canal
	procChannel <- procRespuesta
	log.Printf("Datos de PROCESOS enviados al canal")
}
