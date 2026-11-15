import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join, resolve, sep } from "node:path";
import QRCode from "qrcode";
import { z } from "zod";

import {
  buildHostFlyerUrl,
  flyerContentSchema,
} from "../src/domains/marketing-attribution/model/host-flyer-campaign.ts";

const rowSchema = z.strictObject({
  code: flyerContentSchema,
  description: z.string().trim().min(1).max(160),
  quantity: z.number().int().nonnegative().max(1_000_000).nullable(),
  distribution_date: z.iso.date().nullable(),
});
const inputSchema = z.array(rowSchema).min(1).max(1_000);

function csvCell(value) {
  const cell = value === null ? "" : String(value);
  const safe = /^\s*[=+@-]/.test(cell) || /^[\t\r\n]/.test(cell) ? "'" + cell : cell;
  return '"' + safe.replaceAll('"', '""') + '"';
}

const [input, output, ...extra] = process.argv.slice(2);
if (!input || !output || extra.length > 0) {
  throw new Error("Usage: node scripts/generate-host-flyer-qr.mjs INPUT.json NEW_OUTPUT_DIR");
}

const records = inputSchema.parse(JSON.parse(await readFile(input, "utf8")));
if (new Set(records.map(({ code }) => code)).size !== records.length) {
  throw new Error("QR content codes must be unique.");
}

const destination = resolve(output);
if (destination === sep) throw new Error("Choose a new output directory.");
await mkdir(dirname(destination), { recursive: true });
await mkdir(destination);

const csv = [
  ["코드", "배포 아파트·캠페인 설명", "수량", "배포일", "PNG 파일명", "SVG 파일명", "URL"],
];
const options = {
  errorCorrectionLevel: "M",
  margin: 4,
  color: { dark: "#000000", light: "#ffffff" },
};
try {
  for (const record of records) {
    const url = buildHostFlyerUrl(record.code).href;
    const base = `host_a4_202611_${record.code}`;
    const png = `${base}.png`;
    const svg = `${base}.svg`;
    const [pngData, svgData] = await Promise.all([
      QRCode.toBuffer(url, { ...options, type: "png", scale: 20 }),
      QRCode.toString(url, { ...options, type: "svg" }),
    ]);
    await writeFile(join(destination, png), pngData);
    await writeFile(join(destination, svg), svgData);
    csv.push([
      record.code,
      record.description,
      record.quantity,
      record.distribution_date,
      png,
      svg,
      url,
    ]);
  }

  await writeFile(
    join(destination, "qr-mapping.csv"),
    "\uFEFF" + csv.map((row) => row.map(csvCell).join(",")).join("\r\n") + "\r\n",
  );
} catch (error) {
  await rm(destination, { recursive: true, force: true });
  throw error;
}

console.log(`Created ${records.length} QR code(s) in ${destination}`);
