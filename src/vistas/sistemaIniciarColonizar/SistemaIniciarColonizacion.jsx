import React, { useEffect, useRef, useState } from "react";

import estilos from "./SistemaIniciarColonizacion.module.css";

import { dameBusqueda } from "../../utilidades";
import Enlace from "../../elementos/Enlace";
import Progreso from "../../elementos/Progreso";

const SistemaIniciarColonizacion = () => {
    const isMounted = useRef(false);
    const nombreSistema = useRef(dameBusqueda()).current;

    const [cargando, setCargando] = useState(false);
    const [alcance, setAlcance] = useState("0");
    const [sistemasAlcance, setSistemasAlcance] = useState([]);

    const [sistLibres, setSistLibres] = useState([]);
    const [sistOcupados, setSistOcupados] = useState([]);

    let sistemasRecuperados = 0;
    let sistemasColonizando = [];
    let sistemasLibres = [];

    const alcancesDisponibles = [
        {
            id: "0",
            valor: 0,
            texto: "",
        },
        {
            id: "1",
            valor: 15,
            texto: "15 AL (Por defecto)",
        },
        {
            id: "2",
            valor: 30,
            texto: "30 AL (Más lento)",
        },
    ];

    async function recuperarSistemasAlcance() {
        sistemasRecuperados = 0;
        let radio = alcancesDisponibles.find((fila) => fila.id === alcance).valor;
        if (radio <= 0) {
            setCargando(false);
            setSistLibres([]);
            setSistOcupados([]);
            setSistemasAlcance([]);
            return;
        }

        let response = await fetch("https://www.edsm.net/api-v1/cube-systems?systemName=" + nombreSistema + "&radius=" + radio + "&showInformation=1", {
            method: "GET",
        });

        if (response.status >= 200 && response.status < 300) {
            const sistemas = await response.json();

            let sistemasValidos = [];
            if (Array.isArray(sistemas) && sistemas.length > 0) {
                sistemas.forEach((sistema) => {
                    if (Object.keys(sistema.information).length > 0) {
                        return;
                    }

                    sistemasValidos.push(sistema);
                });

                setSistemasAlcance(sistemasValidos);
                return;
            }
        }

        setCargando(false);
        setSistLibres([]);
        setSistOcupados([]);
        setSistemasAlcance([]);
    }

    function recuperarInfoSistemas() {
        sistemasAlcance.forEach((sistema) => {
            recuperarInfoSistema(sistema.name, sistema.distance);
        });
    }

    async function recuperarInfoSistema(nombre, distanciaOrigen) {
        // Comprobamos que no haya nada, ni otros comandantes
        let response = await fetch("https://www.edsm.net/api-system-v1/stations?systemName=" + nombre, {
            method: "GET",
        });

        if (response.status >= 200 && response.status < 300) {
            const infoSistema = await response.json();

            if (infoSistema.stations && infoSistema.stations.length > 0) {
                // Si tiene facciones y no tenia info de sistema, ya esta siendo colonizado
                infoSistema.distanciaOrigen = distanciaOrigen;
                sistemasColonizando.push(infoSistema);
                sistemasRecuperados++;
                comprobarFinCarga();
            } else {
                recuperarCuerposSistema(nombre, distanciaOrigen);
            }
        } else {
            sistemasRecuperados++;
            comprobarFinCarga();
        }
    }

    async function recuperarCuerposSistema(nombre, distanciaOrigen) {
        // Sistemas como este fallan al recuperar
        // WISE 1405+5534
        let response = await fetch("https://www.edsm.net/api-system-v1/bodies?systemName=" + nombre, {
            method: "GET",
        });

        if (response.status >= 200 && response.status < 300) {
            const infoSistema = await response.json();
            infoSistema.distanciaOrigen = distanciaOrigen;
            sistemasLibres.push(infoSistema);
        }

        sistemasRecuperados++;
        comprobarFinCarga();
    }

    function comprobarFinCarga() {
        if (cargando === true && sistemasAlcance.length === sistemasColonizando.length + sistemasLibres.length) {
            setSistLibres(sistemasLibres);
            setSistOcupados(sistemasColonizando);
            setCargando(false);
        }
    }

    function cambiaAlcance(evento) {
        setCargando(true);
        setSistLibres([]);
        setSistOcupados([]);
        setAlcance(evento.target.value);
        setSistemasAlcance([]);
    }

    function pintarSistemasLibres() {
        return sistLibres.map((sistema) => {
            let estrellas = 0;
            let planetasLunas = 0;
            let cinturones = 0;
            let anillos = 0;
            let cuerpoMasLejano = 0;
            let aterrizables = 0;

            if (!sistema.bodies) {
                return;
            }

            sistema.bodies.forEach((cuerpo) => {
                if (cuerpo.type === "Star") {
                    estrellas++;

                    if (cuerpo.belts && cuerpo.belts.length > 0) {
                        cinturones += cuerpo.belts.length;
                    }
                } else {
                    planetasLunas++;

                    if (cuerpo.isLandable) {
                        aterrizables++;
                    }
                }

                if (cuerpo.rings && cuerpo.rings.length > 0) {
                    anillos += cuerpo.rings.length;
                }

                if (cuerpo.distanceToArrival > cuerpoMasLejano) {
                    cuerpoMasLejano = cuerpo.distanceToArrival;
                }
            });

            return (
                <tr key={sistema.id}>
                    <td>{sistema.name}</td>
                    <td>{sistema.distanciaOrigen}</td>
                    <td>{estrellas}</td>
                    <td>{planetasLunas}</td>
                    <td>{aterrizables}</td>
                    <td>{cinturones}</td>
                    <td>{anillos}</td>
                    <td>{new Intl.NumberFormat("es-CO", { currency: "EUR" }).format(cuerpoMasLejano)} sL</td>
                    <td>
                        <a target="_blank" href={"https://inara.cz/elite/starsystem/?search=" + sistema.name}>
                            Inara
                        </a>
                        &nbsp;&nbsp;
                        <a target="_blank" href={"https://www.edsm.net/en/system/id/" + sistema.id + "/name/" + sistema.name}>
                            EDSM
                        </a>
                    </td>
                </tr>
            );
        });
    }

    function pintarSistemasColonizando() {
        return sistOcupados.map((sistema) => {
            return (
                <tr key={sistema.id}>
                    <td>{sistema.name}</td>
                    <td>
                        <a target="_blank" href={"https://inara.cz/elite/starsystem/?search=" + sistema.name}>
                            Inara
                        </a>
                        &nbsp;&nbsp;
                        <a target="_blank" href={"https://www.edsm.net/en/system/id/" + sistema.id + "/name/" + sistema.name}>
                            EDSM
                        </a>
                    </td>
                </tr>
            );
        });
    }

    useEffect(() => {
        // Constructor
        isMounted.current = true;
    }, []);

    useEffect(() => {
        // hemos recibido sistemas validos

        if (sistemasAlcance.length > 0) {
            recuperarInfoSistemas();
        }
    }, [sistemasAlcance]);

    useEffect(() => {
        // hemos cambiado el alcance

        recuperarSistemasAlcance();
    }, [alcance]);

    return (
        <>
            <div className="row">
                <div className="col-sm-12">
                    <Progreso visible={cargando} />
                </div>

                <div className="col-sm-12">
                    <b>Sistema: </b>
                    {nombreSistema}
                    <br />
                    <br />
                </div>

                <div className="col-sm-12">
                    <label>Distancia máxima: </label>
                    <select name="faccion" onChange={cambiaAlcance} value={alcance} disabled={cargando} className={estilos.selectAlcance}>
                        {alcancesDisponibles.map((distancia) => {
                            return (
                                <option key={distancia.id} value={distancia.id}>
                                    {distancia.texto}
                                </option>
                            );
                        })}
                    </select>
                    &nbsp;&nbsp;
                </div>
            </div>

            <div className="row">
                <div className="col-sm-12">
                    <h4>Sistemas libres:</h4>
                    <table className={estilos.tablaSistemas}>
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Distancia Origen</th>
                                <th>Estrellas</th>
                                <th>Planetas y Satélites</th>
                                <th>Cuerpos aterrizables</th>
                                <th>Cinturon de asteroides</th>
                                <th>Anillos</th>
                                <th>Cuerpo más lejano</th>
                                <th>Enlaces</th>
                            </tr>
                        </thead>
                        <tbody>{cargando ? null : pintarSistemasLibres()}</tbody>
                    </table>
                </div>
            </div>

            <div className="row">
                <div className="col-sm-12">
                    <h4>Sistemas siendo colonizados por jugadores:</h4>
                    <table className={estilos.tablaSistemas}>
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Enlaces</th>
                            </tr>
                        </thead>
                        <tbody>{cargando ? null : pintarSistemasColonizando()}</tbody>
                    </table>
                </div>
            </div>
        </>
    );
};

export default SistemaIniciarColonizacion;
