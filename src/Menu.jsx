import React, { useEffect, useRef, useState } from "react";

import estilos from "./Menu.module.css";
import Boton from "./elementos/Boton";

const Menu = props => {
    const isMounted = useRef(false);

    useEffect(() => {
        // Constructor
        isMounted.current = true;
    }, []);

    return (
        <div className={estilos.contenedorApp}>
            <div className={estilos.appbar}>
                <div>
                    <b>Planificador de Expansiones</b>
                </div>

                <span className={estilos.separadorDerecha}></span>

            </div>

            <div className={estilos.contenedorAplicacion}>
                <div>
                    
                </div>
            </div>
        </div>
    );
};

export default Menu;
