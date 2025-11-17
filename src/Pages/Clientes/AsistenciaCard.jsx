import React from "react";
import styles from "./AsistenciaCard.module.css";
import { useEffect } from "react";

const AsistenciaCard = () => {
  // Simulación de asistencia (true = asistió, false = no asistió)
  const asistencia30dias = Array.from({ length: 30 }, () =>
    Math.random() > 0.3
  );

  return (
    <section
      className={styles.cardAsistencia}
    >
      <div className={styles.calendarContainer} data-aos="fade-up">
        <div className={styles.divCalendar}>
          <h4>Asistencia - <span>Noviembre</span></h4>

          <div className={styles.weekDays}>
            {["L", "M", "X", "J", "V", "S", "D"].map((d, idx) => (
              <div key={idx} className={styles.weekDay}>
                {d}
              </div>
            ))}
          </div>

          <div className={styles.calendar}>
            {asistencia30dias.map((dia, idx) => {
              const dayOfWeek = idx % 7;
              const delay = idx * 30; // delay escalonado

              return (
                <div
                  key={idx}
                  className={`${styles.calendarDay} ${
                    dia ? styles.active : ""
                  } ${dayOfWeek === 6 ? styles.domingo : ""}`}
                  title={`Día ${idx + 1}: ${dia ? "Asistió" : "No asistió"}`}
                  data-aos="fade-up"
                  data-aos-delay={delay}
                  data-aos-duration="300"
                >
                  {idx + 1}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AsistenciaCard;