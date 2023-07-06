import React from "react";
import packageJson from "../../package.json";

const semverGreaterThan = (versionA, versionB) => {
    const versionsA = versionA.split(/\./g);

    const versionsB = versionB.split(/\./g);
    while (versionsA.length || versionsB.length) {
        const a = Number(versionsA.shift());

        const b = Number(versionsB.shift());
        if (a === b) continue;
        return a > b || isNaN(b);
    }
    return false;
};

class CacheBuster extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            isLatestVersion: false,
        };
    }

    refreshCacheAndReload = (fallo = false) => {
        console.log("Reloading app...");

        if (fallo) {
            // Solo recargamos la pagina 1 vez si hemos borrado la cache
            let app_refresh = window.localStorage.getItem("app_refresh");

            if (app_refresh) {
                console.log("Page is already updated");
            } else {
                console.log("Updating page");
                window.localStorage.setItem("app_refresh", true);
                window.location.reload(true);
            }
        } else {
            // Se ha borrado la cache y hay una versión más nueva, recargamos la página.
            window.localStorage.removeItem("app_refresh");
            window.location.reload(true);
        }
    };

    async comprobarVersion() {
        if (process.env.NODE_ENV !== "production") {
            // Solo comprobamos la versión en modo producción.
            this.setState({ loading: false, isLatestVersion: true });
            return true;
        }

        let response = await fetch("meta.json?f=" + new Date().getTime(), {
            method: "GET",
            mode: "no-cors",
            cache: "no-cache",
        });

        if (response.status >= 200 && response.status < 300) {
            const meta = await response.json();
            const latestVersion = meta.version;

            const shouldForceRefresh = semverGreaterThan(
                latestVersion,
                packageJson.version
            );
            if (shouldForceRefresh) {
                console.log(
                    `We have a new version - ${latestVersion} > ${packageJson.version}. It is necessary to reload.`
                );
                this.setState({ loading: false, isLatestVersion: false });
            } else {
                console.log(
                    `You have the latest version available - ${latestVersion} - ${packageJson.version}. No need to reload.`
                );
                this.setState({ loading: false, isLatestVersion: true });
            }

            return true;
        }

        return false;
    }

    async componentDidMount() {
        let okMeta = false;

        try {
            okMeta = await this.comprobarVersion();
        } catch (error) {
            console.log("Error checking version:", error);
        }

        if (!okMeta) {
            console.log(
                `Unknown previous version. Current version: ${packageJson.version}. Refresh the application.`
            );
            this.setState({ loading: false, isLatestVersion: true });
            this.refreshCacheAndReload(true);
        }
    }

    render() {
        return this.props.children({
            loading: this.state.loading,
            isLatestVersion: this.state.isLatestVersion,
            refreshCacheAndReload: this.refreshCacheAndReload,
        });
    }
}

export default CacheBuster;
