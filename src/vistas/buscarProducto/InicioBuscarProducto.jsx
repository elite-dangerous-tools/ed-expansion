import React, { useEffect, useState } from "react";
import { dameBusquedaMultiple } from "../../utilidades";
import BuscarProducto from "./BuscarProducto";

let parametrosUrl = {};
let listaProdInicial = [];

const InicioBuscarProducto = () => {
    const [iniciado, setIniciado] = useState(false);

    function valoresInicialesProductos() {
        if (!parametrosUrl.productos) {
            return [];
        }

        return parametrosUrl.productos.split(",").map((fila) => {
            return {
                value: fila,
                label: fila,
            };
        });
    }

    useEffect(() => {
        // Constructor

        parametrosUrl = dameBusquedaMultiple();
        listaProdInicial = valoresInicialesProductos();


        setIniciado(true);
    }, []);

    if (iniciado) {
        return <BuscarProducto parametrosUrl={parametrosUrl} listaProdInicial={listaProdInicial} />;
    } else {
        return null;
    }
};

export default InicioBuscarProducto;
