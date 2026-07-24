/**
 * Lightweight verification — no MongoDB binary download required.
 * Run: node scripts/verify.js
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import mongoose from "mongoose";

process.env.ACCESS_TOKEN_SECRET = "test-access-secret";
process.env.ACCESS_TOKEN_EXPIRY = "1d";
process.env.REFRESH_TOKEN_SECRET = "test-refresh-secret";
process.env.REFRESH_TOKEN_EXPIRY = "10d";
process.env.CORS_ORIGIN = "http://localhost:5173";
process.env.MONGODB_URI = "mongodb://127.0.0.1:27017";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const results = [];

const assert = (name, condition, detail = "") => {
  results.push({ name, ok: !!condition, detail });
  console.log(`${condition ? "PASS" : "FAIL"}: ${name}${detail ? " — " + detail : ""}`);
};

const walk = (dir, files = []) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (entry.name.endsWith(".js")) files.push(full);
  }
  return files;
};

// 1) No Clerk references in server source
{
  const files = walk(path.join(root, "src"));
  let clerkHits = 0;
  for (const file of files) {
    const text = fs.readFileSync(file, "utf8");
    if (/clerk|@clerk|req\.auth\s*\(/i.test(text)) {
      clerkHits++;
      console.log("  clerk hit:", path.relative(root, file));
    }
  }
  assert("No Clerk references in server/src", clerkHits === 0, `hits=${clerkHits}`);
}

// 2) Required folders/files exist
{
  const required = [
    "src/index.js",
    "src/app.js",
    "src/constants.js",
    "src/db/index.js",
    "src/utils/ApiError.js",
    "src/utils/ApiResponse.js",
    "src/utils/asyncHandler.js",
    "src/utils/cloudinary.js",
    "src/middlewares/auth.middleware.js",
    "src/middlewares/multer.middleware.js",
    "src/models/user.model.js",
    "src/models/movie.model.js",
    "src/models/show.model.js",
    "src/models/booking.model.js",
    "src/controllers/auth.controller.js",
    "src/controllers/user.controller.js",
    "src/controllers/show.controller.js",
    "src/controllers/booking.controller.js",
    "src/controllers/admin.controller.js",
    "src/controllers/stripeWebhooks.controller.js",
    "src/routes/auth.routes.js",
    "src/routes/user.routes.js",
    "src/routes/show.routes.js",
    "src/routes/booking.routes.js",
    "src/routes/admin.routes.js",
    "public/temp",
  ];
  const missing = required.filter((p) => !fs.existsSync(path.join(root, p)));
  assert("Required architecture files exist", missing.length === 0, missing.join(", "));
}

// 3) Import app + models
const { app } = await import("../src/app.js");
const { User } = await import("../src/models/user.model.js");
const { ApiError } = await import("../src/utils/ApiError.js");
const { ApiResponse } = await import("../src/utils/ApiResponse.js");
const { asyncHandler } = await import("../src/utils/asyncHandler.js");

assert("Express app exports", typeof app === "function" || typeof app === "object");
assert("User model exports", typeof User === "function");
assert("ApiError works", new ApiError(400, "x").success === false);
assert("ApiResponse works", new ApiResponse(200, { a: 1 }).success === true);
assert("asyncHandler wraps", typeof asyncHandler(async () => {}) === "function");

// 4) JWT helpers on User schema (no DB required)
{
  const user = new User({
    _id: new mongoose.Types.ObjectId(),
    name: "Verify User",
    username: "verifyuser",
    email: "verify@example.com",
    password: await bcrypt.hash("Password123", 10),
    image: "https://example.com/a.jpg",
    role: "user",
  });

  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();
  assert("generateAccessToken returns jwt", typeof accessToken === "string" && accessToken.split(".").length === 3);
  assert("generateRefreshToken returns jwt", typeof refreshToken === "string" && refreshToken.split(".").length === 3);

  const decodedAccess = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
  assert("access token payload has _id", !!decodedAccess._id);
  assert("access token payload has email", decodedAccess.email === "verify@example.com");

  const decodedRefresh = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
  assert("refresh token payload has _id", !!decodedRefresh._id);

  const passwordOk = await user.isPasswordCorrect("Password123");
  const passwordBad = await user.isPasswordCorrect("wrong");
  assert("isPasswordCorrect accepts valid password", passwordOk === true);
  assert("isPasswordCorrect rejects invalid password", passwordBad === false);
}

// 5) Route stack includes expected nested routes (Express 5)
{
  const stack = app.router?.stack || [];
  const routers = stack.filter((layer) => layer.name === "router" && layer.handle?.stack);
  const allPaths = routers.flatMap((layer) =>
    (layer.handle.stack || [])
      .filter((l) => l.route?.path)
      .map((l) => `${Object.keys(l.route.methods).join(",").toUpperCase()} ${l.route.path}`)
  );

  const has = (methodPath) => allPaths.some((p) => p.includes(methodPath));

  assert("Auth route POST /register", has("POST /register"), allPaths.join(" | "));
  assert("Auth route POST /login", has("POST /login"));
  assert("Auth route POST /logout", has("POST /logout"));
  assert("Auth route POST /refresh-token", has("POST /refresh-token"));
  assert("Auth route GET /current-user", has("GET /current-user"));
  assert("Show route GET /all", has("GET /all"));
  assert("Booking route POST /create", has("POST /create"));
  assert("Admin route GET /dashboard", has("GET /dashboard"));
  assert("User route GET /favorites", has("GET /favorites"));
  assert("Stripe webhook mounted", stack.some((l) => l.name === "stripeWebhooks"));
  assert("Five feature routers mounted", routers.length >= 5, `count=${routers.length}`);
}

// 6) Cookie auth middleware exports
{
  const auth = await import("../src/middlewares/auth.middleware.js");
  assert("verifyJWT exported", typeof auth.verifyJWT === "function");
  assert("protectAdmin exported", typeof auth.protectAdmin === "function");
}

// 7) Multer middleware
{
  const { upload } = await import("../src/middlewares/multer.middleware.js");
  assert("multer upload exported", typeof upload?.fields === "function" || typeof upload?.single === "function");
}

console.log("\n==============================");
const failed = results.filter((r) => !r.ok);
console.log(`Passed: ${results.filter((r) => r.ok).length}/${results.length}`);
if (failed.length) {
  console.log("Failed:");
  failed.forEach((f) => console.log(` - ${f.name}: ${f.detail}`));
  process.exit(1);
}
console.log("All lightweight verification checks passed.");
process.exit(0);
