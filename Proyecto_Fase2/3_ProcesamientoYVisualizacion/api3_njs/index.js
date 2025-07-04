// =========================================================================
// API NODE.JS CON SOCKET.IO PARA MÉTRICAS EN TIEMPO REAL
// =========================================================================
// Esta API consulta la base de datos cada segundo y envía los datos
// actualizados a los clientes conectados via WebSocket
// =========================================================================

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mysql = require('mysql2/promise');
const cors = require('cors');
require('dotenv').config();

// =========================================================================
// CONFIGURACIÓN DEL SERVIDOR
// =========================================================================
const app = express();
const server = http.createServer(app);

// Configurar Socket.IO con CORS para permitir conexiones desde cualquier origen
const io = socketIo(server, {
    cors: {
        origin: "*", // En producción, especificar dominios permitidos
        methods: ["GET", "POST"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: true
    }
});

// Configurar Express con CORS
app.use(cors({
    origin: "*", // En producción, especificar dominios permitidos
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

// =========================================================================
// CONFIGURACIÓN DE LA BASE DE DATOS
// =========================================================================
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'sp1db',
    // Configuraciones para manejo de conexiones
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    acquireTimeout: 60000,
    timeout: 60000,
    reconnect: true
};

// Crear pool de conexiones para mejor rendimiento
const pool = mysql.createPool(dbConfig);

// =========================================================================
// VARIABLES GLOBALES PARA CONTROL DE LA APLICACIÓN
// =========================================================================
let metricsInterval = null; // Intervalo para consultar métricas
let lastMetrics = null; // Última métrica obtenida
let connectedClients = 0; // Contador de clientes conectados

// =========================================================================
// FUNCIONES PARA CONSULTAR LA BASE DE DATOS
// =========================================================================

/**
 * Obtiene los datos más recientes de la tabla RAM
 */
async function getRamData() {
    try {
        const [rows] = await pool.execute(`
            SELECT total, libre, uso, porcentaje, compartida, buffer, hora, api 
            FROM ram_table 
            ORDER BY hora DESC 
            LIMIT 1
        `);
        return rows[0] || null;
    } catch (error) {
        console.error('Error al obtener datos de RAM:', error.message);
        return null;
    }
}

/**
 * Obtiene los datos más recientes de la tabla CPU
 */
async function getCpuData() {
    try {
        const [rows] = await pool.execute(`
            SELECT min_1, min_5, min_15, actual_mhz, used, free, hora, api 
            FROM cpu_table 
            ORDER BY hora DESC 
            LIMIT 1
        `);
        return rows[0] || null;
    } catch (error) {
        console.error('Error al obtener datos de CPU:', error.message);
        return null;
    }
}

/**
 * Obtiene los datos más recientes de la tabla de procesos
 */
async function getProcData() {
    try {
        const [rows] = await pool.execute(`
            SELECT corriendo, total, durmiendo, zombie, parados, hora, api 
            FROM proc_table 
            ORDER BY hora DESC 
            LIMIT 1
        `);
        return rows[0] || null;
    } catch (error) {
        console.error('Error al obtener datos de procesos:', error.message);
        return null;
    }
}

/**
 * Obtiene todas las métricas de la base de datos
 */
async function getAllMetrics() {
    try {
        // Ejecutar todas las consultas en paralelo para mejor rendimiento
        const [ramData, cpuData, procData] = await Promise.all([
            getRamData(),
            getCpuData(),
            getProcData()
        ]);

        return {
            timestamp: new Date().toISOString(),
            ram: ramData,
            cpu: cpuData,
            processes: procData,
            status: 'success'
        };
    } catch (error) {
        console.error('Error al obtener métricas:', error.message);
        return {
            timestamp: new Date().toISOString(),
            ram: null,
            cpu: null,
            processes: null,
            status: 'error',
            error: error.message
        };
    }
}

// =========================================================================
// FUNCIONES PARA MANEJAR SOCKET.IO
// =========================================================================

/**
 * Inicia el polling de métricas cada segundo
 * Solo se ejecuta si hay clientes conectados
 */
function startMetricsPolling() {
    if (metricsInterval) return; // Ya está ejecutándose

    console.log('Iniciando polling de métricas cada 1 segundo...');
    
    metricsInterval = setInterval(async () => {
        try {
            const metrics = await getAllMetrics();
            lastMetrics = metrics;
            
            // Enviar métricas a todos los clientes conectados
            io.emit('metrics-update', metrics);
            
            // Log opcional para debugging
            // console.log(`Métricas enviadas a ${connectedClients} clientes`);
            
        } catch (error) {
            console.error('Error en polling de métricas:', error.message);
            
            // Enviar error a los clientes
            io.emit('metrics-error', {
                timestamp: new Date().toISOString(),
                error: error.message
            });
        }
    }, 1000); // Cada 1 segundo
}

/**
 * Detiene el polling de métricas
 * Se ejecuta cuando no hay clientes conectados
 */
function stopMetricsPolling() {
    if (metricsInterval) {
        clearInterval(metricsInterval);
        metricsInterval = null;
        console.log('Polling de métricas detenido');
    }
}

// =========================================================================
// MANEJO DE CONEXIONES SOCKET.IO
// =========================================================================

io.on('connection', (socket) => {
    connectedClients++;
    console.log(`Cliente conectado. Total: ${connectedClients} clientes`);
    
    // Iniciar polling si es el primer cliente
    if (connectedClients === 1) {
        startMetricsPolling();
    }
    
    // Enviar las últimas métricas al cliente recién conectado
    if (lastMetrics) {
        socket.emit('metrics-update', lastMetrics);
    }
    
    // Manejar desconexión del cliente
    socket.on('disconnect', () => {
        connectedClients--;
        console.log(`Cliente desconectado. Total: ${connectedClients} clientes`);
        
        // Detener polling si no hay clientes conectados
        if (connectedClients === 0) {
            stopMetricsPolling();
        }
    });
    
    // Manejar solicitud manual de métricas
    socket.on('request-metrics', async () => {
        try {
            const metrics = await getAllMetrics();
            socket.emit('metrics-update', metrics);
        } catch (error) {
            socket.emit('metrics-error', {
                timestamp: new Date().toISOString(),
                error: error.message
            });
        }
    });
});

// =========================================================================
// RUTAS HTTP (PARA HEALTH CHECKS Y ENDPOINT PRINCIPAL)
// =========================================================================

/**
 * Endpoint principal donde el frontend se conecta al WebSocket
 * Retorna la página de conexión o información sobre el WebSocket
 */
app.get('/info/actual', (req, res) => {
    res.json({
        message: 'API de métricas en tiempo real',
        websocket_url: `http://${req.get('host')}`,
        status: 'running',
        connected_clients: connectedClients,
        polling_active: metricsInterval !== null,
        last_update: lastMetrics ? lastMetrics.timestamp : null,
        instructions: {
            connect: 'Conectar al WebSocket en la misma URL',
            events: {
                'metrics-update': 'Recibe métricas actualizadas',
                'metrics-error': 'Recibe errores de métricas', 
                'request-metrics': 'Solicita métricas manualmente'
            }
        }
    });
});

/**
 * Health check endpoint para Kubernetes
 */
app.get('/health', async (req, res) => {
    try {
        // Verificar conexión a la base de datos
        await pool.execute('SELECT 1');
        
        res.status(200).json({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            database: 'connected',
            connected_clients: connectedClients,
            polling_active: metricsInterval !== null
        });
    } catch (error) {
        res.status(500).json({
            status: 'unhealthy',
            timestamp: new Date().toISOString(),
            database: 'disconnected',
            error: error.message
        });
    }
});

/**
 * Endpoint para obtener métricas via HTTP (sin WebSocket)
 */
app.get('/api3/metrics', async (req, res) => {
    try {
        const metrics = await getAllMetrics();
        res.json(metrics);
    } catch (error) {
        res.status(500).json({
            timestamp: new Date().toISOString(),
            status: 'error',
            error: error.message
        });
    }
});

/**
 * Endpoint de información general
 */
app.get('/', (req, res) => {
    res.json({
        name: 'API de Métricas en Tiempo Real',
        version: '1.0.0',
        description: 'API Node.js con Socket.IO para métricas de sistema',
        endpoints: {
            '/info/actual': 'Información del WebSocket',
            '/health': 'Health check',
            '/api3/metrics': 'Métricas via HTTP',
            '/': 'Esta información'
        },
        websocket: {
            url: `ws://${req.get('host')}`,
            events: ['metrics-update', 'metrics-error', 'request-metrics']
        }
    });
});

// =========================================================================
// MANEJO DE ERRORES Y CIERRE GRACEFUL
// =========================================================================

// Manejar errores no capturados
process.on('uncaughtException', (error) => {
    console.error('Error no capturado:', error);
    gracefulShutdown();
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Promesa rechazada no manejada:', reason);
    gracefulShutdown();
});

// Manejar señales de cierre
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

/**
 * Cierre graceful de la aplicación
 */
function gracefulShutdown() {
    console.log('Iniciando cierre graceful...');
    
    // Detener polling de métricas
    stopMetricsPolling();
    
    // Cerrar conexiones de Socket.IO
    io.close(() => {
        console.log('Socket.IO cerrado');
        
        // Cerrar pool de base de datos
        pool.end(() => {
            console.log('Pool de base de datos cerrado');
            
            // Cerrar servidor HTTP
            server.close(() => {
                console.log('Servidor HTTP cerrado');
                process.exit(0);
            });
        });
    });
    
    // Forzar cierre después de 10 segundos
    setTimeout(() => {
        console.log('Forzando cierre después de 10 segundos');
        process.exit(1);
    }, 10000);
}

// =========================================================================
// INICIAR SERVIDOR
// =========================================================================

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
    console.log('====================================');
    console.log(`Servidor iniciado en puerto ${PORT}`);
    console.log('====================================');
    console.log(`HTTP: http://localhost:${PORT}`);
    console.log(`WebSocket: ws://localhost:${PORT}`);
    console.log(`Endpoint principal: http://localhost:${PORT}/info/actual`);
    console.log(`Health check: http://localhost:${PORT}/health`);
    console.log('====================================');
});

// Exportar para testing
module.exports = { app, server, io };