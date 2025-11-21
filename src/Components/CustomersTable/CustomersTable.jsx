import React, { useState, useEffect } from "react";
import styles from "./CustomersTable.module.css";
import Loader from "../../Components/Loader/Loader";

import {
  obtenerClientes,
  crearCliente,
  actualizarCliente,
} from "../../assets/services/clientesService";

import { obtenerPlanes } from "../../assets/services/planesService";

const CustomersTable = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [planesDisponibles, setPlanesDisponibles] = useState([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [toast, setToast] = useState({ message: "", type: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const itemsPerPage = mostrarFormulario ? 6 : 7; // fijo para evitar confusión

  // Estado inicial del usuario
  const [nuevoUsuario, setNuevoUsuario] = useState({
    document: "",
    name: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    idPlan: "",
  });

  /* ===================================================
     🔹 Obtener clientes y planes
     =================================================== */
  const fetchData = async () => {
    try {
      setLoading(true);
      const [clientesData, planesData] = await Promise.all([
        obtenerClientes(),
        obtenerPlanes(),
      ]);
      setUsuarios(clientesData);
      setPlanesDisponibles(planesData);
    } catch (error) {
      console.error("❌ Error al cargar datos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  /* ===================================================
     🔹 Resolver nombre del plan aunque backend no lo mande
     =================================================== */
  const resolverNombrePlan = (u) => {
    if (u.namePlan) return u.namePlan;

    if (u.idPlan) {
      const plan = planesDisponibles.find((p) => p.idPlan === u.idPlan);
      if (plan) return plan.namePlan;
    }

    if (u.currentPlan?.idPlan) {
      const plan = planesDisponibles.find(
        (p) => p.idPlan === u.currentPlan.idPlan
      );
      if (plan) return plan.namePlan;
    }

    return "-";
  };

  /* ===================================================
     🔹 Manejo del formulario
     =================================================== */
  const limpiarFormulario = () => {
    setNuevoUsuario({
      document: "",
      name: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      idPlan: "",
    });
  };

  const toggleFormulario = () => {
    if (editIndex !== null) return;
    setMostrarFormulario(!mostrarFormulario);
    limpiarFormulario();
  };

  const cancelarEdicion = () => {
    limpiarFormulario();
    setEditIndex(null);
    setMostrarFormulario(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNuevoUsuario({
      ...nuevoUsuario,
      [name]: value,
    });
  };

  const mostrarToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: "", type: "" }), 2500);
  };

  /* ===================================================
     🔹 Validación
     =================================================== */
  const validarCampos = () => {
    if (
      !nuevoUsuario.document ||
      !nuevoUsuario.name ||
      !nuevoUsuario.lastName ||
      !nuevoUsuario.email ||
      !nuevoUsuario.idPlan
    ) {
      mostrarToast("⚠️ Todos los campos son obligatorios.", "error");
      return false;
    }
    return true;
  };

  /* ===================================================
     🔹 Crear o actualizar cliente
     =================================================== */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validarCampos()) return;

    try {
      setSaving(true);

      const clienteBody = {
        document: parseInt(nuevoUsuario.document),
        name: nuevoUsuario.name,
        lastName: nuevoUsuario.lastName,
        email: nuevoUsuario.email,
        phoneNumber: nuevoUsuario.phoneNumber,
        isActive: true,
        currentPlan: { idPlan: parseInt(nuevoUsuario.idPlan) },
      };

      if (editIndex !== null) {
        const usuarioEditado = usuarios[editIndex];
        await actualizarCliente(usuarioEditado.document, clienteBody);
        mostrarToast("✅ Usuario actualizado correctamente");
      } else {
        await crearCliente(clienteBody);
        mostrarToast("✅ Usuario creado exitosamente");
      }

      await fetchData();
      limpiarFormulario();
      setMostrarFormulario(false);
      setEditIndex(null);
    } catch (error) {
      console.error("❌ Error en el envío:", error);
      mostrarToast("❌ Error al guardar usuario", "error");
    } finally {
      setSaving(false);
    }
  };

  /* ===================================================
     🔹 Editar usuario
     =================================================== */
  const editarUsuario = (index) => {
    const cliente = usuarios[index];

    const planSeleccionado =
      planesDisponibles.find((p) => p.namePlan === cliente.namePlan)?.idPlan ||
      "";

    setNuevoUsuario({
      document: cliente.document,
      name: cliente.name,
      lastName: cliente.lastName,
      email: cliente.email,
      phoneNumber: cliente.phoneNumber,
      idPlan: planSeleccionado,
    });

    setEditIndex(index);
    setMostrarFormulario(true);
  };

  /* ===================================================
     🔹 Paginación
     =================================================== */
  const totalPaginas = Math.ceil(usuarios.length / itemsPerPage);
  const inicio = (currentPage - 1) * itemsPerPage;
  const usuariosPagina = usuarios.slice(inicio, inicio + itemsPerPage);

  const siguientePagina = () =>
    currentPage < totalPaginas && setCurrentPage(currentPage + 1);

  const anteriorPagina = () =>
    currentPage > 1 && setCurrentPage(currentPage - 1);

  /* ===================================================
     🔹 Render
     =================================================== */
  return (
    <>
      {toast.message && (
        <div
          className={`${styles.toast} ${
            toast.type === "error" ? styles.toastError : styles.toastSuccess
          }`}
        >
          {toast.message}
        </div>
      )}

      <section className={styles.customersContainer}>
        <div className={styles.header}>
          <h3>Gestión de Usuarios</h3>

          {editIndex === null ? (
            <button className={styles.btnCrear} onClick={toggleFormulario}>
              {mostrarFormulario ? "Cancelar" : "+ Crear usuario"}
            </button>
          ) : (
            <button className={styles.btnEliminar} onClick={cancelarEdicion}>
              Cancelar edición
            </button>
          )}
        </div>

        {/* Loaders */}
        {loading ? (
          <Loader text="Cargando clientes..." />
        ) : saving ? (
          <Loader text="Guardando cambios..." />
        ) : (
          <>
            {/* FORMULARIO */}
            {mostrarFormulario && (
              <form className={styles.formContainer} onSubmit={handleSubmit}>
                <input
                  type="text"
                  name="document"
                  placeholder="DNI"
                  value={nuevoUsuario.document}
                  onChange={handleChange}
                  disabled={editIndex !== null}
                />

                <input
                  type="text"
                  name="name"
                  placeholder="Nombre"
                  value={nuevoUsuario.name}
                  onChange={handleChange}
                />

                <input
                  type="text"
                  name="lastName"
                  placeholder="Apellido"
                  value={nuevoUsuario.lastName}
                  onChange={handleChange}
                />

                <input
                  type="email"
                  name="email"
                  placeholder="Correo electrónico"
                  value={nuevoUsuario.email}
                  onChange={handleChange}
                />

                <input
                  type="text"
                  name="phoneNumber"
                  placeholder="Teléfono"
                  value={nuevoUsuario.phoneNumber}
                  onChange={handleChange}
                />

                <select
                  name="idPlan"
                  value={nuevoUsuario.idPlan}
                  onChange={handleChange}
                >
                  <option value="">Seleccionar plan...</option>
                  {planesDisponibles.map((plan) => (
                    <option key={plan.idPlan} value={plan.idPlan}>
                      {plan.namePlan} — ${plan.value}
                    </option>
                  ))}
                </select>

                <button type="submit" className={styles.btnConfirmar}>
                  {editIndex !== null ? "Guardar cambios" : "Confirmar"}
                </button>
              </form>
            )}

            {/* TABLA */}
            {usuarios.length > 0 ? (
              <>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>DNI</th>
                      <th>Nombre</th>
                      <th>Apellido</th>
                      <th>Email</th>
                      <th>Teléfono</th>
                      <th>Plan</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>

                  <tbody>
                    {usuariosPagina.map((u, i) => {
                      const indexReal = inicio + i;
                      const isEditing = editIndex === indexReal;
                      const isActive = u.status === "Activo";

                      return (
                        <tr
                          key={u.document}
                          className={isEditing ? styles.editingRow : ""}
                        >
                          <td>{u.document}</td>
                          <td>{u.name}</td>
                          <td>{u.lastName}</td>
                          <td>{u.email}</td>
                          <td>{u.phoneNumber}</td>

                          <td>{resolverNombrePlan(u)}</td>

                          <td>
                            <span
                              className={
                                isActive ? styles.active : styles.inactive
                              }
                            >
                              {u.status}
                            </span>
                          </td>

                          <td>
                            <button
                              className={styles.btnEditar}
                              onClick={() => editarUsuario(indexReal)}
                              disabled={
                                editIndex !== null && editIndex !== indexReal
                              }
                            >
                              Editar
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {/* PAGINADOR */}
                {usuarios.length > itemsPerPage && (
                  <div className={styles.paginador}>
                    <button
                      onClick={anteriorPagina}
                      disabled={currentPage === 1}
                      className={styles.btnPaginador}
                    >
                      ◀ Anterior
                    </button>

                    <span className={styles.paginaActual}>
                      Página {currentPage} de {totalPaginas}
                    </span>

                    <button
                      onClick={siguientePagina}
                      disabled={currentPage === totalPaginas}
                      className={styles.btnPaginador}
                    >
                      Siguiente ▶
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className={styles.placeholderBox}>
                <p>⚙️ No hay usuarios registrados todavía...</p>
              </div>
            )}
          </>
        )}
      </section>
    </>
  );
};

export default CustomersTable;
