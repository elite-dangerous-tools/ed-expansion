import React, { useEffect, useRef, useState } from "react";

import estilos from "./Busqueda.module.css";
import Boton from "./elementos/Boton";

const Busqueda = props => {
    const isMounted = useRef(false);

    const [sistemaBuscar, setSistemaBuscar] = useState("");
    const [sistemas, setSistemas] = useState([]);

    useEffect(() => {
        // Constructor
        isMounted.current = true;
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
        let response = await fetch(
            "https://www.edsm.net/api-v1/systems?systemName=" + sistemaBuscar + "&showId=1&showInformation=1&showPermit=1&showCoordinates=1",
            {
                method: "GET"
            }
        );

        if (response.status >= 200 && response.status < 300) {
            const datos = await response.json();
            setSistemas(datos);
        }
    }

    return (
        <div className={estilos.nada}>
            <label>Sistema:</label>
            &nbsp;
            <input name="sistema" className={estilos.inputSistema} onKeyUp={pulsaTecla} value={sistemaBuscar} onChange={cambiaTexto} />
            &nbsp;&nbsp;
            <Boton desactivado={sistemaBuscar.length === 0} fnClick={buscarSistemas}>
                buscar
            </Boton>
            {sistemas.length > 0 ? (
                <>
                    <hr />
                    <table className={estilos.resultadosSistemas}>
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Lealtad</th>
                                <th>Facción</th>
                                <th>Estado Facción</th>
                                <th>Gobierno</th>
                                <th>Población</th>
                                <th>Seguridad</th>
                                <th>Economía Principal</th>
                                <th>Economía Secundaria</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sistemas.map(sistema => {
                                let info = sistema.information;
                                if (Object.keys(info).length === 0) {
                                    return;
                                }

                                return (
                                    <tr key={sistema.name}>
                                        <td>{sistema.name}</td>
                                        <td>{info.allegiance}</td>
                                        <td>{info.faction}</td>
                                        <td>{info.factionState}</td>
                                        <td>{info.government}</td>
                                        <td>{info.population}</td>
                                        <td>{info.security}</td>
                                        <td>{info.economy}</td>
                                        <td>{info.secondEconomy}</td>
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
