import React, { useEffect, useRef, useState } from "react";
import Select from "react-select";

import estilos from "./BuscarProducto.module.css";

import { dameBusquedaMultiple, formateaNumero } from "../../utilidades";
import Progreso from "../../elementos/Progreso";

import outpost from "../../imagenes/Outpost.png";
import asteroid from "../../imagenes/Asteroid.png";
import odyssey from "../../imagenes/OdysseySettlement.png";
import coriolis from "../../imagenes/Coriolis.jpg";
import ocellus from "../../imagenes/Ocellus.png";
import megaship from "../../imagenes/Megaship.jpg";

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
        id: 10000,
        texto: "10000",
    },
];

const valoresInicialesProductos = () => {
    if (!parametrosUrl.productos) {
        return [];
    }

    return parametrosUrl.productos.split(",").map((fila) => {
        return {
            value: fila,
            label: fila,
        };
    });
};

const parametrosUrl = dameBusquedaMultiple();
const listaProdInicial = valoresInicialesProductos();

const BuscarProducto = () => {
    const isMounted = useRef(false);

    const nombreSistema = useRef(parametrosUrl.buscarProducto).current;

    const [cargando, setCargando] = useState(true);
    const [listaProductos, setListaProductos] = useState([]);
    const [estacionesProducto, setEstacionesProducto] = useState([]);

    const [alcance, setAlcance] = useState(parametrosUrl.alcance ? parseInt(parametrosUrl.alcance) : alcancesDisponibles[0].id);
    const [productos, setProductos] = useState([]);
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
    }, [alcance, productos]);

    useEffect(() => {
        // hemos cambiado el alcance o el producto o el idioma
        guardarParametros();
    }, [alcance, productos, idioma, orden, suministroMinimo]);

    useEffect(() => {
        // hemos recuperado los productos

        if (listaProdInicial.length > 0 && productos.length === 0 && listaProductos.length > 0) {
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

            setProductos(nuevosProductos);
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
        setProductos(articulos);
    }

    function cambiaOrden(evento) {
        setOrden(evento.target.value);
    }

    function cambiaSuministroMinimo(evento) {
        setSuministroMinimo(evento.target.value);
    }

    function guardarParametros() {
        const params = new URLSearchParams(window.location.search);

        params.set("alcance", alcance);
        params.set("idioma", idioma);
        params.set("orden", orden);
        params.set("suministroMinimo", suministroMinimo);

        const valoresProductos = productos.map((item) => item.value);
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

        if (productos.length === 0) {
            return;
        }

        const valoresProductos = productos.map((item) => item.value);

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

    function compararEstaciones(a, b) {
        let valor1 = "";
        let valor2 = "";

        switch (orden) {
            case "suministro":
                // Orden descendente
                valor1 = parseFloat(b.suministro);
                valor2 = parseFloat(a.suministro);

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
        return productos.map((fila) => {
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

    function productosOrdenados() {
        let listaProductosOrdenados = listaProductos.sort(compararProductos);
        return listaProductosOrdenados.map(datosProducto);
    }

    function filtrarEstacionesProducto(fila) {
        if (fila.suministro < suministroMinimo) {
            return null;
        }

        return fila;
    }

    function mostrarEstacionesProducto() {
        const estacionesProductoFiltradas = estacionesProducto.filter(filtrarEstacionesProducto);
        const estacionesConProductosOrdenadas = estacionesProductoFiltradas.sort(compararEstaciones);

        let ultimaFilaVisualizada = null;

        return estacionesConProductosOrdenadas.map((fila) => {
            const productoFila = listaProductos.find((prod) => prod.id === fila.producto);

            let nombreProducto = fila.producto;
            if (productoFila) {
                if (idioma === "es") {
                    nombreProducto = productoFila.nombre;
                } else if (idioma === "en") {
                    nombreProducto = productoFila.name;
                }
            }

            let mismoSistema = ultimaFilaVisualizada && ultimaFilaVisualizada.sistema === fila.sistema;
            let mismaEstacion = ultimaFilaVisualizada && mismoSistema && ultimaFilaVisualizada.estacion === fila.estacion;

            if (fila.estacion.includes("Trailblazer")) {
                fila.tipo = "Mega ship";
            }

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
                    imagenEstacion = "";
                    break;

                case "Planetary Outpost": // Grande??
                    imagenEstacion = "";
                    break;

                case "Ocellus Starport": // Grande
                    imagenEstacion = ocellus;
                    break;

                case "Orbis Starport": // Grande
                    imagenEstacion = "";
                    break;

                case "Mega ship": // Grande
                    imagenEstacion = megaship;
                    break;

                default:
                    break;
            }

            ultimaFilaVisualizada = fila;
            return (
                <tr key={fila.sistema + "-" + fila.estacion + "-" + fila.producto}>
                    <td>{mismaEstacion ? null : <img className={estilos.imagenEstacion} src={imagenEstacion} />}</td>
                    <td>{mismoSistema ? null : fila.distanciasistema.toFixed(2) + " AL"}</td>
                    <td>{mismoSistema ? null : fila.sistema}</td>
                    <td>{mismaEstacion ? null : fila.distanciaestacion + " sl"}</td>
                    <td>{mismaEstacion ? null : fila.estacion}</td>
                    <td>{mismaEstacion ? null : fila.tipo}</td>
                    <td>{nombreProducto}</td>
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

                <div className="col-sm-12 col-md-4">
                    <label htmlFor="idioma">Idioma: </label>
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

                <div className="col-sm-12 col-md-4">
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
                        value={productos}
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
                                <th>Distancia sistema</th>
                                <th>Sistema</th>
                                <th>Distancia estación</th>
                                <th>Estación</th>
                                <th>Tipo</th>
                                <th>Producto</th>
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
