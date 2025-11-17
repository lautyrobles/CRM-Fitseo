import React from 'react'
import styles from './Inicio.module.css'
import StatsCard from '../../Components/StatsCard/StatsCard'
import CustomersTable from '../../Components/CustomersTable/CustomersTable'

const Inicio = () => {
  return (
    <div className={styles.inicioContainer}>
      <section className={styles.statsSection}>
        <StatsCard title="Clientes totales" value="5,423" change="+16%" positive />
        <StatsCard title="Miembros" value="1,893" change="-1%" />
        <StatsCard title="Activos ahora" value="189" change="+5%" positive />
      </section>
      <CustomersTable />
    </div>
  )
}

export default Inicio
