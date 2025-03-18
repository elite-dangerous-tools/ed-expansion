import React, { useEffect, useRef, useState } from "react";

import estilos from "./Busqueda.module.css";
import Boton from "../../elementos/Boton";
import Enlace from "../../elementos/Enlace";
import { dameBusqueda } from "../../utilidades";

const Busqueda = (props) => {
    const isMounted = useRef(false);

    const [sistemaBuscar, setSistemaBuscar] = useState(dameBusqueda());
    const [sistemas, setSistemas] = useState([]);

    useEffect(() => {
        // Constructor
        isMounted.current = true;

        if (sistemaBuscar) {
            buscarSistemas();
        }
    }, []);

    function cambiaTexto(evento) {
        setSistemaBuscar(evento.target.value);
    }

    function pulsaTecla(evento) {
        if (evento.key === "Enter" || evento.keyCode === 13) {
            buscarSistemas();
        }
    }

    async function buscarSistemas() {
        if (!sistemaBuscar.length > 0) {
            return;
        }

        history.pushState(null, "", "?buscar=" + sistemaBuscar);

        let response = await fetch(
            "https://www.edsm.net/api-v1/systems?systemName=" + sistemaBuscar + "&showId=1&showInformation=1&showPermit=1&showCoordinates=1",
            {
                method: "GET",
            }
        );

        if (response.status >= 200 && response.status < 300) {
            const datos = await response.json();

            // Habria que controlar si es un sistema poblado
            // if (datos.length === 1) {
            //     let nuevoSistema = datos[0].name;
            //     window.location.href = "?sistema=" + nuevoSistema;
            //     return;
            // }

            setSistemas(datos);
        }
    }

    function limpiarSistemas() {
        history.pushState(null, "", "?");
        setSistemas([]);
    }

    return (
        <div className={estilos.nada}>
            <label>Sistema Origen:</label>
            &nbsp;
            <input name="sistema" className={estilos.inputSistema} onKeyUp={pulsaTecla} value={sistemaBuscar} onChange={cambiaTexto} />
            &nbsp;&nbsp;
            <Boton desactivado={sistemaBuscar.length === 0} fnClick={buscarSistemas}>
                buscar
            </Boton>
            &nbsp;
            <Boton desactivado={sistemas.length === 0} fnClick={limpiarSistemas}>
                limpiar
            </Boton>
            {sistemas.length > 0 ? (
                <>
                    <hr />
                    <table className={estilos.resultadosSistemas}>
                        <thead>
                            <tr>
                                <th>Sistema</th>
                                <th>Planificar colonizaciones</th>
                                <th>Buscar productos</th>
                                <th>Lealtad</th>
                                <th>Facción Dominante</th>
                                {/* <th>Estado Facción</th> */}
                                <th>Gobierno</th>
                                <th>Población</th>
                                <th>Seguridad</th>
                                {/* <th>Economía Principal</th> */}
                                {/* <th>Economía Secundaria</th> */}
                                {/* <th>Requiere Permiso</th> */}
                            </tr>
                        </thead>
                        <tbody>
                            {sistemas.map((sistema) => {
                                let info = sistema.information;
                                // if (Object.keys(info).length === 0) {
                                //     return;
                                // }

                                return (
                                    <tr key={sistema.name}>
                                        <td>
                                            <b>
                                                <Enlace to={"?sistema=" + sistema.name}>{sistema.name}</Enlace>
                                            </b>
                                        </td>
                                        <td>
                                            <b>
                                                <Enlace to={"?sistemaIniciarColonizacion=" + sistema.name}>Ver alrededores de {sistema.name}</Enlace>
                                            </b>
                                        </td>
                                        <td>
                                            <b>
                                                <Enlace to={"?buscarProducto=" + sistema.name}>Ver estaciones con productos a la venta cerca de {sistema.name}</Enlace>
                                            </b>
                                        </td>
                                        <td>{info.allegiance}</td>
                                        <td>{info.faction}</td>
                                        {/* <td>{info.factionState}</td> */}
                                        <td>{info.government}</td>
                                        <td>{info.population}</td>
                                        <td>{info.security}</td>
                                        {/* <td>{info.economy}</td> */}
                                        {/* <td>{info.secondEconomy}</td> */}
                                        {/* <td>{sistema.permitName}</td> */}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </>
            ) : (
                undefined
            )}
        </div>
    );
};

export default Busqueda;
