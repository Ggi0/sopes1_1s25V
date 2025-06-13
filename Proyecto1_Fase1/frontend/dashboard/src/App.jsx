import Header from '../components/Header'
import Footer from '../components/Footer'
import RamChart from '../components/RamChart'
import CpuChart from '../components/CpuChart'


// componentes principal de la aplicacion
function App() {
    return (
        <>
            <Header />

            <main style={{ display: 'flex', justifyContent: 'space-around', padding: '2rem' }}>
                <RamChart />
                <CpuChart />
            </main>

            <Footer />
        </>
    )
}

export default App;