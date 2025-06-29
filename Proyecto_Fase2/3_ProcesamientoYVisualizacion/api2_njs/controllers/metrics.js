// ======================================================================
// Controlador para manejar las peticiones relacionadas con métricas del sistema
// ======================================================================

const databaseService = require('../services/database')


// =======================================================================
//                      FUNCIONES DE VALIDACIÓN
// =======================================================================

/**
 * Función para validar la estructura de los datos de métricas
 */
function validateMetricsData(data) {
    const errors = [];
    
    // Validar que existe el objeto data
    if (!data || !data.data) {
        errors.push('El campo "data" es requerido');
        return { isValid: false, errors };
    }
    
    const metricsData = data.data;
    
    // Validar datos de RAM
    if (metricsData.ram) {
        const ram = metricsData.ram;
        if (typeof ram.total !== 'number') errors.push('ram.total debe ser un número');
        if (typeof ram.libre !== 'number') errors.push('ram.libre debe ser un número');
        if (typeof ram.uso !== 'number') errors.push('ram.uso debe ser un número');
        if (typeof ram.porcentaje !== 'number') errors.push('ram.porcentaje debe ser un número');
        if (typeof ram.compartida !== 'number') errors.push('ram.compartida debe ser un número');
        if (typeof ram.buffer !== 'number') errors.push('ram.buffer debe ser un número');
    }
    
    // Validar datos de CPU
    if (metricsData.cpu) {
        const cpu = metricsData.cpu;
        if (!cpu.carga_avg) errors.push('cpu.carga_avg es requerido');
        else {
            if (typeof cpu.carga_avg['1min'] !== 'number') errors.push('cpu.carga_avg.1min debe ser un número');
            if (typeof cpu.carga_avg['5min'] !== 'number') errors.push('cpu.carga_avg.5min debe ser un número');
            if (typeof cpu.carga_avg['15min'] !== 'number') errors.push('cpu.carga_avg.15min debe ser un número');
        }
        
        if (!cpu.frecuencia) errors.push('cpu.frecuencia es requerido');
        else {
            if (typeof cpu.frecuencia.actual_mhz !== 'number') errors.push('cpu.frecuencia.actual_mhz debe ser un número');
        }
        
        if (!cpu.uso) errors.push('cpu.uso es requerido');
        else {
            if (typeof cpu.uso.cpu_used !== 'number') errors.push('cpu.uso.cpu_used debe ser un número');
            if (typeof cpu.uso.cpu_free !== 'number') errors.push('cpu.uso.cpu_free debe ser un número');
        }
    }
    
    // Validar datos de procesos
    if (metricsData.procesos) {
        const proc = metricsData.procesos;
        if (typeof proc.corriendo !== 'number') errors.push('procesos.corriendo debe ser un número');
        if (typeof proc.total !== 'number') errors.push('procesos.total debe ser un número');
        if (typeof proc.durmiendo !== 'number') errors.push('procesos.durmiendo debe ser un número');
        if (typeof proc.zombie !== 'number') errors.push('procesos.zombie debe ser un número');
        if (typeof proc.parados !== 'number') errors.push('procesos.parados debe ser un número');
    }
    
    // Validar timestamp
    if (!metricsData.hora) {
        errors.push('El campo "hora" es requerido');
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
}


// =======================================================================
//                      CONTROLADORES
// =======================================================================

/**
 * Controlador para recibir y procesar datos de métricas del sistema
 * Esta función recibe el tráfico del Ingress (50% del total)
 * TODO: Verificar que la IP del Load Balancer esté configurada correctamente en Kubernetes
 */
async function receiveMetrics(req, res) {
    try {
        console.log('Recibiendo datos de métricas...');
        console.log('Headers recibidos:', req.headers);
        
        // TODO: En Kubernetes, verificar headers del Ingress para confirmar el origen
        const clientIP = req.ip || req.connection.remoteAddress;
        console.log(`Petición recibida desde IP: ${clientIP}`);
        
        // Validar que se recibieron datos
        if (!req.body) {
            return res.status(400).json({
                error: 'No se recibieron datos',
                message: 'El cuerpo de la petición está vacío',
                api: 'NodeJS',
                timestamp: new Date().toISOString()
            });
        }
        
        // Validar estructura de los datos
        const validation = validateMetricsData(req.body);
        if (!validation.isValid) {
            console.error('Datos inválidos:', validation.errors);
            return res.status(400).json({
                error: 'Datos inválidos',
                details: validation.errors,
                api: 'NodeJS',
                timestamp: new Date().toISOString()
            });
        }
        
        // Extraer los datos y agregar identificador de API
        const metricsData = req.body.data;
        metricsData.api = 'NodeJS'; // Agregar identificador de la API
        
        console.log('Datos validados correctamente');
        console.log('Insertando en base de datos...');
        
        // Insertar datos en la base de datos
        await databaseService.insertMetricsData(metricsData);
        
        // Respuesta exitosa
        const response = {
            success: true,
            message: 'Datos de métricas procesados correctamente',
            api: 'NodeJS',
            timestamp: new Date().toISOString(),
            data_received: {
                ram: !!metricsData.ram,
                cpu: !!metricsData.cpu,
                procesos: !!metricsData.procesos,
                hora: metricsData.hora
            }
        };
        
        console.log('Datos procesados exitosamente');
        res.status(200).json(response);
        
    } catch (error) {
        console.error('Error al procesar métricas:', error);
        
        // Respuesta de error
        res.status(500).json({
            error: 'Error interno del servidor',
            message: error.message,
            api: 'NodeJS',
            timestamp: new Date().toISOString()
        });
    }
}

/**
 * Controlador para obtener estadísticas de la base de datos
 * Útil para monitoreo y debugging
 */
async function getStats(req, res) {
    try {
        console.log('Consultando estadísticas de la base de datos...');
        
        const stats = await databaseService.getDatabaseStats();
        
        res.status(200).json({
            success: true,
            message: 'Estadísticas obtenidas correctamente',
            api: 'NodeJS',
            timestamp: new Date().toISOString(),
            statistics: stats
        });
        
    } catch (error) {
        console.error('Error al obtener estadísticas:', error);
        
        res.status(500).json({
            error: 'Error al obtener estadísticas',
            message: error.message,
            api: 'NodeJS',
            timestamp: new Date().toISOString()
        });
    }
}

/**
 * Controlador para verificar el estado de la API y la conexión a la base de datos
 */
async function healthCheck(req, res) {
    try {
        // Probar conexión a la base de datos
        await databaseService.testConnection();
        
        res.status(200).json({
            status: 'healthy',
            message: 'API funcionando correctamente',
            api: 'NodeJS',
            database: 'connected',
            timestamp: new Date().toISOString(),
            // TODO: En Kubernetes, agregar información del pod y namespace
            environment: process.env.NODE_ENV || 'development'
        });
        
    } catch (error) {
        console.error('Health check falló:', error);
        
        res.status(503).json({
            status: 'unhealthy',
            message: 'Problemas de conectividad',
            api: 'NodeJS',
            database: 'disconnected',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
}

/**
 * Controlador para manejar peticiones de prueba
 * Útil para verificar que la API recibe correctamente las peticiones del Ingress
 */
function testEndpoint(req, res) {
    const testResponse = {
        success: true,
        message: 'Endpoint de prueba funcionando',
        api: 'NodeJS',
        method: req.method,
        path: req.path,
        headers: req.headers,
        query: req.query,
        timestamp: new Date().toISOString()
    };
    
    console.log('Test endpoint ejecutado');
    res.status(200).json(testResponse);
}

// =======================================================================
//                      EXPORTAR CONTROLADORES
// =======================================================================

module.exports = {
    receiveMetrics,
    getStats,
    healthCheck,
    testEndpoint
};