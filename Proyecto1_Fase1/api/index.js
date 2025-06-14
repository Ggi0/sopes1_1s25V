const express = require('express');
const cors = require('cors')

const app = express();
const PORT = 3000;

const axios = require('axios')

app.use(cors());
app.use(express.json()); // middelware para parsear a json


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


// TODO: conectar a la base de datos.

app.listen(PORT, () => {
    console.log(`API escuchando en http://localhost:${PORT}`);

    // iniciar las llamadas
    actualizacion();
});

