import React, { useEffect, useState } from "react";
import styles from "./PagosCard.module.css";
import { obtenerPagosPorCliente } from "../../assets/services/pagosService";

const PagosCard = ({ cliente }) => {
  const [pagos, setPagos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 🧩 Si hay cliente con documento → intentamos cargar pagos
  useEffect(() => {
    const fetchPagos = async () => {
      if (!cliente?.document) return;

      setLoading(true);
      setError("");

      try {
        const data = await obtenerPagosPorCliente(cliente.document);
        // Validar que sea array
        setPagos(Array.isArray(data) ? data : []);
      } catch (err) {
        console.warn("⚠️ No se pudieron obtener pagos:", err.message);
        setError("No se pudieron cargar los pagos del cliente.");
      } finally {
        setLoading(false);
      }
    };

    fetchPagos();
  }, [cliente]);

  return (
    <div className={styles.cardPagos}>
      <h3>Historial de Pagos</h3>

      {loading ? (
        <p className={styles.placeholder}>Cargando pagos...</p>
      ) : error ? (
        <p className={styles.placeholder}>{error}</p>
      ) : pagos.length > 0 ? (
        <ul className={styles.listaPagos}>
          {pagos.map((pago, index) => (
            <li key={index}>
              <span>{pago.fechaPago || "Sin fecha"}</span>
              <strong>${pago.monto || 0}</strong>
            </li>
          ))}
        </ul>
      ) : (
        <p className={styles.placeholder}>💳 Sin registros de pago disponibles</p>
      )}
    </div>
  );
};

export default PagosCard;
