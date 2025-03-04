import React from "react";

import estilos from "./Progreso.module.css";

const Progreso = ({ visible = true }) => {
    if (visible !== true) {
        return null;
    }

    return (
        <div className={estilos.contenedorProgreso}>
            <div className={estilos.puntosProgreso}></div>
        </div>
    );
};

export default Progreso;
