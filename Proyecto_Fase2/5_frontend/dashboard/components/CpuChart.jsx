// CpuChart.jsx
import { Pie, Line, Bar } from 'react-chartjs-2';
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
} from 'chart.js';

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
);

// El componente ahora recibe data como prop desde App.jsx
export default function CpuChart({ data }) {
  // Si no hay datos, mostrar mensaje de carga
  if (!data) {
    return <div>Cargando datos de CPU...</div>;
  }

  // Datos para la gráfica de pie (libre vs usado)
  const pieData = {
    labels: ['Libre', 'Usado'],
    datasets: [
      {
        data: [parseFloat(data.free), parseFloat(data.used)],
        backgroundColor: ['#4BC0C0', '#FF9F40'],
      },
    ],
  };

  // Datos para gráfica de líneas: carga promedio
  const lineData = {
    labels: ['1 min', '5 min', '15 min'],
    datasets: [
      {
        label: 'Carga Promedio',
        data: [
          parseFloat(data.min_1),
          parseFloat(data.min_5),
          parseFloat(data.min_15)
        ],
        borderColor: '#FF6384',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        fill: true,
        tension: 0.3,
      },
    ],
  };

  // Datos para gráfica de barras: frecuencias
  const barData = {
    labels: ['Frecuencia Actual (GHz)'],
    datasets: [
      {
        label: 'GHz',
        data: [parseFloat(data.actual_mhz)],
        backgroundColor: ['#36A2EB'],
      },
    ],
  };

  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: '3rem', padding: '2rem' }}>
      <h2>Monitoreo de CPU</h2>
      
      {/* Información adicional */}
      <div>
        <p><strong>CPU Usado:</strong> {data.used}%</p>
        <p><strong>CPU Libre:</strong> {data.free}%</p>
        <p><strong>Última actualización:</strong> {new Date(data.hora).toLocaleString()}</p>
      </div>

      <div>
        <h3>Uso del CPU</h3>
        <Pie data={pieData} />
      </div>

      <div>
        <h3>Carga Promedio del Sistema</h3>
        <Line data={lineData} />
      </div>

      <div>
        <h3>Frecuencia del Procesador</h3>
        <Bar data={barData} />
      </div>
    </section>
  );
}