
// ========================================================================
//  esta api recibe datos de metricas del sistema y los almacena en MySQL
// ========================================================================
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// importar los modulos locales 
const database  = require('./services/database');
const metrics = require('./controllers/metrics');
const routes = require('./routes/metricsRoutes')

// cargar las variables de entorn
dotenv.config();

const app = express()

// TODO: configurar puerto desde varible de entorno cuando este en kubernetes
const PORT = process.env.PORT || 3000;



// =======================================================================
//                      CONFIGURACIÓN DE MIDDLEWARES
// =======================================================================

// Habilitar CORS para permitir peticiones desde diferentes orígenes
app.use(cors());

// Middleware para parsear JSON en las peticiones
app.use(express.json({ limit: '10mb' }));

// Middleware para logging de peticiones
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
});


// =======================================================================
//                      CONFIGURACIÓN DE RUTAS
// =======================================================================

// Ruta de salud para verificar que la API está funcionando
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        message: 'API NodeJS funcionando correctamente',
        timestamp: new Date().toISOString(),
        api: 'NodeJS'
    });
});

// Usar las rutas de métricas
app.use('/api', routes);

// Ruta por defecto
app.get('/', (req, res) => {
    res.json({
        message: 'API NodeJS - Sistema de Métricas',
        status: 'activo',
        api: 'NodeJS',
        timestamp: new Date().toISOString()
    });
});

// =======================================================================
//                      MANEJO DE ERRORES GLOBALES
// =======================================================================

// middlware para manejar rutas no encontradas
app.use((req,res) => {
    res.status(404).json({
        error: 'Ruta no encontrada',
        message: `La ruta ${req.originalUrl} no existe`,
        api: 'NodeJS'
    });
});

// middleware para manejo de erroes
app.use((error, req, res, next) => {
    console.error('Error no manejado: ', error);
    res.status(500).json({
        error: 'Error interno del servidor',
        message: error.message,
        api: 'NodeJS'
    });
});


// =======================================================================
//                      INICIALIZACIÓN DEL SERVIDOR
// =======================================================================
async function startServer(){
    try{
        // probar la conexion a la base de datos antes de empezar el servidor
        //await database.testConnection();
        console.log('Conexion a MySQL aun no configurada');


        // inicial el servidor
        app.listen(PORT, () => {
            console.log(`API NodeJS iniciada en puerto ${PORT}`)
            console.log(`Entorno: ${process.env.NODE_ENV || 'development'}`);
            console.log(`Base de datos: ${process.env.DB_HOST || 'localhost'}`);
        });
        
    }catch (error) {
        console.error('Error al iniciar el servidor', error);
        process.exit(1);
    }
}


/*

    Manejo de cierre graceful del servidor

    esto es importante ya que en entornos reales como Kubernetes, Docker, o Cloud Run
    cuando un contenedor se detiene o reinicia, se envía SIGTERM. 
    Si no manejas estas señales, tu app puede cerrarse sin guardar logs, 
    cerrar conexiones de base de datos, o liberar recursos.


*/ 
process.on('SIGTERM', () => {
    console.log('Señal SIGTERM recibida, cerrando servidor...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('Señal SIGINT recibida, cerrando servidor...');
    process.exit(0);
});

// Iniciar la aplicación
startServer();

