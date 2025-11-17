import React from "react";
import styles from "./PlanCard.module.css";

const PlanCard = ({ plan }) => {
  return (
    <div className={styles.cardPlan}>
      <h3>Plan Contratado</h3>
      <p>{plan}</p>
    </div>
  );
};

export default PlanCard;
