pasos para trabajar lo de locust load testing

1 instalar python

verificarlo 
`python -v`
o
`python3 --version`

2 instalar pip
```bash
sudo apt update
sudo apt install python3-pip -y
```

verficar si pip fue estalado correctamente
`python3 -m pip --version`


instalar locust a traves de pip
`pip install locust`

NOTA: es recomendado trabajar en un entorno virtual, la parte de locust se ejecutara desde el local host (ubuntu)
por lo tanto debo crear un entorno para trabajar esta parte, de lo contrario el SO no dejara instalar locust a menos
de que se fuerce.

entonces:
crear el entorno en la carpeta deseada: `python3 -m venv env`
activar el entorno: `source env/bin/activate`
Nota: tiene que tener instaldo venv: `sudo apt install python3-venv`

ahora si instalar locust.

verificar version `locust -V`


para desactivar el entorno es `deactivate`

para ejecutar nuestro archivo:
`locust -f nombre.py`


---
# ¿QUÉ ES LOCUST?
Locust es una herramienta de pruebas de carga escrita en Python que simula usuarios concurrentes realizando peticiones HTTP a una aplicación. Su función principal es generar tráfico artificial para probar el rendimiento de sistemas bajo estrés.


el json generado por la entrada de trafico tendra esta estructura:

```json
[
  {
    "data": {
      "ram": {...},
      "cpu": {...},
      "procesos": {...},
      "hora": "2025-06-17 02:21:54"
    }
  },
  {
    "data": {
      ...
    }
  }
  ...
]

```

donde data es:
```json

  "data":{
		"ram": {
			"total": 7.66,
			"libre": 0.66,
			"uso"  : 7.00,
			"porcentaje": 91.38,
			"compartida": 0.15,
			"buffer": 0.02
		},
		"cpu": {
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
		},
		"procesos": {
			"corriendo": 3,
			"total":     331,
			"durmiendo": 212,
			"zombie":    0,
			"parados":   0
		},
		"hora": "2025-06-17 02:21:54"
	}

```