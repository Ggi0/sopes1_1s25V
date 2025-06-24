# obtener la imagen de golang
FROM golang:1.24-alpine AS builder

# CARPETA de la aplicacion
WORKDIR /backend

# Copiamos los archivos con las dependencias (gin - cors)
COPY go.mod go.sum ./

# descargamos las dependecias
RUN go mod download

# copiamos el resto del recolector (codigo fuente)
COPY . .

# compilamos la aplicacion
RUN go build -o collector main.go

# genera un archivo binaro llamado collector
# usamos la imagen mas ligera para el contenedor en donde se va ejecutar el binario
FROM alpine:latest

# instalar certificados para poder hacer peticiones HTTPS desde el contenedor 
RUN apk --no-cache add ca-certificates

# nos  vamos al la root de alpine
WORKDIR /root/

# traemos al binario collector a este directorio
COPY --from=builder /backend/collector .

# Exponemos el puerto desde donde trabaja
EXPOSE 8080

# ejecutamos la aplicacion
CMD [ "./collector" ]
