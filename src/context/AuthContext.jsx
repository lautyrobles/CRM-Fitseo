import React, { createContext, useContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import api from "../assets/services/api";
import { login as loginAPI } from "../assets/services/authService";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [tokenExp, setTokenExp] = useState(null);
  const [showSessionPopup, setShowSessionPopup] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);

  // =====================================================
  // 🔹 Cargar sesión guardada al iniciar
  // =====================================================
  useEffect(() => {
    const storedUser = localStorage.getItem("fitseoUser");
    const token = localStorage.getItem("token");

    if (storedUser && token) {
      try {
        const parsed = JSON.parse(storedUser);
        const decoded = jwtDecode(token);

        // 🚫 Bloqueo para usuarios con rol USER
        if (parsed.role === "USER") {
          localStorage.removeItem("token");
          localStorage.removeItem("fitseoUser");
          return;
        }

        setUser(parsed);
        setTokenExp(decoded.exp * 1000);
      } catch (e) {
        logout();
      }
    }
  }, []);

  // =====================================================
  // 🔐 Login
  // =====================================================
  const login = async ({ usuario, password }) => {
    try {
      await loginAPI(usuario, password);

      const token = localStorage.getItem("token");
      const storedUser = localStorage.getItem("fitseoUser");

      if (!token || !storedUser) return false;

      const parsedUser = JSON.parse(storedUser);

      // 🚫 Bloqueo absoluto al rol USER
      if (parsedUser.role === "USER") {
        localStorage.removeItem("token");
        localStorage.removeItem("fitseoUser");
        throw new Error("Tu cuenta no tiene permisos para acceder al CRM.");
      }

      setUser(parsedUser);

      try {
        const decoded = jwtDecode(token);
        setTokenExp(decoded.exp * 1000);
      } catch {}

      return true;
    } catch (error) {
      console.error("Error en login (AuthContext):", error);
      return false;
    }
  };

  // =====================================================
  // 🔓 Logout
  // =====================================================
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("fitseoUser");
    setUser(null);
    setTokenExp(null);
    setShowSessionPopup(false);
    setSecondsLeft(0);
    window.location.href = "/";
  };

  // =====================================================
  // 🔁 Auto-refresh token
  // =====================================================
  const refreshSession = async () => {
    try {
      const oldToken = localStorage.getItem("token");
      if (!oldToken) return logout();

      const response = await api.post("/auth/refresh-token", {
        token: oldToken,
      });

      const newToken = response.data.token;
      if (!newToken) return logout();

      localStorage.setItem("token", newToken);

      const decoded = jwtDecode(newToken);
      setTokenExp(decoded.exp * 1000);

      setShowSessionPopup(false);
      setSecondsLeft(0);
    } catch (e) {
      logout();
    }
  };

  // =====================================================
  // ⏰ Intervalo para mostrar popup
  // =====================================================
  useEffect(() => {
    if (!tokenExp) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const diff = tokenExp - now;

      if (diff < 120000 && diff > 0) {
        setShowSessionPopup(true);
        setSecondsLeft(Math.floor(diff / 1000));
      }

      if (diff <= 0) {
        logout();
      }
    }, 20000);

    return () => clearInterval(interval);
  }, [tokenExp]);

  // =====================================================
  // ⏳ Timer 1s cuando el popup está activo
  // =====================================================
  useEffect(() => {
    if (!showSessionPopup) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const diff = tokenExp - now;

      if (diff <= 0) {
        logout();
      } else {
        setSecondsLeft(Math.floor(diff / 1000));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [showSessionPopup, tokenExp]);

  // =====================================================
  // 🧩 Popup
  // =====================================================
  const SessionPopup = () =>
    showSessionPopup ? (
      <div style={popupStyles.overlay}>
        <div style={popupStyles.box}>
          <h3 style={popupStyles.title}>⚠️ Tu sesión está por expirar</h3>
          <p style={popupStyles.text}>
            Se cerrará en <b>{secondsLeft}</b> segundos.
          </p>

          <button style={popupStyles.btnPrimary} onClick={refreshSession}>
            Extender sesión
          </button>

          <button style={popupStyles.btnSecondary} onClick={logout}>
            Cerrar sesión
          </button>
        </div>
      </div>
    ) : null;

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
      <SessionPopup />
    </AuthContext.Provider>
  );
};

// =====================================================
// 🧩 Estilos popup
// =====================================================
const popupStyles = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.45)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
  },
  box: {
    background: "#fff",
    padding: "28px 32px",
    borderRadius: "14px",
    width: "360px",
    textAlign: "center",
    fontFamily: "Inter, sans-serif",
    boxShadow: "0 3px 12px rgba(0,0,0,0.1)",
  },
  title: {
    fontSize: "18px",
    color: "#263640",
    marginBottom: "8px",
  },
  text: {
    fontSize: "14px",
    color: "#555",
  },
  btnPrimary: {
    marginTop: "16px",
    width: "100%",
    padding: "10px",
    borderRadius: "8px",
    background: "#28b16d",
    color: "#fff",
    fontWeight: "600",
    border: "none",
    cursor: "pointer",
  },
  btnSecondary: {
    marginTop: "10px",
    width: "100%",
    padding: "10px",
    borderRadius: "8px",
    background: "#e34c67",
    color: "#fff",
    fontWeight: "600",
    border: "none",
    cursor: "pointer",
  },
};

export const useAuth = () => useContext(AuthContext);
