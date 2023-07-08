import React from "react";

import estilos from "./Enlace.module.css";
import { ProveedorRuta } from "./ProveedorRuta";

const Enlace = ({ children, to, decoracion = true }) => {
    function fnClick(cambiaRuta) {
        history.pushState(null, "", to);
        cambiaRuta(to);
    }

    function fnMouseUp(event) {
        if (event.button === 1) {
            event.preventDefault();
            event.stopPropagation();
            const win = window.open(to, "_blank");
            win.focus();
        }
    }

    return (
        <ProveedorRuta.Consumer>
            {(cambiaRuta) => (
                <span
                    className={
                        estilos.enlace +
                        " " +
                        (decoracion ? estilos.enlaceDecorado : "")
                    }
                    onClick={fnClick.bind(this, cambiaRuta)}
                    onMouseUp={fnMouseUp}
                >
                    {children}
                </span>
            )}
        </ProveedorRuta.Consumer>
    );
};

export default Enlace;
