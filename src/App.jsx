import React, { useEffect, useRef } from "react";

import CacheBuster from "./scripts/cacheBuster";

import { BrowserRouter, Routes, Route } from "react-router-dom";

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
                                <div>
                                    <b>Planificador de Expansiones</b>
                                </div>

                                <span className={estilos.separadorDerecha}></span>
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
