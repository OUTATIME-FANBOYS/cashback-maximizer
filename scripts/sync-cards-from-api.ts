/**
 * Fetch all credit cards from Rewards CC API and upload images to Vercel Blob.
 *
 * Usage:
 *   BLOB_READ_WRITE_TOKEN=<token> npx tsx scripts/sync-cards-from-api.ts
 *
 * This script:
 * 1. Fetches the list of all available cards from Rewards CC
 * 2. Downloads card images
 * 3. Uploads them to Vercel Blob
 * 4. Outputs the image mapping to update cards.ts
 */

import { put } from "@vercel/blob";
import * as fs from "fs";
import * as path from "path";

const REWARDS_CC_API = "https://api.rewardscc.com/creditcard-card-image";

interface RewardsCard {
  cardKey: string;
  cardName: string;
  cardImageUrl: string;
}

async function fetchCardImage(
  url: string
): Promise<Buffer> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch ${url}`);
  return Buffer.from(await response.arrayBuffer());
}

async function uploadToBlob(
  filename: string,
  buffer: Buffer,
  contentType: string
): Promise<string> {
  const blob = await put(filename, buffer, {
    access: "public",
    addRandomSuffix: false,
    contentType,
  });
  return blob.url;
}

async function getCardIdFromKey(cardKey: string): Promise<number | null> {
  // Map common card keys to IDs from your cards.json
  const keyToId: Record<string, number> = {
    "chase-sapphire-preferred": 1,
    "chase-sapphire-reserve": 2,
    // Add mappings as needed
  };
  return keyToId[cardKey] || null;
}

async function main() {
  console.log("Fetching available cards from Rewards CC API...\n");

  // Read cards.json from local file
  const cardsJsonPath = path.join(process.cwd(), "src/data/cards.json");
  const cardsData = JSON.parse(fs.readFileSync(cardsJsonPath, "utf-8")) as { creditCards: Array<{ id: number; name: string }> };
  const results: Record<number, { url: string; lastUpdated: string }> = {};

  for (const card of cardsData.creditCards) {
    try {
      console.log(`Processing ${card.id}: ${card.name}...`);

      // Fetch card metadata from rewards CC API
      // Note: The API endpoint might need adjustment based on how they identify cards
      const apiUrl = `${REWARDS_CC_API}/${card.id}`;
      const apiResponse = await fetch(apiUrl);

      if (!apiResponse.ok) {
        console.warn(`  ⚠ API call failed for card ${card.id}, skipping image update`);
        continue;
      }

      const cardData = await apiResponse.json() as RewardsCard;

      if (!cardData.cardImageUrl) {
        console.warn(`  ⚠ No image URL found, skipping`);
        continue;
      }

      // Download image
      const imageBuffer = await fetchCardImage(cardData.cardImageUrl);

      // Upload to Vercel Blob
      const blobPath = `cards/api/${card.id}.png`;
      const blobUrl = await uploadToBlob(blobPath, imageBuffer, "image/png");

      results[card.id] = {
        url: blobUrl,
        lastUpdated: new Date().toISOString(),
      };

      console.log(`  ✓ Uploaded: ${blobUrl}`);
    } catch (err) {
      console.error(`  ✗ Error: ${err instanceof Error ? err.message : "Unknown error"}`);
    }
  }

  // Output results for updating cards.ts
  console.log("\n// Add to src/lib/cards.ts:");
  console.log("export const cardImages: Record<number, string> = {");
  for (const [id, data] of Object.entries(results).sort(
    (a, b) => Number(a[0]) - Number(b[0])
  )) {
    console.log(`  ${id}: "${data.url}",`);
  }
  console.log("};");

  // Also output metadata for tracking updates
  console.log("\n// Card image metadata (for polling system):");
  console.log("export const cardImageMetadata: Record<number, { lastUpdated: string }> = {");
  for (const [id, data] of Object.entries(results).sort(
    (a, b) => Number(a[0]) - Number(b[0])
  )) {
    console.log(`  ${id}: { lastUpdated: "${data.lastUpdated}" },`);
  }
  console.log("};");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
