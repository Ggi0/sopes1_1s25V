// ProcChart.jsx
import { Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
} from 'chart.js';

// Registrar elementos necesarios para las gráficas
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
);

// Componente para mostrar información de procesos del sistema
export default function ProcChart({ data }) {
  // Si no hay datos, mostrar mensaje de carga
  if (!data) {
    return <div>Cargando datos de procesos...</div>;
  }

  // Datos para gráfica de dona: distribución de estados de procesos
  const doughnutData = {
    labels: ['Corriendo', 'Durmiendo', 'Zombie', 'Parados'],
    datasets: [
      {
        label: 'Procesos por Estado',
        data: [
          parseInt(data.corriendo),
          parseInt(data.durmiendo),
          parseInt(data.zombie),
          parseInt(data.parados)
        ],
        backgroundColor: [
          '#28a745', // Verde para corriendo
          '#17a2b8', // Azul para durmiendo
          '#dc3545', // Rojo para zombie
          '#ffc107'  // Amarillo para parados
        ],
        borderColor: [
          '#1e7e34',
          '#117a8b',
          '#bd2130',
          '#e0a800'
        ],
        borderWidth: 2,
      },
    ],
  };

  // Opciones para la gráfica de dona
  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const total = context.dataset.data.reduce((sum, value) => sum + value, 0);
            const percentage = ((context.raw / total) * 100).toFixed(1);
            return `${context.label}: ${context.raw} (${percentage}%)`;
          }
        }
      }
    },
  };

  // Datos para gráfica de barras: comparación de estados
  const barData = {
    labels: ['Corriendo', 'Durmiendo', 'Zombie', 'Parados'],
    datasets: [
      {
        label: 'Cantidad de Procesos',
        data: [
          parseInt(data.corriendo),
          parseInt(data.durmiendo),
          parseInt(data.zombie),
          parseInt(data.parados)
        ],
        backgroundColor: [
          'rgba(40, 167, 69, 0.8)',
          'rgba(23, 162, 184, 0.8)',
          'rgba(220, 53, 69, 0.8)',
          'rgba(255, 193, 7, 0.8)'
        ],
        borderColor: [
          '#28a745',
          '#17a2b8',
          '#dc3545',
          '#ffc107'
        ],
        borderWidth: 2,
      },
    ],
  };

  // Opciones para la gráfica de barras
  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Número de Procesos'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Estado del Proceso'
        }
      }
    },
  };


  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: '3rem', padding: '2rem' }}>
      <h2>Procesos del Sistema</h2>
      
      {/* Información general de procesos */}
      <div>
        <p><strong>Total de Procesos:</strong> {data.total}</p>
        <p><strong>Procesos Activos:</strong> {data.corriendo}</p>
        <p><strong>Última actualización:</strong> {new Date(data.hora).toLocaleString()}</p>
      </div>

      {/* Gráfica de dona para distribución de procesos */}
      <div style={{ marginBottom: '30px' }}>
        <h3>Distribución de Estados de Procesos</h3>
        <div style={{ maxWidth: '400px', margin: '0 auto' }}>
          <Doughnut data={doughnutData} options={doughnutOptions} />
        </div>
      </div>

      {/* Gráfica de barras para comparación */}
      <div>
        <h3>Comparación de Procesos por Estado</h3>
        <Bar data={barData} options={barOptions} />
      </div>

    </section>
  );
}