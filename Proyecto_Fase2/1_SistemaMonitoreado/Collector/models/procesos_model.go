package models

/*

procData es la estructura completa para el modulo la lectura de procesos

la estructura que se escribe en el modulo es:

{
	"corriendo": 3,
	"total":     331,
	"durmiendo": 212,
	"zombie":    0,
	"parados":   0,
}


*/

type ProcData struct {
	Corriendo int `json:"corriendo"`
	Total     int `json:"total"`
	Durmiendo int `json:"durmiendo"`
	Zombie    int `json:"zombie"`
	Parados   int `json:"parados"`
}
