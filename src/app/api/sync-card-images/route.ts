/**
 * Background API route for syncing card images from Rewards CC API to Vercel Blob.
 *
 * Trigger via cron:
 *   - Vercel Crons: add to vercel.json
 *   - EasyCron: POST to /api/sync-card-images
 *   - Manual: curl https://yoursite.com/api/sync-card-images
 *
 * Environment variables required:
 *   - BLOB_READ_WRITE_TOKEN (set in Vercel project settings)
 *   - VERCEL_KV_REST_API_URL & VERCEL_KV_REST_API_TOKEN (for KV store)
 */

import { put } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";
import { getAllCards, updateCardImage as updateCardInKV } from "@/lib/cards-store";

interface RewardsCardResponse {
  cardKey: string;
  cardName: string;
  cardImageUrl: string;
}

const REWARDS_CC_API_BASE = "https://api.rewardscc.com/creditcard-card-image";

const CONTENT_TYPE_TO_EXT: Record<string, string> = {
  "image/png": ".png",
  "image/webp": ".webp",
  "image/jpeg": ".jpg",
  "image/jpg": ".jpg",
};

async function uploadImageToBlob(
  cardId: number,
  imageUrl: string
): Promise<{ success: boolean; blobUrl?: string; error?: string }> {
  try {
    const response = await fetch(imageUrl, { signal: AbortSignal.timeout(15000) });
    if (!response.ok) throw new Error(`Fetch failed: ${response.statusText}`);

    const contentType = response.headers.get("content-type")?.split(";")[0].trim() ?? "image/jpeg";
    const ext = CONTENT_TYPE_TO_EXT[contentType] ?? ".jpg";
    const buffer = Buffer.from(await response.arrayBuffer());

    const blob = await put(`cards/api/${cardId}${ext}`, buffer, {
      access: "public",
      addRandomSuffix: false,
      contentType,
    });

    return { success: true, blobUrl: blob.url };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { success: false, error: message };
  }
}

export async function POST(request: NextRequest) {
  // Optional: Add auth token to prevent abuse
  const authToken = request.headers.get("x-sync-token");
  if (authToken !== process.env.SYNC_CARD_IMAGES_TOKEN && process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const updates: Record<
    number,
    { old?: string; new?: string; error?: string; status: "updated" | "failed" }
  > = {};

  const cards = await getAllCards();

  if (cards.length === 0) {
    return NextResponse.json(
      { error: "No cards found in KV store. Run seed script first." },
      { status: 500 }
    );
  }

  for (const card of cards) {
    try {
      // Fetch from Rewards CC API
      const apiUrl = `${REWARDS_CC_API_BASE}/${card.id}`;
      const apiResponse = await fetch(apiUrl, { signal: AbortSignal.timeout(5000) });

      if (!apiResponse.ok) {
        updates[card.id] = {
          error: `API returned ${apiResponse.status}`,
          status: "failed",
        };
        continue;
      }

      const cardData = (await apiResponse.json()) as RewardsCardResponse;

      if (!cardData.cardImageUrl) {
        updates[card.id] = {
          error: "No image URL in response",
          status: "failed",
        };
        continue;
      }

      // Check if image URL changed
      if (card.image === cardData.cardImageUrl) {
        // Image hasn't changed, skip
        continue;
      }

      // Upload new image to Blob
      const result = await uploadImageToBlob(card.id, cardData.cardImageUrl);

      if (result.success) {
        // Update in KV
        await updateCardInKV(card.id, result.blobUrl!);

        updates[card.id] = {
          old: card.image,
          new: result.blobUrl,
          status: "updated",
        };
      } else {
        updates[card.id] = {
          error: result.error,
          status: "failed",
        };
      }
    } catch (err) {
      updates[card.id] = {
        error: err instanceof Error ? err.message : "Unknown error",
        status: "failed",
      };
    }
  }

  // Count results
  const totalChecked = cards.length;
  const totalUpdated = Object.values(updates).filter((u) => u.status === "updated").length;
  const totalFailed = Object.values(updates).filter((u) => u.status === "failed").length;

  return NextResponse.json(
    {
      timestamp: new Date().toISOString(),
      summary: {
        checked: totalChecked,
        updated: totalUpdated,
        failed: totalFailed,
      },
      updates,
    },
    { status: 200 }
  );
}
