package handlers

/*
	handlers/metrics.go - Contiene los manejadores HTTP (handlers)
	Los handlers son funciones que se ejecutan cuando llega una petición HTTP
	Son como los controladores en MVC, manejan las rutas de la API
*/

import (
	"collector/models"
	"collector/services"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

// MetricsHandler maneja todas las rutas relacionadas con métricas del sistema
type MetricsHandler struct {
	monitorService *services.MonitorService // Servicio que hace la lógica de negocio
}

// NewMetricsHandler crea una nueva instancia del manejador de métricas
func NewMetricsHandler(monitorService *services.MonitorService) *MetricsHandler {
	return &MetricsHandler{
		monitorService: monitorService,
	}
}

/*
GetMetrics maneja las peticiones GET a /metrics
Esta función se ejecuta cada vez que la API de NodeJS hace una petición

Parámetros:
- c: Context de Gin que contiene información de la petición HTTP
*/
func (h *MetricsHandler) GetMetrics(c *gin.Context) {
	// Log para debugging - nos ayuda a ver cuándo llegan peticiones
	c.Header("X-Request-ID", time.Now().Format("20060102-150405"))

	// Llamamos al servicio para obtener las métricas del sistema
	// Aquí es donde se ejecutan las goroutines y se leen los archivos
	metrics, err := h.monitorService.GetSystemMetrics()

	if err != nil {
		// Si hay error, respondemos con código 500 (Internal Server Error)
		errorResponse := models.ErrorResponse{
			Status:    "error",
			Message:   err.Error(),
			TimeStamp: time.Now().Format(time.RFC3339),
		}

		// c.JSON convierte el struct a JSON y lo envía como respuesta
		c.JSON(http.StatusInternalServerError, errorResponse)
		return
	}

	// Si todo salió bien, respondemos con código 200 (OK) y las métricas
	c.JSON(http.StatusOK, metrics)
}

/*
GetHealth maneja las peticiones GET a /health
Este endpoint se usa para verificar que el servicio esté funcionando
Es útil para Docker health checks y monitoreo
*/
func (h *MetricsHandler) GetHealth(c *gin.Context) {
	healthResponse := gin.H{
		"status":    "healthy",
		"service":   "recolector-monitoreo",
		"timestamp": time.Now().Format(time.RFC3339),
		"version":   "1.0.0",
	}

	c.JSON(http.StatusOK, healthResponse)
}

/*
GetInfo maneja las peticiones GET a /info
Proporciona información sobre el servicio y qué archivos está monitoreando
*/
func (h *MetricsHandler) GetInfo(c *gin.Context) {
	infoResponse := gin.H{
		"service":     "Recolector de Métricas del Sistema",
		"description": "Servicio que lee módulos del kernel y recolecta métricas de CPU y RAM",
		"endpoints": gin.H{
			"/metrics": "GET - Obtiene métricas actuales del sistema",
			"/health":  "GET - Verifica el estado del servicio",
			"/info":    "GET - Información sobre el servicio",
		},
		"technology": gin.H{
			"language":  "Go",
			"framework": "Gin",
			"features":  []string{"Goroutines", "Channels", "Concurrent File Reading"},
		},
		"timestamp": time.Now().Format(time.RFC3339),
	}

	c.JSON(http.StatusOK, infoResponse)
}
