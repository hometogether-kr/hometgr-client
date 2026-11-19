import { randomBytes } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { parseEnv } from "node:util";
import { z } from "zod";

const target = new URL("../.env.supabase.local", import.meta.url);
const original = await readFile(target, "utf8");
const existing = parseEnv(original);
const credentials = z
  .object({
    NHN_ALIMTALK_APP_KEY: z.string().regex(/^[A-Za-z0-9_-]+$/),
    NHN_ALIMTALK_SECRET_KEY: z
      .string()
      .min(1)
      .regex(/^[^\r\n]+$/),
    NHN_ALIMTALK_SENDER_KEY: z
      .string()
      .regex(/^[A-Za-z0-9_-]{40}$/)
      .optional(),
  })
  .safeParse({
    ...existing,
    ...Object.fromEntries(
      Object.entries(process.env).filter(
        ([key, value]) => key.startsWith("NHN_ALIMTALK_") && value,
      ),
    ),
  });
if (!credentials.success) throw new Error("NHN_CREDENTIALS_MISSING_OR_INVALID");
const config = credentials.data;
const base = `https://kakaotalk-bizmessage.api.nhncloudservice.com/alimtalk`;
async function readNhn(path) {
  const response = await fetch(`${base}${path}`, {
    headers: { "X-Secret-Key": config.NHN_ALIMTALK_SECRET_KEY },
    redirect: "manual",
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) throw new Error("NHN_CONFIGURATION_CHECK_FAILED");
  const body = z
    .object({
      header: z.object({ isSuccessful: z.boolean() }),
      senders: z.unknown().optional(),
      template: z.unknown().optional(),
      templates: z.unknown().optional(),
    })
    .safeParse(await response.json());
  if (!body.success || !body.data.header.isSuccessful)
    throw new Error("NHN_CONFIGURATION_CHECK_FAILED");
  return body.data;
}
let senders = config.NHN_ALIMTALK_SENDER_KEY ? [config.NHN_ALIMTALK_SENDER_KEY] : [];
if (!senders.length) {
  const body = await readNhn(
    `/v2.1/appkeys/${config.NHN_ALIMTALK_APP_KEY}/senders?status=YSC03&pageSize=1000&pageNum=1`,
  );
  const parsed = z
    .object({ senders: z.array(z.object({ senderKey: z.string().regex(/^[A-Za-z0-9_-]{40}$/) })) })
    .safeParse(body);
  if (!parsed.success) throw new Error("NHN_SENDER_RESPONSE_INVALID");
  senders = parsed.data.senders.map((sender) => sender.senderKey);
}
const matches = [];
for (const sender of senders) {
  const response = await readNhn(
    `/v2.3/appkeys/${config.NHN_ALIMTALK_APP_KEY}/senders/${sender}/templates/ht_event1_received`,
  );
  const parsed = z
    .object({
      templateCode: z.literal("ht_event1_received"),
      status: z.string(),
      templateContent: z.string(),
      block: z.boolean(),
      dormant: z.boolean(),
    })
    .safeParse(response.template ?? response.templates);
  if (parsed.success) matches.push({ sender, template: parsed.data });
}
if (matches.length !== 1) throw new Error("NHN_EVENT_TEMPLATE_SENDER_MUST_BE_UNIQUE");
const selected = matches[0];
const values = {
  NHN_ALIMTALK_APP_KEY: config.NHN_ALIMTALK_APP_KEY,
  NHN_ALIMTALK_SECRET_KEY: config.NHN_ALIMTALK_SECRET_KEY,
  NHN_ALIMTALK_SENDER_KEY: selected.sender,
  EVENT_ALIMTALK_TEMPLATE_CODE: "ht_event1_received",
  EVENT_ALIMTALK_ENABLED: "false",
  EVENT_ALIMTALK_DISPATCH_SECRET:
    existing.EVENT_ALIMTALK_DISPATCH_SECRET || randomBytes(32).toString("base64url"),
};
let content = original;
for (const [key, value] of Object.entries(values)) {
  const line = `${key}=${JSON.stringify(value)}`;
  const pattern = new RegExp(`^${key}=.*$`, "m");
  content = pattern.test(content)
    ? content.replace(pattern, () => line)
    : `${content.trimEnd()}\n${line}\n`;
}
await writeFile(target, content, { mode: 0o600 });
console.log(
  JSON.stringify({
    configured: true,
    enabled: false,
    templateCode: selected.template.templateCode,
    templateStatus: selected.template.status,
    block: selected.template.block,
    dormant: selected.template.dormant,
    bodyMatches:
      selected.template.templateContent.replace(/\r\n/g, "\n") ===
      "[홈투게더] 한 달 월세 지원 이벤트\n\n신청이 접수되었습니다.\n신청 내용을 확인하고 있으니 잠시만 기다려 주세요.",
  }),
);
