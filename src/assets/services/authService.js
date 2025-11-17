// src/assets/services/authService.js
import api from "./api";

const AUTH_BASE = "/auth";

/* =========================================
   🔐 LOGIN
========================================= */
export const login = async (loginValue, password) => {
  try {
    console.log("🚀 Intentando iniciar sesión...");

    const response = await api.post(`${AUTH_BASE}/login`, {
      login: loginValue,
      password,
    });

    const { token } = response.data;

    if (!token) throw new Error("❌ No se recibió token del servidor.");

    localStorage.setItem("token", token);

    // ======================================
    // 🔍 Obtener usuario con /me
    // ======================================
    let me = {};
    try {
      const meResponse = await api.get(`${AUTH_BASE}/me`);
      me = meResponse.data || {};
    } catch (e) {
      console.warn("⚠️ Error al obtener /me:", e);
    }

    // 🚫 Bloqueo para usuarios con rol USER
    if (me.role === "USER") {
      localStorage.removeItem("token");
      throw new Error("Tu cuenta no tiene permisos para acceder al CRM.");
    }

    localStorage.setItem("fitseoUser", JSON.stringify(me));

    return me;
  } catch (error) {
    console.error("❌ Error login:", error);

    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }

    if (error.request) {
      throw new Error("⚠️ No se pudo conectar con el servidor.");
    }

    throw new Error("⚠️ Error inesperado.");
  }
};

/* =========================================
   🆕 REGISTER USER
========================================= */
export const registerUser = async (
  name,
  lastName,
  email,
  username,
  password,
  role
) => {
  try {
    const response = await api.post(`${AUTH_BASE}/register`, {
      name,
      lastName,
      email,
      username,
      password,
      role,
    });

    return response.data;
  } catch (error) {
    console.error("❌ Error register:", error);

    const msg =
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Error al registrar usuario";

    throw new Error(msg);
  }
};

/* =========================================
   📋 GET USERS
========================================= */
export const getUsers = async () => {
  try {
    const response = await api.get(`${AUTH_BASE}/users`);
    return response.data || [];
  } catch (error) {
    console.error("❌ Error getUsers:", error);
    throw new Error("⚠️ No se pudieron cargar los usuarios del sistema.");
  }
};

/* =========================================
   ✏️ UPDATE USER
========================================= */
export const updateUser = async (id, data) => {
  try {
    const res = await api.put(`${AUTH_BASE}/users/${id}`, data);
    return res.data;
  } catch (error) {
    console.error("❌ Error updateUser:", error.response?.data || error);

    const msg =
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Error al actualizar usuario";

    throw new Error(msg);
  }
};

/* =========================================
   🔄 HABILITAR / DESHABILITAR USUARIO
========================================= */
export const toggleUserStatus = async (id, enabled) => {
  try {
    const res = await api.patch(
      `${AUTH_BASE}/users/${id}/status?enabled=${enabled}`
    );
    return res.data;
  } catch (error) {
    console.error("❌ Error toggleUserStatus:", error.response?.data || error);

    const msg =
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Error al actualizar el estado del usuario";

    throw new Error(msg);
  }
};

/* =========================================
   🗑️ DELETE USER
========================================= */
export const deleteUser = async (id) => {
  try {
    const res = await api.delete(`${AUTH_BASE}/users/${id}`);
    return res.data;
  } catch (error) {
    console.error("❌ Error deleteUser:", error.response?.data || error);

    const msg =
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Error al eliminar usuario";

    throw new Error(msg);
  }
};
