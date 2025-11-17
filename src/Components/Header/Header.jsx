import React from 'react'
import styles from './Header.module.css'
import { useAuth } from '../../context/AuthContext'

const Header = () => {
  const { user } = useAuth()

  // Si existe usuario → mostrar nombre completo
  const nombreCompleto = user
    ? `${user.name || ''}`.trim()
    : ''

  return (
    <header className={styles.header}>
      <h2>
        Bienvenido{nombreCompleto ? ` ${nombreCompleto}` : ''}! 👋🏼
      </h2>
      {/* <input type="text" placeholder="Search" className={styles.search} /> */}
    </header>
  )
}

export default Header

