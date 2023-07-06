import liveServer from "live-server";
import chokidar from "chokidar";
import esbuild from "esbuild";
import fse from "fs-extra";
import os from "os";

import { buildParams, carpetaDev } from "./esbuild-config.js";

let puerto = 3000;
let argumentos = process.argv.slice(2);
for (const argumento of argumentos) {
    let [clave, valor] = argumento.split("=");
    if (clave === "--port") {
        puerto = parseInt(valor);
    }
}

/**
 * Live Server Params
 * @link https://www.npmjs.com/package/live-server#usage-from-node
 */
const serverParams = {
    port: puerto, // Set the server port. Defaults to 8080.
    root: carpetaDev, // Set root directory that's being served. Defaults to cwd.
    open: false, // When false, it won't load your browser by default.
    host: "0.0.0.0", // Set the address to bind to. Defaults to 0.0.0.0 or process.env.IP.
    // ignore: 'scss,my/templates', // comma-separated string for paths to ignore
    ignore: "dist,build,node_modules",
    file: "index.html" // When set, serve this file (server root relative) for every 404 (useful for single-page applications)
    // wait: 1000, // Waits for all changes, before reloading. Defaults to 0 sec.
    // mount: [['/components', './node_modules']], // Mount a directory to a route.
    // logLevel: 2, // 0 = errors only, 1 = some, 2 = lots
    // middleware: [function(req, res, next) { next(); }] // Takes an array of Connect-compatible middleware that are injected into the server middleware stack
};

// Clean folder
if (fse.existsSync(carpetaDev)) {
    await fse.rm(carpetaDev, { recursive: true });
}
await fse.copy("./public", carpetaDev);

function info_dist() {
    let lineaIp = "\r\nSirviendo desarrollo en: http://localhost:" + puerto;

    var networkInterfaces = os.networkInterfaces();
    for (let indice in networkInterfaces) {
        let interfaz = networkInterfaces[indice];

        for (let alias in interfaz) {
            let red = interfaz[alias];
            if (red.family === "IPv4") {
                lineaIp += ", http://" + red.address + ":" + puerto;
            }
        }
    }

    console.log(lineaIp);
    // if (hayCambios) console.log("Listo para cambios");
}

(async () => {
    // Build
    const result = await esbuild.build(buildParams).catch(() => process.exit(1));

    // Start live server
    liveServer.start(serverParams);
    setTimeout(info_dist, 250);

    /**
     * Watch development server changes
     * ignored: ignore watch `.*` files
     */
    return chokidar.watch(["src/**/*", "public/**/*"], { ignored: /(^|[/\\])\../, ignoreInitial: true }).on("all", async (event, path) => {
        if (event === "change" && path.includes(carpetaDev)) {
            // Nothing
        } else if (event === "change" && path.includes("public")) {
            console.log(`⚡ [esbuild] change in public ${path}`);
            try {
                fse.copySync("public", carpetaDev);
            } catch (err) {
                console.error(err);
            }
        } else if (event === "change") {
            console.log(`⚡ [esbuild] Rebuilding ${path}`);
            console.time("⚡ [esbuild] Done");
            if (result.rebuild) await result.rebuild();
            console.timeEnd("⚡ [esbuild] Done");

            setTimeout(info_dist, 250);
        }
    });
})();
