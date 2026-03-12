#!/usr/bin/env node
/**
 * Generates public/logo.png from public/logo.svg.
 * Run: npm run build:logo (requires sharp: npm install --save-dev sharp)
 */
import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const svgPath = join(root, "public", "logo.svg");
const pngPath = join(root, "public", "logo.png");

const svg = readFileSync(svgPath);
await sharp(svg)
  .resize(192, 192)
  .png()
  .toFile(pngPath);
console.log("Generated public/logo.png (192x192)");

const iconPath = join(root, "app", "icon.png");
await sharp(svg)
  .resize(32, 32)
  .png()
  .toFile(iconPath);
console.log("Generated app/icon.png (32x32 favicon)");
