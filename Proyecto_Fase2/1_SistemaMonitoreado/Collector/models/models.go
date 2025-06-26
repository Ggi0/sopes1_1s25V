package models

/*
	define las estructuras de datos,
	que representan la informacion de la cpu y la ram
	que leemos de los archivos kernel

*/

// respuesta final que enviamos a la api de nodojs
// conbina la info de cpu y ram
type SystemMetrics struct {
	TimeStamp string   `json:"timeStamp"` // fecha y hora de la medicion
	RAM       RAMinfo  `json:"ram"`       // infomacion de la memoria (ram model)
	CPU       CPUdata  `json:"cpu"`       // imformacion del cpu (cpu model)
	PROC      ProcData `json:"procesos"`  // informacion de los procesos (procesos model)
	Status    string   `json:"status"`    // EStado de la recoleecion (success o error)
	Message   string   `json:"message"`   // mensaje
}

type ErrorResponse struct {
	Status    string `json:"status"`    // error por defecto
	Message   string `json:"message"`   // description del error
	TimeStamp string `json:"timeStamp"` // fecha y hora del error
}
