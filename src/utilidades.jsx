const clonar = (elemento) => {
    if (Array.isArray(elemento)) {
        return elemento.slice();
    } else if (typeof elemento === "object") {
        return Object.assign({}, elemento);
    }
};

export { clonar };
