// src/assets/services/planesService.js
import api from "./api";

// 🟢 Obtener todos los planes
export const obtenerPlanes = async () => {
  try {
    const res = await api.get("/plans");
    console.log("✅ Planes obtenidos:", res.data);
    return res.data;
  } catch (error) {
    console.error("❌ Error al obtener planes:", error.response?.data || error.message);
    throw error;
  }
};

// 🟡 Crear un nuevo plan
export const crearPlan = async (plan) => {
  try {
    console.log("📦 Enviando plan al backend:", plan);
    const res = await api.post("/plans", plan);
    console.log("✅ Plan creado:", res.data);
    return res.data;
  } catch (error) {
    console.error("❌ Error al crear plan:", error.response?.data || error.message);
    throw error;
  }
};

// 🟠 Actualizar un plan existente
export const actualizarPlan = async (id, plan) => {
  try {
    console.log(`✏️ Actualizando plan con ID ${id}:`, plan);
    const res = await api.put(`/plans/${id}`, plan);
    console.log("✅ Plan actualizado:", res.data);
    return res.data;
  } catch (error) {
    console.error(`❌ Error al actualizar plan ${id}:`, error.response?.data || error.message);
    throw error;
  }
};

// 🟣 Cambiar el estado de un plan (activo/inactivo)
export const cambiarEstadoPlan = async (id, active) => {
  try {
    console.log(`🔁 Cambiando estado del plan ${id} a ${active ? "Activo" : "Inactivo"}`);
    const res = await api.patch(`/plans/${id}/status?active=${active}`);
    console.log("✅ Estado actualizado:", res.data);
    return res.data;
  } catch (error) {
    console.error(`❌ Error al cambiar estado del plan ${id}:`, error.response?.data || error.message);
    throw error;
  }
};

// 🔵 Filtrar planes por estado (opcional)
export const filtrarPlanesPorEstado = async (activo = true) => {
  try {
    const res = await api.get(`/plans/filter?active=${activo}`);
    console.log("✅ Planes filtrados:", res.data);
    return res.data;
  } catch (error) {
    console.error("❌ Error al filtrar planes:", error.response?.data || error.message);
    throw error;
  }
};
