import React, { useState } from 'react';
import styles from './Soporte.module.css';

const Soporte = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    categoria: 'general',
    descripcion: '',
  });
  const [enviado, setEnviado] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Aquí podrías hacer la llamada al backend cuando esté listo
    console.log('Datos enviados:', formData);
    setEnviado(true);
  };

  return (
    <section className={styles.soporteContainer}>
      <h2>Soporte Técnico</h2>
      <p>¿Tenés algún inconveniente con FitSEO CRM? Nuestro equipo está listo para ayudarte.</p>

      <div className={styles.formBox}>
        {enviado ? (
          <div className={styles.mensajeExito}>
            <h3>¡Gracias!</h3>
            <p>Hemos recibido tu solicitud de soporte y nos pondremos en contacto a la brevedad.</p>
          </div>
        ) : (
          <form className={styles.formulario} onSubmit={handleSubmit}>
            <div className={styles.fieldGroup}>
              <label htmlFor="nombre">Nombre completo</label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                required
                placeholder="Tu nombre y apellido"
              />
            </div>

            <div className={styles.fieldGroup}>
              <label htmlFor="email">Correo electrónico</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="ejemplo@correo.com"
              />
            </div>

            <div className={styles.fieldGroup}>
              <label htmlFor="categoria">Empresa</label>
              <select
                id="categoria"
                name="categoria"
                value={formData.categoria}
                onChange={handleChange}
              >
                <option value="usuarios">FitnesMania</option>
              </select>
            </div>

            <div className={styles.fieldGroup}>
              <label htmlFor="categoria">Categoría del problema</label>
              <select
                id="categoria"
                name="categoria"
                value={formData.categoria}
                onChange={handleChange}
              >
                <option value="general">General</option>
                <option value="membresia">Membresía / Pago</option>
                <option value="usuarios">Usuarios / Accesos</option>
                <option value="tecnico">Problema técnico</option>
                <option value="otros">Otros</option>
              </select>
            </div>


            <div className={styles.fieldGroup}>
              <label htmlFor="descripcion">Descripción del inconveniente</label>
              <textarea
                id="descripcion"
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                required
                placeholder="Por favor describí lo que sucede, pasos que ya intentaste, imagenes si corresponde"
                rows="5"
              />
            </div>

            <button type="submit" className={styles.btnSubmit}>
              Confirmar
            </button>
          </form>
        )}
      </div>
    </section>
  );
};

export default Soporte;
