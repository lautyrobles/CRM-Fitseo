import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import styles from './App.module.css'

// 🧱 Componentes globales
import Sidebar from './Components/Sidebar/Sidebar'
import Header from './Components/Header/Header'

// 📄 Páginas
import Inicio from './pages/Inicio/Inicio.jsx';
import Clientes from './Pages/Clientes/Clientes'
import Pagos from './Pages/Pagos/Pagos'
import Planes from './Pages/Planes/Planes'
import Configuracion from './pages/Configuracion/Configuracion'
import Soporte from './Pages/Soporte/Soporte'
import Login from './Pages/Login/Login'

// ⚙️ Contexto
import { useAuth } from './context/AuthContext'

const App = () => {
  const { user } = useAuth()

  return (
    <Router>
      <div className={styles.appContainer}>
        {/* Sidebar siempre visible */}
        <Sidebar />

        <main className={styles.mainContent}>
          {/* Si el usuario está logueado, renderizamos el CRM completo */}
          {user ? (
            <>
              <Header />

              <Routes>
                <Route path="/" element={<Inicio />} />
                <Route path="/clientes" element={<Clientes />} />
                <Route path="/pagos" element={<Pagos />} />
                <Route path="/planes" element={<Planes />} />
                <Route path="/configuracion" element={<Configuracion />} />
                <Route path="/soporte" element={<Soporte />} />
              </Routes>
            </>
          ) : (
            // Si no hay sesión → solo Login
            <Login />
          )}
        </main>
      </div>
    </Router>
  )
}

export default App
