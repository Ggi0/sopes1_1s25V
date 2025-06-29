// ======================================================================
//   servicio para manejar todas las operaciones de base de datos MySQL
// ======================================================================

const mysql = require('mysql2/promise')

// Configuración del pool de conexiones MySQL
// TODO: En Kubernetes, estas variables vendrán del ConfigMap y Secrets
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'metrics_db',
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
};


// Crear el pool de conexiones
const pool = mysql.createPool(dbConfig);



// =======================================================================
//                      FUNCIONES DE BASE DE DATOS
// =======================================================================

// Función para probar la conexión a la base de datos
async function testConnection() {
    try {
        const connection = await pool.getConnection();
        const [rows] = await connection.execute('SELECT 1 as test');
        connection.release();
        console.log('Test de conexión MySQL exitoso');
        return true;
    } catch (error) {
        console.error('Error en la conexión MySQL:', error.message);
        throw error;
    }
}

// Función para insertar datos de RAM en la base de datos
async function insertRamData(ramData, timestamp) {
    const connection = await pool.getConnection();
    try {
        const query = `
            INSERT INTO ram_table (total, libre, uso, porcentaje, compartida, buffer, hora, api)
            VALUES (?, ?, ?, ?, ?, ?, ?, 'NodeJS')
        `;
        
        const values = [
            ramData.total,
            ramData.libre,
            ramData.uso,
            ramData.porcentaje,
            ramData.compartida,
            ramData.buffer,
            timestamp
        ];

        await connection.execute(query, values);
        console.log('Datos de RAM insertados correctamente');
        
    } catch (error) {
        console.error('Error al insertar datos de RAM:', error);
        throw error;
    } finally {
        connection.release();
    }
}


/**
 * Función para insertar datos de procesos en la base de datos
 */
async function insertProcessData(processData, timestamp) {
    const connection = await pool.getConnection();
    try {
        const query = `
            INSERT INTO proc_table (corriendo, total, durmiendo, zombie, parados, hora, api)
            VALUES (?, ?, ?, ?, ?, ?, 'NodeJS')
        `;
        
        const values = [
            processData.corriendo,
            processData.total,
            processData.durmiendo,
            processData.zombie,
            processData.parados,
            timestamp
        ];

        await connection.execute(query, values);
        console.log('Datos de procesos insertados correctamente');
        
    } catch (error) {
        console.error('Error al insertar datos de procesos:', error);
        throw error;
    } finally {
        connection.release();
    }
}



// Funcion para insertar datos de cpu en la base de datos
async function insertCpuData(cpuData, timestamp) {
    const connection = await pool.getConnection();
    try {
        const query = `
            INSERT INTO cpu_table (min_1, min_5, min_15, actual_mhz, used, free, hora, api)
            VALUES (?, ?, ?, ?, ?, ?, ?, 'NodeJS')
        `;
        
        const values = [
            cpuData.carga_avg['1min'],
            cpuData.carga_avg['5min'],
            cpuData.carga_avg['15min'],
            cpuData.frecuencia.actual_mhz,
            cpuData.uso.cpu_used,
            cpuData.uso.cpu_free,
            timestamp
        ];

        await connection.execute(query, values);
        console.log('Datos de CPU insertados correctamente');
        
    } catch (error) {
        console.error('Error al insertar datos de CPU:', error);
        throw error;
    } finally {
        connection.release();
    }
}

/**
 * Función principal para insertar todos los datos usando transacciones
 * Garantiza que todos los datos se inserten o ninguno (atomicidad)
 */
async function insertMetricsData(metricsData) {
    const connection = await pool.getConnection();
    
    try {
        // Iniciar transacción para garantizar consistencia de datos
        await connection.beginTransaction();
        
        console.log('🔄 Iniciando inserción de datos en MySQL...');
        
        const timestamp = metricsData.hora;
        
        // Insertar datos de RAM si existen
        if (metricsData.ram) {
            const ramQuery = `
                INSERT INTO ram_table (total, libre, uso, porcentaje, compartida, buffer, hora, api)
                VALUES (?, ?, ?, ?, ?, ?, ?, 'NodeJS')
            `;
            const ramValues = [
                metricsData.ram.total,
                metricsData.ram.libre,
                metricsData.ram.uso,
                metricsData.ram.porcentaje,
                metricsData.ram.compartida,
                metricsData.ram.buffer,
                timestamp
            ];
            await connection.execute(ramQuery, ramValues);
        }
        
        // Insertar datos de CPU si existen
        if (metricsData.cpu) {
            const cpuQuery = `
                INSERT INTO cpu_table (min_1, min_5, min_15, actual_mhz, used, free, hora, api)
                VALUES (?, ?, ?, ?, ?, ?, ?, 'NodeJS')
            `;
            const cpuValues = [
                metricsData.cpu.carga_avg['1min'],
                metricsData.cpu.carga_avg['5min'],
                metricsData.cpu.carga_avg['15min'],
                metricsData.cpu.frecuencia.actual_mhz,
                metricsData.cpu.uso.cpu_used,
                metricsData.cpu.uso.cpu_free,
                timestamp
            ];
            await connection.execute(cpuQuery, cpuValues);
        }
        
        // Insertar datos de procesos si existen
        if (metricsData.procesos) {
            const procQuery = `
                INSERT INTO proc_table (corriendo, total, durmiendo, zombie, parados, hora, api)
                VALUES (?, ?, ?, ?, ?, ?, 'NodeJS')
            `;
            const procValues = [
                metricsData.procesos.corriendo,
                metricsData.procesos.total,
                metricsData.procesos.durmiendo,
                metricsData.procesos.zombie,
                metricsData.procesos.parados,
                timestamp
            ];
            await connection.execute(procQuery, procValues);
        }
        
        // Confirmar la transacción
        await connection.commit();
        console.log('Todos los datos insertados correctamente en MySQL');
        
    } catch (error) {
        // Revertir la transacción en caso de error
        await connection.rollback();
        console.error('Error en la transacción, datos revertidos:', error);
        throw error;
        
    } finally {
        connection.release();
    }
}

/**
 * Función para obtener estadísticas básicas de la base de datos
 * Útil para monitoreo y debugging
 */
async function getDatabaseStats() {
    const connection = await pool.getConnection();
    try {
        const [ramCount] = await connection.execute('SELECT COUNT(*) as count FROM ram_table WHERE api = "NodeJS"');
        const [cpuCount] = await connection.execute('SELECT COUNT(*) as count FROM cpu_table WHERE api = "NodeJS"');
        const [procCount] = await connection.execute('SELECT COUNT(*) as count FROM proc_table WHERE api = "NodeJS"');
        
        return {
            ram_records: ramCount[0].count,
            cpu_records: cpuCount[0].count,
            process_records: procCount[0].count,
            api: 'NodeJS'
        };
        
    } catch (error) {
        console.error('Error al obtener estadísticas:', error);
        throw error;
    } finally {
        connection.release();
    }
}

// =======================================================================
//                      EXPORTAR FUNCIONES
// =======================================================================

module.exports = {
    testConnection,
    insertRamData,
    insertCpuData,
    insertProcessData,
    insertMetricsData,
    getDatabaseStats,
    pool // Exportar el pool para uso directo si es necesario
};