import React, { useState } from "react";
import styles from "./Clientes.module.css";

// 🧱 Componentes parciales
import ClienteInfoCard from "./ClienteInfoCard";
import AsistenciaCard from "./AsistenciaCard";
import PagosCard from "./PagosCard";
import EstadoCard from "./EstadoCard";
import PlanCard from "./PlanCard";

// 📦 Servicios
import {
  obtenerClientes,
  obtenerClientePorDocumento,
} from "../../assets/services/clientesService";

const Clientes = () => {
  const [busqueda, setBusqueda] = useState("");
  const [filtroActivo, setFiltroActivo] = useState("nombre");
  const [cliente, setCliente] = useState(null);
  const [clientesCoincidentes, setClientesCoincidentes] = useState([]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [busquedaRealizada, setBusquedaRealizada] = useState(false);
  const [inputInvalido, setInputInvalido] = useState(false);
  const [mensajeTemporal, setMensajeTemporal] = useState("");

  /* ===================================================
     🔹 Buscar cliente
     =================================================== */
  const handleBuscar = async () => {
    if (!busqueda.trim()) {
      setInputInvalido(true);
      setMensajeTemporal("Ingrese un valor por favor");
      setTimeout(() => {
        setInputInvalido(false);
        setMensajeTemporal("");
      }, 2500);
      return;
    }

    setLoading(true);
    setError("");
    setCliente(null);
    setClientesCoincidentes([]);
    setBusquedaRealizada(true);

    try {
      let resultados = [];

      if (filtroActivo === "dni" && /^\d+$/.test(busqueda)) {
        // 🔍 Buscar por documento exacto
        const data = await obtenerClientePorDocumento(busqueda);
        resultados = Array.isArray(data) ? data : data ? [data] : [];
      } else if (filtroActivo === "nombre") {
        // 🔍 Búsqueda flexible por nombre / apellido / combinación
        const clientes = await obtenerClientes();
        const termino = busqueda.toLowerCase().trim();

        resultados = clientes.filter((c) => {
          const nombre = c.name?.toLowerCase().trim() || "";
          const apellido = c.lastName?.toLowerCase().trim() || "";
          const nombreCompleto = `${nombre} ${apellido}`.trim();
          const nombreReverso = `${apellido} ${nombre}`.trim();

          return (
            nombre.includes(termino) ||
            apellido.includes(termino) ||
            nombreCompleto.includes(termino) ||
            nombreReverso.includes(termino)
          );
        });

        // 🔍 Si hay varios con el mismo nombre completo exacto → modal
        const mismoNombreCompleto = clientes.filter((c) => {
          const nombre = c.name?.toLowerCase().trim() || "";
          const apellido = c.lastName?.toLowerCase().trim() || "";
          const nombreCompleto = `${nombre} ${apellido}`.trim();
          return nombreCompleto === termino;
        });

        if (mismoNombreCompleto.length > 1) {
          setClientesCoincidentes(mismoNombreCompleto);
          setMostrarModal(true);
          setCliente(null);
          setLoading(false);
          return;
        }

        // 🔍 Si hay múltiples resultados parciales → modal
        if (resultados.length > 1) {
          setClientesCoincidentes(resultados);
          setMostrarModal(true);
          setCliente(null);
          setLoading(false);
          return;
        }
      }

      // ✅ Un solo resultado
      if (resultados.length === 1) {
        setCliente(resultados[0]);
        return;
      }

      // ❌ Nada
      setError("No se encontraron clientes con ese criterio.");
    } catch (err) {
      console.error("❌ Error en la búsqueda:", err);
      setError("Error al buscar el cliente. Intente nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  /* ===================================================
     🔹 Limpiar búsqueda
     =================================================== */
  const handleLimpiar = () => {
    setBusqueda("");
    setFiltroActivo("nombre");
    setCliente(null);
    setError("");
    setBusquedaRealizada(false);
    setClientesCoincidentes([]);
    setMostrarModal(false);
    setInputInvalido(false);
    setMensajeTemporal("");
  };

  /* ===================================================
     🔹 Enter para buscar
     =================================================== */
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleBuscar();
    }
  };

  /* ===================================================
     🔹 Seleccionar cliente desde el modal
     =================================================== */
  const handleSeleccionarCliente = (c) => {
    setCliente(c);
    setMostrarModal(false);
  };

  /* ===================================================
     🔹 Render principal
     =================================================== */
  return (
    <section className={styles.clientesContainer}>
      {/* 🔍 Buscador */}
      <div className={styles.gestionContainer}>
        <h2 className={styles.title}>Buscar usuario</h2>

        {/* ⚠️ Mensaje temporal fijo a la izquierda */}
        {mensajeTemporal && (
          <p className={styles.warningText}>{mensajeTemporal}</p>
        )}

        <div className={styles.filtrosContainer}>
          <input
            type="text"
            placeholder={`Buscar cliente por ${filtroActivo}...`}
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            onKeyDown={handleKeyDown}
            className={`${styles.inputBuscar} ${
              inputInvalido ? styles.inputError : ""
            }`}
          />

          {/* Botones de filtro */}
          <button
            className={`${styles.btnFiltro} ${
              filtroActivo === "nombre" ? styles.btnActivo : ""
            }`}
            onClick={() => setFiltroActivo("nombre")}
          >
            Nombre / Apellido
          </button>

          <button
            className={`${styles.btnFiltro} ${
              filtroActivo === "dni" ? styles.btnActivo : ""
            }`}
            onClick={() => setFiltroActivo("dni")}
          >
            DNI
          </button>

          {/* Botones de acción */}
          <button onClick={handleBuscar} className={styles.btnBuscar}>
            Buscar
          </button>
          <button onClick={handleLimpiar} className={styles.btnLimpiar}>
            Limpiar
          </button>
        </div>
      </div>

      {/* 🌀 Loader */}
      {loading && (
        <div className={styles.loaderContainer}>
          <div className={styles.loader}></div>
          <p>Buscando cliente...</p>
        </div>
      )}

      {/* ⚙️ Render condicional luego de la búsqueda */}
      {!loading && busquedaRealizada && (
        <>
          {error ? (
            <div
              style={{
                textAlign: "center",
                marginTop: "20px",
                color: "#e34c67",
              }}
            >
              <p>{error}</p>
            </div>
          ) : cliente ? (
            <div className={styles.gridContainer}>
              <ClienteInfoCard
                cliente={{
                  nombre: cliente?.name || "Sin nombre",
                  apellido: cliente?.lastName || "",
                  dni: cliente?.document || "-",
                  direccion: cliente?.address || "No registrada",
                  telefono: cliente?.phoneNumber || "-",
                  email: cliente?.email || "-",
                  cuit: cliente?.cuit || "-",
                }}
              />
              <AsistenciaCard />
              <PagosCard cliente={cliente} />
              <EstadoCard estado={cliente?.status || "Activo"} />
              <PlanCard plan={cliente?.namePlan || "Sin plan"} />
            </div>
          ) : (
            <div
              style={{
                textAlign: "center",
                marginTop: "20px",
                color: "#263640",
              }}
            >
              <p>No se encontraron resultados para la búsqueda.</p>
            </div>
          )}
        </>
      )}

      {/* 🪟 Modal de selección múltiple */}
      {mostrarModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h3>Se encontraron varios clientes</h3>
            <table className={styles.modalTable}>
              <thead>
                <tr>
                  <th>DNI</th>
                  <th>Nombre</th>
                  <th>Apellido</th>
                  <th>Email</th>
                  <th>Teléfono</th>
                  <th>Plan</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {clientesCoincidentes.map((c) => (
                  <tr key={c.document}>
                    <td>{c.document}</td>
                    <td>{c.name}</td>
                    <td>{c.lastName}</td>
                    <td>{c.email}</td>
                    <td>{c.phoneNumber}</td>
                    <td>{c.namePlan || "-"}</td>
                    <td>
                      <button
                        onClick={() => handleSeleccionarCliente(c)}
                        className={styles.btnSeleccionar}
                      >
                        Seleccionar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className={styles.modalFooter}>
              <button
                onClick={() => setMostrarModal(false)}
                className={styles.btnCerrarModal}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Clientes;
