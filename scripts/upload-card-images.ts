/**
 * Upload local card images to Vercel Blob.
 *
 * Usage:
 *   BLOB_READ_WRITE_TOKEN=<token> npx tsx scripts/upload-card-images.ts
 *
 * Place card images in scripts/card-art/ named by card ID, e.g.:
 *   scripts/card-art/4.png
 *   scripts/card-art/14.png
 *
 * After running, copy the printed URLs into src/lib/cards.ts → cardImages.
 */

import { put } from "@vercel/blob";
import { readFileSync, readdirSync } from "fs";
import { join, extname, basename } from "path";

const CARD_ART_DIR = join(__dirname, "card-art");

async function main() {
  let files: string[];
  try {
    files = readdirSync(CARD_ART_DIR);
  } catch {
    console.error(`Create a directory at scripts/card-art/ and place card images there (named by card ID, e.g. 4.png)`);
    process.exit(1);
  }

  const results: Record<number, string> = {};

  for (const file of files) {
    const ext = extname(file);
    const id = parseInt(basename(file, ext), 10);
    if (isNaN(id)) {
      console.warn(`Skipping ${file} — filename is not a numeric card ID`);
      continue;
    }

    const filePath = join(CARD_ART_DIR, file);
    const data = readFileSync(filePath);
    const mimeType = ext === ".png" ? "image/png" : ext === ".jpg" || ext === ".jpeg" ? "image/jpeg" : "image/webp";

    console.log(`Uploading card ${id}...`);
    const blob = await put(`cards/${id}${ext}`, data, {
      access: "public",
      addRandomSuffix: false,
      contentType: mimeType,
    });

    results[id] = blob.url;
    console.log(`  → ${blob.url}`);
  }

  console.log("\n// Paste into src/lib/cards.ts → cardImages:");
  console.log("export const cardImages: Record<number, string> = {");
  for (const [id, url] of Object.entries(results).sort((a, b) => Number(a[0]) - Number(b[0]))) {
    console.log(`  ${id}: "${url}",`);
  }
  console.log("};");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
