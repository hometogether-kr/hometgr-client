import { randomBytes } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { parseEnv } from "node:util";

const environmentFile =
  process.argv[2] ?? (existsSync(".env.supabase.local") ? ".env.supabase.local" : ".env.local");
if (
  ![".env.local", ".env.supabase.local"].includes(environmentFile) ||
  !existsSync(environmentFile)
) {
  throw new Error(
    "Choose an existing .env.local or .env.supabase.local in the event app directory",
  );
}
const current = readFileSync(environmentFile, "utf8");
const env = parseEnv(current);
const additions = [];
const password = env.EVENT_OPS_ACCESS_KEY;
if (password !== undefined) {
  if (password.length < 4 || password.length > 128 || password.trim().length < 4) {
    throw new Error(
      "The existing operator password must contain 4-128 characters; it was not changed",
    );
  }
} else {
  additions.push(`EVENT_OPS_ACCESS_KEY=${randomBytes(12).toString("base64url")}`);
}
if (env.EVENT_OPS_SESSION_SECRET !== undefined) {
  if (!/^[A-Za-z0-9_-]{32,128}$/.test(env.EVENT_OPS_SESSION_SECRET)) {
    throw new Error("The existing session secret needs manual review; it was not changed");
  }
} else {
  additions.push(`EVENT_OPS_SESSION_SECRET=${randomBytes(32).toString("base64url")}`);
}
if (additions.length) {
  writeFileSync(environmentFile, `${current.trimEnd()}\n${additions.join("\n")}\n`, {
    mode: 0o600,
  });
}
console.log(
  `Operator access configured in ${environmentFile}. Existing password and secrets were preserved; missing values were generated without printing them.`,
);
