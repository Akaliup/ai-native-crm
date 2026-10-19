import assert from "node:assert/strict";
import { existsSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

// Turbopack gives external ESM packages hashed aliases in .next/node_modules.
// Prefer that installed copy; local source checkouts use the normal package name.
const sdkDirectory = resolve(".next/node_modules/@earendil-works");
const aliases = existsSync(sdkDirectory) ? readdirSync(sdkDirectory) : [];
function loadSdk(name, file, subpath = "") {
  const alias = aliases.find((entry) => entry === name || entry.startsWith(`${name}-`));
  return alias
    ? import(pathToFileURL(resolve(sdkDirectory, alias, "dist", file)).href)
    : import(`@earendil-works/${name}${subpath}`);
}

// No model call or credentials: prove the published image contains working
// native SDK modules and provider data, beyond merely starting the HTTP server.
const [core, openai, compat] = await Promise.all([
  loadSdk("pi-agent-core", "index.js"),
  loadSdk("pi-ai", "providers/openai.js", "/providers/openai"),
  loadSdk("pi-ai", "compat.js", "/compat"),
]);

assert.equal(typeof core.Agent, "function", "Pi Agent constructor is unavailable");
assert.equal(typeof compat.getEnvApiKey, "function", "Pi compatibility module is unavailable");
assert.ok(openai.openaiProvider().getModels().length > 0, "Pi provider model data is missing");
await new Promise(setImmediate);
process.stdout.write("Pi SDK and provider data loaded inside the image\n");
