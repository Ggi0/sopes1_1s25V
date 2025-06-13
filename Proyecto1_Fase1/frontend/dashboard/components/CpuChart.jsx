import { useEffect, useState } from 'react'
import { Pie } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'

// Registrar elementos necesarios para Chart.js
ChartJS.register(ArcElement, Tooltip, Legend)

export default function CpuChart() {
  const [data, setData] = useState(null)

  // Llamada a la API para obtener datos de CPU
  useEffect(() => {
    fetch('http://localhost:3000/recolector/metrics')
      .then(res => res.json())
      .then(data => setData(data.cpu.uso)) // Solo usamos cpu.uso
      .catch(err => console.error('Error al obtener datos de CPU', err))
  }, [])

  // Mostrar mensaje mientras se cargan datos
  if (!data) return <p>Cargando datos de CPU...</p>

  // Datos para la gráfica
  const pieData = {
    labels: ['Libre', 'Usada'],
    datasets: [
      {
        data: [data.cpu_used, data.cpu_free],
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
