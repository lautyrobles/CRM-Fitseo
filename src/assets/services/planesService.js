// src/assets/services/planesService.js
import api from "./api";

/* =========================================
   🟢 OBTENER TODOS LOS PLANES
========================================= */
export const obtenerPlanes = async () => {
  try {
    const res = await api.get("/plans");
    return res.data; // Backend devuelve: [{ idPlan, namePlan, status, ... }]
  } catch (error) {
    console.error("❌ Error al obtener planes:", error.response?.data || error.message);
    throw error;
  }
};

/* =========================================
   🟡 CREAR UN PLAN
========================================= */
export const crearPlan = async (plan) => {
  try {
    const res = await api.post("/plans", plan);
    return res.data;
  } catch (error) {
    console.error("❌ Error al crear plan:", error.response?.data || error.message);
    throw error;
  }
};

/* =========================================
   🟠 ACTUALIZAR PLAN
========================================= */
export const actualizarPlan = async (id, plan) => {
  try {
    const res = await api.put(`/plans/${id}`, plan);
    return res.data;
  } catch (error) {
    console.error("❌ Error al actualizar plan:", error.response?.data || error.message);
    throw error;
  }
};

/* =========================================
   🟣 CAMBIAR ESTADO
   ⚠️ Azure requiere YES/NO en query param:
   /plans/{id}/status?active=true|false
========================================= */
export const cambiarEstadoPlan = async (id, active) => {
  try {
    const booleanStr = active ? "true" : "false";

    console.log(`🔁 Cambiando estado del plan ${id} → ${booleanStr}`);

    const res = await api.patch(`/plans/${id}/status?active=${booleanStr}`);

    return res.data;
  } catch (error) {
    console.error(
      "❌ Error al cambiar estado:",
      error.response?.data || error.message
    );
    throw error;
  }
};

/* =========================================
   🔵 FILTRAR POR ESTADO
========================================= */
export const filtrarPlanesPorEstado = async (activo = true) => {
  try {
    const res = await api.get(`/plans/filter?active=${activo}`);
    return res.data;
  } catch (error) {
    console.error("❌ Error al filtrar planes:", error.response?.data || error.message);
    throw error;
  }
};
