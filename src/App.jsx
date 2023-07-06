import React, { useEffect, useRef, useState } from "react";

// import packageJson from "../package.json" assert { type: "json" };
import packageJson from "../package.json";

import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

import "./grid.css";
import estilos from "./App.module.css";

import Busqueda from "./Busqueda";
import Sistema from "./Sistema";
import NoMatch from "./NoMatch";
import { dameUrlBase, semverGreaterThan } from "./utilidades";

const App = props => {
    const isMounted = useRef(false);
    const [hayActualizacion, setHayActualizacion] = useState(true);
    const [ultimaVersion, setUltimaVersion] = useState("");
    const [base, setBase] = useState(dameUrlBase());

    async function recuperarVersion() {
        let response = await fetch(base + "meta.json?f=" + new Date().getTime(), {
            method: "GET",
            mode: "no-cors",
            cache: "no-cache"
        });

        if (response.status >= 200 && response.status < 300) {
            const meta = await response.json();
            const latestVersion = meta.version;
            setUltimaVersion(latestVersion);

            let hayActualizacion = semverGreaterThan(latestVersion, packageJson.version);
            setHayActualizacion(hayActualizacion);
        }
    }

    useEffect(() => {
        // Constructor
        isMounted.current = true;

        recuperarVersion();
    }, []);

    return (
        <BrowserRouter>
            <div className={estilos.contenedorApp}>
                <div className={estilos.appbar}>
                    <b className={estilos.nombreApp}>
                        <Link to={base}>Planificador de Expansiones</Link>
                    </b>

                    <span className={estilos.separadorDerecha}></span>
                    {!hayActualizacion && <div>v{packageJson.version}</div>}
                    {hayActualizacion && (
                        <div>
                            <span className={estilos.versionAnterior}>v{packageJson.version}</span>
                            &nbsp;-&nbsp;
                            <span className={estilos.versionNueva}>v{ultimaVersion}</span>
                        </div>
                    )}
                </div>

                <div className={estilos.contenedorAplicacion}>
                    <Routes>
                        <Route exact path={base} element={<Busqueda base={base} />} />
                        <Route exact path={base + "sistema/:id"} element={<Sistema base={base} />} />
                        <Route exact path="*" element={<NoMatch />} />
                    </Routes>
                </div>
            </div>
        </BrowserRouter>
    );
};

export default App;
