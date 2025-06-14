import { useEffect, useState } from 'react'
import { Pie } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'

// Registrar elementos necesarios para Chart.js
ChartJS.register(ArcElement, Tooltip, Legend)

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
        .then(data => setData(data.cpu.uso)) // Solo usamos cpu.uso
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
        data: [data.cpu_free, data.cpu_used],
        backgroundColor: ['#4BC0C0', '#FF9F40'],
      },
    ],
  }

  return (
    <section>
      <h2>Uso del CPU</h2>
      <Pie data={pieData} />
    </section>
  )
}
