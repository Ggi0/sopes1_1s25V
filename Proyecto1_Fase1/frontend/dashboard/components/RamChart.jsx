import { useEffect, useState } from "react";
import {Pie} from 'react-chartjs-2'
import {Chart as ChartJS, ArcElement, Tooltip, Legend} from 'chart.js'

// registrar los elementos de chart.js necesarios
ChartJS.register(ArcElement, Tooltip, Legend)

export default function RamChart() {
    const [data, setData] = useState(null)

    // llamada a la API para obtener dato de RAM
    useEffect(() => {
        const fetchData = () => {
            fetch('http://localhost:3000/recolector/metrics')
                .then(res => res.json())
                .then(data => setData(data.ram)) // solo daos de la ram
                .catch(err => console.error('error al obetner datos de ram', err));

        };
        // Llamada inicial
        fetchData();
         // intervalo cada 20 seg (20000 ms)
         const intervalo = setInterval(fetchData, 20000);
        
         // limpieza del intervalo al desmontar compotnete
         return () => clearInterval(intervalo);

    }, [])

    // si aun no hay datos
    if (!data) return <p>Cargando datos de RAM ...</p>

    // datos para la grafica
    const pieData = {
        labels: ['Libre', 'Usada'],
        datasets: [
            {
                data: [data.libre, data.uso],
                backgroundColor: ['#36A2EB', '#FF6384'],
            },
        ],
    }

    return (
        <section>
            <h2>Uso de Memoria RAM</h2>
            <Pie data={pieData} />
        </section>
    )

}