/**
 * Frontend static verification — no server required.
 * Run: node scripts/verify-frontend.js
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const src = path.join(root, "src");
const results = [];

const assert = (name, condition, detail = "") => {
  results.push({ name, ok: !!condition, detail });
  console.log(`${condition ? "PASS" : "FAIL"}: ${name}${detail ? " — " + detail : ""}`);
};

const walk = (dir, files = []) => {
  if (!fs.existsSync(dir)) return files;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (/\.(jsx?|tsx?|css|json)$/.test(entry.name)) files.push(full);
  }
  return files;
};

const files = walk(src);
let clerkHits = 0;
let bearerHits = 0;
let localStorageTokenHits = 0;
let withCredentials = false;
let hasLogin = false;
let hasRegister = false;

for (const file of files) {
  const text = fs.readFileSync(file, "utf8");
  const rel = path.relative(root, file);
  if (/@clerk|clerk-react|ClerkProvider|useClerk|UserButton|useAuth\s*\(|useUser\s*\(/.test(text)) {
    clerkHits++;
    console.log("  clerk:", rel);
  }
  if (/Authorization:\s*`Bearer \$\{/.test(text) || /getToken\s*\(/.test(text)) {
    bearerHits++;
    console.log("  bearer/getToken:", rel);
  }
  if (/localStorage\.(setItem|getItem)\(['"`].*token/i.test(text)) {
    localStorageTokenHits++;
    console.log("  localStorage token:", rel);
  }
  if (/withCredentials\s*=\s*true/.test(text)) withCredentials = true;
  if (rel.replace(/\\/g, "/").endsWith("pages/Login.jsx")) hasLogin = true;
  if (rel.replace(/\\/g, "/").endsWith("pages/Register.jsx")) hasRegister = true;
}

assert("No Clerk references in client/src", clerkHits === 0, `hits=${clerkHits}`);
assert("No Bearer getToken auth headers", bearerHits === 0, `hits=${bearerHits}`);
assert("No JWT in localStorage", localStorageTokenHits === 0, `hits=${localStorageTokenHits}`);
assert("axios withCredentials enabled", withCredentials);
assert("Login page exists", hasLogin);
assert("Register page exists", hasRegister);

const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
assert("Clerk removed from package.json", !pkg.dependencies?.["@clerk/clerk-react"]);

const env = fs.readFileSync(path.join(root, ".env"), "utf8");
assert("No VITE_CLERK in .env", !/VITE_CLERK/.test(env));
assert("VITE_BASE_URL set without spaces around =", /^VITE_BASE_URL=\S+/m.test(env));

const context = fs.readFileSync(path.join(src, "context/AppContext.jsx"), "utf8");
assert("Uses /api/v1/users/login", context.includes("/api/v1/users/login"));
assert("Uses /api/v1/users/register", context.includes("/api/v1/users/register"));
assert("Uses /api/v1/users/logout", context.includes("/api/v1/users/logout"));
assert("Uses /api/v1/users/current-user", context.includes("/api/v1/users/current-user"));
assert("Uses refresh-token interceptor", context.includes("/api/v1/users/refresh-token"));

const appJsx = fs.readFileSync(path.join(src, "App.jsx"), "utf8");
assert("App routes include /login", appJsx.includes("path='/login'") || appJsx.includes('path="/login"'));
assert("App routes include /register", appJsx.includes("path='/register'") || appJsx.includes('path="/register"'));

console.log("\n==============================");
const failed = results.filter((r) => !r.ok);
console.log(`Passed: ${results.filter((r) => r.ok).length}/${results.length}`);
if (failed.length) {
  failed.forEach((f) => console.log(` - ${f.name}: ${f.detail}`));
  process.exit(1);
}
console.log("All frontend verification checks passed.");
process.exit(0);
