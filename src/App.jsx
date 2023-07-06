import React, { useEffect, useRef } from "react";

import packageJson from "../package.json" assert { type: "json" };

import CacheBuster from "./scripts/cacheBuster";

import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

import "./grid.css";
import estilos from "./App.module.css";

import Busqueda from "./Busqueda";
import Sistema from "./Sistema";
import NoMatch from "./NoMatch";

const App = props => {
    const isMounted = useRef(false);

    useEffect(() => {
        // Constructor
        isMounted.current = true;
    }, []);

    return (
        <CacheBuster>
            {({ loading, isLatestVersion, refreshCacheAndReload }) => {
                if (loading) return null;
                if (!loading && !isLatestVersion) {
                    refreshCacheAndReload();
                }

                return (
                    <BrowserRouter>
                        <div className={estilos.contenedorApp}>
                            <div className={estilos.appbar}>
                                <b className={estilos.nombreApp}>
                                    <Link to="/">Planificador de Expansiones</Link>
                                </b>

                                <span className={estilos.separadorDerecha}></span>
                                <div>v{packageJson.version}</div>
                            </div>

                            <div className={estilos.contenedorAplicacion}>
                                <Routes>
                                    <Route exact path="/" element={<Busqueda />} />
                                    <Route exact path="/sistema/:id" element={<Sistema />} />
                                    <Route exact path="*" element={<NoMatch />} />
                                </Routes>
                            </div>
                        </div>
                    </BrowserRouter>
                );
            }}
        </CacheBuster>
    );
};

export default App;
