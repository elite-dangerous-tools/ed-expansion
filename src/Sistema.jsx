import React, { useEffect, useRef, useState } from "react";

import estilos from "./Busqueda.module.css";

import Boton from "./elementos/Boton";
import { useParams } from "react-router-dom";

const Sistema = () => {
    const isMounted = useRef(false);

    let { id } = useParams();
    const [sistema, setSistema] = useState([]);

    async function recuperarSistema() {
        let response = await fetch("https://www.edsm.net/api-v1/system?systemName=" + id + "&showId=1&showInformation=1&showPermit=1&showCoordinates=1", {
            method: "GET"
        });

        console.log("estado:", response.status);
        if (response.status >= 200 && response.status < 300) {
            const datos = await response.json();
            console.log(datos);
            setSistema(datos);
        }
    }

    useEffect(() => {
        // Constructor
        isMounted.current = true;

        recuperarSistema();
    }, []);

    return <div className={estilos.nada}>pagina de sistema: {id}</div>;
};

export default Sistema;
