import React, { useEffect, useRef, useState } from "react";

import estilos from "./Sistema.module.css";

import Boton from "./elementos/Boton";
import { useParams } from "react-router-dom";

const Sistema = () => {
    const isMounted = useRef(false);

    let { id } = useParams();
    const [sistema, setSistema] = useState({});
    const [trafico, setTrafico] = useState({});

    async function recuperarSistema() {
        let response = await fetch("https://www.edsm.net/api-v1/system?systemName=" + id + "&showId=1&showInformation=1&showPermit=1&showCoordinates=1", {
            method: "GET"
        });

        if (response.status >= 200 && response.status < 300) {
            const datos = await response.json();
            setSistema(datos);
        }
    }

    async function recuperarTraficoSistema() {
        let response = await fetch("https://www.edsm.net/api-system-v1/traffic?systemName=" + id, {
            method: "GET"
        });

        if (response.status >= 200 && response.status < 300) {
            const datos = await response.json();
            setTrafico(datos);
        }
    }

    function pintarNaves() {
        let listaNaves = [];

        if (trafico && trafico.breakdown) {
            let claves = Object.keys(trafico.breakdown);

            claves.forEach(clave => {
                let datosNave = (
                    <div key={clave} className={claseColumna}>
                        <b>{clave}: </b>
                        {trafico.breakdown[clave]}
                    </div>
                );

                listaNaves.push(datosNave);
            });
        }

        return listaNaves;
    }

    useEffect(() => {
        // Constructor
        isMounted.current = true;

        recuperarSistema();
        recuperarTraficoSistema();
    }, []);

    let claseColumna = "col-sm-12 col-md-6 col-lg-4 " + estilos.columna;

    return (
        <>
            <fieldset>
                <h3 className={estilos.titulo}>{id}</h3>
                <div className="row">
                    <div className={claseColumna}>
                        <b>sistema: </b>
                        {sistema.name}
                    </div>
                    <div className={claseColumna}>
                        <b>lealtad: </b>
                        {sistema.information ? sistema.information.allegiance : undefined}
                    </div>
                    <div className={claseColumna}>
                        <b>gobierno: </b>
                        {sistema.information ? sistema.information.government : undefined}
                    </div>
                    <div className={claseColumna}>
                        <b>facción dominante: </b>
                        {sistema.information ? sistema.information.faction : undefined}
                    </div>
                    <div className={claseColumna}>
                        <b>estado facción: </b>
                        {sistema.information ? sistema.information.factionState : undefined}
                    </div>
                    <div className={claseColumna}>
                        <b>población: </b>
                        {sistema.information ? sistema.information.population : undefined}
                    </div>
                    <div className={claseColumna}>
                        <b>seguridad: </b>
                        {sistema.information ? sistema.information.security : undefined}
                    </div>
                    <div className={claseColumna}>
                        <b>economía principal: </b>
                        {sistema.information ? sistema.information.economy : undefined}
                    </div>
                    <div className={claseColumna}>
                        <b>economía secundaria: </b>
                        {sistema.information ? sistema.information.secondEconomy : undefined}
                    </div>
                </div>
            </fieldset>

            <br />

            <fieldset>
                <h3 className={estilos.titulo}>Trafico</h3>
                <div className="row">
                    <div className={claseColumna}>
                        <b>Total: </b>
                        {trafico.traffic ? trafico.traffic.total : undefined}
                    </div>
                    <div className={claseColumna}>
                        <b>Semana: </b>
                        {trafico.traffic ? trafico.traffic.week : undefined}
                    </div>
                    <div className={claseColumna}>
                        <b>Día: </b>
                        {trafico.traffic ? trafico.traffic.day : undefined}
                    </div>
                </div>
            </fieldset>

            <br />

            <fieldset>
                <h3 className={estilos.titulo}>Naves</h3>
                <div className="row">{pintarNaves()}</div>
            </fieldset>
        </>
    );
};

export default Sistema;
