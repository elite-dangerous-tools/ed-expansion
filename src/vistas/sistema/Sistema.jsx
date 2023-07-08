import React, { useEffect, useRef, useState } from "react";

import estilos from "./Sistema.module.css";

import { dameBusqueda } from "../../utilidades";

const Sistema = () => {
    const isMounted = useRef(false);
    const nombreSistema = useRef(dameBusqueda()).current;

    const [sistema, setSistema] = useState({});
    const [trafico, setTrafico] = useState({});
    const [facciones, setFacciones] = useState({});

    async function recuperarSistema() {
        let response = await fetch(
            "https://www.edsm.net/api-v1/system?systemName=" +
                nombreSistema +
                "&showId=1&showInformation=1&showPermit=1&showCoordinates=1",
            {
                method: "GET",
            }
        );

        if (response.status >= 200 && response.status < 300) {
            const datos = await response.json();
            setSistema(datos);
        }
    }

    async function recuperarTraficoSistema() {
        let response = await fetch(
            "https://www.edsm.net/api-system-v1/traffic?systemName=" +
                nombreSistema,
            {
                method: "GET",
            }
        );

        if (response.status >= 200 && response.status < 300) {
            const datos = await response.json();
            setTrafico(datos);
        }
    }

    async function recuperarFaccionesSistema() {
        let response = await fetch(
            "https://www.edsm.net/api-system-v1/factions?showHistory=1&systemName=" +
                nombreSistema,
            {
                method: "GET",
            }
        );

        if (response.status >= 200 && response.status < 300) {
            const datos = await response.json();
            setFacciones(datos);
        }
    }

    function pintarNaves() {
        let listaNaves = [];

        if (trafico && trafico.breakdown) {
            let claves = Object.keys(trafico.breakdown);

            claves.forEach((clave) => {
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

    function pintarFacciones() {
        if (
            !facciones ||
            !facciones.factions ||
            facciones.factions.length === 0
        ) {
            return;
        }

        // "recoveringStates": [],
        // "pendingStates": [],

        let faccionDominante = facciones.controllingFaction.id;

        return facciones.factions.map((faccion) => {
            let esDominante = faccionDominante === faccion.id;

            return (
                <tr key={faccion.id}>
                    <td>{faccion.name}</td>
                    <td>{faccion.allegiance}</td>
                    <td>{faccion.government}</td>
                    <td>{faccion.influence * 100}%</td>
                    <td>{faccion.state}</td>
                    <td>{faccion.hapiness}</td>
                    <td>{faccion.isPlayer}</td>
                </tr>
            );
        });
    }

    function ultimaActualizacion() {
        try {
            return new Date(
                parseInt(facciones.factions[0].lastUpdate + "000")
            ).toLocaleString();
        } catch (error) {
            return "";
        }
    }

    useEffect(() => {
        // Constructor
        isMounted.current = true;

        recuperarSistema();
        recuperarTraficoSistema();
        recuperarFaccionesSistema();
    }, []);

    let claseColumna = "col-sm-12 col-md-6 col-lg-4 " + estilos.columna;

    return (
        <div className="row">
            <div className="col-sm-12">
                <fieldset>
                    <h3 className={estilos.titulo}>{sistema.name}</h3>
                    <div className="row">
                        <div className={claseColumna}>
                            <b>sistema: </b>
                            {sistema.name}
                        </div>
                        <div className={claseColumna}>
                            <a
                                target="_blank"
                                href={
                                    "https://inara.cz/elite/starsystem/?search=" +
                                    sistema.name
                                }
                            >
                                Ver en Inara
                            </a>
                        </div>
                        <div className={claseColumna}>
                            <a target="_blank" href={trafico.url}>
                                Ver en EDSM
                            </a>
                        </div>

                        <div className={claseColumna}>
                            <b>lealtad: </b>
                            {sistema.information
                                ? sistema.information.allegiance
                                : undefined}
                        </div>
                        <div className={claseColumna}>
                            <b>gobierno: </b>
                            {sistema.information
                                ? sistema.information.government
                                : undefined}
                        </div>
                        <div className={claseColumna}>
                            <b>facción dominante: </b>
                            {sistema.information
                                ? sistema.information.faction
                                : undefined}
                        </div>
                        <div className={claseColumna}>
                            <b>estado facción: </b>
                            {sistema.information
                                ? sistema.information.factionState
                                : undefined}
                        </div>
                        <div className={claseColumna}>
                            <b>población: </b>
                            {sistema.information
                                ? sistema.information.population
                                : undefined}
                        </div>
                        <div className={claseColumna}>
                            <b>seguridad: </b>
                            {sistema.information
                                ? sistema.information.security
                                : undefined}
                        </div>
                        <div className={claseColumna}>
                            <b>economía principal: </b>
                            {sistema.information
                                ? sistema.information.economy
                                : undefined}
                        </div>
                        <div className={claseColumna}>
                            <b>economía secundaria: </b>
                            {sistema.information
                                ? sistema.information.secondEconomy
                                : undefined}
                        </div>
                        <div className={claseColumna}>
                            <b>ultima actualización: </b>
                            {ultimaActualizacion()}
                        </div>
                    </div>
                </fieldset>
            </div>

            <div className="col-sm-12">
                <br />
            </div>

            <div className="col-sm-12 col-md-6">
                <fieldset>
                    <h3 className={estilos.titulo}>trafico</h3>
                    <div className="row">
                        <div className={claseColumna}>
                            <b>Total: </b>
                            {trafico.traffic
                                ? trafico.traffic.total
                                : undefined}
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
            </div>

            <div className="col-sm-12 col-md-6">
                <fieldset>
                    <h3 className={estilos.titulo}>naves (últimas 24H)</h3>
                    <div className="row">{pintarNaves()}</div>
                </fieldset>
            </div>

            <div className="col-sm-12">
                <br />
            </div>

            <div className="col-sm-12">
                <fieldset>
                    <h3 className={estilos.titulo}>facciones del sistema</h3>
                    <table className={estilos.tablaFacciones}>
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Alianza</th>
                                <th>Gobierno</th>
                                <th>Influencia</th>
                                <th>Estado</th>
                                <th>Felicidad</th>
                                <th>De jugador</th>
                            </tr>
                        </thead>
                        <tbody>{pintarFacciones()}</tbody>
                    </table>
                </fieldset>
            </div>
        </div>
    );
};

export default Sistema;
