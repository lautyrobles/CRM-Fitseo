// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { login as loginAPI } from "../assets/services/authService";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  /* ===================================================
      🔄 Cargar sesión guardada
     =================================================== */
  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("fitseoUser");

    if (!token || !storedUser) return;

    try {
      const parsed = JSON.parse(storedUser);

      // ⭐ Normalizamos roles del backend (ROLE_X → X)
      const normalizedRole =
        parsed.role?.replace("ROLE_", "") || parsed.role;

      // ❌ Evitar acceso a USER
      if (normalizedRole === "USER") {
        console.warn("⛔ Usuario USER bloqueado");
        localStorage.clear();
        return;
      }

      setUser({ ...parsed, role: normalizedRole });
    } catch (err) {
      console.error("❌ Error cargando sesión:", err);
      logout();
    }
  }, []);

  /* ===================================================
      🔐 LOGIN
     =================================================== */
  const login = async ({ usuario, password }) => {
    console.log("🔐 Login ejecutado con:", usuario);

    try {
      const data = await loginAPI(usuario, password); // authService ya trae rol normalizado

      if (!data) return false;

      // ⭐ Normalizar rol siempre
      const normalizedRole =
        data.role?.replace("ROLE_", "") || data.role;

      if (normalizedRole === "USER") {
        console.warn("⛔ Usuario bloqueado (USER)");
        logout();
        throw new Error("Tu cuenta no tiene permisos para acceder al CRM.");
      }

      const fixedUser = { ...data, role: normalizedRole };

      setUser(fixedUser);

      console.log("✅ Login OK — usuario:", fixedUser);
      return true;
    } catch (err) {
      console.error("❌ Error en login(AuthContext):", err);
      return false;
    }
  };

  /* ===================================================
      🔓 LOGOUT
     =================================================== */
  const logout = () => {
    console.log("🔒 Logout ejecutado");
    localStorage.removeItem("token");
    localStorage.removeItem("fitseoUser");
    setUser(null);
    window.location.href = "/";
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
