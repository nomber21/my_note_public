#!/usr/bin/env node
import { execSync, spawnSync } from "node:child_process";

const QUARTZ = "/Users/1111903/obsidian/quartz";

function run(cmd, args, opts = {}) {
  const r = spawnSync(cmd, args, { cwd: QUARTZ, stdio: "inherit", ...opts });
  if (r.status !== 0) process.exit(r.status ?? 1);
}

function out(cmd, args) {
  return execSync([cmd, ...args].join(" "), { cwd: QUARTZ }).toString().trim();
}

console.log("==> Syncing publish:true notes from Vault...");
run("node", ["sync-from-vault.mjs"]);

console.log("\n==> Checking for changes...");
const status = out("git", ["status", "--porcelain", "content"]);
if (!status) {
  console.log("No changes in content/. Nothing to publish.");
  process.exit(0);
}
console.log(status);

const msg = process.argv.slice(2).join(" ") || `publish: ${new Date().toISOString().slice(0, 16).replace("T", " ")}`;

console.log(`\n==> Committing: "${msg}"`);
run("git", ["add", "content"]);
run("git", ["commit", "-m", msg]);

console.log("\n==> Pushing to GitHub (Pages deploy will start)...");
run("git", ["push"]);

console.log("\n✓ Done. Check Actions: https://github.com/nomber21/my_note_public/actions");
console.log("  Site: https://nomber21.github.io/my_note_public/");
