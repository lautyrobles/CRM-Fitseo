import React from "react";
import styles from "./Loader.module.css";

const Loader = ({ text = "Cargando..." }) => {
  return (
    <div className={styles.loaderContainer}>
      <div className={styles.spinner}></div>
      <p>{text}</p>
    </div>
  );
};

export default Loader;
