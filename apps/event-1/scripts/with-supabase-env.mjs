import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

process.loadEnvFile(fileURLToPath(new URL("../.env.supabase.local", import.meta.url)));
const nextCli = fileURLToPath(new URL("../node_modules/next/dist/bin/next", import.meta.url));
const child = spawn(process.execPath, [nextCli, ...process.argv.slice(2)], {
  cwd: fileURLToPath(new URL("../", import.meta.url)),
  env: process.env,
  stdio: "inherit",
  windowsHide: true,
});
child.once("error", (error) => {
  console.error(error.message);
  process.exitCode = 1;
});
child.once("exit", (code) => {
  process.exitCode = code ?? 1;
});
