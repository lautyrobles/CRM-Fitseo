// src/assets/services/api.js
import axios from "axios";

const api = axios.create({
  baseURL: "https://crmgym-backend-production.up.railway.app/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// 🔐 Interceptor de autenticación
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;

