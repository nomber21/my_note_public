#!/usr/bin/env node
import { readdir, readFile, writeFile, rm, mkdir, copyFile } from "node:fs/promises";
import { dirname, join, relative, extname } from "node:path";

const PUBLISH_DIR = "/Users/1111903/obsidian/note/publish";
const CONTENT = "/Users/1111903/obsidian/quartz/content";

const ASSET_EXTS = new Set([".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg", ".pdf"]);

async function* walk(dir) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch (e) {
    if (e.code === "ENOENT") return;
    throw e;
  }
  for (const e of entries) {
    if (e.name.startsWith(".")) continue;
    const p = join(dir, e.name);
    if (e.isDirectory()) yield* walk(p);
    else if (e.isFile()) yield p;
  }
}

async function main() {
  await rm(CONTENT, { recursive: true, force: true });
  await mkdir(CONTENT, { recursive: true });
  await writeFile(join(CONTENT, ".gitkeep"), "");

  let mdCount = 0;
  let assetCount = 0;
  let hasIndex = false;

  for await (const file of walk(PUBLISH_DIR)) {
    const ext = extname(file).toLowerCase();
    const rel = relative(PUBLISH_DIR, file);
    const dest = join(CONTENT, rel);
    await mkdir(dirname(dest), { recursive: true });

    if (ext === ".md") {
      const text = await readFile(file, "utf8");
      await writeFile(dest, text);
      mdCount++;
      if (rel.toLowerCase() === "index.md") hasIndex = true;
      console.log(`  + ${rel}`);
    } else if (ASSET_EXTS.has(ext)) {
      await copyFile(file, dest);
      assetCount++;
      console.log(`  + ${rel} (asset)`);
    }
  }

  if (!hasIndex) {
    const indexBody = `---
title: Home
---

# My Notes

\`note/publish/\` 폴더에 들어 있는 노트들이 여기에 공개됩니다.

_(아직 \`index.md\` 가 없어서 자동 생성된 홈입니다. \`note/publish/index.md\` 를 만들면 그게 우선됩니다.)_
`;
    await writeFile(join(CONTENT, "index.md"), indexBody);
    console.log(`  + index.md (auto-generated fallback)`);
  }

  console.log(`\nSynced ${mdCount} markdown + ${assetCount} asset(s) from publish/`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
