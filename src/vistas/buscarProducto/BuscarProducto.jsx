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
import megaship from "../../imagenes/Megaship.png";
import carrier from "../../imagenes/Carrier.png";
import PlanetaryPort from "../../imagenes/PlanetaryPort.png";
import planetaryOutpost from "../../imagenes/PlanetaryOutpost.png";
import Enlace from "../../elementos/Enlace";

let dominio = "https://stormseekers.twilightparadox.com";
// if (window.location.hostname === "localhost") {
//     dominio = "http://localhost:5000";
// }

const idiomasDisponibles = [
    {
        id: "es",
        texto: "Español"
    },
    {
        id: "en",
        texto: "English"
    }
];

const alcancesDisponibles = [
    {
        id: 0,
        texto: ""
    },
    {
        id: 5,
        texto: "5 AL"
    },
    {
        id: 15,
        texto: "15 AL"
    },
    {
        id: 25,
        texto: "25 AL (Lento)"
    },
    {
        id: 45,
        texto: "45 AL (Más lento)"
    },
    {
        id: 75,
        texto: "75 AL (Muy Lento)"
    }
];

const suministrosMinimos = [
    {
        id: 10,
        texto: "10"
    },
    {
        id: 100,
        texto: "100"
    },
    {
        id: 1000,
        texto: "1000"
    },
    {
        id: 10000,
        texto: "10000"
    },
    {
        id: 100000,
        texto: "100000"
    }
];

const BuscarProducto = ({ parametrosUrl, listaProdInicial }) => {
    const isMounted = useRef(false);

    const [cargando, setCargando] = useState(true);
    const [listaProductos, setListaProductos] = useState([]);
    const [estacionesProducto, setEstacionesProducto] = useState([]);

    const [nombreSistema, setNombreSistema] = useState(parametrosUrl.buscarProducto || "Sol");
    const [alcance, setAlcance] = useState(parametrosUrl.alcance ? parseInt(parametrosUrl.alcance) : alcancesDisponibles[0].id);
    const [productosSeleccionados, setProductosSeleccionados] = useState([]);
    const [plataforma, setPlataforma] = useState(parametrosUrl.plataforma || "");
    const [planetaria, setPlanetaria] = useState(parametrosUrl.planetaria || "");
    const [idioma, setIdioma] = useState(parametrosUrl.idioma || "es");
    const [orden, setOrden] = useState(parametrosUrl.orden || "distanciasistema");
    const [portanaves, setPortanaves] = useState(parametrosUrl.portanaves || "");
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
        // hemos cambiado el alcance, la plataforma o el producto
        recuperarProductosEstaciones();
    }, [alcance, plataforma, planetaria]);

    useEffect(() => {
        // hemos cambiado el alcance o el producto o el idioma
        guardarParametros();
    }, [alcance, productosSeleccionados, portanaves, idioma, orden, suministroMinimo, plataforma, planetaria]);

    useEffect(() => {
        // hemos recuperado los productos

        if (listaProdInicial.length > 0 && productosSeleccionados.length === 0 && listaProductos.length > 0) {
            let nuevosProductos = [];
            listaProdInicial.forEach(fila => {
                const articulo = listaProductos.find(item => item.id === fila.value);

                let nombreProducto = articulo.id;
                if (idioma === "es") {
                    nombreProducto = articulo.nombre;
                }

                nuevosProductos.push({
                    value: fila.value,
                    label: nombreProducto,
                    tipo: articulo.tipo
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

    function cambiaPortanaves(evento) {
        setPortanaves(evento.target.value);
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
        params.set("portanaves", portanaves);
        params.set("suministroMinimo", suministroMinimo);

        const valoresProductos = productosSeleccionados.map(item => item.value);
        params.set("productos", valoresProductos);

        // Actualizar la URL sin recargar la página
        const nuevaURL = `${window.location.pathname}?${params.toString()}`;
        window.history.pushState({}, "", nuevaURL);
    }

    async function recuperarListaProductos() {
        let urlProductos = dominio + "/api/productos";
        let response = await fetch(encodeURI(urlProductos), {
            method: "GET"
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

        setCargando(true);
        let urlAlcance =
            dominio + "/api/estaciones?distancia=" + alcance + "&sistema=" + nombreSistema + "&plataforma=" + plataforma + "&planetaria=" + planetaria;
        let response = await fetch(encodeURI(urlAlcance), {
            method: "GET"
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

                break;
            case "distanciasistema":
                // Orden ascendente
                valor1 = parseFloat(a.distance);
                valor2 = parseFloat(b.distance);

                if (valor1 === valor2) {
                    valor1 = parseFloat(a.distance_to_arrival);
                    valor2 = parseFloat(b.distance_to_arrival);
                }

                break;

            case "nombresistema":
            default:
                // Orden ascendente
                if (valor1 === valor2) {
                    valor1 = a.name;
                    valor2 = b.name;
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

    function datosProducto(articulo) {
        let descrip = articulo.id;
        if (idioma === "es") {
            descrip = articulo.nombre;
        }

        return {
            value: articulo.id,
            label: descrip,
            tipo: articulo.tipo
        };
    }

    function mostrarProductosSeleccionados() {
        const listaProdSeleccionados = productosSeleccionados.map(fila => {
            const articulo = listaProductos.find(item => item.id === fila.value);

            let nombreProducto = articulo.id;
            if (idioma === "es") {
                nombreProducto = articulo.nombre;
            }

            return {
                value: fila.value,
                label: nombreProducto,
                tipo: articulo.tipo
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
        if (fila.name.includes("Trailblazer")) {
            // Los Trailblazer son como meganaves
            fila.type = "Mega ship";
        }

        if (portanaves == "0" && fila.carrier_docking_access) {
            // No permitimos carriers
            return undefined;
        } else if (portanaves == "1" && !fila.carrier_docking_access) {
            // Solo permitimos carriers
            return undefined;
        }


        if (productosSeleccionados.length === 0) {
            // Si no hay productos seleccionados, devolvemos todas las filas
            return fila;
        }

        const mercado = fila.market.filter(productoA => {
            if (productoA.supply < suministroMinimo) {
                return false;
            }

            return productosSeleccionados.some(productoB => {
                return productoA.commodity === productoB.value;
            });
        });

        if (mercado.length === 0) {
            return undefined;
        }

        fila.productosFiltrados = mercado;

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
                return "Asentamiento de superficie";

            case "Planetary Port":
                return "Puerto Planetario";

            case "Planetary Outpost":
                return "Puerto de superficie";

            case "Ocellus Starport":
                return "Estación Ocellus";

            case "Orbis Starport":
                return "Estación Orbis";

            case "Mega ship":
                return "Mega Nave";

            default:
                break;
        }

        return nombreTipo;
    }

    function mostrarEstacionesProducto() {
        const estacionesProductoFiltradas = estacionesProducto.filter(filtrarEstacionesProducto);
        const estacionesConProductosOrdenadas = estacionesProductoFiltradas.sort(compararEstaciones);

        let ultimaFilaVisualizada = null;
        return estacionesConProductosOrdenadas.map(fila => {
            let mismoSistema = ultimaFilaVisualizada && ultimaFilaVisualizada.system_id64 === fila.system_id64;
            // let mismaEstacion = ultimaFilaVisualizada && mismoSistema && ultimaFilaVisualizada.id === fila.id;

            let imagenEstacion = "";
            switch (fila.type) {
                case "Settlement":
                    imagenEstacion = odyssey;
                    break;

                case "Asteroid base":
                    imagenEstacion = asteroid;
                    break;

                case "Coriolis Starport":
                    imagenEstacion = coriolis;
                    break;

                case "Outpost":
                    imagenEstacion = outpost;
                    break;

                case "Ocellus Starport":
                    imagenEstacion = ocellus;
                    break;

                case "Orbis Starport":
                    imagenEstacion = orbis;
                    break;

                case "Planetary Outpost":
                    imagenEstacion = planetaryOutpost;
                    break;

                case "Planetary Port":
                    imagenEstacion = PlanetaryPort;
                    break;

                case "Mega ship":
                    imagenEstacion = megaship;
                    break;

                case "Drake-Class Carrier":
                case "Javelin-Class Carrier":
                case "Victory-Class Carrier":
                case "Fortune-Class Carrier":
                case "Nautilus-Class Carrier":
                    imagenEstacion = carrier;
                    break;

                default:
                    break;
            }

            let productos = [];
            let suministros = [];
            let precios = [];

            if (fila.productosFiltrados && fila.productosFiltrados.length > 0) {
                fila.productosFiltrados.forEach(productoFiltrado => {
                    let nombreProducto = productoFiltrado.commodity;
                    const productoFila = listaProductos.find(prod => prod.id === nombreProducto);
                    if (productoFila) {
                        if (idioma === "es") {
                            nombreProducto = productoFila.nombre;
                        } else if (idioma === "en") {
                            nombreProducto = productoFila.id;
                        }
                    }

                    // filaActual.suministroTotal += fila.supply;
                    suministros.push(<div key={productoFiltrado.commodity}>{formateaNumero(productoFiltrado.supply, idioma)}</div>);
                    productos.push(<div key={productoFiltrado.commodity}>{nombreProducto}</div>);
                    precios.push(<div key={productoFiltrado.commodity}>{formateaNumero(productoFiltrado.sell_price, idioma)}</div>);
                });
            }

            // buy_price
            // category
            // commodity
            // demand
            // sell_price
            // supply

            ultimaFilaVisualizada = fila;
            return (
                <tr key={fila.id}>
                    <td>
                        <b>{mismoSistema ? null : fila.system_name}</b>
                    </td>
                    <td className={estilos.nowrap}>{mismoSistema ? null : fila.distance.toFixed(0) + " AL"}</td>

                    <td>
                        <div className={estilos.textoCentrado}>{<img className={estilos.imagenEstacion} src={imagenEstacion} />}</div>
                        <div className={estilos.textoCentrado}>{tipoEstacion(fila.type)}</div>
                    </td>
                    <td className={estilos.nowrap}>{fila.distance_to_arrival.toFixed(0) + " sl"}</td>
                    <td>
                        {fila.carrier_name ? (
                            <b>
                                {fila.carrier_name} ({fila.name})
                            </b>
                        ) : (
                            <b>{fila.name}</b>
                        )}

                        <small>
                            <div>{fila.large_pads} Plataformas Grandes</div>
                            <div>{fila.medium_pads} Plataformas Medianas</div>
                            <div>{fila.small_pads} Plataformas Pequeñas</div>
                        </small>
                    </td>

                    <td>{productos}</td>
                    <td>{suministros}</td>
                    <td>{precios}</td>
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
                    <Enlace to={"?sistema=" + nombreSistema}>{nombreSistema}</Enlace>
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
                        {idiomasDisponibles.map(idioma => {
                            return (
                                <option key={idioma.id} value={idioma.id}>
                                    {idioma.texto}
                                </option>
                            );
                        })}
                    </select>
                    &nbsp;&nbsp;
                </div>

                <div className="col-sm-12 col-md-3">
                    <label htmlFor="columna">Orden: </label>
                    <select id="columna" onChange={cambiaOrden} value={orden} disabled={cargando} className={estilos.selectAlcance}>
                        <option value="distanciasistema">Distancia Sistema</option>
                        <option value="nombresistema">Nombre Sistema</option>
                        <option disabled value="suministro">Suministro Total</option>
                    </select>
                    &nbsp;&nbsp;
                </div>

                <div className="col-sm-12 col-md-3">
                    <label htmlFor="portanaves">Portanaves: </label>
                    <select id="portanaves" onChange={cambiaPortanaves} value={portanaves} disabled={cargando} className={estilos.selectAlcance}>
                        <option value=""></option>
                        <option value="1">Sí</option>
                        <option value="0">No</option>
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
                        {suministrosMinimos.map(filaSuministroMinimo => {
                            return (
                                <option key={filaSuministroMinimo.id} value={filaSuministroMinimo.id}>
                                    {formateaNumero(filaSuministroMinimo.id, idioma)}
                                </option>
                            );
                        })}
                    </select>
                    &nbsp;&nbsp;
                </div>

                <div className="col-sm-12 col-md-8 col-md-offset-2">
                    &nbsp;&nbsp;
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
                        styles={{
                            option: (baseStyles, state) => {
                                switch (state.data.tipo) {
                                    case "export":
                                        return {
                                            ...baseStyles,
                                            color: "green",
                                            fontWeight: "bold"
                                        };

                                    case "rare":
                                        return {
                                            ...baseStyles,
                                            color: "orange",
                                            fontWeight: "bold"
                                        };

                                    case "prohibited":
                                        return {
                                            ...baseStyles,
                                            color: "red",
                                            fontWeight: "bold"
                                        };
                                }

                                return {
                                    ...baseStyles
                                };
                            },
                            multiValueLabel: (baseStyles, state) => {
                                switch (state.data.tipo) {
                                    case "export":
                                        return {
                                            ...baseStyles,
                                            color: "green",
                                            fontWeight: "bold"
                                        };

                                    case "rare":
                                        return {
                                            ...baseStyles,
                                            color: "orange",
                                            fontWeight: "bold"
                                        };

                                    case "prohibited":
                                        return {
                                            ...baseStyles,
                                            color: "red",
                                            fontWeight: "bold"
                                        };
                                }

                                return {
                                    ...baseStyles
                                };
                            }
                        }}
                    />
                </div>
            </div>

            <div className="row">
                <div className="col-sm-12">
                    <h4>Búsqueda:</h4>
                </div>

                <div className="col-sm-6 col-md-3">
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

                <div className="col-sm-6 col-md-3">
                    <label htmlFor="plataforma">Plataformas grandes: </label>
                    <select id="plataforma" onChange={cambiaPlataforma} value={plataforma} disabled={cargando} className={estilos.selectPlataforma}>
                        <option value=""></option>
                        <option value="G">Sí</option>
                        <option value="M">No</option>
                    </select>
                    &nbsp;&nbsp;
                </div>

                <div className="col-sm-6 col-md-3">
                    <label htmlFor="planetaria">Estación planetaria: </label>
                    <select id="planetaria" onChange={cambiaPlanetaria} value={planetaria} disabled={cargando} className={estilos.selectPlataforma}>
                        <option value=""></option>
                        <option value="1">Sí</option>
                        <option value="0">No</option>
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
                                <th>Sistema</th>
                                <th width={50}>Distancia sistema</th>

                                <th>Tipo</th>
                                <th width={50}>Distancia estación</th>
                                <th>Estación</th>

                                <th width={175}>Producto</th>
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
