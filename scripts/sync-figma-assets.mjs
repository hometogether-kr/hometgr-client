#!/usr/bin/env node
/**
 * Figma 임시 에셋을 저장소로 내려받고 소스의 URL을 교체합니다.
 *
 * Figma MCP가 내려주는 에셋 URL은 약 7일 뒤 만료됩니다. 이 스크립트를 한 번 실행해
 * `public/figma/`로 파일을 받아 커밋하면 더 이상 만료를 신경 쓰지 않아도 됩니다.
 *
 *   node scripts/sync-figma-assets.mjs          # 내려받고 소스까지 교체
 *   node scripts/sync-figma-assets.mjs --check  # 만료 여부만 확인 (파일 변경 없음)
 *
 * 만료된 URL은 Figma MCP로 해당 노드를 다시 export해야 합니다. 어떤 파일의 어떤
 * 상수가 실패했는지 출력하므로 그 부분만 다시 받으면 됩니다.
 */
import { readFile, writeFile, mkdir, readdir } from "node:fs/promises";
import path from "node:path";

const projectRoot = path.resolve(import.meta.dirname, "..");
const sourceRoot = path.join(projectRoot, "src");
const assetDir = path.join(projectRoot, "public", "figma");
/** 소스에서 참조할 공개 경로 */
const publicPrefix = "/figma";

const checkOnly = process.argv.includes("--check");

const ASSET_URL = /https:\/\/www\.figma\.com\/api\/mcp\/asset\/[a-zA-Z0-9-]+/g;
/** `const FIGMA_TEMP_LOGO = "…"` 처럼 이름이 붙은 선언 */
const NAMED_ASSET = /(?:const\s+)?([A-Za-z0-9_]+)\s*[:=]\s*\n?\s*"(https:\/\/www\.figma\.com\/api\/mcp\/asset\/[a-zA-Z0-9-]+)"/g;

const EXTENSION_BY_MIME = {
  "image/svg+xml": "svg",
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
};

async function collectSourceFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });

  const files = await Promise.all(
    entries.map((entry) => {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) return collectSourceFiles(fullPath);
      return /\.tsx?$/.test(entry.name) ? [fullPath] : [];
    }),
  );

  return files.flat();
}

function toFileName(rawName, url) {
  const fallback = url.split("/").pop().slice(0, 8);
  if (!rawName) return `asset-${fallback}`;

  const cleaned = rawName
    .replace(/^FIGMA_TEMP_/, "")
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/_/g, "-")
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "");

  return cleaned ? `${cleaned}-${fallback}` : `asset-${fallback}`;
}

/** URL → { name, files } 목록을 만듭니다. 같은 URL이 여러 파일에 있을 수 있습니다. */
async function collectAssets(sourceFiles) {
  const assets = new Map();

  for (const filePath of sourceFiles) {
    const source = await readFile(filePath, "utf8");
    const names = new Map();

    for (const [, name, url] of source.matchAll(NAMED_ASSET)) {
      names.set(url, name);
    }

    for (const url of source.match(ASSET_URL) ?? []) {
      const existing = assets.get(url);
      if (existing) {
        existing.files.add(filePath);
        existing.name ??= names.get(url);
        continue;
      }
      assets.set(url, { name: names.get(url), files: new Set([filePath]) });
    }
  }

  return assets;
}

async function downloadAsset(url) {
  const response = await fetch(url, { redirect: "follow" });
  if (!response.ok) return { ok: false, status: response.status };

  const mime = (response.headers.get("content-type") ?? "").split(";")[0].trim();
  const bytes = Buffer.from(await response.arrayBuffer());

  return { ok: true, bytes, extension: EXTENSION_BY_MIME[mime] ?? "bin", mime };
}

async function main() {
  const sourceFiles = await collectSourceFiles(sourceRoot);
  const assets = await collectAssets(sourceFiles);

  if (assets.size === 0) {
    console.log("교체할 Figma 임시 URL이 없습니다. 이미 정리된 상태입니다.");
    return;
  }

  console.log(`Figma 임시 에셋 ${assets.size}개를 찾았습니다.\n`);
  if (!checkOnly) await mkdir(assetDir, { recursive: true });

  /** 소스에서 바꿔치기할 URL → 공개 경로 */
  const replacements = new Map();
  const expired = [];

  for (const [url, meta] of assets) {
    const label = meta.name ?? "(이름 없음)";
    const result = await downloadAsset(url).catch((error) => ({
      ok: false,
      status: error.message,
    }));

    if (!result.ok) {
      expired.push({ url, meta });
      console.log(`  ✗ ${label} — 만료됨 (${result.status})`);
      continue;
    }

    const fileName = `${toFileName(meta.name, url)}.${result.extension}`;

    if (!checkOnly) {
      await writeFile(path.join(assetDir, fileName), result.bytes);
    }
    replacements.set(url, `${publicPrefix}/${fileName}`);
    console.log(`  ✓ ${label} → public/figma/${fileName}`);
  }

  if (checkOnly) {
    console.log("\n--check 모드라 파일을 저장하거나 소스를 바꾸지 않았습니다.");
  } else if (replacements.size > 0) {
    let changedFiles = 0;

    for (const filePath of sourceFiles) {
      const source = await readFile(filePath, "utf8");
      let next = source;

      for (const [url, publicPath] of replacements) {
        next = next.replaceAll(url, publicPath);
      }

      if (next !== source) {
        await writeFile(filePath, next);
        changedFiles += 1;
      }
    }

    console.log(`\n소스 ${changedFiles}개 파일의 URL을 로컬 경로로 교체했습니다.`);
  }

  if (expired.length > 0) {
    console.log(`\n만료된 에셋 ${expired.length}개 — Figma에서 다시 export해야 합니다:`);
    for (const { meta } of expired) {
      const files = [...meta.files].map((file) => path.relative(projectRoot, file));
      console.log(`  · ${meta.name ?? "(이름 없음)"}  ${files.join(", ")}`);
    }
    process.exitCode = 1;
  }
}

await main();
