import { createServer } from "http";
import { readFileSync, existsSync, rmSync, cpSync, statSync, watch as fsWatch } from "fs";
import { join, extname } from "path";
import { networkInterfaces } from "os";
import esbuild from "esbuild";

import { buildParams, carpetaDev } from "./esbuild-config.js";

let puerto = 3000;
for (const arg of process.argv.slice(2)) {
    const [key, val] = arg.split("=");
    if (key === "--port") puerto = parseInt(val);
}

// Limpiar carpeta de desarrollo
if (existsSync(carpetaDev)) {
    rmSync(carpetaDev, { recursive: true });
}

// Copiar carpeta public
cpSync("./public", carpetaDev, { recursive: true });

// MIME types para servir archivos estaticos
const MIME = {
    ".html": "text/html",
    ".js": "application/javascript",
    ".mjs": "application/javascript",
    ".css": "text/css",
    ".json": "application/json",
    ".png": "image/png",
    ".ico": "image/x-icon",
    ".svg": "image/svg+xml",
    ".ttf": "font/ttf",
    ".woff": "font/woff",
    ".woff2": "font/woff2",
};

const server = createServer((req, res) => {
    let url = req.url.split("?")[0];
    if (url === "/") url = "/index.html";

    const filePath = join(carpetaDev, url);
    try {
        if (statSync(filePath).isFile()) {
            const ext = extname(filePath);
            res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream" });
            res.end(readFileSync(filePath));
            return;
        }
    } catch {}

    // SPA fallback: servir index.html para cualquier ruta no encontrada
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(readFileSync(join(carpetaDev, "index.html")));
});

server.listen(puerto, "0.0.0.0", () => {
    let urls = `\x1b[32mSirviendo desarrollo en: \x1b[34mhttp://localhost:${puerto}`;
    for (const ifaces of Object.values(networkInterfaces())) {
        for (const iface of ifaces) {
            if (iface.family === "IPv4") urls += `, http://${iface.address}:${puerto}`;
        }
    }
    console.log(urls + "\x1b[0m");
});

// Build inicial + watch con esbuild
const ctx = await esbuild.context(buildParams);
await ctx.rebuild();

ctx.watch((result) => {
    if (result.errors.length === 0) {
        console.log("\x1b[32m⚡ [esbuild] Rebuild completado\x1b[0m");
    }
});

// Watch manual de public/ (esbuild ctx.watch solo vigila src/)
const publicWatcher = fsWatch("./public", { recursive: true }, (event, filename) => {
    if (filename) {
        console.log(`⚡ [public] Copiando ${filename}`);
        cpSync("./public", carpetaDev, { recursive: true });
    }
});

// Cerrar limpiamente
process.on("SIGINT", () => {
    server.close();
    ctx.dispose();
    publicWatcher.close();
    process.exit(0);
});
