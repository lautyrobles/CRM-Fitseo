import React, { useEffect, useState } from "react";
import styles from "./Planes.module.css";
import Loader from "../../Components/Loader/Loader";
import {
  obtenerPlanes,
  crearPlan,
  actualizarPlan,
  cambiarEstadoPlan,
} from "../../assets/services/planesService";

const Planes = () => {
  const [planes, setPlanes] = useState([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [editIndex, setEditIndex] = useState(null);

  const [nuevoPlan, setNuevoPlan] = useState({
    namePlan: "",
    daysEnabled: "",
    hoursEnabled: "",
    value: "",
    notes: "",
    active: true, // ✔️ backend usa active: boolean
  });

  const [toast, setToast] = useState({ message: "", type: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  /* ===========================
        🔹 Obtener planes
     =========================== */
  const fetchPlanes = async () => {
    try {
      setLoading(true);
      const data = await obtenerPlanes();
      setPlanes(data);
    } catch (error) {
      console.error("❌ Error al obtener planes:", error);
      mostrarToast("Error al cargar los planes", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlanes();
  }, []);

  /* ===========================
        🔹 Form handlers
     =========================== */
  const handleChange = (e) => {
    const { name, value } = e.target;

    setNuevoPlan((prev) => ({
      ...prev,
      [name]:
        name === "active"
          ? value === "true"
          : value,
    }));
  };

  const limpiarFormulario = () => {
    setNuevoPlan({
      namePlan: "",
      daysEnabled: "",
      hoursEnabled: "",
      value: "",
      notes: "",
      active: true,
    });
    setEditIndex(null);
  };

  const toggleFormulario = () => {
    if (editIndex !== null) return;
    setMostrarFormulario((prev) => !prev);
    limpiarFormulario();
  };

  const cancelarEdicion = () => {
    limpiarFormulario();
    setMostrarFormulario(false);
  };

  const mostrarToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: "", type: "" }), 2500);
  };

  const validarCampos = () => {
    if (!nuevoPlan.namePlan || !nuevoPlan.value) {
      mostrarToast("⚠️ El nombre y el valor son obligatorios.", "error");
      return false;
    }
    return true;
  };

  /* ===========================
        🔹 Crear / actualizar
     =========================== */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validarCampos()) return;

    try {
      setSaving(true);

      const body = {
        namePlan: nuevoPlan.namePlan,
        daysEnabled: Number(nuevoPlan.daysEnabled) || 0,
        hoursEnabled: Number(nuevoPlan.hoursEnabled) || 0,
        value: Number(nuevoPlan.value),
        notes: nuevoPlan.notes || "",
        active: nuevoPlan.active, // ✔ booleano
      };

      if (editIndex !== null) {
        const plan = planes[editIndex];
        await actualizarPlan(plan.idPlan, body);
        mostrarToast("✔️ Plan actualizado correctamente");
      } else {
        await crearPlan(body);
        mostrarToast("✔️ Plan creado exitosamente");
      }

      await fetchPlanes();
      cancelarEdicion();
    } catch (error) {
      console.error("❌ Error al guardar plan:", error);
      mostrarToast("❌ Error al guardar el plan.", "error");
    } finally {
      setSaving(false);
    }
  };

  /* ===========================
        🔹 Cambiar estado
     =========================== */
  const toggleEstado = async (id, active) => {
    try {
      await cambiarEstadoPlan(id, !active);
      await fetchPlanes();
      mostrarToast("🔁 Estado actualizado");
    } catch (error) {
      console.error("❌ Error estado plan:", error);
      mostrarToast("❌ Error al cambiar estado", "error");
    }
  };

  /* ===========================
        🔹 Editar plan
     =========================== */
  const editarPlan = (index) => {
    const p = planes[index];

    setNuevoPlan({
      namePlan: p.namePlan,
      daysEnabled: p.daysEnabled,
      hoursEnabled: p.hoursEnabled,
      value: p.value,
      notes: p.notes,
      active: p.active, // ✔ boolean
    });

    setEditIndex(index);
    setMostrarFormulario(true);
  };

  /* ===========================
        🔹 Render
     =========================== */
  return (
    <section className={styles.planesContainer}>
      {toast.message && (
        <div
          className={`${styles.toast} ${
            toast.type === "error" ? styles.toastError : styles.toastSuccess
          }`}
        >
          {toast.message}
        </div>
      )}

      <div className={styles.header}>
        <div>
          <h2>Planes Disponibles</h2>
          <p>Administrá los planes ofrecidos a los clientes.</p>
        </div>

        {editIndex === null ? (
          <button className={styles.btnCrear} onClick={toggleFormulario}>
            {mostrarFormulario ? "Cancelar" : "+ Crear plan"}
          </button>
        ) : (
          <button className={styles.btnEliminar} onClick={cancelarEdicion}>
            Cancelar edición
          </button>
        )}
      </div>

      {loading ? (
        <Loader text="Cargando planes..." />
      ) : saving ? (
        <Loader text="Guardando cambios..." />
      ) : (
        <>
          {mostrarFormulario && (
            <form className={styles.formContainer} onSubmit={handleSubmit}>
              <input
                type="text"
                name="namePlan"
                placeholder="Nombre del plan"
                value={nuevoPlan.namePlan}
                onChange={handleChange}
              />

              <input
                type="number"
                name="daysEnabled"
                placeholder="Días"
                value={nuevoPlan.daysEnabled}
                onChange={handleChange}
              />

              <input
                type="number"
                name="hoursEnabled"
                placeholder="Horas"
                value={nuevoPlan.hoursEnabled}
                onChange={handleChange}
              />

              <input
                type="number"
                name="value"
                placeholder="Precio ($)"
                value={nuevoPlan.value}
                onChange={handleChange}
              />

              <input
                type="text"
                name="notes"
                placeholder="Notas"
                value={nuevoPlan.notes}
                onChange={handleChange}
              />

              <select name="active" value={nuevoPlan.active} onChange={handleChange}>
                <option value={true}>Activo</option>
                <option value={false}>Inactivo</option>
              </select>

              <button type="submit" className={styles.btnConfirmar}>
                {editIndex !== null ? "Guardar cambios" : "Confirmar"}
              </button>
            </form>
          )}

          {planes.length > 0 ? (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Días</th>
                  <th>Horas</th>
                  <th>Valor</th>
                  <th>Notas</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>

              <tbody>
                {planes.map((p, i) => (
                  <tr key={p.idPlan}>
                    <td>{p.idPlan}</td>
                    <td>{p.namePlan}</td>
                    <td>{p.daysEnabled}</td>
                    <td>{p.hoursEnabled}</td>
                    <td>${p.value}</td>
                    <td>{p.notes}</td>

                    <td>
                      <span
                        className={
                          p.active ? styles.active : styles.inactive
                        }
                      >
                        {p.active ? "Activo" : "Inactivo"}
                      </span>
                    </td>

                    <td>
                      <button
                        className={styles.btnEditar}
                        onClick={() => editarPlan(i)}
                      >
                        Editar
                      </button>

                      <button
                        className={styles.btnEstado}
                        onClick={() => toggleEstado(p.idPlan, p.active)}
                      >
                        {p.active ? "Desactivar" : "Activar"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className={styles.placeholderBox}>
              <p>📋 No hay planes registrados todavía</p>
            </div>
          )}
        </>
      )}
    </section>
  );
};

export default Planes;
