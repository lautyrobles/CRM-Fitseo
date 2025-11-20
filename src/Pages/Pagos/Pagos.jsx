// src/pages/Pagos/Pagos.jsx
import React, { useEffect, useState } from "react";
import styles from "./Pagos.module.css";
import api from "../../assets/services/api";
import { useAuth } from "../../context/AuthContext";
import Loader from "../../Components/Loader/Loader"; // ajustá el path si lo tenés distinto

const Pagos = () => {
  const { user } = useAuth();
  const role = user?.roles?.[0] || user?.role || "USER";

  const canRegisterPayments = ["SUPER_ADMIN", "ADMIN", "SUPERVISOR"].includes(
    role
  );
  const canApplyLateFees = ["SUPER_ADMIN", "ADMIN"].includes(role);

  const [pagos, setPagos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingLateFee, setLoadingLateFee] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  // Filtros
  const [filtros, setFiltros] = useState({
    search: "",
    estado: "TODOS",
    metodo: "TODOS",
  });

  // Formulario de nuevo pago
  const [nuevoPago, setNuevoPago] = useState({
    clienteDocumento: "",
    clienteNombre: "",
    planNombre: "",
    monto: "",
    metodoPago: "EFECTIVO",
    fechaPago: "",
    estado: "PAGADO",
    nota: "",
  });

  // 🔹 Toasts simples
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
    }, 4000);
  };

  // =====================================================
  // 🔹 CARGAR PAGOS INICIALES
  // =====================================================
  const cargarPagos = async () => {
    try {
      setLoading(true);
      const res = await api.get("/payments");
      setPagos(res.data || []);
    } catch (e) {
      console.error("Error al cargar pagos:", e);
      mostrarToast("No se pudieron cargar los pagos.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarPagos();
  }, []);

  // =====================================================
  // 🔹 MANEJO FORMULARIO NUEVO PAGO
  // =====================================================
  const handleChangeFiltro = (e) => {
    const { name, value } = e.target;
    setFiltros((prev) => ({ ...prev, [name]: value }));
  };

  const handleChangeNuevoPago = (e) => {
    const { name, value } = e.target;
    setNuevoPago((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitPago = async (e) => {
    e.preventDefault();

    if (
      !nuevoPago.clienteDocumento ||
      !nuevoPago.clienteNombre ||
      !nuevoPago.monto ||
      !nuevoPago.fechaPago
    ) {
      mostrarToast(
        "Completá al menos: cliente, documento, monto y fecha de pago.",
        "error"
      );
      return;
    }

    try {
      const payload = {
        clientDocument: nuevoPago.clienteDocumento,
        clientName: nuevoPago.clienteNombre,
        planName: nuevoPago.planNombre || null,
        amount: Number(nuevoPago.monto),
        method: nuevoPago.metodoPago,
        paymentDate: nuevoPago.fechaPago,
        status: nuevoPago.estado,
        note: nuevoPago.nota || null,
      };

      const res = await api.post("/payments", payload);

      setPagos((prev) => [res.data, ...prev]);
      mostrarToast("Pago registrado correctamente ✅", "success");

      setNuevoPago({
        clienteDocumento: "",
        clienteNombre: "",
        planNombre: "",
        monto: "",
        metodoPago: "EFECTIVO",
        fechaPago: "",
        estado: "PAGADO",
        nota: "",
      });
      setMostrarFormulario(false);
    } catch (e) {
      console.error("Error al registrar pago:", e);
      const backendMsg =
        e.response?.data?.message || e.response?.data?.error || "";
      mostrarToast(
        backendMsg || "No se pudo registrar el pago. Intentá nuevamente.",
        "error"
      );
    }
  };

  // =====================================================
  // 🔹 APLICAR RECARGOS (MULTAS)
  // =====================================================
  const handleApplyLateFees = async () => {
    if (!canApplyLateFees) return;

    if (
      !window.confirm(
        "¿Aplicar recargos a todos los pagos vencidos? Esta acción no se puede deshacer."
      )
    )
      return;

    try {
      setLoadingLateFee(true);
      await api.post("/payments/apply-late-fees");
      mostrarToast("Recargos aplicados correctamente.", "success");
      await cargarPagos();
    } catch (e) {
      console.error("Error al aplicar recargos:", e);
      const backendMsg =
        e.response?.data?.message || e.response?.data?.error || "";
      mostrarToast(
        backendMsg ||
          "No se pudieron aplicar los recargos. Intentá nuevamente.",
        "error"
      );
    } finally {
      setLoadingLateFee(false);
    }
  };

  // =====================================================
  // 🔹 FILTRADO EN FRONT
  // =====================================================
  const pagosFiltrados = pagos.filter((p) => {
    const search = filtros.search.trim().toLowerCase();
    const estado = filtros.estado;
    const metodo = filtros.metodo;

    const matchSearch =
      !search ||
      (p.clientName && p.clientName.toLowerCase().includes(search)) ||
      (p.clientDocument &&
        String(p.clientDocument).toLowerCase().includes(search));

    const matchEstado =
      estado === "TODOS" ||
      !p.status ||
      p.status.toUpperCase() === estado.toUpperCase();

    const matchMetodo =
      metodo === "TODOS" ||
      !p.method ||
      p.method.toUpperCase() === metodo.toUpperCase();

    return matchSearch && matchEstado && matchMetodo;
  });

  const formatCurrency = (value) => {
    if (value == null) return "-";
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (value) => {
    if (!value) return "-";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "-";
    return d.toLocaleDateString("es-AR");
  };

  return (
    <section className={styles.pagosContainer}>
      {/* Toasts */}
      <div className={styles.toastContainer}>
        {success && (
          <div className={`${styles.toast} ${styles.toastSuccess}`}>
            {success}
          </div>
        )}
        {error && (
          <div className={`${styles.toast} ${styles.toastError}`}>{error}</div>
        )}
      </div>

      {/* Header */}
      <div className={styles.header}>
        <div>
          <h2>Gestión de pagos</h2>
          <p className={styles.subtitle}>
            Registrá cobros de manera rápida y visualizá el historial de pagos.
          </p>
        </div>

        <div className={styles.headerActions}>
          {canApplyLateFees && (
            <button
              className={styles.btnOutline}
              onClick={handleApplyLateFees}
              disabled={loadingLateFee}
            >
              {loadingLateFee ? "Aplicando recargos..." : "Aplicar recargos"}
            </button>
          )}

          {canRegisterPayments && (
            <button
              className={styles.btnPrimary}
              onClick={() => setMostrarFormulario((prev) => !prev)}
            >
              {mostrarFormulario ? "Cancelar" : "+ Registrar pago"}
            </button>
          )}
        </div>
      </div>

      {/* Formulario registrar pago */}
      {mostrarFormulario && canRegisterPayments && (
        <form className={styles.formContainer} onSubmit={handleSubmitPago}>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Documento del cliente</label>
              <input
                type="text"
                name="clienteDocumento"
                placeholder="DNI / CUIT"
                value={nuevoPago.clienteDocumento}
                onChange={handleChangeNuevoPago}
              />
            </div>

            <div className={styles.formGroup}>
              <label>Nombre del cliente</label>
              <input
                type="text"
                name="clienteNombre"
                placeholder="Nombre y apellido"
                value={nuevoPago.clienteNombre}
                onChange={handleChangeNuevoPago}
              />
            </div>

            <div className={styles.formGroup}>
              <label>Plan</label>
              <input
                type="text"
                name="planNombre"
                placeholder="Mensual / Trimestral / Anual..."
                value={nuevoPago.planNombre}
                onChange={handleChangeNuevoPago}
              />
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Monto</label>
              <input
                type="number"
                name="monto"
                placeholder="Monto abonado"
                value={nuevoPago.monto}
                onChange={handleChangeNuevoPago}
                min="0"
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
                <option value="MERCADO_PAGO">Mercado Pago / QR</option>
                <option value="DEBITO">Débito</option>
                <option value="CREDITO">Crédito</option>
              </select>
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

            <div className={styles.formGroup}>
              <label>Estado</label>
              <select
                name="estado"
                value={nuevoPago.estado}
                onChange={handleChangeNuevoPago}
              >
                <option value="PAGADO">Pagado</option>
                <option value="PENDIENTE">Pendiente</option>
                <option value="VENCIDO">Vencido</option>
              </select>
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={`${styles.formGroup} ${styles.formGroupFull}`}>
              <label>Notas (opcional)</label>
              <textarea
                name="nota"
                placeholder="Ej: abonó con billete grande, dejar comprobante en caja…"
                value={nuevoPago.nota}
                onChange={handleChangeNuevoPago}
                rows={2}
              />
            </div>
          </div>

          <div className={styles.formActions}>
            <button type="submit" className={styles.btnPrimary}>
              Guardar pago
            </button>
          </div>
        </form>
      )}

      {/* Filtros + Tabla */}
      <div className={styles.card}>
        <div className={styles.filtrosContainer}>
          <input
            type="text"
            name="search"
            placeholder="Buscar por nombre o documento..."
            value={filtros.search}
            onChange={handleChangeFiltro}
          />

          <select
            name="estado"
            value={filtros.estado}
            onChange={handleChangeFiltro}
          >
            <option value="TODOS">Estado: Todos</option>
            <option value="PAGADO">Pagado</option>
            <option value="PENDIENTE">Pendiente</option>
            <option value="VENCIDO">Vencido</option>
          </select>

          <select
            name="metodo"
            value={filtros.metodo}
            onChange={handleChangeFiltro}
          >
            <option value="TODOS">Método: Todos</option>
            <option value="EFECTIVO">Efectivo</option>
            <option value="TRANSFERENCIA">Transferencia</option>
            <option value="MERCADO_PAGO">Mercado Pago / QR</option>
            <option value="DEBITO">Débito</option>
            <option value="CREDITO">Crédito</option>
          </select>
        </div>

        {loading ? (
          <Loader text="Cargando pagos..." />
        ) : pagosFiltrados.length > 0 ? (
          <div className={styles.tableWrapper}>
            <table className={styles.tablaPagos}>
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Documento</th>
                  <th>Plan</th>
                  <th>Método</th>
                  <th>Estado</th>
                  <th>Monto</th>
                  <th>Fecha pago</th>
                </tr>
              </thead>
              <tbody>
                {pagosFiltrados.map((pago) => (
                  <tr key={pago.id}>
                    <td>{pago.clientName || "-"}</td>
                    <td>{pago.clientDocument || "-"}</td>
                    <td>{pago.planName || "-"}</td>
                    <td>
                      <span className={styles.metodoTag}>
                        {pago.method || "-"}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`${styles.statusPill} ${
                          styles[
                            (pago.status || "PENDIENTE")
                              .toLowerCase()
                              .replace(" ", "")
                          ]
                        }`}
                      >
                        {pago.status || "Pendiente"}
                      </span>
                    </td>
                    <td>{formatCurrency(pago.amount)}</td>
                    <td>{formatDate(pago.paymentDate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className={styles.placeholderBox}>
            <p>📭 No hay pagos que coincidan con los filtros.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default Pagos;
