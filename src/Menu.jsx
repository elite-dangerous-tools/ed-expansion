import React, { useEffect, useRef, useState } from "react";

import estilos from "./Menu.module.css";
import Busqueda from "./Busqueda";

const Menu = props => {
    const isMounted = useRef(false);

    const [sistema, setSistema] = useState(0);

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
                <Busqueda sistema={sistema} setSistema={setSistema} />
            </div>
        </div>
    );
};

export default Menu;
