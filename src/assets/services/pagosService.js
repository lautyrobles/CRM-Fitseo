// 📁 src/assets/services/pagosService.js
import api from "./api";

/* ===================================================
   🔹 LISTAR TODOS LOS PAGOS
   =================================================== */
export const obtenerPagos = async () => {
  try {
    console.log("📡 Obteniendo todos los pagos...");
    const res = await api.get("/payments");
    return res.data;
  } catch (error) {
    console.error("❌ Error al obtener pagos:", error.response?.data || error.message);
    throw error;
  }
};

/* ===================================================
   🔹 BUSCAR PAGOS POR CLIENTE (documento)
   =================================================== */
export const obtenerPagosPorCliente = async (documento) => {
  try {
    console.log(`📄 Obteniendo pagos del cliente con documento ${documento}...`);
    const res = await api.get(`/payments/client/${documento}`);
    return res.data;
  } catch (error) {
    console.error(
      `❌ Error al obtener pagos del cliente ${documento}:`,
      error.response?.data || error.message
    );
    throw error;
  }
};

/* ===================================================
   🔹 REGISTRAR UN NUEVO PAGO
   =================================================== */
export const crearPago = async (pago) => {
  try {
    console.log("💰 Registrando nuevo pago:", pago);
    const res = await api.post("/payments", pago);
    console.log("✅ Pago registrado correctamente:", res.data);
    return res.data;
  } catch (error) {
    console.error("❌ Error al registrar pago:", error.response?.data || error.message);
    throw error;
  }
};
