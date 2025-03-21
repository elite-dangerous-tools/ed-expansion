const clonar = (elemento) => {
    if (Array.isArray(elemento)) {
        return elemento.slice();
    } else if (typeof elemento === "object") {
        return Object.assign({}, elemento);
    }
};

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

const dameUrlBase = () => {
    if (window.location.href.includes("ed-colonizacion")) {
        return "/ed-colonizacion/";
    } else {
        return "/";
    }
};

const dameBusqueda = () => {
    try {
        let busquedaCompleta = window.location.search.replace("?", "").split("&");

        let uri = busquedaCompleta[0].split("=")[1];
        return uri ? decodeURI(uri) : "";
    } catch (error) {
        return "";
    }
};

const dameBusquedaMultiple = () => {
    const params = new URLSearchParams(window.location.search);
    const queryParams = {};

    for (const [key, value] of params.entries()) {
        queryParams[key] = decodeURIComponent(value.replace(/\+/g, " "));
    }

    return queryParams;
};

const formateaNumero = (valor, idioma) => {
    valor = parseFloat(valor);
    if (idioma === "en") {
        return new Intl.NumberFormat("en-US", { currency: "USD" }).format(valor);
    } else if (idioma === "es") {
        return new Intl.NumberFormat("de-DE", { currency: "EUR" }).format(valor);
    } else {
        return new Intl.NumberFormat("de-DE", { currency: "EUR" }).format(valor);
    }
};

export { clonar, semverGreaterThan, dameUrlBase, dameBusqueda, dameBusquedaMultiple, formateaNumero };
