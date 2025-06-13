const express = require('express');
const app = express();
const PORT = 3000;

const axios = require('axios')

app.use(express.json()); // middelware para parsear a json

app.get('/', (req, res) => {
    res.send('API - nodeJS viva')
});

app.get('/recolector', async(req, res) => {
    try {
        const response = await axios.get('http://localhost:8080');
        res.json(response.data);
    } catch (error) {
        res.status(500).send('Error al tratar de comunicarse con el RECOLECTOR')
    }
});

app.get('/recolector/metrics', async(req, res) => {
    try {
        const response = await axios.get('http://localhost:8080/metrics');
        res.json(response.data);
    } catch (error) {
        res.status(500).send('Error al tratar de obtener las metricas con el RECOLECTOR')
    }
});

app.get('/recolector/info', async(req, res) => {
    try{
        const response = await axios.get('http://localhost:8080/info');
        res.json(response.data);
    } catch (error) {
        res.status(500).send('ERROR al tratar de obtener la info del recolector')
    }
});

app.get('/recolector/health', async(req, res) => {
    try{
        const response = await axios.get('http://localhost:8080/health');
        res.json(response.data);
    } catch (error) {
        res.status(500).send('ERROR al tratar de obtener el estado del recolector')
    }
});



app.listen(PORT, () => {
    console.log(`API escuchando en http://localhost:${PORT}`);
});

