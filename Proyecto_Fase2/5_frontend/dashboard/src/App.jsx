import { useEffect, useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import RamChart from '../components/RamChart';
import CpuChart from '../components/CpuChart';
import ProcChart from '../components/ProcChart';
import socket from './socket';


// componentes principal de la aplicacion
function App() {
    // Estados para almacenar los datos de métricas recibidos por WebSocket
    const [ramData, setRamData] = useState(null);
    const [cpuData, setCpuData] = useState(null);
    const [processData, setProcessData] = useState(null);
    const [connectionStatus, setConnectionStatus] = useState('Conectando...');
    const [lastUpdate, setLastUpdate] = useState(null);

    useEffect(() => {
        // Solicitar métricas iniciales al conectar
        socket.emit('request-metrics');

        // Escuchar el evento de actualización de métricas
        socket.on('metrics-update', (data) => {
            console.log('Métricas recibidas:', data);

            // Actualizar estados con los datos recibidos
            if (data.ram) setRamData(data.ram);
            if (data.cpu) setCpuData(data.cpu);
            if (data.processes) setProcessData(data.processes);

            // Actualizar timestamp de última actualización
            setLastUpdate(new Date().toLocaleTimeString());
            setConnectionStatus('Conectado');
        });

        // Escuchar errores de métricas
        socket.on('metrics-error', (error) => {
            console.error('Error en métricas:', error);
            setConnectionStatus('Error en métricas');
        });

        // Escuchar eventos de conexión/desconexión
        socket.on('connect', () => {
            setConnectionStatus('Conectado');
            // Solicitar métricas cuando se reconecte
            socket.emit('request-metrics');
        });

        socket.on('disconnect', () => {
            setConnectionStatus('Desconectado');
        });


        // Cleanup: limpiar event listeners cuando el componente se desmonte
        return () => {
            socket.off('metrics-update');
            socket.off('metrics-error');
            socket.off('connect');
            socket.off('disconnect');
        };
    }, []);

    return (
        <>
            <Header />

            {/* Indicador de estado de conexión */}
            <div style={{
                padding: '10px',
                backgroundColor: connectionStatus === 'Conectado' ? '#d4edda' : '#f8d7da',
                color: connectionStatus === 'Conectado' ? '#155724' : '#721c24',
                textAlign: 'center',
                marginBottom: '20px'
            }}>
                Estado: {connectionStatus}
            </div>



            <main style={{ display: 'flex', justifyContent: 'space-around', padding: '2rem' }}>
                {/* Pasar datos como props a los componentes */}
                <RamChart data={ramData} />
                <CpuChart data={cpuData} />
                <ProcChart data={processData} />
            </main>

            <Footer />
        </>
    );
}

export default App;