import React, { useEffect, useRef, useState } from "react";

import estilos from "./SistemaIniciarColonizacion.module.css";

import { dameBusqueda, dameUrlBase } from "../../utilidades";
import Progreso from "../../elementos/Progreso";

const SistemaIniciarColonizacion = () => {
    const isMounted = useRef(false);
    const nombreSistema = useRef(dameBusqueda()).current;

    const [cargando, setCargando] = useState(true);
    const [alcance, setAlcance] = useState("0");
    const [anillo, setAnillo] = useState(false);
    const [cinturon, setCinturon] = useState(false);
    const [sistemas550, setSistemas550] = useState([]);
    const [sistemasAlcance, setSistemasAlcance] = useState([]);

    const [sistLibres, setSistLibres] = useState([]);
    const [sistOcupados, setSistOcupados] = useState([]);
    const [sistPoblados, setSistPoblados] = useState([]);

    let sistemasRecuperados = 0;
    let sistemasColonizando = [];
    let sistemasLibres = [];
    let sistemasAntiguos = [];

    const alcancesDisponibles = [
        {
            id: "0",
            valor: 0,
            texto: ""
        },
        {
            id: "1",
            valor: 15,
            texto: "15 AL (Por defecto)"
        },
        {
            id: "2",
            valor: 30,
            texto: "30 AL (Más lento)"
        },
        {
            id: "3",
            valor: 30,
            texto: "60 AL (Muy lento)"
        }
    ];

    function distanciaSistema(sistemaOrigen, sistemaNuevo) {
        const x1 = sistemaOrigen.c.x;
        const y1 = sistemaOrigen.c.y;
        const z1 = sistemaOrigen.c.z;

        const x2 = sistemaNuevo.c.x;
        const y2 = sistemaNuevo.c.y;
        const z2 = sistemaNuevo.c.z;

        const d = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2) + Math.pow(z2 - z1, 2) * 1.0);
        return d;
    }

    async function recuperarSistemasAlcance() {
        sistemasRecuperados = 0;
        let radio = alcancesDisponibles.find(fila => fila.id === alcance).valor;
        if (radio <= 0) {
            return;
        }

        let sistemaOrigen = sistemas550.find(fila => fila.n === nombreSistema);

        let sistemasValidos = [];
        sistemas550.forEach(sistema => {
            let anyosLuz = distanciaSistema(sistemaOrigen, sistema);

            if (anyosLuz <= radio) {
                sistemasValidos.push({
                    name: sistema.n,
                    distance: anyosLuz
                });
            }
        });

        setSistemasAlcance(sistemasValidos);
    }

    function recuperarInfoSistemas() {
        sistemasAlcance.forEach(sistema => {
            recuperarInfoSistema(sistema.name, sistema.distance);
        });
    }

    async function recuperarListaSistemas() {
        let response = await fetch(dameUrlBase() + "sistemas550.json", {
            method: "GET"
            // mode: "no-cors",
            // cache: "no-cache"
        });

        if (response.status >= 200 && response.status < 300) {
            const sistemasBBDD = await response.json();
            setSistemas550(sistemasBBDD);
            setCargando(false);
        } else {
            alert("Fallo al recuperar los sistemas de la burbuja");
            setCargando(false);
        }
    }

    async function recuperarInfoSistema(nombre, distanciaOrigen) {
        // Sistemas como WISE 1405+5534 este fallan al recuperar sin encodeURI
        let response = await fetch(encodeURI("https://www.edsm.net/api-system-v1/factions?systemName=" + nombre), {
            method: "GET"
        });

        // Comprobamos que no haya nada, ni otros comandantes
        if (response.status >= 200 && response.status < 300) {
            const infoSistema = await response.json();

            if (infoSistema.factions && infoSistema.factions.length === 1) {
                // Si tiene una facción, ya esta siendo colonizado
                infoSistema.distanciaOrigen = distanciaOrigen;
                sistemasColonizando.push(infoSistema);
                sistemasRecuperados++;
                comprobarFinCarga();
            } else if (infoSistema.factions && infoSistema.factions.length > 1) {
                // Si tiene más facciones es un sistema poblado
                infoSistema.distanciaOrigen = distanciaOrigen;
                sistemasAntiguos.push(infoSistema);
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
        // Sistemas como WISE 1405+5534 este fallan al recuperar sin encodeURI
        let response = await fetch(encodeURI("https://www.edsm.net/api-system-v1/bodies?systemName=" + nombre), {
            method: "GET"
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
        if (cargando === true && sistemasAlcance.length === sistemasColonizando.length + sistemasLibres.length + sistemasAntiguos.length) {
            setSistLibres(sistemasLibres);
            setSistOcupados(sistemasColonizando);
            setSistPoblados(sistemasAntiguos);
            setCargando(false);
        }
    }

    function cambiaAlcance(evento) {
        const nuevoAlcance = evento.target.value;
        setAlcance(nuevoAlcance);

        if (nuevoAlcance !== "0") {
            setCargando(true);
            setSistLibres([]);
            setSistOcupados([]);
            setSistPoblados([]);
            setSistemasAlcance([]);
        }
    }

    function cambiaAnillo(evento) {
        setAnillo(evento.target.value);
    }

    function cambiaCinturon(evento) {
        setCinturon(evento.target.value);
    }

    function pintarSistemasLibresExcluidos() {
        return pintarSistemasLibres();
    }

    function pintarSistemasLibresFiltrados() {
        return pintarSistemasLibres();
    }

    function pintarSistemasLibres(cumplenFiltros=undefined) {
        return sistLibres.map(sistema => {
            let estrellas = 0;
            let planetasLunas = 0;
            let cinturones = 0;
            let anillos = 0;
            let cuerpoMasLejano = 0;
            let aterrizables = 0;

            if (!sistema.bodies) {
                return;
            }

            sistema.bodies.forEach(cuerpo => {
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
        return sistOcupados.map(sistema => {
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

    function pintarSistemasPoblados() {
        return sistPoblados.map(sistema => {
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

        recuperarListaSistemas();
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

                <div className="col-sm-12 col-md-4">
                    <label for="anillo">Debe tener algún anillo: </label>
                    <input id="anillo" type="checkbox" value={anillo} onChange={cambiaAnillo} />
                    &nbsp;&nbsp;
                </div>

                <div className="col-sm-12 col-md-4">
                    <select name="faccion" onChange={cambiaAlcance} value={alcance} disabled={cargando} className={estilos.selectAlcance}>
                        {alcancesDisponibles.map(distancia => {
                            return (
                                <option key={distancia.id} value={distancia.id}>
                                    {distancia.texto}
                                </option>
                            );
                        })}
                    </select>


                    <label for="cinturon">Debe tener cinturón de asteroides: </label>
                    <input id="cinturon" type="checkbox" value={cinturon} onChange={cambiaCinturon} />
                    &nbsp;&nbsp;
                </div>

                <div className="col-sm-12 col-md-4">
                    <label>Distancia máxima: </label>
                    <select name="faccion" onChange={cambiaAlcance} value={alcance} disabled={cargando} className={estilos.selectAlcance}>
                        {alcancesDisponibles.map(distancia => {
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
                    <h4>Sistemas probablemente libres que cumplen los filtros:</h4>
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
                        <tbody>{cargando ? null : pintarSistemasLibresFiltrados()}</tbody>
                    </table>
                </div>
                <div className="col-sm-12">
                    <h4>Sistemas probablemente libres que no cumplen los filtros:</h4>
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
                        <tbody>{cargando ? null : pintarSistemasLibresExcluidos()}</tbody>
                    </table>
                </div>
            </div>

            <div className="row">
                <div className="col-sm-12">
                    <h4>Sistemas en proceso de colonizar por jugadores:</h4>
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

            <div className="row">
                <div className="col-sm-12">
                    <h4>Sistemas poblados:</h4>
                    <table className={estilos.tablaSistemas}>
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Enlaces</th>
                            </tr>
                        </thead>
                        <tbody>{cargando ? null : pintarSistemasPoblados()}</tbody>
                    </table>
                </div>
            </div>
        </>
    );
};

export default SistemaIniciarColonizacion;
