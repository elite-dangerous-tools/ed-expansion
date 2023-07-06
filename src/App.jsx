import React from "react";

import Menu from "./Menu";
import CacheBuster from "./scripts/cacheBuster";

import "./App.css";

const App = (props) => {
    return (
        <CacheBuster>
            {({ loading, isLatestVersion, refreshCacheAndReload }) => {
                if (loading) return null;
                if (!loading && !isLatestVersion) {
                    refreshCacheAndReload();
                }

                return <Menu />;
            }}
        </CacheBuster>
    );
};

export default App;
