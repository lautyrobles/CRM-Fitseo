import React from "react";
import styles from "./EstadoCard.module.css";

const EstadoCard = ({ estado }) => {
  return (
    <div className={styles.cardEstado}>
      <h3>Estado del Usuario</h3>
      <span
        className={
          estado === "Activo" ? styles.estadoActivo : styles.estadoInactivo
        }
      >
        {estado}
      </span>
    </div>
  );
};

export default EstadoCard;
