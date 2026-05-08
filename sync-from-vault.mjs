#!/usr/bin/env node
import { readdir, readFile, writeFile, rm, mkdir, stat } from "node:fs/promises";
import { dirname, join, relative } from "node:path";

const VAULT = "/Users/1111903/obsidian/note";
const CONTENT = "/Users/1111903/obsidian/quartz/content";

const FRONTMATTER_RE = /^---\n([\s\S]*?)\n---/;
const PUBLISH_RE = /^publish:\s*true\s*$/m;

async function* walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    if (e.name.startsWith(".")) continue;
    const p = join(dir, e.name);
    if (e.isDirectory()) yield* walk(p);
    else if (e.isFile() && e.name.endsWith(".md")) yield p;
  }
}

async function main() {
  await rm(CONTENT, { recursive: true, force: true });
  await mkdir(CONTENT, { recursive: true });
  await writeFile(join(CONTENT, ".gitkeep"), "");

  const published = [];
  for await (const file of walk(VAULT)) {
    const text = await readFile(file, "utf8");
    const m = text.match(FRONTMATTER_RE);
    if (!m || !PUBLISH_RE.test(m[1])) continue;

    const rel = relative(VAULT, file);
    const dest = join(CONTENT, rel);
    await mkdir(dirname(dest), { recursive: true });
    await writeFile(dest, text);
    published.push(rel);
    console.log(`  + ${rel}`);
  }

  const hasVaultIndex = published.some((p) => p.toLowerCase() === "index.md");

  if (!hasVaultIndex) {
    const links = published
      .map((p) => p.replace(/\.md$/, ""))
      .sort()
      .map((name) => `- [[${name}]]`)
      .join("\n");

    const indexBody = `---
title: Home
---

# My Notes

[Obsidian](https://obsidian.md) 에서 작성한 노트 중 \`publish: true\` 로 표시된 것들만 여기에 공개됩니다.

## 공개된 노트

${links || "_(아직 공개된 노트가 없습니다)_"}
`;
    await writeFile(join(CONTENT, "index.md"), indexBody);
    console.log(`Generated content/index.md with ${published.length} link(s) (Vault에 index.md 없음)`);
  } else {
    console.log(`Using Vault index.md as home page`);
  }

  console.log(`\nSynced ${published.length} note(s) with publish:true into content/`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
