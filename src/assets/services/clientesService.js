// 📁 src/assets/services/clientesService.js
import api from "./api";

/* ===================================================
   🔹 OBTENER TODOS LOS CLIENTES
   =================================================== */
export const obtenerClientes = async () => {
  try {
    console.log("📡 Obteniendo clientes desde el backend...");
    const res = await api.get("/clients");
    console.log("✅ Clientes recibidos:", res.data);
    return res.data;
  } catch (error) {
    console.error(
      "❌ Error al obtener clientes:",
      error.response?.data || error.message
    );
    throw error;
  }
};

/* ===================================================
   🔹 OBTENER UN CLIENTE POR DOCUMENTO (DNI)
   =================================================== */
export const obtenerClientePorDocumento = async (documento) => {
  try {
    console.log(`🔍 Buscando cliente con documento ${documento}...`);
    const res = await api.get(`/clients/${documento}`);
    console.log("✅ Cliente encontrado:", res.data);
    return res.data;
  } catch (error) {
    console.error(
      `❌ Error al obtener cliente ${documento}:`,
      error.response?.data || error.message
    );
    throw error;
  }
};

/* ===================================================
   🔹 BUSCAR CLIENTES POR NOMBRE
   =================================================== */
export const buscarClientesPorNombre = async (nombre) => {
  try {
    console.log(`🔍 Buscando clientes por nombre: ${nombre}`);
    const res = await api.get(`/clients/search?name=${nombre}`);
    console.log("✅ Resultados de búsqueda:", res.data);
    return res.data;
  } catch (error) {
    console.error(
      "❌ Error al buscar clientes por nombre:",
      error.response?.data || error.message
    );
    throw error;
  }
};

/* ===================================================
   🔹 CREAR UN NUEVO CLIENTE
   =================================================== */
export const crearCliente = async (cliente) => {
  try {
    console.log("📦 Enviando cliente al backend:", cliente);
    const res = await api.post("/clients", cliente);
    console.log("✅ Cliente creado correctamente:", res.data);
    return res.data;
  } catch (error) {
    console.error(
      "❌ Error al crear cliente:",
      error.response?.data || error.message
    );
    throw error;
  }
};

/* ===================================================
   🔹 ACTUALIZAR UN CLIENTE EXISTENTE
   =================================================== */
export const actualizarCliente = async (idClient, cliente) => {
  try {
    console.log(`🛠️ Actualizando cliente ID ${idClient}...`);
    const res = await api.put(`/clients/${idClient}`, cliente);
    console.log("✅ Cliente actualizado:", res.data);
    return res.data;
  } catch (error) {
    console.error(
      `❌ Error al actualizar cliente ${idClient}:`,
      error.response?.data || error.message
    );
    throw error;
  }
};

/* ===================================================
   🔹 ELIMINAR UN CLIENTE
   =================================================== */
export const eliminarCliente = async (idClient) => {
  try {
    console.log(`🗑️ Eliminando cliente ID ${idClient}...`);
    const res = await api.delete(`/clients/${idClient}`);
    console.log("✅ Cliente eliminado:", res.data);
    return res.data;
  } catch (error) {
    console.error(
      `❌ Error al eliminar cliente ${idClient}:`,
      error.response?.data || error.message
    );
    throw error;
  }
};
