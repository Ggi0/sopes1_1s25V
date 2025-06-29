// Definición de todas las rutas de la API de métricas

const express = require('express');
const router = express.Router();
const metricsController = require('../controllers/metrics');

// =======================================================================
//                      MIDDLEWARE ESPECÍFICO DE RUTAS
// =======================================================================

/**
 * Middleware para logging específico de las rutas de métricas
 */
function logMetricsRequest(req, res, next) {
    console.log(`[METRICS] ${req.method} ${req.originalUrl} - ${new Date().toISOString()}`);
    console.log(`[METRICS] Content-Type: ${req.get('Content-Type')}`);
    console.log(`[METRICS] User-Agent: ${req.get('User-Agent')}`);
    next();
}

// Aplicar middleware de logging a todas las rutas
router.use(logMetricsRequest);

// =======================================================================
//                      DEFINICIÓN DE RUTAS
// =======================================================================

/**
 * POST /api/metrics
 * Ruta principal para recibir datos de métricas del sistema
 * Esta ruta recibe el 50% del tráfico desde el Ingress
 * 
 * TODO: Configurar en el Ingress de Kubernetes para que apunte a esta ruta
 * Ejemplo de configuración del Ingress:
 * - path: /api/metrics
 *   pathType: Prefix
 *   backend:
 *     service:
 *       name: nodejs-api-service
 *       port:
 *         number: 3000
 */
router.post('/metrics', metricsController.receiveMetrics);

/**
 * GET /api/metrics/stats
 * Ruta para obtener estadísticas de la base de datos
 * Útil para monitoreo y debugging
 */
router.get('/metrics/stats', metricsController.getStats);

/**
 * GET /api/health
 * Ruta de health check para verificar el estado de la API
 * Kubernetes puede usar esta ruta para liveness y readiness probes
 * 
 * TODO: Configurar en el deployment de Kubernetes:
 * livenessProbe:
 *   httpGet:
 *     path: /api/health
 *     port: 3000
 *   initialDelaySeconds: 30
 *   periodSeconds: 10
 * 
 * readinessProbe:
 *   httpGet:
 *     path: /api/health
 *     port: 3000
 *   initialDelaySeconds: 5
 *   periodSeconds: 5
 */
router.get('/health', metricsController.healthCheck);

/**
 * GET /api/test
 * Ruta de prueba para verificar conectividad
 * Útil para debugging del Ingress y Load Balancer
 */
router.get('/test', metricsController.testEndpoint);

/**
 * POST /api/test
 * Ruta de prueba para verificar que se pueden recibir datos POST
 */
router.post('/test', metricsController.testEndpoint);

// =======================================================================
//                      RUTAS DE COMPATIBILIDAD
// =======================================================================

/**
 * Rutas adicionales para compatibilidad con diferentes configuraciones
 * TODO: Eliminar estas rutas una vez que el Ingress esté configurado correctamente
 */

// Ruta alternativa sin prefijo /api
router.post('/receive-metrics', metricsController.receiveMetrics);

// Ruta para recibir datos directamente en la raíz (compatibilidad)
router.post('/', metricsController.receiveMetrics);

// =======================================================================
//                      MIDDLEWARE DE MANEJO DE ERRORES ESPECÍFICO
// =======================================================================

/**
 * Middleware para manejar errores específicos de las rutas de métricas
 */
router.use((error, req, res, next) => {
    console.error('[METRICS ERROR]:', error);
    
    // Si es un error de validación de JSON
    if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
        return res.status(400).json({
            error: 'JSON inválido',
            message: 'El formato de los datos recibidos no es JSON válido',
            api: 'NodeJS',
            timestamp: new Date().toISOString()
        });
    }
    
    // Para otros errores, pasar al siguiente middleware
    next(error);
});

// =======================================================================
//                      EXPORTAR ROUTER
// =======================================================================

module.exports = router;