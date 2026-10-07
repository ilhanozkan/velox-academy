// Copies Monaco's AMD build to public/monaco so the editor is served by the
// app itself instead of cdn.jsdelivr.net (blocked on many school and company
// networks). Runs before `dev` and `build`.
const fs = require("fs");
const path = require("path");

const source = path.join(path.dirname(require.resolve("monaco-editor/package.json")), "min", "vs");
const target = path.join(__dirname, "..", "public", "monaco", "vs");
const version = require("monaco-editor/package.json").version;
const marker = path.join(target, ".version");

if (fs.existsSync(marker) && fs.readFileSync(marker, "utf8") === version) process.exit(0);

fs.rmSync(target, { recursive: true, force: true });
fs.cpSync(source, target, { recursive: true });
fs.writeFileSync(marker, version);
console.log(`Monaco ${version} copied to public/monaco/vs`);
