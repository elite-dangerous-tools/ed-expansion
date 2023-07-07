import esbuild from "esbuild";
// import { config } from "dotenv";
import fse from "fs-extra";
import { buildParams, carpetaProd } from "./esbuild-config.js";
import packageJson from "../../package.json" assert { type: "json" };

const build = async () => {
    // config();
    if (fse.existsSync(carpetaProd)) {
        await fse.rm(carpetaProd, { recursive: true });
    }

    // Copiamos la carpeta public a la carpeta del build
    await fse.copy("./public", carpetaProd);

    // Insertamos en el index.html la versión
    fse.readFile(carpetaProd + "/index.html", "utf8", function(err, data) {
        if (err) {
            return console.log("Error al leer index.html", err);
        }

        console.log("leo y reemplazo version");
        var result = data.replaceAll("?v=dev", "?v=" + packageJson.version);

        fse.writeFile(carpetaProd + "/index.html", result, "utf8", function(err) {
            if (err) return console.log("Error al escribir index.html", err);
        });
    });

    console.log(`⚡ [esbuild] Building..`);
    // Run build
    esbuild.build(buildParams).catch(() => process.exit(1));
};

build();
