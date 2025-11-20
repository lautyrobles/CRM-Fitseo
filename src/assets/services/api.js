// src/assets/services/api.js
import axios from "axios";

const api = axios.create({
  baseURL: "https://crmgym-api-test-czbbe4hkdpcaaqhk.chilecentral-01.azurewebsites.net/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// ===============================
// 🔐 Interceptor → Adjuntar Token
// ===============================
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;

    console.log("📤 REQUEST →", config.method?.toUpperCase(), config.url, config);
    return config;
  },
  (error) => Promise.reject(error)
);

// ===============================
// 📥 Interceptor → Manejo de Errores
// ===============================
api.interceptors.response.use(
  (response) => {
    console.log("📥 RESPONSE ←", response.status, response.data);
    return response;
  },
  (error) => {
    console.error("❌ AXIOS ERROR:", {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });

    // Caso típico Azure: 403 por token inválido o expirado
    if (error.response?.status === 403 || error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("fitseoUser");
      window.location.href = "/";
    }

    return Promise.reject(error);
  }
);

export default api;
