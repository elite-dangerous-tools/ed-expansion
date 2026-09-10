import { existsSync, rmSync, cpSync, readFileSync, writeFileSync } from "fs";
import esbuild from "esbuild";
import { buildParams, carpetaProd } from "./esbuild-config.js";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const packageJson = require("../../package.json");

const build = async () => {
    if (existsSync(carpetaProd)) {
        rmSync(carpetaProd, { recursive: true });
    }

    // Copiamos la carpeta public a la carpeta del build
    cpSync("./public", carpetaProd, { recursive: true });

    // Insertamos en el index.html la version
    const indexPath = carpetaProd + "/index.html";
    let data = readFileSync(indexPath, "utf8");
    data = data.replaceAll("index.js", "index.js?v=" + packageJson.version);
    data = data.replaceAll("index.css", "index.css?v=" + packageJson.version);
    writeFileSync(indexPath, data, "utf8");

    console.log(`⚡ [esbuild] Building..`);
    const ctx = await esbuild.context(buildParams);
    await ctx.rebuild();
    await ctx.dispose();
};

build();
