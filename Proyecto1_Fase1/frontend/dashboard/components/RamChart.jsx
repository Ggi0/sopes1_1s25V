import { useEffect, useState } from "react";
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

// registrar los elementos de chart.js necesarios
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  RadialLinearScale,
  CategoryScale,
  LinearScale,
  BarElement
);

export default function RamChart() {
  const [data, setData] = useState(null);

  // llamada a la API para obtener dato de RAM
  useEffect(() => {
    const fetchData = () => {
      fetch("http://localhost:3000/recolector/metrics")
        .then((res) => res.json())
        .then((data) => setData(data.ram)) // solo datos de la RAM
        .catch((err) => console.error("error al obetner datos de ram", err));
    };
    // Llamada inicial
    fetchData();
    // intervalo cada 20 seg (20000 ms)
    const intervalo = setInterval(fetchData, 3000);

    // limpieza del intervalo al desmontar compotnete
    return () => clearInterval(intervalo);
  }, []);

  // si aun no hay datos
  if (!data) return <p>Cargando datos de RAM ...</p>;

  // datos para la grafica
  const pieData = {
    labels: ["Libre", "Usada"],
    datasets: [
      {
        data: [data.libre, data.uso],
        backgroundColor: ["#36A2EB", "#FF6384"],
      },
    ],
  };

  // Horizontal Bar Chart: libre, usada, compartida, buffer
  const barData = {
    labels: ["Libre", "Usada", "Compartida", "Buffer"],
    datasets: [
      {
        label: "GB de Memoria",
        data: [data.libre, data.uso, data.compartida, data.buffer],
        backgroundColor: ["#36A2EB", "#FF6384", "#FFCE56", "#4BC0C0"],
      },
    ],
  };

  const barOptions = {
    indexAxis: "y", // horizontal
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
    },
  };

  // Polar Area Chart
  const polarData = {
    labels: ["Usada", "Libre", "Compartida", "Buffer"],
    datasets: [
      {
        label: "Distribución RAM",
        data: [data.uso, data.libre, data.compartida, data.buffer],
        backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0"],
      },
    ],
  };

  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: '3rem', padding: '2rem' }}>
      <section>
        <h2>Uso de Memoria RAM</h2>
        <Pie data={pieData} />
      </section>

      <section>
        <h2>Distribución detallada</h2>
        <Bar data={barData} options={barOptions} />
      </section>

      <section>
        <h2>Distribución Polar de la RAM</h2>
        <PolarArea data={polarData} />
      </section>
    </section>
  );
}
