import { randomBytes } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";

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
const existing = current.match(/^EVENT_OPS_ACCESS_KEY=(.*)$/m);
if (existing) {
  if (!/^[A-Za-z0-9_-]{32,128}$/.test(existing[1].trim()))
    throw new Error("The existing operator key needs manual review; it was not changed");
  console.log(
    `Operator access is already configured in ${environmentFile}. The key was preserved.`,
  );
} else {
  writeFileSync(
    environmentFile,
    `${current.trimEnd()}\nEVENT_OPS_ACCESS_KEY=${randomBytes(32).toString("base64url")}\n`,
    { mode: 0o600 },
  );
  console.log(
    `Operator access configured in ${environmentFile}. Read EVENT_OPS_ACCESS_KEY there; it is never printed or committed.`,
  );
}
