import { useEffect, useState } from 'react'
import { Pie, Line, Bar } from 'react-chartjs-2'

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  BarElement
} from 'chart.js'

// Registrar elementos necesarios
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  BarElement
)

export default function CpuChart() {
  const [data, setData] = useState(null)
  // const [lastUpdated, setLastUpdated] = useState(null);
  // const [isHealthy, setIsHealthy] = useState(true);
  const [error, setError] = useState(null);

  // Llamada a la API para obtener datos de CPU
  useEffect(() => {
    const fetchData = () => {
      fetch('http://localhost:3000/recolector/metrics')
        .then(res => res.json())
        .then(data => setData(data.cpu)) // Solo usamos cpu.uso
        .catch(err => console.error('Error al obtener datos de CPU', err))

    };

    // Llamada inicial
        fetchData();
         // intervalo cada 20 seg (20000 ms)
         const intervalo = setInterval(fetchData, 3000);
        
         // limpieza del intervalo al desmontar compotnete
         return () => clearInterval(intervalo);

    }, [])

  // Mostrar mensaje mientras se cargan datos
  if (!data) return <p>Cargando datos de CPU...</p>

  // Datos para la gráfica
  const pieData = {
    labels: ['Libre', 'Usada'],
    datasets: [
      {
        data: [data.uso.cpu_free, data.uso.cpu_used],
        backgroundColor: ['#4BC0C0', '#FF9F40'],
      },
    ],
  }

  // Line Chart: carga promedio 1min, 5min, 15min
  const lineData = {
    labels: ['1 min', '5 min', '15 min'],
    datasets: [
      {
        label: 'Carga Promedio',
        data: [
          data.carga_avg['1min'],
          data.carga_avg['5min'],
          data.carga_avg['15min']
        ],
        borderColor: '#FF6384',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        fill: true,
        tension: 0.3,
      },
    ],
  }

  // Bar Chart: procesos ejecutando y bloqueados
  const barData = {
    labels: ['Ejecutando', 'Bloqueados'],
    datasets: [
      {
        label: 'Cantidad de procesos',
        data: [
          data.porcesos.ejecutando,
          data.porcesos.bloqueados
        ],
        backgroundColor: ['#36A2EB', '#FFCE56'],
      },
    ],
  }


    return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: '3rem', padding: '2rem' }}>
      <section>
        <h2>Uso del CPU</h2>
        <Pie data={pieData} />
      </section>

      <section>
        <h2>Carga Promedio del Sistema</h2>
        <Line data={lineData} />
      </section>

      <section>
        <h2>Procesos del Sistema</h2>
        <Bar data={barData} />
      </section>
    </section>
  )
}
