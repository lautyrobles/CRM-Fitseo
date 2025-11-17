import React, { useState, useEffect } from "react";
import styles from "./CustomersTable.module.css";
import Loader from "../../components/Loader/Loader";

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

  const itemsPerPage = mostrarFormulario ? 6 : 7;

  // 🔹 Estado inicial → AHORA INCLUYE CONTRASEÑA
  const [nuevoUsuario, setNuevoUsuario] = useState({
    document: "",
    name: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    isActive: true,
    idPlan: "",
    password: "", // ⬅️ NUEVO CAMPO
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
     🔹 Manejo del formulario
     =================================================== */
  const limpiarFormulario = () => {
    setNuevoUsuario({
      document: "",
      name: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      isActive: true,
      idPlan: "",
      password: "", // ⬅️ reset
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
      [name]: name === "isActive" ? value === "true" : value,
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
      !nuevoUsuario.name ||
      !nuevoUsuario.lastName ||
      !nuevoUsuario.email ||
      !nuevoUsuario.document ||
      !nuevoUsuario.idPlan
    ) {
      mostrarToast("⚠️ Todos los campos son obligatorios.", "error");
      return false;
    }

    if (editIndex === null && !nuevoUsuario.password) {
      mostrarToast("⚠️ La contraseña es obligatoria.", "error");
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
        isActive: nuevoUsuario.isActive === true,
        currentPlan: { idPlan: parseInt(nuevoUsuario.idPlan) },
      };

      // 🆕 Solo enviar contraseña si se escribió una
      if (nuevoUsuario.password && nuevoUsuario.password.trim() !== "") {
        clienteBody.password = nuevoUsuario.password;
      }

      if (editIndex !== null) {
        const usuarioEditado = usuarios[editIndex];
        await actualizarCliente(usuarioEditado.document, clienteBody);
        mostrarToast("✅ Usuario actualizado correctamente");
      } else {
        await crearCliente(clienteBody);
        mostrarToast("✅ Usuario creado exitosamente");
      }

      await fetchData();

      setMostrarFormulario(false);
      limpiarFormulario();
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
      isActive: cliente.status === "Activo",
      idPlan: planSeleccionado,
      password: "", // ← SIEMPRE LIMPIO
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
            <button
              className={`${styles.btnCrear} ${
                editIndex !== null ? styles.btnBloqueado : ""
              }`}
              onClick={toggleFormulario}
            >
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

                {/* Campo contraseña */}
                <input
                  type="password"
                  name="password"
                  placeholder={
                    editIndex !== null
                      ? "Nueva contraseña (opcional)"
                      : "Contraseña"
                  }
                  value={nuevoUsuario.password}
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

                <select
                  name="isActive"
                  value={nuevoUsuario.isActive ? "true" : "false"}
                  onChange={handleChange}
                >
                  <option value="true">Activo</option>
                  <option value="false">Inactivo</option>
                </select>

                <button type="submit" className={styles.btnConfirmar}>
                  {editIndex !== null ? "Guardar cambios" : "Confirmar"}
                </button>
              </form>
            )}

            {/* TABLA */}
            {usuarios.length > 0 ? (
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
                        <td>{u.namePlan || "-"}</td>
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
