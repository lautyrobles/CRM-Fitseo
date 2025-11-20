import React, { useState, useEffect } from "react";
import styles from "./Configuracion.module.css";
import {
  registerUser,
  getUsers,
  updateUser,
  deleteUser,
  toggleUserStatus,
} from "../../assets/services/authService";
import { useAuth } from "../../context/AuthContext";

const Configuracion = () => {
  const { user } = useAuth();

  // Usuario persistido
  const storedUser = JSON.parse(localStorage.getItem("fitseoUser") || "null");

  /* ===================================================
      🔹 Normalizar rol (ROLE_SUPER_ADMIN → SUPER_ADMIN)
     =================================================== */
  const normalizeRole = (r) =>
    r ? r.replace("ROLE_", "").toUpperCase() : "";

  const currentUserRole =
    normalizeRole(user?.role) || normalizeRole(storedUser?.role) || "";

  /* ===================================================
      🔹 Estados
     =================================================== */
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [toastError, setToastError] = useState("");
  const [success, setSuccess] = useState("");
  const [editUser, setEditUser] = useState(null);
  const [editUserId, setEditUserId] = useState(null);

  const [nuevoUsuario, setNuevoUsuario] = useState({
    nombre: "",
    apellido: "",
    nombreUsuario: "",
    email: "",
    password: "",
    tipo: "",
  });

  /* ===================================================
      🔹 Mapear rol → etiqueta UI
     =================================================== */
  const mapRoleToTipo = (roleRaw) => {
    const role = normalizeRole(roleRaw);
    switch (role) {
      case "SUPER_ADMIN":
        return "Super Admin";
      case "ADMIN":
        return "Admin";
      case "SUPERVISOR":
        return "Encargado";
      case "USER":
        return "Usuario Cliente";
      default:
        return "Usuario";
    }
  };

  /* ===================================================
      🔹 Mapear UI → rol API
     =================================================== */
  const mapTipoToRole = (tipo) => {
    switch (tipo) {
      case "Super Admin":
        return "SUPER_ADMIN";
      case "Admin":
        return "ADMIN";
      case "Encargado":
        return "SUPERVISOR";
      default:
        return null;
    }
  };

  /* ===================================================
      🔹 Qué roles puede crear este usuario
     =================================================== */
  const getAllowedTipos = () => {
    switch (currentUserRole) {
      case "SUPER_ADMIN":
        return ["Super Admin", "Admin", "Encargado"];
      case "ADMIN":
        return ["Encargado"];
      case "SUPERVISOR":
        return []; 
      default:
        return [];
    }
  };

  const allowedTipos = getAllowedTipos();
  const canCreateProfiles = allowedTipos.length > 0;

  /* ===================================================
      🔹 Toasts
     =================================================== */
  const mostrarToast = (texto, tipo = "success") => {
    if (tipo === "success") {
      setSuccess(texto);
      setToastError("");
    } else {
      setToastError(texto);
      setSuccess("");
    }
    setTimeout(() => {
      setSuccess("");
      setToastError("");
    }, 4000);
  };

  /* ===================================================
      🔹 Obtener usuarios desde backend
     =================================================== */
  useEffect(() => {
    const cargar = async () => {
      try {
        const data = await getUsers();
        setUsuarios(
          data.map((u) => ({
            ...u,
            normalizedRole: normalizeRole(u.role),
          }))
        );
      } catch (e) {
        console.error(e);
        mostrarToast("Error al cargar usuarios", "error");
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, []);

  /* ===================================================
      🔹 Form handlers
     =================================================== */
  const limpiarFormulario = () => {
    setNuevoUsuario({
      nombre: "",
      apellido: "",
      nombreUsuario: "",
      email: "",
      password: "",
      tipo: allowedTipos[0] || "",
    });
    setErrors({});
    setEditUser(null);
    setEditUserId(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNuevoUsuario((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validarCampos = () => {
    const { nombre, apellido, nombreUsuario, email, password, tipo } =
      nuevoUsuario;

    const newErrors = {};
    if (!nombre) newErrors.nombre = "El nombre es obligatorio.";
    if (!apellido) newErrors.apellido = "El apellido es obligatorio.";
    if (!nombreUsuario)
      newErrors.nombreUsuario = "El usuario es obligatorio.";
    if (!email) newErrors.email = "El correo es obligatorio.";
    if (!tipo) newErrors.tipo = "Seleccioná un rol.";
    if (!editUser && !password)
      newErrors.password = "La contraseña es obligatoria.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* ===================================================
      🔹 Crear / actualizar usuario
     =================================================== */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validarCampos()) return;

    try {
      const apiRole = mapTipoToRole(nuevoUsuario.tipo);

      if (editUser) {
        // EDITAR
        await updateUser(editUser.id, {
          name: nuevoUsuario.nombre,
          lastName: nuevoUsuario.apellido,
          username: nuevoUsuario.nombreUsuario,
          email: nuevoUsuario.email,
          role: editUser.normalizedRole,
        });

        setUsuarios((prev) =>
          prev.map((u) =>
            u.id === editUser.id
              ? {
                  ...u,
                  name: nuevoUsuario.nombre,
                  lastName: nuevoUsuario.apellido,
                  username: nuevoUsuario.nombreUsuario,
                  email: nuevoUsuario.email,
                }
              : u
          )
        );

        mostrarToast("Usuario actualizado correctamente");
      } else {
        // CREAR
        const created = await registerUser(
          nuevoUsuario.nombre,
          nuevoUsuario.apellido,
          nuevoUsuario.email,
          nuevoUsuario.nombreUsuario,
          nuevoUsuario.password,
          apiRole
        );

        setUsuarios((prev) => [
          ...prev,
          { ...created, normalizedRole: normalizeRole(created.role) },
        ]);

        mostrarToast("Usuario creado correctamente");
      }

      limpiarFormulario();
      setMostrarFormulario(false);
    } catch (err) {
      mostrarToast(err.message || "Error al guardar usuario", "error");
    }
  };

  /* ===================================================
      🔹 Eliminar usuario
     =================================================== */
  const handleDelete = async (id, roleRaw) => {
    const role = normalizeRole(roleRaw);

    if (!window.confirm("¿Seguro que querés eliminar esta cuenta?")) return;

    if (currentUserRole === "SUPERVISOR")
      return mostrarToast("No tenés permisos", "error");

    if (id === user.id)
      return mostrarToast("No podés eliminarte a vos mismo", "error");

    if (currentUserRole === "ADMIN" && ["ADMIN", "SUPER_ADMIN"].includes(role))
      return mostrarToast("No podés eliminar este usuario", "error");

    if (currentUserRole === "SUPER_ADMIN" && role === "SUPER_ADMIN")
      return mostrarToast(
        "No podés eliminar otro usuario Super Admin",
        "error"
      );

    try {
      await deleteUser(id);
      setUsuarios((prev) => prev.filter((u) => u.id !== id));
      mostrarToast("Usuario eliminado correctamente");
    } catch (err) {
      mostrarToast("Error al eliminar usuario", "error");
    }
  };

  /* ===================================================
      🔹 Habilitar / deshabilitar usuario
     =================================================== */
  const handleToggleEnabled = async (u) => {
    const role = normalizeRole(u.role);
    const newStatus = !u.enabled;

    if (u.id === user.id)
      return mostrarToast("No podés modificarte a vos mismo", "error");

    if (currentUserRole === "SUPERVISOR")
      return mostrarToast("No tenés permisos", "error");

    if (
      currentUserRole === "ADMIN" &&
      ["ADMIN", "SUPER_ADMIN"].includes(role)
    )
      return mostrarToast("No podés modificar este usuario", "error");

    try {
      await toggleUserStatus(u.id, newStatus);

      setUsuarios((prev) =>
        prev.map((x) =>
          x.id === u.id ? { ...x, enabled: newStatus } : x
        )
      );

      mostrarToast(
        newStatus ? "Usuario habilitado" : "Usuario deshabilitado"
      );
    } catch (err) {
      mostrarToast(err.message, "error");
    }
  };

  /* ===================================================
      🔹 Iniciar edición
     =================================================== */
  const startEdit = (u) => {
    setEditUser(u);
    setEditUserId(u.id);
    setMostrarFormulario(true);

    setNuevoUsuario({
      nombre: u.name,
      apellido: u.lastName,
      email: u.email,
      nombreUsuario: u.username,
      tipo: mapRoleToTipo(u.role),
      password: "",
    });
  };

  /* ===================================================
      🔹 Render
     =================================================== */
  return (
    <>
      {/* TOASTS */}
      <div className={styles.toastContainer}>
        {success && (
          <div className={`${styles.toast} ${styles.toastSuccess}`}>
            {success}
          </div>
        )}
        {toastError && (
          <div className={`${styles.toast} ${styles.toastError}`}>
            {toastError}
          </div>
        )}
      </div>

      <section className={styles.configContainer}>
        <div className={styles.header}>
          <h2>Configuración y permisos</h2>

          {canCreateProfiles && (
            <button
              className={styles.btnCrear}
              onClick={() => {
                limpiarFormulario();
                setMostrarFormulario(!mostrarFormulario);
              }}
            >
              {mostrarFormulario ? "Cancelar" : "+ Crear perfil"}
            </button>
          )}
        </div>

        <p>Gestión del personal según jerarquía de roles.</p>

        {/* FORMULARIO */}
        {mostrarFormulario && (
          <form className={styles.formContainer} onSubmit={handleSubmit}>
            {/* Nombre */}
            <input
              type="text"
              name="nombre"
              placeholder="Nombre"
              value={nuevoUsuario.nombre}
              onChange={handleChange}
              className={errors.nombre ? styles.inputError : ""}
            />
            {errors.nombre && (
              <p className={styles.errorInline}>{errors.nombre}</p>
            )}

            {/* Apellido */}
            <input
              type="text"
              name="apellido"
              placeholder="Apellido"
              value={nuevoUsuario.apellido}
              onChange={handleChange}
              className={errors.apellido ? styles.inputError : ""}
            />
            {errors.apellido && (
              <p className={styles.errorInline}>{errors.apellido}</p>
            )}

            {/* Usuario */}
            <input
              type="text"
              name="nombreUsuario"
              placeholder="Nombre de usuario"
              value={nuevoUsuario.nombreUsuario}
              onChange={handleChange}
              className={errors.nombreUsuario ? styles.inputError : ""}
            />
            {errors.nombreUsuario && (
              <p className={styles.errorInline}>
                {errors.nombreUsuario}
              </p>
            )}

            {/* Email */}
            <input
              type="email"
              name="email"
              placeholder="Correo electrónico"
              value={nuevoUsuario.email}
              onChange={handleChange}
              className={errors.email ? styles.inputError : ""}
            />
            {errors.email && (
              <p className={styles.errorInline}>{errors.email}</p>
            )}

            {/* Contraseña */}
            {!editUser && (
              <>
                <input
                  type="password"
                  name="password"
                  placeholder="Contraseña"
                  value={nuevoUsuario.password}
                  onChange={handleChange}
                  className={errors.password ? styles.inputError : ""}
                />
                {errors.password && (
                  <p className={styles.errorInline}>
                    {errors.password}
                  </p>
                )}
              </>
            )}

            {/* Rol */}
            <select
              name="tipo"
              value={nuevoUsuario.tipo}
              onChange={handleChange}
              className={errors.tipo ? styles.inputError : ""}
              disabled={!!editUser}
            >
              <option value="">Seleccionar rol</option>
              {allowedTipos.map((tipo) => (
                <option key={tipo} value={tipo}>
                  {tipo}
                </option>
              ))}
            </select>
            {errors.tipo && (
              <p className={styles.errorInline}>{errors.tipo}</p>
            )}

            <button type="submit" className={styles.btnConfirmar}>
              {editUser ? "Guardar cambios" : "Confirmar"}
            </button>
          </form>
        )}

        {/* TABLA */}
        {loading ? (
          <div className={styles.placeholderBox}>
            <p>Cargando usuarios...</p>
          </div>
        ) : usuarios.length > 0 ? (
          <table className={styles.tablaUsuarios}>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Apellido</th>
                <th>Usuario</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {usuarios.map((u) => {
                const realRole = normalizeRole(u.role);

                const canEdit =
                  u.id === user.id ||
                  currentUserRole === "SUPER_ADMIN" ||
                  (currentUserRole === "ADMIN" &&
                    ["SUPERVISOR", "USER"].includes(realRole));

                const canDelete =
                  currentUserRole === "SUPER_ADMIN" &&
                  realRole !== "SUPER_ADMIN" &&
                  u.id !== user.id;

                return (
                  <tr
                    key={u.id}
                    className={
                      editUserId === u.id ? styles.rowEditing : ""
                    }
                  >
                    <td>{u.name}</td>
                    <td>{u.lastName}</td>
                    <td>{u.username}</td>
                    <td>{u.email}</td>
                    <td>{mapRoleToTipo(realRole)}</td>

                    <td>
                      {canEdit && (
                        <button
                          className={styles.btnEditar}
                          onClick={() => startEdit(u)}
                        >
                          Editar
                        </button>
                      )}

                      {(currentUserRole === "SUPER_ADMIN" ||
                        currentUserRole === "ADMIN") &&
                        u.id !== user.id &&
                        ["SUPERVISOR", "USER"].includes(realRole) && (
                          <button
                            style={{
                              backgroundColor: u.enabled
                                ? "#b03a2e"
                                : "#27ae60",
                              color: "#fff",
                              border: "none",
                              borderRadius: "6px",
                              padding: "5px 10px",
                              cursor: "pointer",
                              marginRight: "4px",
                              fontSize: "13px",
                            }}
                            onClick={() => handleToggleEnabled(u)}
                          >
                            {u.enabled ? "Deshabilitar" : "Habilitar"}
                          </button>
                        )}

                      {canDelete && (
                        <button
                          className={styles.btnEliminar}
                          onClick={() => handleDelete(u.id, realRole)}
                        >
                          Eliminar
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className={styles.placeholderBox}>
            <p>⚙️ No hay perfiles creados todavía...</p>
          </div>
        )}
      </section>
    </>
  );
};

export default Configuracion;
