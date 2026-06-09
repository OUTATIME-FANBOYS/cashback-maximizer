# Vercel KV Setup Guide

This system uses **Vercel KV** (or **Upstash Redis**) as the primary data store for credit cards. This replaces the file-based JSON approach with a scalable, cloud-backed key-value store.

## Why KV?

- **Scalable**: Handles unlimited cards without performance degradation
- **Real-time**: Image updates are immediately available (no file caching)
- **No duplication**: Single source of truth (no JSON duplication)
- **Built-in caching**: Vercel's edge network caches reads
- **Per-region replication**: Automatic data replication for low latency

## Setup Steps

### 1. Create KV Store in Vercel Dashboard

**Option A: Use Vercel KV (Deprecated, but still works)**
```
Vercel Dashboard → Storage → KV → Create Database
```

**Option B: Use Upstash Redis (Recommended)**
```
Vercel Dashboard → Integrations → Marketplace → Search "Redis"
→ Install Upstash Redis
```

Both provide the same `@vercel/kv` API.

### 2. Link Environment Variables

After creating the store, Vercel automatically adds these to your environment:

- `VERCEL_KV_REST_API_URL` — The KV database URL
- `VERCEL_KV_REST_API_TOKEN` — The authentication token

These are automatically available in your Vercel deployment. For local development:

```bash
vercel env pull  # Downloads .env.local with KV credentials
```

### 3. Seed Initial Card Data

Run the seed script to load all cards from `cards.json` into KV:

```bash
# Production (uses VERCEL_KV_REST_API_URL and VERCEL_KV_REST_API_TOKEN from .env.local)
npm run seed-kv

# Or manually specify:
VERCEL_KV_REST_API_URL=<your-url> VERCEL_KV_REST_API_TOKEN=<your-token> npm run seed-kv
```

Expected output:
```
✅ Successfully seeded 42 cards to KV!
   11 issuers
```

### 4. Update Environment in Vercel

Add to your Vercel project settings (if not auto-added):

```
SYNC_CARD_IMAGES_TOKEN=<your-secret-for-manual-triggers>  # Optional
BLOB_READ_WRITE_TOKEN=<your-blob-token>  # For image uploads
```

### 5. Deploy to Vercel

```bash
git add .
git commit -m "Add Vercel KV data store"
git push origin develop
```

Once deployed, your API routes will use KV automatically.

## Using KV in Your Code

### Server-side (API routes, server components)

```typescript
import { 
  getAllCards, 
  getCardsByIssuer, 
  getIssuers 
} from '@/lib/cards-store';

// Fetch all cards
const cards = await getAllCards();

// Fetch by issuer
const chaseCards = await getCardsByIssuer('Chase');

// Fetch card by ID
const card = await getCardById(1);

// Get all issuers
const issuers = await getIssuers();
```

### Client-side (React components)

Use the `/api/cards` endpoint:

```typescript
// Fetch all cards
const response = await fetch('/api/cards');
const { creditCards, issuers, metadata } = await response.json();

// Filter by issuer
const response = await fetch('/api/cards?issuer=Chase');
const { issuer, cards } = await response.json();

// Get single card
const response = await fetch('/api/cards?id=1');
const card = await response.json();
```

## Background Sync Updates

The `/api/sync-card-images` endpoint now:

1. Fetches cards from KV (not JSON files)
2. Polls Rewards CC API for image updates
3. Uploads changed images to Vercel Blob
4. **Updates cards in KV** (not JSON)
5. Logs updates to response

Trigger manually:
```bash
curl -X POST https://yoursite.com/api/sync-card-images \
  -H "x-sync-token: your-sync-token"
```

Or let Vercel Crons handle it automatically (configured in `vercel.json`).

## Updating Cards Manually

To manually update card data:

1. Edit `src/data/cards.json` locally
2. Run `npm run seed-kv` to sync to KV
3. The changes are live immediately

OR directly update KV via API:

```typescript
import { updateCardImage } from '@/lib/cards-store';

// Update a card's image
await updateCardImage(cardId, newImageUrl);
```

## Monitoring

Check KV data in Vercel Dashboard:

```
Vercel Dashboard → Storage → KV → Manage → Data Browser
```

See stored keys:
- `cards:all` — All 42 cards (array)
- `card:1` through `card:42` — Individual cards
- `cards:issuer:Chase` — Chase cards only
- `issuers:list` — All issuer names

## Troubleshooting

**KV is empty after deploy?**
- Run `npm run seed-kv` after deployment
- Or add it to your build script: `"build": "next build && npm run seed-kv"`

**API routes return 500?**
- Check Vercel function logs for KV connection errors
- Ensure environment variables are set: `vercel env pull`
- Test connection locally first

**Cards not updating after sync?**
- Check BLOB_READ_WRITE_TOKEN is set
- Verify Rewards CC API is responding
- Check sync route logs in Vercel

## Cost

**Vercel KV (deprecated):**
- 1 GB included free, then $0.50/GB

**Upstash Redis (recommended):**
- 10,000 commands/day free, then pay-as-you-go
- Better for small projects

For 42 cards with daily syncs, you'll stay well within free tier.
