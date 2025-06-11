package models

/*
cargaAvg -> carga promerido del sistema en x minutos
*/
type CargaAvg struct {
	OneMin  float64 `json:"1min"`
	FiveMin float64 `json:"5min"`
	FiftMin float64 `json:"15min"`
}

/*
Frecuenca actual del cpu en mhz
*/
type Frecuenca struct {
	ActualMhz float64 `json:"actual_mhz"`
}

/*
Uso de cpu
*/
type UsoCPU struct {
	CPUuse float64 `json:"cpu_used"` // porcentaje del cpu usando
	CPUfre float64 `json:"cpu_free"` // porcentaje del cpu libre
}

/*
procesos sobre el sistema
*/
type Procesos struct {
	Ejecutando int `json:"ejecutando"`
	Bloqueados int `json:"bloqueados"`
}

/*
cpuData es la estructura completa del modulo cpu

la estructura que escribe el modulo de kernel es:

	{
		"carga_avg": {
			"1min": 0.95,
			"5min": 1.40,
			"15min": 2.07
		},
		"frecuencia": {
			"actual_mhz": 1200.000
		},
		"uso": {
			"cpu_used": 10.45,
			"cpu_free": 89.55
		},
		"procesos": {
			"ejecutando": 2,
			"bloqueados": 0
		}
	}
*/
type CPUdata struct {
	CargaAvg  CargaAvg  `json:"carga_avg"`
	Frecuenca Frecuenca `json:"frecuencia"`
	UsoCPU    UsoCPU    `json:"uso"`
	Procesos  Procesos  `json:"porcesos"`
}
