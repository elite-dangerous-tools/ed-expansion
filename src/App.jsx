import React, { useEffect, useRef, useState } from "react";

// import packageJson from "../package.json" assert { type: "json" };
import packageJson from "../package.json";

import "./grid.css";
import estilos from "./App.module.css";

import { dameUrlBase, semverGreaterThan } from "./utilidades";
import NoMatch from "./vistas/noMatch/NoMatch";
import Busqueda from "./vistas/busqueda/Busqueda";
import Sistema from "./vistas/sistema/Sistema";
import Enlace from "./elementos/Enlace";
import { ProveedorRuta } from "./elementos/ProveedorRuta";

const App = (props) => {
    const isMounted = useRef(false);
    const [hayActualizacion, setHayActualizacion] = useState(true);
    const [ultimaVersion, setUltimaVersion] = useState("");
    const [ruta, setRuta] = useState(window.location.search);

    async function recuperarVersion() {
        let response = await fetch(
            dameUrlBase() + "meta.json?f=" + new Date().getTime(),
            {
                method: "GET",
                mode: "no-cors",
                cache: "no-cache",
            }
        );

        if (response.status >= 200 && response.status < 300) {
            const meta = await response.json();
            const latestVersion = meta.version;
            setUltimaVersion(latestVersion);

            let hayActualizacion = semverGreaterThan(
                latestVersion,
                packageJson.version
            );
            setHayActualizacion(hayActualizacion);
        }
    }

    useEffect(() => {
        // Constructor
        isMounted.current = true;

        recuperarVersion();
    }, []);

    function pintarVista() {
        switch (true) {
            case ruta === "":
            case ruta === "?buscar":
            case ruta.includes("?buscar="):
                return <Busqueda />;

            case ruta.includes("?sistema="):
                return <Sistema />;

            default:
                return <NoMatch />;
        }
    }

    return (
        <ProveedorRuta.Provider value={setRuta}>
            <div className={estilos.contenedorApp}>
                <div className={estilos.appbar}>
                    <b className={estilos.nombreApp}>
                        <Enlace to="?buscar" hasColors={false}>
                            Planificador de Expansiones
                        </Enlace>
                    </b>

                    <span className={estilos.separadorDerecha}></span>
                    {!hayActualizacion && <div>v{packageJson.version}</div>}
                    {hayActualizacion && (
                        <div>
                            <span className={estilos.versionAnterior}>
                                v{packageJson.version}
                            </span>
                            &nbsp;-&nbsp;
                            <span className={estilos.versionNueva}>
                                v{ultimaVersion}
                            </span>
                        </div>
                    )}
                </div>

                <div className={estilos.contenedorAplicacion}>
                    {pintarVista()}
                </div>
            </div>
        </ProveedorRuta.Provider>
    );
};

export default App;
