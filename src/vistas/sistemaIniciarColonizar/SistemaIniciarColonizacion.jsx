import React, { useEffect, useRef, useState } from "react";

import estilos from "./SistemaIniciarColonizacion.module.css";

import inara from "../../imagenes/Inara.png";

import { dameBusqueda } from "../../utilidades";
import Progreso from "../../elementos/Progreso";
import Enlace from "../../elementos/Enlace";

const SistemaIniciarColonizacion = () => {
    const isMounted = useRef(false);
    const nombreSistema = useRef(dameBusqueda()).current;

    const [cargando, setCargando] = useState(false);
    const [alcance, setAlcance] = useState("0");
    const [anillo, setAnillo] = useState(false);
    const [cinturon, setCinturon] = useState(false);

    const [orden, setOrden] = useState("distance");
    const [sentido, setSentido] = useState("ASC");

    const [aterrizable, setAterrizable] = useState(false);

    const [sistemasAlcanceLibres, setSistemasAlcanceLibres] = useState([]);
    const [sistemasAlcanceColonizados, setSistemasAlcanceColonizados] = useState([]);
    const [sistemasAlcancePoblados, setSistemasAlcancePoblados] = useState([]);

    const alcancesDisponibles = [
        {
            id: "0",
            valor: 0,
            texto: ""
        },
        {
            id: "15",
            valor: 15,
            texto: "15 AL"
        },
        {
            id: "25",
            valor: 25,
            texto: "25 AL (Lento)"
        },
        {
            id: "45",
            valor: 45,
            texto: "45 AL (Más Lento)"
        },
        // {
        //     id: "75",
        //     valor: 75,
        //     texto: "75 AL (Muy lento)"
        // }
    ];

    async function recuperarSistemasAlcance(nuevoAlcance) {
        let radio = alcancesDisponibles.find(fila => fila.id === nuevoAlcance).valor;
        if (radio <= 0) {
            return;
        }

        let dominio = "https://stormseekers.twilightparadox.com";
        // if (window.location.hostname === "localhost") {
        //     dominio = "http://localhost:5000";
        // }

        let urlAlcance = dominio + "/api/sistemas_alcance?distancia=" + radio + "&sistema=" + nombreSistema;
        let response = await fetch(encodeURI(urlAlcance), {
            method: "GET"
        });

        if (response.status >= 200 && response.status < 300) {
            const sistemasRecuperados = await response.json();

            let sistemasColonizados = sistemasRecuperados.filter(s => s.is_being_colonised === true || s.is_colonised === true);

            let sistemasLibres = sistemasRecuperados.filter(s => s.is_being_colonised !== true && s.is_colonised !== true && s.population === 0);

            let sistemasPoblados = sistemasRecuperados.filter(s => s.is_being_colonised !== true && s.is_colonised !== true && s.population > 0);

            setSistemasAlcanceColonizados(sistemasColonizados);
            setSistemasAlcanceLibres(sistemasLibres);
            setSistemasAlcancePoblados(sistemasPoblados);

            setCargando(false);
        } else {
            alert("Fallo al recuperar los sistemas de la burbuja: " + response.statusText);
            setCargando(false);
        }
    }

    function cambiaAlcance(evento) {
        const nuevoAlcance = evento.target.value;
        setAlcance(nuevoAlcance);
        setSistemasAlcanceLibres([]);
        setSistemasAlcanceColonizados([]);
        setSistemasAlcancePoblados([]);

        if (nuevoAlcance !== "0") {
            setCargando(true);
            recuperarSistemasAlcance(nuevoAlcance);
        }
    }

    function cambiaAnillo(evento) {
        setAnillo(evento.target.value);
    }

    function cambiaOrden(evento) {
        setOrden(evento.target.value);
    }

    function cambiaSentido(evento) {
        setSentido(evento.target.value);
    }

    function cambiaCinturon(evento) {
        setCinturon(evento.target.value);
    }

    function cambiaAterrizable(evento) {
        setAterrizable(evento.target.value);
    }

    function pintarSistemasLibresExcluidos() {
        return pintarSistemasLibres(false);
    }

    function pintarSistemasLibresFiltrados() {
        return pintarSistemasLibres(true);
    }

    function compare(a, b) {
        let valor1 = sentido === "ASC" ? a[orden] : b[orden];
        let valor2 = sentido === "ASC" ? b[orden] : a[orden];

        if (isNaN(valor1) || isNaN(valor2)) {
            // Si alguno no es númerico, ordenamos como texto
            valor1 = valor1.toLowerCase();
            valor2 = valor2.toLowerCase();
        } else {
            // Es numérico
            valor1 = parseFloat(valor1);
            valor2 = parseFloat(valor2);
        }

        if (valor1 < valor2) {
            return -1;
        }
        if (valor1 > valor2) {
            return 1;
        }

        return 0;
    }

    function ordenarSistemas(sistemas) {
        return sistemas.sort(compare);
    }

    function pintarSistemasLibres(cumplenFiltros = undefined) {
        let sistemasOrdenados = ordenarSistemas(sistemasAlcanceLibres);

        return sistemasOrdenados.map(sistema => {
            let estrellas = 0;
            let planetasLunas = 0;
            let cinturones = 0;
            let anillos = 0;
            let cuerpoMasLejano = 0;
            let aterrizables = 0;

            if (!sistema.bodies) {
                return;
            }

            let tipoTierra = 0;
            let terraformacion = 0;
            let acuatico = 0;
            let amoniaco = 0;
            let ricoEnMetal = 0;
            let altoContenidoMetal = 0;

            sistema.bodies.forEach(cuerpo => {
                if (cuerpo.type === "Star") {
                    estrellas++;

                    if (cuerpo.belts && cuerpo.belts.length > 0) {
                        cinturones += cuerpo.belts.length;
                    }
                } else {
                    planetasLunas++;
                    let esTerraformable = cuerpo.terraforming_state != null && cuerpo.terraforming_state != "Not terraformable";
                    if (esTerraformable) {
                        terraformacion++;
                    }

                    if (cuerpo.subtype && cuerpo.subtype === "Earth-like world") {
                        tipoTierra++;
                    } else if (cuerpo.subtype && cuerpo.subtype === "Water world") {
                        acuatico++;
                    } else if (cuerpo.subtype && cuerpo.subtype === "Ammonia world") {
                        amoniaco++;
                    } else if (cuerpo.subtype && cuerpo.subtype === "Metal-rich body") {
                        ricoEnMetal++;
                    } else if (cuerpo.subtype && cuerpo.subtype === "High metal content world") {
                        altoContenidoMetal++;
                    }

                    if (cuerpo.is_landable) {
                        aterrizables++;
                    }
                }

                if (cuerpo.rings && cuerpo.rings.length > 0) {
                    anillos += cuerpo.rings.length;
                }

                if (cuerpo.distance_to_arrival > cuerpoMasLejano) {
                    cuerpoMasLejano = cuerpo.distance_to_arrival;
                }
            });

            let cumpleTodosFiltros = true;
            if (anillo === "SI") {
                // Debe tener al menos uno
                if (anillos <= 0) {
                    cumpleTodosFiltros = false;
                }
            } else if (anillo === "NO") {
                // No debe tener ni uno
                if (anillos > 0) {
                    cumpleTodosFiltros = false;
                }
            }

            if (cinturon === "SI") {
                // Debe tener al menos uno
                if (cinturones <= 0) {
                    cumpleTodosFiltros = false;
                }
            } else if (cinturon === "NO") {
                // No debe tener ni uno
                if (cinturones > 0) {
                    cumpleTodosFiltros = false;
                }
            }

            if (aterrizable === "SI") {
                // Debe tener al menos uno
                if (aterrizables <= 0) {
                    cumpleTodosFiltros = false;
                }
            } else if (aterrizable === "NO") {
                // No debe tener ni uno
                if (aterrizables > 0) {
                    cumpleTodosFiltros = false;
                }
            }

            // // if (cuerpoMasLejano > 10000) {
            // //     cumpleTodosFiltros = false;
            // // }
            // // if (aterrizables < 5) {
            // //     cumpleTodosFiltros = false;
            // // }
            // // if (tipoTierra == 0 && terraformacion == 0 && acuatico == 0 && amoniaco == 0 && altoContenidoMetal == 0) {
            // //     cumpleTodosFiltros = false;
            // // }

            if (!cumpleTodosFiltros && cumplenFiltros) {
                return null;
            }

            if (cumpleTodosFiltros && !cumplenFiltros) {
                return null;
            }

            return (
                <tr key={sistema.name}>
                    <td>
                        <a target="_blank" href={"https://inara.cz/elite/starsystem/?search=" + sistema.name}>
                            <img className={estilos.logoInara} src={inara} />
                        </a>
                        &nbsp;
                        <Enlace to={"?sistema=" + sistema.name}>{sistema.name}</Enlace>
                    </td>
                    <td>{new Intl.NumberFormat("es-CO", { currency: "EUR" }).format(sistema.distance)} AL</td>
                    {/* <td>{estrellas}</td> */}
                    <td>{planetasLunas}</td>
                    <td>{aterrizables}</td>

                    <td>{tipoTierra + terraformacion}</td>
                    <td>{acuatico + amoniaco}</td>
                    <td>{ricoEnMetal + altoContenidoMetal}</td>

                    <td>{cinturones}</td>
                    <td>{anillos}</td>
                    <td>{new Intl.NumberFormat("es-CO", { currency: "EUR" }).format( cuerpoMasLejano.toFixed(0) )} sL</td>
                </tr>
            );
        });
    }

    function pintarSistemasColonizando() {
        let sistemasColonizados = sistemasAlcanceColonizados.filter(s => s.is_colonised === true);
        let sistemasOrdenados = ordenarSistemas(sistemasColonizados);

        return sistemasOrdenados.map(sistema => {
            return (
                <tr key={sistema.name}>
                    <td>
                        <a target="_blank" href={"https://inara.cz/elite/starsystem/?search=" + sistema.name}>
                            <img className={estilos.logoInara} src={inara} />
                        </a>
                        &nbsp;
                        <Enlace to={"?sistema=" + sistema.name}>{sistema.name}</Enlace>
                    </td>
                    <td>{new Intl.NumberFormat("es-CO", { currency: "EUR" }).format(sistema.distance)} AL</td>
                </tr>
            );
        });
    }

    function pintarSistemasReclamando() {
        let sistemasReclamando = sistemasAlcanceColonizados.filter(s => s.is_being_colonised === true);
        let sistemasOrdenados = ordenarSistemas(sistemasReclamando);

        return sistemasOrdenados.map(sistema => {
            return (
                <tr key={sistema.name}>
                    <td>
                        <a target="_blank" href={"https://inara.cz/elite/starsystem/?search=" + sistema.name}>
                            <img className={estilos.logoInara} src={inara} />
                        </a>
                        &nbsp;
                        <Enlace to={"?sistema=" + sistema.name}>{sistema.name}</Enlace>
                    </td>
                    <td>{new Intl.NumberFormat("es-CO", { currency: "EUR" }).format(sistema.distance)} AL</td>
                </tr>
            );
        });
    }

    function pintarSistemasPoblados() {
        let sistemasOrdenados = ordenarSistemas(sistemasAlcancePoblados);

        return sistemasOrdenados.map(sistema => {
            return (
                <tr key={sistema.name}>
                    <td>
                        <a target="_blank" href={"https://inara.cz/elite/starsystem/?search=" + sistema.name}>
                            <img className={estilos.logoInara} src={inara} />
                        </a>
                        &nbsp;
                        <Enlace to={"?sistema=" + sistema.name}>{sistema.name}</Enlace>
                    </td>
                    <td>{new Intl.NumberFormat("es-CO", { currency: "EUR" }).format(sistema.distance)} AL</td>
                </tr>
            );
        });
    }

    useEffect(() => {
        // Constructor
        isMounted.current = true;

        try {
            // recuperarListaSistemas();
        } catch (error) {
            console.log(error);
        }
    }, []);

    return (
        <>
            <div className="row">
                <div className="col-sm-12">
                    <Progreso visible={cargando} />
                </div>

                <div className="col-sm-12">
                    <b>Sistema: </b>
                    <Enlace to={"?sistema=" + nombreSistema}>{nombreSistema}</Enlace>
                    <br />
                    <br />
                </div>
            </div>

            <div className="row">
                <div className="col-sm-12">
                    <h4>Filtros dinámicos:</h4>
                </div>

                <div className="col-sm-12 col-md-4">
                    <label htmlFor="aterrizable">Debe tener cuerpos aterrizables: </label>
                    <select id="aterrizable" onChange={cambiaAterrizable} value={aterrizable} disabled={cargando} className={estilos.selectAlcance}>
                        <option value=""></option>
                        <option value="SI">Sí</option>
                        <option value="NO">No</option>
                    </select>
                    &nbsp;&nbsp;
                </div>

                <div className="col-sm-12 col-md-4">
                    <label htmlFor="anillo">Debe tener algún anillo: </label>
                    <select name="anillo" onChange={cambiaAnillo} value={anillo} disabled={cargando} className={estilos.selectAlcance}>
                        <option value=""></option>
                        <option value="SI">Sí</option>
                        <option value="NO">No</option>
                    </select>
                    &nbsp;&nbsp;
                </div>

                <div className="col-sm-12 col-md-4">
                    <label htmlFor="cinturon">Debe tener cinturón de asteroides: </label>
                    <select id="cinturon" onChange={cambiaCinturon} value={cinturon} disabled={cargando} className={estilos.selectAlcance}>
                        <option value=""></option>
                        <option value="SI">Sí</option>
                        <option value="NO">No</option>
                    </select>
                    &nbsp;&nbsp;
                </div>
            </div>

            <div className="row">
                <div className="col-sm-12">
                    <h4>Búsqueda:</h4>
                </div>

                <div className="col-sm-12 col-md-4">
                    <label htmlFor="faccion">Distancia máxima: </label>
                    <select id="faccion" onChange={cambiaAlcance} value={alcance} disabled={cargando} className={estilos.selectAlcance}>
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
                    <h4>Orden:</h4>
                </div>

                <div className="col-sm-12 col-md-4">
                    <label htmlFor="columna">Columna: </label>
                    <select id="columna" onChange={cambiaOrden} value={orden} disabled={cargando} className={estilos.selectAlcance}>
                        <option value="name">Nombre</option>
                        <option value="distance">Distancia Origen</option>
                    </select>
                    &nbsp;&nbsp;
                </div>

                <div className="col-sm-12 col-md-4">
                    <label htmlFor="columna">Sentido: </label>
                    <select id="columna" onChange={cambiaSentido} value={sentido} disabled={cargando} className={estilos.selectAlcance}>
                        <option value="ASC">Ascendente</option>
                        <option value="DESC">Descendente</option>
                    </select>
                    &nbsp;&nbsp;
                </div>
            </div>

            <div className="row">
                <div className="col-sm-12">
                    <h4>Sistemas probablemente libres:</h4>
                    <table className={estilos.tablaSistemas}>
                        <thead>
                            <tr>
                                <th width={175}>Nombre</th>
                                <th>Distancia Origen</th>
                                {/* <th>Estrellas</th> */}
                                <th>Planetas y Satélites</th>
                                <th>Cuerpos aterrizables</th>

                                <th>Tipo Tierra o Terraformable</th>
                                <th>Acuaticos o Amoniaco</th>
                                <th>Metalicos</th>

                                <th>Cinturon de asteroides</th>
                                <th>Anillos</th>
                                <th>Cuerpo más lejano</th>
                            </tr>
                        </thead>
                        <tbody>{cargando ? null : pintarSistemasLibresFiltrados()}</tbody>
                        <tbody className={estilos.sistemasRojo}>{cargando ? null : pintarSistemasLibresExcluidos()}</tbody>
                    </table>
                </div>
            </div>

            <div className="row">
                <div className="col-sm-12">
                    <h4>Sistemas colonizados por jugadores:</h4>
                    <table className={estilos.tablaSistemas + " " + estilos.sistemasVerde}>
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Distancia Origen</th>
                            </tr>
                        </thead>
                        <tbody>{cargando ? null : pintarSistemasColonizando()}</tbody>
                    </table>
                </div>
            </div>

            <div className="row">
                <div className="col-sm-12">
                    <h4>Sistemas en proceso de reclamación por jugadores:</h4>
                    <table className={estilos.tablaSistemas + " " + estilos.sistemasVerde}>
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Distancia Origen</th>
                            </tr>
                        </thead>
                        <tbody>{cargando ? null : pintarSistemasReclamando()}</tbody>
                    </table>
                </div>
            </div>

            <div className="row">
                <div className="col-sm-12">
                    <h4>Sistemas poblados:</h4>
                    <table className={estilos.tablaSistemas + " " + estilos.sistemasAzul}>
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Distancia Origen</th>
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
