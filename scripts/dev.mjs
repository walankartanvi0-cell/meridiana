/**
 * Starts the Meridiana backend and frontend together from the project root.
 *
 * Using the root `npm run dev` prevents npm from walking up to an unrelated
 * package.json in a parent folder (for example the user's home directory).
 * Each app still runs from its own folder, so its own package.json, env file
 * and node_modules are used.
 */

import { spawn } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";

const npmExecPath = process.env.npm_execpath;
const npm = npmExecPath
  ? { command: process.execPath, args: [npmExecPath] }
  : { command: process.platform === "win32" ? "npm.cmd" : "npm", args: [] };

const backendPort = process.env.BACKEND_PORT ?? "5000";
const frontendPort = process.env.FRONTEND_PORT ?? "3000";

/** Reads MONGO_URI from backend/.env and decides which backend script to run. */
function usesRealDatabase() {
  const envPath = path.resolve("backend", ".env");
  if (!existsSync(envPath)) return false;

  const match = readFileSync(envPath, "utf8").match(/^\s*MONGO_URI\s*=\s*(.+)$/m);
  if (!match) return false;

  const uri = match[1].trim().replace(/^["']|["']$/g, "");
  if (!uri || /mongodb:\/\/(localhost|127\.0\.0\.1)/i.test(uri)) return false;
  return /^mongodb(\+srv)?:\/\//i.test(uri);
}

const realDatabase = usesRealDatabase();
const backendScript = process.env.BACKEND_SCRIPT ?? (realDatabase ? "dev:real" : "dev");
console.log(
  `[backend] using ${backendScript} (${
    backendScript === "dev:real" ? "MONGO_URI from backend/.env" : "local development database"
  })`,
);

// mongodb-memory-server prefers its global cache by default. If the local
// cache created during npm install is present, reuse it instead of downloading
// another (large) MongoDB binary on every fresh start.
const localMongoCache = path.resolve("backend", "node_modules", ".cache", "mongodb-memory-server");
const backendEnv = { ...process.env, PORT: backendPort };
if (existsSync(localMongoCache) && !process.env.MONGOMS_DOWNLOAD_DIR) {
  backendEnv.MONGOMS_DOWNLOAD_DIR = localMongoCache;
}

const services = [
  {
    name: "backend",
    args: ["--prefix", "backend", "run", backendScript],
    env: backendEnv,
  },
  {
    name: "frontend",
    args: ["--prefix", "frontend", "run", "dev", "--", "-p", frontendPort],
    env: { ...process.env, PORT: frontendPort },
  },
];

const children = [];
let stopping = false;

function stopChild(child) {
  if (!child?.pid || child.exitCode !== null) return;

  if (process.platform === "win32") {
    const killer = spawn("taskkill", ["/PID", String(child.pid), "/T", "/F"], {
      stdio: "ignore",
    });
    killer.on("error", () => child.kill());
  } else {
    try {
      process.kill(-child.pid, "SIGTERM");
    } catch {
      child.kill("SIGTERM");
    }
  }
}

function shutdown(code = 0) {
  if (stopping) return;
  stopping = true;
  children.forEach(stopChild);
  process.exitCode = code;
  // Safety net in case a child ignores SIGTERM.
  setTimeout(() => process.exit(code), 5000).unref();
}

for (const service of services) {
  const child = spawn(npm.command, [...npm.args, ...service.args], {
    cwd: process.cwd(),
    env: service.env,
    stdio: "inherit",
    detached: process.platform !== "win32",
  });

  children.push(child);

  child.on("error", (error) => {
    console.error(`[${service.name}] failed to start:`, error);
    shutdown(1);
  });

  child.on("exit", (code, signal) => {
    if (stopping) return;
    console.log(
      `[${service.name}] stopped (${signal ?? code ?? "unknown"}). Stopping the other service too.`,
    );
    shutdown(code ?? 1);
  });
}

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));
