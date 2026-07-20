import { execSync, spawn } from "node:child_process";
import { rmSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const port = process.env.PORT ?? "3000";
const clean = process.argv.includes("--clean");

function getPidsOnPort() {
  try {
    return execSync(`lsof -ti :${port}`, {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    })
      .trim()
      .split("\n")
      .filter(Boolean)
      .map(Number);
  } catch {
    return [];
  }
}

function killPort() {
  const pids = getPidsOnPort();
  if (pids.length === 0) return;

  for (const pid of pids) {
    try {
      process.kill(pid, "SIGTERM");
    } catch {
      // already exited
    }
  }

  execSync("sleep 2", { stdio: "ignore" });

  for (const pid of getPidsOnPort()) {
    try {
      process.kill(pid, "SIGKILL");
    } catch {
      // already exited
    }
  }

  execSync("sleep 1", { stdio: "ignore" });
}

killPort();

if (clean) {
  rmSync(path.join(projectRoot, ".next"), { recursive: true, force: true });
  console.log("Removed .next cache");
}

const remaining = getPidsOnPort();
if (remaining.length > 0) {
  console.error(
    `Port ${port} is still in use (pids: ${remaining.join(", ")}). Stop other dev servers first.`,
  );
  process.exit(1);
}

console.log(`Starting dev server on http://127.0.0.1:${port}`);

const child = spawn(
  "node",
  [
    path.join(projectRoot, "node_modules/next/dist/bin/next"),
    "dev",
    "--turbopack",
    "--hostname",
    "127.0.0.1",
    "--port",
    port,
  ],
  {
    cwd: projectRoot,
    stdio: "inherit",
  },
);

child.on("exit", (code) => {
  process.exit(code ?? 0);
});
