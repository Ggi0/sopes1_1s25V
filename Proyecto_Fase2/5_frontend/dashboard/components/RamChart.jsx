import { useEffect, useState } from "react";
// RamChart.jsx
import { Pie, Bar, PolarArea } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  RadialLinearScale,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";

// Registrar los elementos de chart.js necesarios
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  RadialLinearScale,
  CategoryScale,
  LinearScale,
  BarElement
);

// El componente ahora recibe data como prop desde App.jsx
export default function RamChart({ data }) {
  // Si no hay datos, mostrar mensaje de carga
  if (!data) {
    return <div>Cargando datos de RAM...</div>;
  }

  // Datos para la gráfica de pie (libre vs usada)
  const pieData = {
    labels: ["Libre", "Usada"],
    datasets: [
      {
        data: [parseFloat(data.libre), parseFloat(data.uso)],
        backgroundColor: ["#36A2EB", "#FF6384"],
      },
    ],
  };

  // Datos para gráfica de barras horizontales
  const barData = {
    labels: ["Libre", "Usada", "Compartida", "Buffer"],
    datasets: [
      {
        label: "GB de Memoria",
        data: [
          parseFloat(data.libre), 
          parseFloat(data.uso), 
          parseFloat(data.compartida), 
          parseFloat(data.buffer)
        ],
        backgroundColor: ["#36A2EB", "#FF6384", "#FFCE56", "#4BC0C0"],
      },
    ],
  };

  const barOptions = {
    indexAxis: "y", // Barras horizontales
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
    },
  };

  // Datos para gráfica polar
  const polarData = {
    labels: ["Usada", "Libre", "Compartida", "Buffer"],
    datasets: [
      {
        label: "Distribución RAM",
        data: [
          parseFloat(data.uso), 
          parseFloat(data.libre), 
          parseFloat(data.compartida), 
          parseFloat(data.buffer)
        ],
        backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0"],
      },
    ],
  };

  return (

    <section style={{ display: 'flex', flexDirection: 'column', gap: '3rem', padding: '2rem' }}>

    
      <h2>Monitoreo de Memoria RAM</h2>
      
      <div>
        <p><strong>Total:</strong> {data.total} GB</p>
        <p><strong>Porcentaje de uso:</strong> {data.porcentaje}%</p>
        <p><strong>Última actualización:</strong> {new Date(data.hora).toLocaleString()}</p>
      </div>

      <div>
        <h3>Uso de Memoria RAM</h3>
        <Pie data={pieData} />
      </div>

      <div>
        <h3>Distribución detallada</h3>
        <Bar data={barData} options={barOptions} />
      </div>

      <div>
        <h3>Distribución Polar de la RAM</h3>
        <PolarArea data={polarData} />
      </div>
    </section>
  );
}