import React, { useEffect, useRef, useState } from "react";

import estilos from "./Sistema.module.css";

import { dameBusqueda, formateaNumero } from "../../utilidades";
import Enlace from "../../elementos/Enlace";
import Progreso from "../../elementos/Progreso";
import Boton from "../../elementos/Boton";

const Sistema = () => {
    const isMounted = useRef(false);
    const nombreSistema = useRef(dameBusqueda()).current;

    const [tabVisible, setTabVisible] = useState(1);

    const [sistema, setSistema] = useState({});
    const [estaciones, setEstaciones] = useState({});
    const [trafico, setTrafico] = useState({});
    const [muertes, setMuertes] = useState({});
    const [facciones, setFacciones] = useState({});
    const [trailblazers, setTrailblazers] = useState([]);

    async function recuperarSistema() {
        let response = await fetch(
            "https://www.edsm.net/api-v1/system?systemName=" + nombreSistema + "&showId=1&showInformation=1&showPermit=1&showCoordinates=1",
            {
                method: "GET",
            }
        );

        if (response.status >= 200 && response.status < 300) {
            const datos = await response.json();
            setSistema(datos);
        }
    }

    async function recuperarTrailblazers() {
        let response = await fetch("https://stormseekers.twilightparadox.com/api/distancia_trailblazer?sistema=" + nombreSistema, {
            method: "GET",
        });

        if (response.status >= 200 && response.status < 300) {
            const datos = await response.json();
            setTrailblazers(datos);
        }
    }

    async function recuperarTraficoSistema() {
        let response = await fetch("https://www.edsm.net/api-system-v1/traffic?systemName=" + nombreSistema, {
            method: "GET",
        });

        if (response.status >= 200 && response.status < 300) {
            const datos = await response.json();
            setTrafico(datos);
        }
    }

    async function recuperarEstacionesSistema() {
        let response = await fetch("https://www.edsm.net/api-system-v1/stations?systemName=" + nombreSistema, {
            method: "GET",
        });

        if (response.status >= 200 && response.status < 300) {
            const datos = await response.json();
            setEstaciones(datos);
        }
    }

    async function recuperarMuertesSistema() {
        let response = await fetch("https://www.edsm.net/api-system-v1/deaths?systemName=" + nombreSistema, {
            method: "GET",
        });

        if (response.status >= 200 && response.status < 300) {
            const datos = await response.json();
            setMuertes(datos);
        }
    }

    async function recuperarFaccionesSistema() {
        let response = await fetch("https://www.edsm.net/api-system-v1/factions?showHistory=1&systemName=" + nombreSistema, {
            method: "GET",
        });

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

    function pintarEstaciones() {
        let listaEstaciones = [];

        if (estaciones && estaciones.stations) {
            estaciones.stations.forEach((estacion) => {
                if (estacion.type === "Fleet Carrier") {
                    return;
                }

                listaEstaciones.push(
                    <tr key={estacion.id}>
                        <td>{estacion.name}</td>
                        <td>{estacion.type}</td>
                        <td>{estacion.economy}</td>
                        <td>{estacion.secondEconomy}</td>
                    </tr>
                );
            });
        }

        return listaEstaciones;
    }

    function pintarTrailblazers() {
        return trailblazers.map((fila) => {
            return (
                <tr key={fila.sistema + "-" + fila.estacion}>
                    <td>{fila.sistema}</td>
                    <td>{formateaNumero(fila.distanciasistema.toFixed(2), 'es')} al</td>
                    <td>{fila.estacion}</td>
                    <td>{formateaNumero(fila.distanciaestacion.toFixed(2), 'es')} sl</td>
                </tr>
            );
        });
    }

    function pintarFacciones() {
        if (!facciones || !facciones.factions || facciones.factions.length === 0) {
            return;
        }

        // "recoveringStates": [],
        // "pendingStates": [],

        let faccionDominante = facciones.controllingFaction.id;

        return facciones.factions.map((faccion) => {
            let esDominante = faccionDominante === faccion.id;

            let influencia = (faccion.influence * 100).toLocaleString("es-CO");

            return (
                <tr key={faccion.id} className={esDominante ? estilos.faccionDominante : ""}>
                    <td>{faccion.name}</td>
                    <td>{faccion.allegiance}</td>
                    <td>{faccion.government}</td>
                    <td>{influencia}%</td>
                    <td>{faccion.state}</td>
                    {/* <td>{faccion.hapiness}</td> */}
                    {/* <td>{faccion.isPlayer}</td> */}
                </tr>
            );
        });
    }

    function ultimaActualizacion() {
        try {
            return new Date(parseInt(facciones.factions[0].lastUpdate + "000")).toLocaleString();
        } catch (error) {
            return "";
        }
    }

    function verBgs() {
        setTabVisible(1);
    }

    function verEstaciones() {
        setTabVisible(2);
    }

    function verPuntos() {
        setTabVisible(3);
    }

    function verTrailblazers() {
        setTabVisible(4);
    }

    useEffect(() => {
        // Constructor
        isMounted.current = true;

        recuperarSistema();
        recuperarEstacionesSistema();
        recuperarTraficoSistema();
        recuperarMuertesSistema();
        recuperarFaccionesSistema();
        recuperarTrailblazers();
    }, []);

    let claseColumna = "col-sm-12 col-md-6 col-lg-4 " + estilos.columna;

    return (
        <>
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
                                <b>Enlaces: </b>
                                <a target="_blank" href={"https://inara.cz/elite/starsystem/?search=" + sistema.name}>
                                    Inara
                                </a>
                                &nbsp;&nbsp;
                                <a target="_blank" href={trafico.url}>
                                    EDSM
                                </a>
                                &nbsp;&nbsp;
                                {/* <Enlace to={"?sistemaExpandir=" + sistema.name}>Expandir aquí</Enlace> */}
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
                            <div className={claseColumna}>
                                <b>ultima actualización: </b>
                                {ultimaActualizacion()}
                            </div>
                            <div className={claseColumna}>
                                <b>requiere permiso: </b>
                                {sistema.requirePermit ? <span className={estilos.rojo}>Sí</span> : <span>No</span>}
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-sm-12 col-md-6">
                                <div className={estilos.titulo}>
                                    <Enlace to={"?sistemaIniciarColonizacion=" + sistema.name}>Buscar sistemas colonizables desde aquí</Enlace>
                                </div>
                            </div>
                            
                            <div className="col-sm-12 col-md-6">
                                <div className={estilos.titulo}>
                                    <Enlace to={"?buscarProducto=" + sistema.name}>Buscar estaciones para comprar productos</Enlace>
                                </div>
                            </div>
                        </div>
                    </fieldset>
                </div>
            </div>

            <div className="row">
                <div className="col-sm-12">
                    <br />
                </div>
            </div>

            <div className="row">
                <div className="col-sm-12">
                    <div className={estilos.tab}>
                        <Boton desactivado={tabVisible === 1} fnClick={verBgs}>
                            Ver BGS
                        </Boton>
                        <Boton desactivado={tabVisible === 2} fnClick={verEstaciones}>
                            Ver Estaciones
                        </Boton>
                        {/* <Boton desactivado={tabVisible === 3} fnClick={verPuntos}>
                            Ver Puntos del sistema
                            </Boton> */}
                        <Boton desactivado={tabVisible === 4} fnClick={verTrailblazers}>
                            Ver Trailblazers
                        </Boton>
                    </div>
                </div>
            </div>

            {tabVisible === 1 ? (
                <>
                    <div className={"row " + estilos.columnasAltas}>
                        <div className="col-sm-12 col-md-4">
                            <fieldset>
                                <h3 className={estilos.titulo}>trafico</h3>
                                <Progreso visible={!trafico.id > 0} />
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
                        </div>

                        <div className="col-sm-12 col-md-4">
                            <fieldset>
                                <h3 className={estilos.titulo}>naves (últimas 24H)</h3>
                                <Progreso visible={!trafico.id > 0} />
                                <div className="row">{pintarNaves()}</div>
                            </fieldset>
                        </div>

                        <div className="col-sm-12 col-md-4">
                            <fieldset>
                                <h3 className={estilos.titulo}>muertes</h3>
                                <Progreso visible={!muertes.id > 0} />
                                <div className="row">
                                    <div className={claseColumna}>
                                        <b>Total: </b>
                                        {muertes.deaths ? muertes.deaths.total : undefined}
                                    </div>
                                    <div className={claseColumna}>
                                        <b>Semana: </b>
                                        {muertes.deaths ? muertes.deaths.week : undefined}
                                    </div>
                                    <div className={claseColumna}>
                                        <b>Día: </b>
                                        {muertes.deaths ? muertes.deaths.day : undefined}
                                    </div>
                                </div>
                            </fieldset>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-sm-12">
                            <br />
                            <br />
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-sm-12">
                            <fieldset>
                                <h3 className={estilos.titulo}>facciones del sistema</h3>
                                <Progreso visible={!facciones.id > 0} />
                                <table className={estilos.tablaFacciones}>
                                    <thead>
                                        <tr>
                                            <th>Nombre</th>
                                            <th>Alianza</th>
                                            <th>Gobierno</th>
                                            <th>Influencia</th>
                                            <th>Estado</th>
                                            {/* <th>Felicidad</th> */}
                                            {/* <th>De jugador</th> */}
                                        </tr>
                                    </thead>
                                    <tbody>{pintarFacciones()}</tbody>
                                </table>
                            </fieldset>
                        </div>
                    </div>
                </>
            ) : null}

            {tabVisible === 2 ? (
                <>
                    <div className="row">
                        <div className="col-sm-12">
                            <fieldset>
                                <h3 className={estilos.titulo}>estaciones del sistema</h3>
                                <Progreso visible={!facciones.id > 0} />
                                <table className={estilos.tablaFacciones}>
                                    <thead>
                                        <tr>
                                            <th>Nombre</th>
                                            <th>Tipo</th>
                                            <th>Economía</th>
                                            <th>Segunda economía</th>
                                        </tr>
                                    </thead>
                                    <tbody>{pintarEstaciones()}</tbody>
                                </table>
                            </fieldset>
                        </div>
                    </div>
                </>
            ) : null}

            {tabVisible === 3 ? (
                <>
                    <div className="row">
                        <div className="col-sm-12">
                            <fieldset>
                                <h3 className={estilos.titulo}>puntos del sistema</h3>
                                <Progreso visible={!facciones.id > 0} />
                                <table className={estilos.tablaFacciones}>
                                    <thead>
                                        <tr>
                                            <th></th>
                                        </tr>
                                    </thead>
                                    {/* <tbody>{pintarPuntos()}</tbody> */}
                                </table>
                            </fieldset>
                        </div>
                    </div>
                </>
            ) : null}

            {tabVisible === 4 ? (
                <>
                    <div className="row">
                        <div className="col-sm-12">
                            <fieldset>
                                <h3 className={estilos.titulo}>Trailblazers más cercanos</h3>
                                <Progreso visible={!trailblazers.length > 0} />
                                <table className={estilos.tablaFacciones}>
                                    <thead>
                                        <tr>
                                            <th>Sistema</th>
                                            <th>Distancia Sistema</th>
                                            <th>Estación</th>
                                            <th>Distancia Estación</th>
                                        </tr>
                                    </thead>
                                    <tbody>{pintarTrailblazers()}</tbody>
                                </table>
                            </fieldset>
                        </div>
                    </div>
                </>
            ) : null}
        </>
    );
};

export default Sistema;
