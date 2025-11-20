// src/assets/services/authService.js
import api from "./api";

/* ===================================================
   🔐 LOGIN
   loginValue → username o email
   password  → contraseña
=================================================== */
export const login = async (loginValue, password) => {
  try {
    const response = await api.post(`/auth/login`, {
      login: loginValue,
      password,
    });

    const { token } = response.data;
    if (!token) throw new Error("El servidor no envió el token.");

    localStorage.setItem("token", token);

    // ===============================
    // 🔍 Obtener /me
    // ===============================
    const meResponse = await api.get(`/auth/me`);
    const me = meResponse.data;

    // Normalizar rol
    me.role = me.role?.replace("ROLE_", "").toUpperCase();

    // Bloquear usuarios comunes
    if (me.role === "USER") {
      localStorage.clear();
      throw new Error("Tu cuenta no tiene permisos para acceder al CRM.");
    }

    localStorage.setItem("fitseoUser", JSON.stringify(me));

    return me;
  } catch (e) {
    console.error("❌ Error login:", e);

    if (e.response?.data?.message) throw new Error(e.response.data.message);
    if (e.response?.data?.error) throw new Error(e.response.data.error);

    throw new Error("Error al iniciar sesión.");
  }
};

/* ===================================================
   🆕 REGISTER USER
=================================================== */
export const registerUser = async (
  name,
  lastName,
  email,
  username,
  password,
  role
) => {
  try {
    const response = await api.post(`/auth/register`, {
      name,
      lastName,
      email,
      username,
      password,
      role,
    });

    return response.data;
  } catch (e) {
    console.error("❌ Error register:", e);

    const msg =
      e.response?.data?.message ||
      e.response?.data?.error ||
      "No se pudo crear el usuario";

    throw new Error(msg);
  }
};

/* ===================================================
   📋 GET USERS
=================================================== */
export const getUsers = async () => {
  try {
    const res = await api.get(`/auth/users`);
    return res.data.map((u) => ({
      ...u,
      role: u.role?.replace("ROLE_", "").toUpperCase(),
    }));
  } catch (e) {
    console.error("❌ Error al obtener usuarios:", e);
    throw new Error("No se pudieron cargar los usuarios.");
  }
};

/* ===================================================
   ✏️ UPDATE USER
=================================================== */
export const updateUser = async (id, data) => {
  try {
    const res = await api.put(`/auth/users/${id}`, data);
    return res.data;
  } catch (e) {
    console.error("❌ Error al actualizar usuario:", e);
    const msg =
      e.response?.data?.message ||
      e.response?.data?.error ||
      "Error al actualizar usuario";
    throw new Error(msg);
  }
};

/* ===================================================
   🔄 HABILITAR / DESHABILITAR USUARIO
=================================================== */
export const toggleUserStatus = async (id, enabled) => {
  try {
    const res = await api.patch(
      `/auth/users/${id}/status?enabled=${enabled}`
    );
    return res.data;
  } catch (e) {
    console.error("❌ Error toggleUserStatus:", e);
    const msg =
      e.response?.data?.message ||
      e.response?.data?.error ||
      "No se pudo cambiar el estado del usuario";
    throw new Error(msg);
  }
};

/* ===================================================
   🗑️ DELETE USER
=================================================== */
export const deleteUser = async (id) => {
  try {
    const res = await api.delete(`/auth/users/${id}`);
    return res.data;
  } catch (e) {
    console.error("❌ Error deleteUser:", e);

    const msg =
      e.response?.data?.message ||
      e.response?.data?.error ||
      "No se pudo eliminar el usuario";

    throw new Error(msg);
  }
};
