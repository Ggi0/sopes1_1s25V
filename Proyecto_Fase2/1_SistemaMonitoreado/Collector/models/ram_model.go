package models

/*
RAMinfo --> informacion de memoria RAM
*/
type RAMinfo struct {
	Total      float64 `json:"total"`      // Memoria total en  GB
	Libre      float64 `json:"libre"`      // Memoria libre en GB
	Uso        float64 `json:"uso"`        // Memoria en uso
	Por_uso    float64 `json:"porcentaje"` // % de uso de memoria
	Compartida float64 `json:"compartida"` // Memoria compartida en gb
	Buffer     float64 `json:"buffer"`     //Memoria en buffer
}

// SWAPinfo representa la informacion de memoria swap
type SWAPinfo struct {
	Total   float64 `json:"total"`      // swap total
	Libre   float64 `json:"libre"`      // swap libre
	Uso     float64 `json:"uso"`        // swap en uso
	Por_uso float64 `json:"porcentaje"` // porcentaje de swap en uso
}

/*
RAMdata es la estructura completa del modulo ram

	Estructura que escriben los modulos de kernek:

	{
		"ram": {
			"total": 7.66,
			"libre": 0.66,
			"uso"  : 7.00,
			"porcentaje": 91.38,
			"compartida": 0.15,
			"buffer": 0.02
		},
		"swap": {
			"total": 0.00,
			"libre": 0.00,
			"uso"  : 0.00,
			"porcentaje": 0.00
		}
	}
*/
type RAMdata struct {
	RAM  RAMinfo  `json:"ram"`  // info de la memeoria ram
	Swap SWAPinfo `json:"swap"` // info de la swap
}
