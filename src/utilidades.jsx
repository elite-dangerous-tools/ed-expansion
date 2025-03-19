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
        let busquedaCompleta = window.location.search
            .replace("?", "")
            .split("&");

        let uri = busquedaCompleta[0].split("=")[1];
        return uri ? decodeURI(uri) : "";
    } catch (error) {
        return "";
    }
};

const dameBusquedaMultiple = () => {
    try {
        let busquedaCompleta = window.location.search
            .replace("?", "")
            .split("&");

        let resultado = {};
        busquedaCompleta.forEach((element) => {
            let [key, value] = element.split("=");
            if (resultado[key]) {
                // Si la clave ya existe, añade el valor al array
                resultado[key] = [].concat(resultado[key], value);
            } else {
                // Si la clave no existe, crea un nuevo array con el valor
                resultado[key] = value;
            }
        });

        return resultado;
    } catch (error) {
        return {};
    }
};

export {
    clonar,
    semverGreaterThan,
    dameUrlBase,
    dameBusqueda,
    dameBusquedaMultiple,
};
