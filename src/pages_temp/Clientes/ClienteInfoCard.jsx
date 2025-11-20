import React from "react";
import styles from "./ClienteInfoCard.module.css";
import clientIcon from "../../assets/client-icon.png";

const ClienteInfoCard = ({ cliente }) => {
  return (
    <div className={styles.cardInfo}>
      {/* Imagen superior */}
      <div className={styles.cardInfoImg}>
        <img src={clientIcon} alt="Icono del cliente" />
      </div>

      {/* Bloques de información */}
      <div className={styles.infoContainer}>
        <div className={styles.sectionHeader}>
          <span className={styles.badge}>Activo</span>
          <span className={styles.version}>Mensual</span>
        </div>

        <small className={styles.updated}>
          Última actualización: 23 Octubre 2025 - 15:45
        </small>

        <h3 className={styles.title}>
          {cliente.nombre} {cliente.apellido}
        </h3>

        <div className={styles.infoBlockBlue}>
          <h4>🧍 Datos Personales</h4>
          <p><strong>DNI:</strong> {cliente.dni}</p>
          <p><strong>Dirección:</strong> {cliente.direccion}</p>
          <p><strong>Teléfono:</strong> {cliente.telefono}</p>
          <p><strong>Email:</strong> {cliente.email}</p>
          <p><strong>CUIT:</strong> {cliente.cuit || "No registrado"}</p>
        </div>
      </div>
    </div>
  );
};

export default ClienteInfoCard;
