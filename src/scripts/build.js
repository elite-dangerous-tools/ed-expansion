import esbuild from "esbuild";
// import { config } from "dotenv";
import fse from "fs-extra";
import { buildParams, carpetaProd } from "./esbuild-config.js";

const build = async () => {
    // config();
    if (fse.existsSync(carpetaProd)) {
        await fse.rm(carpetaProd, { recursive: true });
    }
    await fse.copy("./public", carpetaProd);

    console.log(`⚡ [esbuild] Building..`);
    // Run build
    esbuild.build(buildParams).catch(() => process.exit(1));
};

build();
