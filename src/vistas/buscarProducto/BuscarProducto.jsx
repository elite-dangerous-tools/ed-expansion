import React, { useEffect, useRef, useState } from "react";
import Select from "react-select";

import estilos from "./BuscarProducto.module.css";

import { formateaNumero } from "../../utilidades";
import Progreso from "../../elementos/Progreso";

import outpost from "../../imagenes/Outpost.png";
import asteroid from "../../imagenes/Asteroid.png";
import odyssey from "../../imagenes/OdysseySettlement.png";
import coriolis from "../../imagenes/Coriolis.png";
import ocellus from "../../imagenes/Ocellus.png";
import orbis from "../../imagenes/Orbis.png";
import megaship from "../../imagenes/Megaship.jpg";
import PlanetaryPort from "../../imagenes/PlanetaryPort.png";
import planetaryOutpost from "../../imagenes/PlanetaryOutpost.png";

let dominio = "https://stormseekers.twilightparadox.com";
// if (window.location.hostname === "localhost") {
//     dominio = "http://localhost:5000";
// }

const idiomasDisponibles = [
    {
        id: "es",
        texto: "Español",
    },
    {
        id: "en",
        texto: "English",
    },
];

const alcancesDisponibles = [
    {
        id: 25,
        texto: "25 AL",
    },
    {
        id: 50,
        texto: "50 AL",
    },
    {
        id: 100,
        texto: "100 AL",
    },
    {
        id: 150,
        texto: "150 AL (Más lento)",
    },
];

const suministrosMinimos = [
    {
        id: 1,
        texto: "1",
    },
    {
        id: 100,
        texto: "100",
    },
    {
        id: 1000,
        texto: "1000",
    },
    {
        id: 5000,
        texto: "5000",
    },
    {
        id: 10000,
        texto: "10000",
    },
];

const BuscarProducto = ({ parametrosUrl, listaProdInicial }) => {
    const isMounted = useRef(false);

    const [cargando, setCargando] = useState(true);
    const [listaProductos, setListaProductos] = useState([]);
    const [estacionesProducto, setEstacionesProducto] = useState([]);

    const [nombreSistema, setNombreSistema] = useState(parametrosUrl.buscarProducto || "Sol");
    const [alcance, setAlcance] = useState(parametrosUrl.alcance ? parseInt(parametrosUrl.alcance) : alcancesDisponibles[0].id);
    const [productosSeleccionados, setProductosSeleccionados] = useState([]);
    const [plataforma, setPlataforma] = useState(parametrosUrl.plataforma || "M");
    const [planetaria, setPlanetaria] = useState(parametrosUrl.planetaria || "1");
    const [idioma, setIdioma] = useState(parametrosUrl.idioma || "es");
    const [orden, setOrden] = useState(parametrosUrl.orden || "distanciasistema");
    const [suministroMinimo, setSuministroMinimo] = useState(parametrosUrl.suministroMinimo ? parseInt(parametrosUrl.suministroMinimo) : 100);

    useEffect(() => {
        // Constructor
        isMounted.current = true;

        try {
            recuperarListaProductos();
        } catch (error) {
            console.log(error);
        }
    }, []);

    useEffect(() => {
        // hemos cambiado el alcance o el producto
        recuperarProductosEstaciones();
    }, [alcance, productosSeleccionados]);

    useEffect(() => {
        // hemos cambiado el alcance o el producto o el idioma
        guardarParametros();
    }, [alcance, productosSeleccionados, idioma, orden, suministroMinimo, plataforma, planetaria]);

    useEffect(() => {
        // hemos recuperado los productos

        if (listaProdInicial.length > 0 && productosSeleccionados.length === 0 && listaProductos.length > 0) {
            let nuevosProductos = [];
            listaProdInicial.forEach((fila) => {
                const articulo = listaProductos.find((item) => item.id === fila.value);

                let nombreProducto = articulo.id;
                if (idioma === "es") {
                    nombreProducto = articulo.nombre;
                } else if (idioma === "en") {
                    nombreProducto = articulo.name;
                }

                nuevosProductos.push({
                    value: fila.value,
                    label: nombreProducto,
                });
            });

            setProductosSeleccionados(nuevosProductos);
        }
    }, [listaProductos]);

    function cambiaAlcance(evento) {
        const nuevoAlcance = evento.target.value;
        setAlcance(nuevoAlcance);
    }

    function cambiaIdioma(evento) {
        const nuevoIdioma = evento.target.value;
        setIdioma(nuevoIdioma);
    }

    function cambiaProductos(articulos, config) {
        setProductosSeleccionados(articulos);
    }

    function cambiaOrden(evento) {
        setOrden(evento.target.value);
    }

    function cambiaPlataforma(evento) {
        setPlataforma(evento.target.value);
    }

    function cambiaPlanetaria(evento) {
        setPlanetaria(evento.target.value);
    }

    function cambiaSuministroMinimo(evento) {
        setSuministroMinimo(evento.target.value);
    }

    function guardarParametros() {
        const params = new URLSearchParams(window.location.search);

        params.set("alcance", alcance);
        params.set("idioma", idioma);
        params.set("orden", orden);
        params.set("plataforma", plataforma);
        params.set("planetaria", planetaria);
        params.set("suministroMinimo", suministroMinimo);

        const valoresProductos = productosSeleccionados.map((item) => item.value);
        params.set("productos", valoresProductos);

        // Actualizar la URL sin recargar la página
        const nuevaURL = `${window.location.pathname}?${params.toString()}`;
        window.history.pushState({}, "", nuevaURL);
    }

    async function recuperarListaProductos() {
        let urlProductos = dominio + "/api/productos";
        let response = await fetch(encodeURI(urlProductos), {
            method: "GET",
        });

        if (response.status >= 200 && response.status < 300) {
            const todosProductos = await response.json();
            setListaProductos(todosProductos);
        } else {
            alert("Fallo al recuperar los productos: " + response.statusText);
        }
        setCargando(false);
    }

    async function recuperarProductosEstaciones() {
        if (alcance <= 0) {
            return;
        }

        if (productosSeleccionados.length === 0) {
            return;
        }

        const valoresProductos = productosSeleccionados.map((item) => item.value);

        setCargando(true);
        let urlAlcance = dominio + "/api/estaciones_producto?distancia=" + alcance + "&sistema=" + nombreSistema + "&productos=" + valoresProductos;
        let response = await fetch(encodeURI(urlAlcance), {
            method: "GET",
        });

        if (response.status >= 200 && response.status < 300) {
            const estacionesConProducto = await response.json();
            setEstacionesProducto(estacionesConProducto);
            setCargando(false);
        } else {
            alert("Fallo al recuperar las estaciones: " + response.statusText);
            setCargando(false);
        }
    }

    function compararProductos(a, b) {
        let valor1 = "";
        let valor2 = "";

        if (idioma == "es") {
            valor1 = a.nombre.toLowerCase();
            valor2 = b.nombre.toLowerCase();
        } else if (idioma == "en") {
            valor1 = a.name.toLowerCase();
            valor2 = b.name.toLowerCase();
        } else {
            valor1 = a.id.toLowerCase();
            valor2 = b.id.toLowerCase();
        }

        if (valor1 < valor2) {
            return -1;
        }
        if (valor1 > valor2) {
            return 1;
        }

        return 0;
    }

    function compararProductosSeleccionados(a, b) {
        const valor1 = a.label.toLowerCase();
        const valor2 = b.label.toLowerCase();

        if (valor1 < valor2) {
            return -1;
        }
        if (valor1 > valor2) {
            return 1;
        }

        return 0;
    }

    function compararEstaciones(a, b) {
        let valor1 = "";
        let valor2 = "";

        switch (orden) {
            case "suministro":
                // Orden descendente
                valor1 = parseFloat(b.suministroTotal);
                valor2 = parseFloat(a.suministroTotal);

                if (valor1 === valor2) {
                }

                break;
            case "distanciasistema":
            default:
                // Orden ascendente
                valor1 = parseFloat(a.distanciasistema);
                valor2 = parseFloat(b.distanciasistema);

                if (valor1 === valor2) {
                    valor1 = parseFloat(a.distanciaestacion);
                    valor2 = parseFloat(b.distanciaestacion);
                }

                break;
        }

        if (valor1 < valor2) {
            return -1;
        }
        if (valor1 > valor2) {
            return 1;
        }

        return 0;
    }

    function mostrarDescripProductos() {
        return productosSeleccionados.map((fila) => {
            const productoSeleccionado = listaProductos.find((prod) => prod.id === fila.value);

            let nombreProducto = productoSeleccionado.id;
            if (idioma === "es") {
                nombreProducto = productoSeleccionado.nombre;
            } else if (idioma === "en") {
                nombreProducto = productoSeleccionado.name;
            }

            return (
                <tr key={fila.value}>
                    <td>{nombreProducto}</td>
                    <td>{formateaNumero(productoSeleccionado.max_stock, idioma)}</td>
                    <td>{formateaNumero(productoSeleccionado.avg_stock, idioma)}</td>
                </tr>
            );
        });
    }

    function datosProducto(articulo) {
        let descrip = articulo.id;

        if (idioma === "es") {
            descrip = articulo.nombre;
        } else if (idioma === "en") {
            descrip = articulo.name;
        }

        return {
            value: articulo.id,
            label: descrip,
        };
    }

    function mostrarProductosSeleccionados() {
        const listaProdSeleccionados = productosSeleccionados.map((fila) => {
            const articulo = listaProductos.find((item) => item.id === fila.value);

            let nombreProducto = articulo.id;
            if (idioma === "es") {
                nombreProducto = articulo.nombre;
            } else if (idioma === "en") {
                nombreProducto = articulo.name;
            }

            return {
                value: fila.value,
                label: nombreProducto,
            };
        });

        const productosSeleccionadosOrdenados = listaProdSeleccionados.sort(compararProductosSeleccionados);
        return productosSeleccionadosOrdenados;
    }

    function productosOrdenados() {
        const listaProductosOrdenados = listaProductos.sort(compararProductos);
        return listaProductosOrdenados.map(datosProducto);
    }

    function filtrarEstacionesProducto(fila) {
        if (fila.suministro < suministroMinimo) {
            return null;
        }

        if (fila.estacion.includes("Trailblazer")) {
            // Los Trailblazer son como meganaves
            fila.tipo = "Mega ship";
        }

        // Filtro de plataforma
        if (plataforma === "L") {
            switch (fila.tipo) {
                case "Outpost":
                    // case "Planetary Outpost":
                    // case "Odyssey Settlement": // Alguno podría tener plataforma grande
                    return null;

                default:
                    break;
            }
        }

        // Filtro de planeta
        if (planetaria === "0") {
            switch (fila.tipo) {
                case "Planetary Outpost":
                case "Planetary Port":
                case "Odyssey Settlement":
                    return null;

                default:
                    break;
            }
        }

        return fila;
    }

    function tipoEstacion(nombreTipo) {
        if (idioma === "en") {
            return nombreTipo;
        }

        if (idioma !== "es") {
            return nombreTipo;
        }

        switch (nombreTipo) {
            case "Outpost":
                break;

            case "Asteroid base":
                return "Base de Asteroide";

            case "Odyssey Settlement":
                break;

            case "Planetary Port":
                return "Base Planetaria";

            case "Planetary Outpost":
                break;

            case "Ocellus Starport":
                break;

            case "Orbis Starport":
                break;

            case "Mega ship":
                break;

            default:
                break;
        }

        return nombreTipo;
    }

    function agruparEstacionesProductos(filas) {
        const estacionesAgrupadas = [];

        let filaActual = undefined;
        filas.forEach((fila) => {
            let mismoSistema = filaActual && filaActual.sistema === fila.sistema;
            let mismaEstacionYSistema = filaActual && mismoSistema && filaActual.estacion === fila.estacion;

            if (!mismaEstacionYSistema) {
                if (filaActual !== undefined) {
                    estacionesAgrupadas.push(filaActual);
                }

                filaActual = { ...fila };
                filaActual.suministroTotal = 0;
                filaActual.suministro = [];
                filaActual.producto = [];
                filaActual.precio = [];
            }

            let nombreProducto = fila.producto;
            const productoFila = listaProductos.find((prod) => prod.id === fila.producto);
            if (productoFila) {
                if (idioma === "es") {
                    nombreProducto = productoFila.nombre;
                } else if (idioma === "en") {
                    nombreProducto = productoFila.name;
                }
            }

            filaActual.suministroTotal += fila.suministro;
            filaActual.suministro.push(<div>{formateaNumero(fila.suministro, idioma)}</div>);
            filaActual.producto.push(<div>{nombreProducto}</div>);
            filaActual.precio.push(<div>{formateaNumero(fila.precio, idioma)}</div>);
        });

        if (filaActual !== undefined) {
            estacionesAgrupadas.push(filaActual);
        }
        return estacionesAgrupadas;
    }

    function mostrarEstacionesProducto() {
        const estacionesProductoFiltradas = estacionesProducto.filter(filtrarEstacionesProducto);
        const estacionesAgrupadasPorProducto = agruparEstacionesProductos(estacionesProductoFiltradas);
        const estacionesConProductosOrdenadas = estacionesAgrupadasPorProducto.sort(compararEstaciones);

        let ultimaFilaVisualizada = null;
        return estacionesConProductosOrdenadas.map((fila) => {
            let mismoSistema = ultimaFilaVisualizada && ultimaFilaVisualizada.sistema === fila.sistema;
            // let mismaEstacion = ultimaFilaVisualizada && mismoSistema && ultimaFilaVisualizada.estacion === fila.estacion;

            let imagenEstacion = "";
            switch (fila.tipo) {
                case "Outpost": // Medio
                    imagenEstacion = outpost;
                    break;

                case "Asteroid base": // Grande
                    imagenEstacion = asteroid;
                    break;

                case "Odyssey Settlement": // ???
                    imagenEstacion = odyssey;
                    break;

                case "Coriolis Starport": // Grande
                    imagenEstacion = coriolis;
                    break;

                case "Planetary Port": // Grande??
                    imagenEstacion = PlanetaryPort;
                    break;

                case "Planetary Outpost": // Grande??
                    imagenEstacion = planetaryOutpost;
                    break;

                case "Ocellus Starport": // Grande
                    imagenEstacion = ocellus;
                    break;

                case "Orbis Starport": // Grande
                    imagenEstacion = orbis;
                    break;

                case "Mega ship": // Grande
                    imagenEstacion = megaship;
                    break;

                default:
                    break;
            }

            ultimaFilaVisualizada = fila;
            return (
                <tr key={fila.sistema + "-" + fila.estacion}>
                    <td>{<img className={estilos.imagenEstacion} src={imagenEstacion} />}</td>
                    <td>{fila.distanciaestacion + " sl"}</td>
                    <td>{fila.estacion}</td>
                    <td>{tipoEstacion(fila.tipo)}</td>

                    <td>{mismoSistema ? null : fila.distanciasistema.toFixed(2) + " AL"}</td>
                    <td>{mismoSistema ? null : fila.sistema}</td>

                    <td>{fila.producto}</td>
                    <td>{fila.suministro}</td>
                    <td>{fila.precio}</td>
                </tr>
            );
        });
    }

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
            </div>

            <div className="row">
                <div className="col-sm-12">
                    <h4>Filtros dinámicos:</h4>
                </div>

                <div className="col-sm-6 col-md-3">
                    <label htmlFor="idioma">Idioma (de productos y números): </label>
                    <select id="idioma" onChange={cambiaIdioma} value={idioma} disabled={cargando} className={estilos.selectAlcance}>
                        {idiomasDisponibles.map((idioma) => {
                            return (
                                <option key={idioma.id} value={idioma.id}>
                                    {idioma.texto}
                                </option>
                            );
                        })}
                    </select>
                    &nbsp;&nbsp;
                </div>

                <div className="col-sm-6 col-md-3">
                    <label htmlFor="suministroMinimo">Suministro mínimo: </label>
                    <select
                        id="suministroMinimo"
                        onChange={cambiaSuministroMinimo}
                        value={suministroMinimo}
                        disabled={cargando}
                        className={estilos.selectAlcance}
                    >
                        {suministrosMinimos.map((filaSuministroMinimo) => {
                            return (
                                <option key={filaSuministroMinimo.id} value={filaSuministroMinimo.id}>
                                    {filaSuministroMinimo.texto}
                                </option>
                            );
                        })}
                    </select>
                    &nbsp;&nbsp;
                </div>

                <div className="col-sm-6 col-md-3">
                    <label htmlFor="plataforma">Plataforma más grande: </label>
                    <select id="plataforma" onChange={cambiaPlataforma} value={plataforma} disabled={cargando} className={estilos.selectPlataforma}>
                        <option value="M">Mediana</option>
                        <option value="L">Grande</option>
                    </select>
                    &nbsp;&nbsp;
                </div>

                <div className="col-sm-6 col-md-3">
                    <label htmlFor="planetaria">Usar estaciones planetarias: </label>
                    <select id="planetaria" onChange={cambiaPlanetaria} value={planetaria} disabled={cargando} className={estilos.selectPlataforma}>
                        <option value="1">Sí</option>
                        <option value="0">No</option>
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
                        <option value="distanciasistema">Distancia Sistema</option>
                        <option value="suministro">Suministro</option>
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

                <div className="col-sm-12 col-md-4">
                    <label htmlFor="producto">Productos: </label>
                    <Select
                        value={mostrarProductosSeleccionados()}
                        isMulti={true}
                        name="productos"
                        options={productosOrdenados()}
                        isClearable={true}
                        isDisabled={cargando}
                        placeholder="Buscar Productos"
                        onChange={cambiaProductos}
                        className="basic-multi-select"
                        classNamePrefix="select"
                    />
                    &nbsp;&nbsp;
                </div>

                <div className="col-sm-12">
                    <table className={estilos.tablaSistemas + " " + estilos.tablaProductos}>
                        <thead>
                            <tr>
                                <th>Producto</th>
                                <th>Estación con más unidades</th>
                                <th>Media de unidades por estación</th>
                            </tr>
                        </thead>
                        <tbody>{mostrarDescripProductos()}</tbody>
                    </table>
                </div>
            </div>

            <div className="row">
                <div className="col-sm-12">
                    <h4>Estaciones:</h4>
                    <table className={estilos.tablaSistemas}>
                        <thead>
                            <tr>
                                <th></th>
                                <th width={50}>Distancia estación</th>
                                <th>Estación</th>
                                <th>Tipo</th>

                                <th width={50}>Distancia sistema</th>
                                <th>Sistema</th>

                                <th width={175}>
                                    Producto
                                </th>
                                <th>Suministro</th>
                                <th>Precio</th>
                            </tr>
                        </thead>
                        <tbody>{cargando ? null : mostrarEstacionesProducto()}</tbody>
                    </table>
                </div>
            </div>
        </>
    );
};

export default BuscarProducto;
