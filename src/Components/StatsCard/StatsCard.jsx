import React from 'react'
import styles from './StatsCard.module.css'
import { Users, Monitor } from 'lucide-react'

const StatsCard = ({ title, value, change, positive }) => {
  const icon = title.includes("Active") ? <Monitor size={20}/> : <Users size={20}/>
  return (
    <div className={styles.card}>
      <div className={styles.icon}>{icon}</div>
      <div>
        <p className={styles.title}>{title}</p>
        <h3 className={styles.value}>{value}</h3>
        {change && (
          <span className={positive ? styles.up : styles.down}>
            {change} Este mes
          </span>
        )}
      </div>
    </div>
  )
}

export default StatsCard
