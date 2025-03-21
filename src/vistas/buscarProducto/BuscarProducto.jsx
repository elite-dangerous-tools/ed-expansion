import React, { useEffect, useRef, useState } from "react";

import estilos from "./BuscarProducto.module.css";

import { dameBusquedaMultiple, formateaNumero } from "../../utilidades";
import Progreso from "../../elementos/Progreso";

import outpost from "../../imagenes/Outpost.png";
import asteroid from "../../imagenes/Asteroid.png";
import odyssey from "../../imagenes/OdysseySettlement.png";

let dominio = "https://stormseekers.twilightparadox.com";
// if (window.location.hostname === 'localhost') {
//     dominio = "http://localhost:5000";
// }

const BuscarProducto = () => {
    const isMounted = useRef(false);

    const parametrosUrl = dameBusquedaMultiple();
    const nombreSistema = useRef(parametrosUrl.buscarProducto).current;

    const [cargando, setCargando] = useState(true);
    const [alcance, setAlcance] = useState(parametrosUrl.alcance || "15");
    const [listaProductos, setListaProductos] = useState([]);
    const [producto, setProducto] = useState(parametrosUrl.producto || "0");
    const [idioma, setIdioma] = useState(parametrosUrl.idioma || "es");

    const [orden, setOrden] = useState(parametrosUrl.orden || "distanciasistema");

    const [estacionesProducto, setEstacionesProducto] = useState([]);

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
            id: "25",
            valor: 25,
            texto: "25 AL",
        },
        {
            id: "50",
            valor: 50,
            texto: "50 AL",
        },
        {
            id: "100",
            valor: 100,
            texto: "100 AL",
        },
        {
            id: "150",
            valor: 150,
            texto: "150 AL (Más lento)",
        },
    ];

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
    }, [alcance, producto]);

    useEffect(() => {
        // hemos cambiado el alcance o el producto o el idioma
        guardarParametros();
    }, [alcance, producto, idioma]);

    function cambiaAlcance(evento) {
        const nuevoAlcance = evento.target.value;
        setAlcance(nuevoAlcance);
    }

    function cambiaIdioma(evento) {
        const nuevoIdioma = evento.target.value;
        setIdioma(nuevoIdioma);
    }

    function cambiaProducto(evento) {
        const nuevoProducto = evento.target.value;
        setProducto(nuevoProducto);
    }

    function cambiaOrden(evento) {
        setOrden(evento.target.value);
    }

    function guardarParametros() {
        const params = new URLSearchParams(window.location.search);

        params.set("alcance", alcance);
        params.set("producto", producto);
        params.set("idioma", idioma);
        params.set("orden", orden);

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
        let radio = alcancesDisponibles.find((fila) => fila.id === alcance).valor;
        if (radio <= 0) {
            return;
        }
        if (producto == 0) {
            return;
        }

        setCargando(true);
        let urlAlcance = dominio + "/api/estaciones_producto?distancia=" + radio + "&sistema=" + nombreSistema + "&producto=" + producto;
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

    function mostrarProducto(articulo) {
        let descrip = articulo.id;

        if (idioma === "es") {
            descrip = articulo.nombre;
        } else if (idioma === "en") {
            descrip = articulo.name;
        }

        // descrip += ` (Max: ${articulo.max_stock} - Avg: ${articulo.avg_stock})`;

        return (
            <option key={articulo.id} value={articulo.id}>
                {descrip}
            </option>
        );
    }

    function mostrarDescripProducto() {
        const productoSeleccionado = listaProductos.find((prod) => prod.id === producto);

        if (!productoSeleccionado) {
            return null;
        }

        return (
            <div>
                <div>Estación con más unidades: {formateaNumero(productoSeleccionado.max_stock, idioma)}</div>

                <div>Media de unidades: {formateaNumero(productoSeleccionado.avg_stock, idioma)}</div>
            </div>
        );
    }

    function mostrarProductos() {
        let productosOrdenados = listaProductos.sort(compararProductos);
        return productosOrdenados.map(mostrarProducto);
    }

    function mostrarEstacionesProducto() {
        let estacionesConProductosOrdenadas = estacionesProducto.sort(compararEstaciones);

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

            let imagenEstacion = "";

            switch (fila.tipo) {
                case "Outpost":
                    imagenEstacion = outpost;
                    break;

                case "Asteroid base":
                    imagenEstacion = asteroid;
                    break;

                case "Odyssey Settlement":
                    imagenEstacion = odyssey;
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
                    <td>{mismaEstacion ? null : fila.distanciaestacion} sl</td>
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
                    <select id="producto" onChange={cambiaProducto} value={producto} disabled={cargando} className={estilos.selectProducto}>
                        <option value="0"></option>
                        {mostrarProductos()}
                    </select>
                    &nbsp;&nbsp;
                    <div>{mostrarDescripProducto()}</div>
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
