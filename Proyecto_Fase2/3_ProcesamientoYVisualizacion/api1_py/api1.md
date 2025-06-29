esta api esta en python y nodeJS 

recibira el el 50% del trafico total que de el INGRESS

primero ir al directorio en donde estara la api
y crear un entorno virtual:
`python -m venv env`

activar el entorno:
`source env/bin/activate`

instalar flask:
`pip install Flask`

para levantar la api ejecutalmos 
`flask --app app run`
donde app es el nombre de nuestra aplicacion

instalar dotenv
`pip install python-dotenv`


instalar mysql para conectar
`pip install mysql-connector-python`

instalar cors para flask
`pip install flask-cors`