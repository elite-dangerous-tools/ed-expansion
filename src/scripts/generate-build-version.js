/* generate-build-version.js */
import fs from "fs";
import { execSync } from "child_process";

// La version es simplemente el numero de commits, p. ej. 120. Sube solo en cada
// build, asi nadie tiene que acordarse de subir el numero a mano.
let numCommits;
try {
    numCommits = parseInt(execSync("git rev-list --count HEAD", { encoding: "utf8" }).trim(), 10);
} catch (error) {
    console.log("No se pudo obtener el numero de commits de git:", error.message);
    numCommits = undefined;
}

const version = numCommits !== undefined ? numCommits : 0;

const jsonData = {
    version: version
};

var jsonContent = JSON.stringify(jsonData);

fs.writeFile("./public/meta.json", jsonContent, "utf8", function(err) {
    if (err) {
        console.log("An error occured while writing JSON Object to meta.json");
        return console.log(err);
    }

    console.log("meta.json file has been saved with latest version number (v" + version + ")");
});
