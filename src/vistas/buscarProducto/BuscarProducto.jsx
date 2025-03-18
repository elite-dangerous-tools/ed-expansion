import React, { useEffect, useRef, useState } from "react";

import estilos from "./BuscarProducto.module.css";

import { dameBusqueda } from "../../utilidades";
import Progreso from "../../elementos/Progreso";

let dominio = "https://stormseekers.twilightparadox.com";
// if (window.location.hostname === 'localhost') {
//     dominio = "http://localhost:5000";
// }

const BuscarProducto = () => {
    const isMounted = useRef(false);
    const nombreSistema = useRef(dameBusqueda()).current;

    const [cargando, setCargando] = useState(true);
    const [alcance, setAlcance] = useState("0");
    const [productos, setProductos] = useState([]);
    const [producto, setProducto] = useState("0");
    const [estacionesProducto, setEstacionesProducto] = useState([]);

    const alcancesDisponibles = [
        {
            id: "0",
            valor: 0,
            texto: "",
        },
        {
            id: "2",
            valor: 30,
            texto: "30 AL",
        },
        {
            id: "3",
            valor: 60,
            texto: "60 AL (Más lento)",
        },
        {
            id: "4",
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
            setProductos(todosProductos);
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

    function mostrarEstacionesProducto() {
        return estacionesProducto.map((fila) => {
            return (
                <tr key={fila.id}>
                    <td>{fila.name}</td>
                    <td>{fila.distance}</td>
                    <td>{fila.type}</td>
                    <td>{fila.id_producto}</td>
                    <td>{fila.id_estacion}</td>
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
                        {productos.map((articulo) => {
                            return (
                                <option key={articulo.id} value={articulo.id}>
                                    {articulo.nombre} ({articulo.name})
                                </option>
                            );
                        })}
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
                                <th>id_producto</th>
                                <th>id_estacion</th>
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
