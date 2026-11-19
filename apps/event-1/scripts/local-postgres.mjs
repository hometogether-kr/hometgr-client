import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";

const admin = new URL(process.env.EVENT_DATABASE_ADMIN_URL);
const binaryDirectory = process.env.EVENT_POSTGRES_BIN;
if (
  process.env.EVENT_APP_ENV !== "local" ||
  admin.hostname !== "127.0.0.1" ||
  admin.username !== "event1_local_admin" ||
  !binaryDirectory
) {
  throw new Error("Local PostgreSQL requires its local admin URL and EVENT_POSTGRES_BIN");
}
const port = Number(admin.port);
if (!Number.isInteger(port) || port < 1024 || port > 65535) throw new Error("Invalid local port");
const local = resolve(".local");
const data = join(local, "postgres");
const suffix = process.platform === "win32" ? ".exe" : "";
const control = join(binaryDirectory, "pg_ctl" + suffix);
function run(file, args) {
  return new Promise((resolveRun, reject) => {
    const child = spawn(file, args, { stdio: "inherit", windowsHide: true });
    child.once("error", reject);
    child.once("exit", (code) =>
      code === 0 ? resolveRun() : reject(new Error(`Local PostgreSQL exited (${code})`)),
    );
  });
}

if (process.argv[2] === "stop") {
  await run(control, ["-D", data, "-m", "fast", "-w", "stop"]);
} else {
  await mkdir(local, { recursive: true });
  if (!existsSync(join(data, "PG_VERSION"))) {
    const passwordFile = join(local, "init-password");
    await writeFile(passwordFile, decodeURIComponent(admin.password) + "\n", { mode: 0o600 });
    try {
      await run(join(binaryDirectory, "initdb" + suffix), [
        "-D",
        data,
        "--username=event1_local_admin",
        "--auth=scram-sha-256",
        "--locale=C",
        "--encoding=UTF8",
        "--pwfile=" + passwordFile,
      ]);
    } finally {
      await unlink(passwordFile);
    }
  }
  await run(control, [
    "-D",
    data,
    "-l",
    join(local, "postgres.log"),
    "-o",
    `-p ${port} -h 127.0.0.1`,
    "-w",
    "start",
  ]);
  console.log(`Event local PostgreSQL is ready on 127.0.0.1:${port}`);
  const keepAlive = setInterval(() => {}, 60000);
  let stopping = false;
  async function shutdown() {
    if (stopping) return;
    stopping = true;
    await run(control, ["-D", data, "-m", "fast", "-w", "stop"]);
    clearInterval(keepAlive);
  }
  process.once("SIGINT", () => void shutdown());
  process.once("SIGTERM", () => void shutdown());
}
