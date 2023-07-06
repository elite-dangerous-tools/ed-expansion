import React from "react";

import estilos from "./Boton.module.css";

const Boton = ({ children, desactivado, fnClick }) => {
    return (
        <button
            disabled={desactivado}
            onClick={fnClick}
            className={estilos.materialButton}
        >
            {children}
        </button>
    );
};

export default Boton;
