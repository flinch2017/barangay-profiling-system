import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const sourceDir = resolve(rootDir, "frontend", "dist");
const targetDir = resolve(rootDir, "dist");

if (!existsSync(sourceDir)) {
  throw new Error("frontend/dist was not found. Run the frontend build first.");
}

rmSync(targetDir, {
  recursive: true,
  force: true,
});
mkdirSync(targetDir, {
  recursive: true,
});
cpSync(sourceDir, targetDir, {
  recursive: true,
});

console.log("Copied frontend/dist to root dist for Render static publishing.");
