const clonar = elemento => {
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
    if (window.location.href.includes("ed-expansion")) {
        return "/ed-expansion/";
    } else {
        return "/";
    }
};

const dameBusqueda = () => {
    return window.location.search.replace("?", "");
};

export { clonar, semverGreaterThan, dameUrlBase, dameBusqueda };
