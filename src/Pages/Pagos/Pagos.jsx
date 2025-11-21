import React, { useEffect, useState } from "react";
import styles from "./Pagos.module.css";
import api from "../../assets/services/api";
import Loader from "../../Components/Loader/Loader";
import { useAuth } from "../../context/AuthContext";

// Servicio cliente
import { obtenerClientePorDocumento } from "../../assets/services/clientesService";

const Pagos = () => {
  const { user } = useAuth();
  const role = user?.roles?.[0] || user?.role || "USER";

  const canRegisterPayments = ["SUPER_ADMIN", "ADMIN", "SUPERVISOR"].includes(role);

  const [pagos, setPagos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const mostrarToast = (msg, tipo = "error") => {
    if (tipo === "error") {
      setError(msg);
      setSuccess("");
    } else {
      setSuccess(msg);
      setError("");
    }
    setTimeout(() => {
      setError("");
      setSuccess("");
    }, 3500);
  };

  const [nuevoPago, setNuevoPago] = useState({
    clienteDocumento: "",
    clienteNombre: "",
    planNombre: "",
    periodo: "",
    fechaPago: "",
    montoFinal: "",
    metodoPago: "EFECTIVO",
    comprobante: "",
    currentPlan: null // 🔵 preparado para backend
  });

  // ===============================================================
  // CARGAR PAGOS
  // ===============================================================
  const cargarPagos = async () => {
    try {
      setLoading(true);
      const res = await api.get("/payments");
      setPagos(res.data || []);
    } catch (e) {
      mostrarToast("❌ Error al cargar los pagos.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarPagos();
  }, []);

  // ===============================================================
  // BUSCAR CLIENTE
  // ===============================================================
  const buscarCliente = async () => {
    const dni = nuevoPago.clienteDocumento.trim();

    if (!dni) return mostrarToast("Ingresá un DNI.", "error");

    try {
      const cliente = await obtenerClientePorDocumento(dni);

      if (!cliente) {
        mostrarToast("Cliente no encontrado.", "error");
        return;
      }

      console.log("🟦 DEBUG CLIENTE →", cliente);

      setNuevoPago((prev) => ({
        ...prev,
        clienteNombre: `${cliente.name} ${cliente.lastName}`,
        planNombre: cliente.namePlan || "-",
        currentPlan: cliente.currentPlan || null // 🔵 future-proof
      }));

      mostrarToast("Cliente encontrado ✓", "success");

    } catch (e) {
      mostrarToast("Error buscando cliente.", "error");
    }
  };

  // ===============================================================
  // HANDLERS
  // ===============================================================
  const handleChangeNuevoPago = (e) => {
    const { name, value } = e.target;
    setNuevoPago((prev) => ({ ...prev, [name]: value }));
  };

  const abrirConfirmacion = (e) => {
    e.preventDefault();

    if (
      !nuevoPago.clienteDocumento ||
      !nuevoPago.clienteNombre ||
      !nuevoPago.periodo ||
      !nuevoPago.fechaPago ||
      !nuevoPago.montoFinal
    ) {
      return mostrarToast("Completá todos los campos.", "error");
    }

    setShowConfirmPopup(true);
  };

  // ===============================================================
  // CONFIRMAR PAGO (POST)
  // ===============================================================
  const confirmarPago = async () => {
    try {
      const payload = {
        period: nuevoPago.periodo,
        paymentDate: nuevoPago.fechaPago,
        baseAmount: Number(nuevoPago.montoFinal),
        discountApplied: 0,
        finalAmount: Number(nuevoPago.montoFinal),
        paymentMethod: nuevoPago.metodoPago,
        paymentStatus: "CONFIRMADO",
        note: nuevoPago.comprobante || null,
        client: {
          document: Number(nuevoPago.clienteDocumento),

          // 🔵 Esta parte funcionará cuando el backend la active:
          currentPlan: nuevoPago.currentPlan
            ? {
                idPlan: nuevoPago.currentPlan.idPlan || null,
                namePlan: nuevoPago.currentPlan.namePlan || nuevoPago.planNombre,
                value: nuevoPago.currentPlan.value || Number(nuevoPago.montoFinal)
              }
            : null
        }
      };

      console.log("📦 PAYLOAD FINAL →", payload);

      const res = await api.post("/payments", payload);

      setPagos((prev) => [res.data, ...prev]);

      mostrarToast("Pago registrado ✔", "success");
      setShowConfirmPopup(false);

      setNuevoPago({
        clienteDocumento: "",
        clienteNombre: "",
        planNombre: "",
        periodo: "",
        fechaPago: "",
        montoFinal: "",
        metodoPago: "EFECTIVO",
        comprobante: "",
        currentPlan: null
      });

      setMostrarFormulario(false);

    } catch (e) {
      mostrarToast("❌ Error al registrar el pago.", "error");
      console.error("❌ BACKEND ERROR:", e);
    }
  };

  const cancelarPopup = () => setShowConfirmPopup(false);

  // ===============================================================
  // RENDER
  // ===============================================================
  return (
    <section className={styles.pagosContainer}>
      
      {/* Toasts */}
      <div className={styles.toastContainer}>
        {success && <div className={`${styles.toast} ${styles.toastSuccess}`}>{success}</div>}
        {error && <div className={`${styles.toast} ${styles.toastError}`}>{error}</div>}
      </div>

      {/* Header */}
      <div className={styles.header}>
        <div>
          <h2>Gestión de pagos</h2>
          <p className={styles.subtitle}>Registrá cobros y visualizá el historial.</p>
        </div>

        {canRegisterPayments && (
          <button
            className={styles.btnPrimary}
            onClick={() => setMostrarFormulario(!mostrarFormulario)}
          >
            {mostrarFormulario ? "Cancelar" : "+ Registrar pago"}
          </button>
        )}
      </div>

      {/* Formulario */}
      {mostrarFormulario && (
        <form className={styles.formContainer} onSubmit={abrirConfirmacion}>
          {/* DNI */}
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>DNI del cliente</label>
              <div className={styles.dniSearchContainer}>
                <input
                  type="text"
                  name="clienteDocumento"
                  value={nuevoPago.clienteDocumento}
                  onChange={handleChangeNuevoPago}
                  placeholder="45123872"
                />
                <button type="button" className={styles.searchBtn} onClick={buscarCliente}>
                  🔍
                </button>
              </div>
            </div>

            {/* Nombre */}
            <div className={styles.formGroup}>
              <label>Nombre y apellido</label>
              <input
                type="text"
                name="clienteNombre"
                value={nuevoPago.clienteNombre}
                onChange={handleChangeNuevoPago}
                placeholder="Nombre del cliente"
                disabled
              />
            </div>

            {/* Plan */}
            <div className={styles.formGroup}>
              <label>Plan vigente</label>
              <input
                type="text"
                name="planNombre"
                value={nuevoPago.planNombre}
                placeholder="Plan del cliente"
                disabled
              />
            </div>
          </div>

          {/* Periodo + Fecha */}
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Período</label>
              <input
                type="date"
                name="periodo"
                value={nuevoPago.periodo}
                onChange={handleChangeNuevoPago}
              />
            </div>

            <div className={styles.formGroup}>
              <label>Fecha de pago</label>
              <input
                type="date"
                name="fechaPago"
                value={nuevoPago.fechaPago}
                onChange={handleChangeNuevoPago}
              />
            </div>
          </div>

          {/* Monto + Método */}
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Monto final</label>
              <input
                type="number"
                name="montoFinal"
                value={nuevoPago.montoFinal}
                onChange={handleChangeNuevoPago}
                placeholder="Ej: 5000"
              />
            </div>

            <div className={styles.formGroup}>
              <label>Método de pago</label>
              <select
                name="metodoPago"
                value={nuevoPago.metodoPago}
                onChange={handleChangeNuevoPago}
              >
                <option value="EFECTIVO">Efectivo</option>
                <option value="TRANSFERENCIA">Transferencia</option>
                <option value="MERCADO_PAGO">Mercado Pago</option>
                <option value="TARJETA_DEBITO">Débito</option>
                <option value="TARJETA_CREDITO">Crédito</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label>N° comprobante</label>
              <input
                type="text"
                name="comprobante"
                value={nuevoPago.comprobante}
                onChange={handleChangeNuevoPago}
                placeholder="Ej: #ABC-123"
              />
            </div>
          </div>

          <div className={styles.formActions}>
            <button className={styles.btnPrimary}>Continuar</button>
          </div>
        </form>
      )}

      {/* POPUP */}
      {showConfirmPopup && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3>Confirmar pago</h3>

            <p><b>DNI:</b> {nuevoPago.clienteDocumento}</p>
            <p><b>Cliente:</b> {nuevoPago.clienteNombre}</p>
            <p><b>Plan:</b> {nuevoPago.planNombre}</p>
            <p><b>Periodo:</b> {nuevoPago.periodo}</p>
            <p><b>Monto:</b> ${nuevoPago.montoFinal}</p>
            <p><b>Método:</b> {nuevoPago.metodoPago}</p>
            <p><b>Fecha:</b> {nuevoPago.fechaPago}</p>
            <p><b>Comprobante:</b> {nuevoPago.comprobante || "-"}</p>

            <div className={styles.modalActions}>
              <button className={styles.btnOutline} onClick={cancelarPopup}>Cancelar</button>
              <button className={styles.btnPrimary} onClick={confirmarPago}>Confirmar pago</button>
            </div>
          </div>
        </div>
      )}

      {/* Tabla */}
      <div className={styles.card}>
        {loading ? (
          <Loader text="Cargando pagos..." />
        ) : pagos.length > 0 ? (
          <div className={styles.tableWrapper}>
            <table className={styles.tablaPagos}>
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>DNI</th>
                  <th>Plan</th>
                  <th>Método</th>
                  <th>Monto</th>
                  <th>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {pagos.map((p) => (
                  <tr key={p.idPayment}>
                    <td>{p.clientName}</td>
                    <td>{p.clientDocument}</td>
                    <td>{p.planName}</td>
                    <td>{p.paymentMethod}</td>
                    <td>${p.finalAmount}</td>
                    <td>{p.paymentDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>No hay pagos registrados.</p>
        )}
      </div>
    </section>
  );
};

export default Pagos;
