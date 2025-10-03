import React, { useEffect, useRef, useState } from "react";

import estilos from "./SistemaIniciarColonizacion.module.css";

import { dameBusqueda } from "../../utilidades";
import Progreso from "../../elementos/Progreso";
import Enlace from "../../elementos/Enlace";

const SistemaIniciarColonizacion = () => {
    const isMounted = useRef(false);
    const nombreSistema = useRef(dameBusqueda()).current;

    const [sistemasRecuperadosLoading, setSistemasRecuperadosLoading] = useState(0);

    const [cargando, setCargando] = useState(false);
    const [alcance, setAlcance] = useState("0");
    const [anillo, setAnillo] = useState(false);
    const [cinturon, setCinturon] = useState(false);

    const [orden, setOrden] = useState("distanciaOrigen");
    const [sentido, setSentido] = useState("ASC");

    const [aterrizable, setAterrizable] = useState(false);
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
        {
            id: "3",
            valor: 60,
            texto: "60 AL (Muy lento)",
        },
    ];

    async function recuperarSistemasAlcance() {
        sistemasRecuperados = 0;
        let radio = alcancesDisponibles.find((fila) => fila.id === alcance).valor;
        if (radio <= 0) {
            return;
        }

        let dominio = "https://stormseekers.twilightparadox.com";
        // if (window.location.hostname === 'localhost') {
        //     dominio = "http://localhost:5000";
        // }

        let urlAlcance = dominio + "/api/sistemas_alcance?distancia=" + radio + "&sistema=" + nombreSistema;
        let response = await fetch(encodeURI(urlAlcance), {
            method: "GET",
        });

        if (response.status >= 200 && response.status < 300) {
            const sistemasBBDD = await response.json();
            setSistemasAlcance(sistemasBBDD);
        } else {
            alert("Fallo al recuperar los sistemas de la burbuja: " + response.statusText);
            setCargando(false);
        }

    }

    async function recuperarInfoSistemas() {
        let radio = alcancesDisponibles.find((fila) => fila.id === alcance).valor;
        if (radio <= 0) {
            return;
        }

        let modoLento = radio > 30;
        let indice = 0;
        for (const key in sistemasAlcance) {
            const sistema = sistemasAlcance[key];

            if (modoLento || indice % 10 === 0) {
                // En modo lento o cada 10 esperamos
                await recuperarInfoSistema(sistema, modoLento);
            } else {
                recuperarInfoSistema(sistema, modoLento);
            }

            indice++;
        }
    }

    async function recuperarInfoSistema(sistema, modoLento) {
        try {
            if (modoLento) {
                await comprobarSistema(sistema, modoLento);
            } else {
                comprobarSistema(sistema, modoLento);
            }
        } catch (error) {
            sistemasRecuperados++;
            comprobarFinCarga();
        }
    }

    async function comprobarSistema(sistema, modoLento) {
        if (sistema.tiene_estaciones_terminadas) {
            // Si tiene alguna estación terminadas es un sistema poblado
            sistema.name = sistema.nombre;
            sistema.distanciaOrigen = sistema.distancia;
            sistemasAntiguos.push(sistema);
            sistemasRecuperados++;
            comprobarFinCarga();
        } else if (sistema.tiene_estaciones_construccion) {
            // Si tiene estaciones en obra y terminadas, es un sistema siendo colonizado por otro jugador
            sistema.name = sistema.nombre;
            sistema.distanciaOrigen = sistema.distancia;
            sistemasColonizando.push(sistema);
            sistemasRecuperados++;
            comprobarFinCarga();
        } else {
            if (modoLento) {
                await recuperarCuerposSistema(sistema);
            } else {
                recuperarCuerposSistema(sistema);
            }
        }

    }

    async function recuperarCuerposSistema(sistema) {
        // Sistemas como WISE 1405+5534 este fallan al recuperar sin encodeURI
        let response = await fetch(encodeURI("https://www.edsm.net/api-system-v1/bodies?systemName=" + sistema.nombre), {
            method: "GET",
        });

        if (response.status >= 200 && response.status < 300) {
            const infoSistema = await response.json();
            infoSistema.distanciaOrigen = sistema.distancia;
            infoSistema.name = sistema.nombre;
            sistemasLibres.push(infoSistema);
        }

        sistemasRecuperados++;
        comprobarFinCarga();

        setSistemasRecuperadosLoading(sistemasRecuperados);
    }

    function comprobarFinCarga() {
        setSistLibres(sistemasLibres);
        setSistOcupados(sistemasColonizando);
        setSistPoblados(sistemasAntiguos);

        if (cargando === true && sistemasAlcance.length === sistemasRecuperados) {
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

    function pintarSistemasLibres(cumplenFiltros = undefined) {
        let sistemasOrdenados = ordenarSistemas(sistLibres);

        return sistemasOrdenados.map((sistema) => {
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

            sistema.bodies.forEach((cuerpo) => {
                if (cuerpo.type === "Star") {
                    estrellas++;

                    if (cuerpo.belts && cuerpo.belts.length > 0) {
                        cinturones += cuerpo.belts.length;
                    }
                } else {
                    planetasLunas++;
                    let esTerraformable = cuerpo.terraformingState != null && cuerpo.terraformingState != "Not terraformable";
                    if (esTerraformable) {
                        terraformacion++;
                    }

                    if (cuerpo.subType && cuerpo.subType === "Earth-like world") {
                        tipoTierra++;
                    } else if (cuerpo.subType && cuerpo.subType === "Water world") {
                        acuatico++;
                    } else if (cuerpo.subType && cuerpo.subType === "Ammonia world") {
                        amoniaco++;
                    } else if (cuerpo.subType && cuerpo.subType === "Metal-rich body") {
                        ricoEnMetal++;
                    } else if (cuerpo.subType && cuerpo.subType === "High metal content world") {
                        altoContenidoMetal++;
                    }

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


            // if (cuerpoMasLejano > 10000) {
            //     cumpleTodosFiltros = false;
            // }
            // if (aterrizables < 5) {
            //     cumpleTodosFiltros = false;
            // }
            // if (tipoTierra == 0 && terraformacion == 0 && acuatico == 0 && amoniaco == 0 && altoContenidoMetal == 0) {
            //     cumpleTodosFiltros = false;
            // }
            

            if (!cumpleTodosFiltros && cumplenFiltros) {
                return null;
            }

            if (cumpleTodosFiltros && !cumplenFiltros) {
                return null;
            }

            return (
                <tr key={sistema.id}>
                    <td>{sistema.name}</td>
                    <td>{new Intl.NumberFormat("es-CO", { currency: "EUR" }).format(sistema.distanciaOrigen)} AL</td>
                    <td>{estrellas}</td>
                    <td>{planetasLunas}</td>
                    <td>{aterrizables}</td>

                    <td>{tipoTierra + terraformacion}</td>
                    <td>{acuatico + amoniaco}</td>
                    <td>{ricoEnMetal + altoContenidoMetal}</td>

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

    function pintarSistemasColonizando() {
        let sistemasOrdenados = ordenarSistemas(sistOcupados);

        return sistemasOrdenados.map((sistema) => {
            return (
                <tr key={sistema.id}>
                    <td>{sistema.name}</td>
                    <td>{new Intl.NumberFormat("es-CO", { currency: "EUR" }).format(sistema.distanciaOrigen)} AL</td>
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
        let sistemasOrdenados = ordenarSistemas(sistPoblados);

        return sistemasOrdenados.map((sistema) => {
            return (
                <tr key={sistema.id}>
                    <td>{sistema.name}</td>
                    <td>{new Intl.NumberFormat("es-CO", { currency: "EUR" }).format(sistema.distanciaOrigen)} AL</td>
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

        try {
            // recuperarListaSistemas();
        } catch (error) {
            console.log(error);
        }
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
                    {cargando === true && sistemasAlcance.length > 0 ? (
                        <div className={estilos.contador}>
                            {sistemasRecuperadosLoading} de {sistemasAlcance.length}
                        </div>
                    ) : null}
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
                    <h4>Orden:</h4>
                </div>

                <div className="col-sm-12 col-md-4">
                    <label htmlFor="columna">Columna: </label>
                    <select id="columna" onChange={cambiaOrden} value={orden} disabled={cargando} className={estilos.selectAlcance}>
                        <option value="name">Nombre</option>
                        <option value="distanciaOrigen">Distancia Origen</option>
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
                                <th>Nombre</th>
                                <th>Distancia Origen</th>
                                <th>Estrellas</th>
                                <th>Planetas y Satélites</th>
                                <th>Cuerpos aterrizables</th>
                                
                                <th>Tipo Tierra o Terraformable</th>
                                <th>Acuaticos o Amoniaco</th>
                                <th>Metalicos</th>

                                <th>Cinturon de asteroides</th>
                                <th>Anillos</th>
                                <th>Cuerpo más lejano</th>
                                <th>Enlaces</th>
                            </tr>
                        </thead>
                        <tbody>{cargando ? null : pintarSistemasLibresFiltrados()}</tbody>
                        <tbody className={estilos.sistemasRojo}>{cargando ? null : pintarSistemasLibresExcluidos()}</tbody>
                    </table>
                </div>
            </div>

            <div className="row">
                <div className="col-sm-12">
                    <h4>Sistemas en proceso de colonizar por jugadores:</h4>
                    <table className={estilos.tablaSistemas + " " + estilos.sistemasVerde}>
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Distancia Origen</th>
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
                    <table className={estilos.tablaSistemas + " " + estilos.sistemasAzul}>
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Distancia Origen</th>
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
