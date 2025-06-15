const express = require('express');
const cors = require('cors')

const { Pool } = require('pg'); // importar postgreSQL client

const app = express();
const PORT = 3000;

const axios = require('axios')

app.use(cors());
app.use(express.json()); // middelware para parsear a json


// Configuración de la conexión a PostgreSQL
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'so1p1',
    password: 'gio21',
    port: 5432,
});

// ==================================================================
//      para la base de datos 
// Función para insertar datos en la base de datos
async function insertDataDB(data) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        
        // Insertar datos de RAM
        if (data.ram) {
            const ramQuery = `
                INSERT INTO ram_data (total_gb, libre_gb, uso_gb, porcentaje, compartida_gb, buffer_gb, timestamp_og)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
            `;
            await client.query(ramQuery, [
                data.ram.total,
                data.ram.libre,
                data.ram.uso,
                data.ram.porcentaje,
                data.ram.compartida,
                data.ram.buffer,
                data.timeStamp
            ]);
        }
        
        // Insertar datos de CPU
        if (data.cpu) {
            const cpuQuery = `
                INSERT INTO cpu_data (carga_1min, carga_5min, carga_15min, frecuencia_mhz, 
                                    cpu_used, cpu_free, procesos_ejecutando, procesos_bloqueados, timestamp_og)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            `;
            await client.query(cpuQuery, [
                data.cpu.carga_avg['1min'],
                data.cpu.carga_avg['5min'],
                data.cpu.carga_avg['15min'],
                data.cpu.frecuencia.actual_mhz,
                data.cpu.uso.cpu_used,
                data.cpu.uso.cpu_free,
                data.cpu.porcesos.ejecutando,
                data.cpu.porcesos.bloqueados,
                data.timeStamp
            ]);
        }
        
        await client.query('COMMIT');
        console.log(' ===>> Datos guardados en la base de datos correctamente');
        
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error al guardar datos en la base de datos:', error);
    } finally {
        client.release();
    }
}
// ==================================================================


// estado global para almacenar las metricas mas recientes
let currentMetrics = {
    ram: null,
    cpu: null,
    lastUpdate: null,
    isHealthy: false
};

// config del intervalo de actualizacion en milisegundos
const UPDATE_INTERVALO = 5000; // 5 seg


/*
    Funcion para obtener la infomaciondel backend 

    es esta la funcion que se ejecuta en bucle para obtener los datos

*/
async function fetchMetricas() {
    try {
        console.log("Consultando informacion del recolector");

        // hacer la peticion
        const response = await axios.get('http://localhost:8080/metrics', {
            timeout: 3000 // timeout 3 seg
        });


        // ! IMPORTANTE meter la info a la funcion que registra en la base de datos
        await insertDataDB(response.data);

        // actualizar el estado global
        currentMetrics = {
            ram: response.data.ram,
            cpu: response.data.cpu,
            lastUpdate: new Date().toISOString(),
            isHealthy: true
        };

        console.log("Actulizado correctamente");
    }catch (error){
        console.error("Error, no se pudo obtener los datos del recolector: ", error.message);

        // marcar el setado como no saludable para mantener los ultimos datos
        currentMetrics.isHealthy = false;
        currentMetrics.lastUpdate = new Date().toISOString();
    }  
}

/*
    Iniciar el sistema para la actualizacion cosntante
*/
function actualizacion() {
    console.log(`Escuchando al servidor cada ${UPDATE_INTERVALO/1000} seg`);

    // primera carga:
    fetchMetricas();

    // config intervalo para actualizaciones constantes
    setInterval(fetchMetricas, UPDATE_INTERVALO);
}


// =======================================================================
//                      RUTAS DE LA API
// =======================================================================

// ruta principal
app.get('/', (req, res) => {
    res.json({
        message: 'API - llamando al servidor de metricas',
        status: 'levantado',
        lastUpdate: currentMetrics.lastUpdate,
        updateInterval: `${UPDATE_INTERVALO/1000} seg`
    });
});

// ruta para obtener metricas 
app.get('/metrics', (req, res) => {
    if (!currentMetrics.ram || !currentMetrics.cpu) {
        return res.status(503).json({
            error: 'Las metricas no disponibles en este momento',
            message: 'El sistema esta iniciando ...'
        });
    }

    res.json({
        ram: currentMetrics.ram,
        cpu: currentMetrics.cpu,
        lastUpdate: currentMetrics.lastUpdate,
        isHealthy: currentMetrics.isHealthy,
        timestamp: new Date().toISOString()
    });
});


// ==========================================================
//          compartabilidad al las rutas originales 
// ==========================================================

app.get('/recolector', async(req, res) => {
    try {
        const response = await axios.get('http://localhost:8080');
        res.json(response.data);
    } catch (error) {
        res.status(500).json({
            error: 'Error al tratar de comunicarse con el RECOLECTOR',
            message: error.message
        });
    }
});

app.get('/recolector/metrics', async(req, res) => {
    /*try {
        const response = await axios.get('http://localhost:8080/metrics');
        res.json(response.data);
    } catch (error) {
        res.status(500).send('Error al tratar de obtener las metricas con el RECOLECTOR')
    }*/

    // redirigir a la nueva ruta optimizada
    res.redirect('/metrics')
});

app.get('/recolector/info', async(req, res) => {
    try{
        const response = await axios.get('http://localhost:8080/info');
        res.json(response.data);
    } catch (error) {
        res.status(500).json({
            error: 'Error al tratar de obtener info con el RECOLECTOR',
            message: error.message
        });
        // res.status(500).send('ERROR al tratar de obtener la info del recolector')
    }
});

app.get('/recolector/health', async(req, res) => {
    try{
        const response = await axios.get('http://localhost:8080/health');
        res.json(response.data);
    } catch (error) {
        //res.status(500).send('ERROR al tratar de obtener el estado del recolector')
        res.status(500).json({
            error: 'Error al tratar de obtener estado del recolector',
            message: error.message
        });
    }
});


// TODO: posibles rutas para ver datos historicos .

app.listen(PORT, () => {
    console.log(`API escuchando en http://localhost:${PORT}`);

        // Probar conexión a la base de datos
    pool.query('SELECT NOW()', (err, res) => {
        if (err) {
            console.error('Error conectando a PostgreSQL:', err);
        } else {
            console.log('Conexión a PostgreSQL exitosa:', res.rows[0]);
        }
    });

    // iniciar las llamadas
    actualizacion();
});

