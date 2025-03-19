import React, { useEffect, useRef, useState } from "react";

import estilos from "./BuscarProducto.module.css";

import { dameBusqueda, dameBusquedaMultiple } from "../../utilidades";
import Progreso from "../../elementos/Progreso";

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
    const [producto, setProducto] = useState("0");
    const [idioma, setIdioma] = useState("es");
    const [estacionesProducto, setEstacionesProducto] = useState([]);

    const alcancesDisponibles = [
        {
            id: "15",
            valor: 15,
            texto: "15 AL",
        },
        {
            id: "30",
            valor: 30,
            texto: "30 AL",
        },
        {
            id: "60",
            valor: 60,
            texto: "60 AL (Más lento)",
        },
        {
            id: "100",
            valor: 100,
            texto: "100 AL (Muy lento)",
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

    function cambiaAlcance(evento) {
        const nuevoAlcance = evento.target.value;
        setAlcance(nuevoAlcance);
    }

    function cambiaProducto(evento) {
        const nuevoProducto = evento.target.value;
        setProducto(nuevoProducto);
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
        // let valor1 = sentido === "ASC" ? a[orden] : b[orden];
        // let valor2 = sentido === "ASC" ? b[orden] : a[orden];

        // if (isNaN(valor1) || isNaN(valor2)) {
        //     // Si alguno no es númerico, ordenamos como texto
        //     valor1 = valor1.toLowerCase();
        //     valor2 = valor2.toLowerCase();
        // } else {
        //     // Es numérico
        //     valor1 = parseFloat(valor1);
        //     valor2 = parseFloat(valor2);
        // }

        // Por ahora ordenamos en castellano
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

    function mostrarProducto(articulo) {
        if (idioma === "es") {
            return (
                <option key={articulo.id} value={articulo.id}>
                    {articulo.nombre} ({articulo.name})
                </option>
            );
        } else if (idioma === "en") {
            return (
                <option key={articulo.id} value={articulo.id}>
                    {articulo.name} ({articulo.nombre})
                </option>
            );
        } else {
            return (
                <option key={articulo.id} value={articulo.id}>
                    {articulo.id}
                </option>
            );
        }
    }

    function mostrarProductos() {
        let productosOrdenados = listaProductos.sort(compararProductos);
        return productosOrdenados.map(mostrarProducto);
    }

    function mostrarEstacionesProducto() {
        // let estacionesConProductosOrdenadas = estacionesProducto.sort(compararEstaciones);

        return estacionesProducto.map((fila) => {
            return (
                <tr key={fila.id}>
                    <td>{fila.name}</td>
                    <td>{fila.distance}</td>
                    <td>{fila.type}</td>
                    {/* <td>{fila.id_producto}</td>
                    <td>{fila.id_estacion}</td> */}
                    <td>{fila.stock}</td>
                    <td>{fila.sellprice}</td>
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
                    <label htmlFor="faccion">Productos: </label>
                    <select id="faccion" onChange={cambiaProducto} value={producto} disabled={cargando} className={estilos.selectProducto}>
                        <option value="0"></option>
                        {mostrarProductos()}
                    </select>
                    &nbsp;&nbsp;
                </div>
            </div>

            <div className="row">
                <div className="col-sm-12">
                    <h4>Estaciones:</h4>
                    <table className={estilos.tablaSistemas}>
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Distancia</th>
                                <th>Tipo</th>
                                {/* <th>id_producto</th> */}
                                {/* <th>id_estacion</th> */}
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
