import cssModulesPlugin from "esbuild-css-modules-plugin";

const isDev = process.argv[1].includes("dev.js");

const carpetaDev = "dist";
const carpetaProd = "build";

const clientEnv = { "process.env.NODE_ENV": isDev ? `'dev'` : `'production'`, global: "window" };
for (const key in process.env) {
    if (key.indexOf("CLIENT_") === 0) {
        clientEnv[`process.env.${key}`] = `'${process.env[key]}'`;
    }
}

/**
 * ESBuild Params
 * @link https://esbuild.github.io/api/#build-api
 */
const buildParams = {
    color: true,
    entryPoints: ["src/index.jsx"],
    loader: { ".png": "file", ".svg": "file" },
    define: clientEnv,
    outdir: isDev ? carpetaDev : carpetaProd,
    minify: !isDev,
    // format: "cjs",
    format: "esm",
    bundle: true,
    sourcemap: isDev, // "inline",
    logLevel: isDev ? "info" : "error",
    incremental: isDev,
    splitting: true,
    plugins: [
        cssModulesPlugin({
            // optional. set to false to not inject generated css into page;
            // default value is false when set `v2` to `true`, otherwise default is true,
            // if set to `true`, the generated css will be injected into `head`;
            // could be a string of css selector of the element to inject into,
            // e.g.
            // ```
            // inject: '#some-element-id' // the plugin will try to get `shadowRoot` of the found element, and append css to the `shadowRoot`, if no shadowRoot then append to the found element, if no element found then append to document.head
            // ```
            // could be a function with params content & digest (return a string of js code to inject to page),
            // e.g.
            // ```
            // inject: (cssContent, digest) => `console.log("${cssContent}", "${digest}")`
            // ```
            inject: false,

            localsConvention: "camelCase", // optional. value could be one of 'camelCaseOnly', 'camelCase', 'dashes', 'dashesOnly', default is 'camelCaseOnly'

            generateScopedName: (name, filename, css) => string, // optional. refer to: https://github.com/madyankin/postcss-modules#generating-scoped-names

            filter: /\.module?\.css$/i, // Optional. Regex to filter certain CSS files.

            cssModulesOption: {
                // optional, refer to: https://github.com/madyankin/postcss-modules/blob/d7cefc427c43bf35f7ebc55e7bda33b4689baf5a/index.d.ts#L27
                // this option will override others passed to postcss-modules
            },

            v2: true, // experimental. v2 can bundle images in css, note if set `v2` to true, other options except `inject` will be ignored. and v2 only works with `bundle: true`.
            v2CssModulesOption: {
                // Optional.
                dashedIndents: false, // Optional. refer to: https://github.com/parcel-bundler/parcel-css/releases/tag/v1.9.0
                /**
                 * Optional. The currently supported segments are:
                 * [name] - the base name of the CSS file, without the extension
                 * [hash] - a hash of the full file path
                 * [local] - the original class name
                 */
                //   pattern: `custom-prefix_[local]_[hash]`
                pattern: `[local]_[hash]`
            }
        })
    ]
};

export { buildParams, carpetaDev, carpetaProd, isDev };
