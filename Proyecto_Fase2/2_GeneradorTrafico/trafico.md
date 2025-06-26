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

