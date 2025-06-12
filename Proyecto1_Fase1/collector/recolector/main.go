/*package main

import (
	"github.com/gin-gonic/gin"
)

func main() {
	r := gin.Default()

	r.GET("/", func(c *gin.Context) {
		c.JSON(200, gin.H{"message": "backend arriba"})
	})

	r.Run(":8080")

	// http://localhost:8080/

}
*/

package main

/*
	main.go - Punto de entrada principal de la aplicación

	Este archivo:
	1. Configura el servidor HTTP con Gin
	2. Inicializa los servicios y handlers
	3. Define las rutas de la API
	4. Configura CORS para permitir peticiones desde otros orígenes
	5. Inicia el servidor en el puerto 8080
*/

import (
	"collector/handlers"
	"collector/services"
	"fmt"
	"log"
	"os"

	"github.com/gin-gonic/gin"
	cors "github.com/rs/cors/wrapper/gin" // Importamos cors para permitir peticiones desde el frontend
)

func main() {
	// Banner de inicio para identificar fácilmente el servicio en los logs
	log.Println(" Iniciando Recolector de Métricas del Sistema")
	log.Println(" Servicio de monitoreo con Goroutines y Canales")
	//log.Println("=" * 50)

	// Configuramos las rutas de los archivos que vamos a leer
	// En desarrollo: /proc/ram_202100229 y /proc/cpu_202100229
	// todo: para cuando este en los contenedores --->  /host/proc/ram_202100229 y /host/proc/cpu_202100229
	ramFilePath := getEnvOrDefault("RAM_FILE_PATH", "/proc/ram_202100229")
	cpuFilePath := getEnvOrDefault("CPU_FILE_PATH", "/proc/cpu_202100229")

	log.Printf(" Archivo RAM: %s", ramFilePath)
	log.Printf(" Archivo CPU: %s", cpuFilePath)

	// Verificamos que los archivos existan antes de continuar
	if !fileExists(ramFilePath) {
		log.Fatalf(" Error: El archivo de RAM no existe: %s", ramFilePath)
	}
	if !fileExists(cpuFilePath) {
		log.Fatalf(" Error: El archivo de CPU no existe: %s", cpuFilePath)
	}

	log.Println(" Archivos de métricas encontrados")

	// Inicializamos el servicio de monitoreo
	// Este servicio contiene toda la lógica para leer los archivos con goroutines
	monitorService := services.NewMonitorService(ramFilePath, cpuFilePath)

	// Inicializamos el handler de métricas
	// El handler maneja las peticiones HTTP y usa el servicio
	metricsHandler := handlers.NewMetricsHandler(monitorService)

	// Configuramos Gin en modo release para producción
	// En desarrollo puedes comentar esta línea para ver más detalles
	gin.SetMode(gin.ReleaseMode)

	// Creamos el router de Gin
	router := gin.Default()

	// Configuramos CORS (Cross-Origin Resource Sharing)
	// Esto permite que la API de NodeJS y el frontend puedan hacer peticiones
	corsHandler := cors.New(cors.Options{
		AllowedOrigins:   []string{"*"}, // En producción, especifica los orígenes permitidos
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Origin", "Content-Type", "Accept", "Authorization"},
		AllowCredentials: true,
	})
	router.Use(corsHandler)

	// Middleware para logging de peticiones
	// Esto nos ayuda a ver qué peticiones están llegando
	router.Use(gin.LoggerWithFormatter(func(param gin.LogFormatterParams) string {
		return fmt.Sprintf("🌐 %s - %s %s %d %s\n",
			param.TimeStamp.Format("2006/01/02 - 15:04:05"),
			param.Method,
			param.Path,
			param.StatusCode,
			param.Latency,
		)
	}))

	// Definimos las rutas de la API
	// Estas son las URLs que puede usar la API de NodeJS

	// Ruta principal para obtener métricas del sistema
	// GET /metrics - Retorna JSON con información de CPU y RAM
	router.GET("/metrics", metricsHandler.GetMetrics)

	// Ruta de health check
	// GET /health - Verifica que el servicio esté funcionando
	router.GET("/health", metricsHandler.GetHealth)

	// Ruta de información del servicio
	// GET /info - Información sobre el servicio y sus endpoints
	router.GET("/info", metricsHandler.GetInfo)

	// Ruta raíz para información básica
	router.GET("/", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": " Recolector de Métricas del Sistema",
			"status":  "running",
			"endpoints": gin.H{
				"metrics": "/metrics",
				"health":  "/health",
				"info":    "/info",
			},
		})
	})

	// Obtenemos el puerto del servidor de las variables de entorno
	// Por defecto usa el puerto 8080
	port := getEnvOrDefault("PORT", "8080")

	log.Printf(" Servidor iniciando en puerto %s", port)
	log.Println(" Endpoints disponibles:")
	log.Println("   GET /metrics - Métricas del sistema")
	log.Println("   GET /health  - Estado del servicio")
	log.Println("   GET /info    - Información del servicio")
	log.Println("   GET /        - Página principal")
	log.Println(" Listo para recibir peticiones...")

	// Iniciamos el servidor HTTP
	// router.Run() es equivalente a http.ListenAndServe()
	if err := router.Run(":" + port); err != nil {
		log.Fatalf("Error al iniciar el servidor: %v", err)
	}
}

// getEnvOrDefault obtiene una variable de entorno o retorna un valor por defecto
// Es útil para configurar la aplicación sin hardcodear valores
func getEnvOrDefault(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

// fileExists verifica si un archivo existe
// Lo usamos para verificar que los archivos de métricas estén disponibles
func fileExists(filename string) bool {
	info, err := os.Stat(filename)
	if os.IsNotExist(err) {
		return false
	}
	return !info.IsDir()
}
