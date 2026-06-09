# Card Image Sync System

This system automatically fetches credit card images from the Rewards CC API and stores them in Vercel Blob, with background polling to keep them updated.

## Setup Steps

### 1. Get Vercel Blob Token

```bash
# Link your project to Vercel (if not already done)
vercel link

# Create a Blob store in Vercel dashboard
# Then pull the token to your .env.local
vercel env pull
```

Verify `BLOB_READ_WRITE_TOKEN` is in your `.env.local`.

### 2. Initial Card Image Sync

Run the sync script to fetch all cards from Rewards CC API and upload to Blob:

```bash
BLOB_READ_WRITE_TOKEN=<your-token> npm run upload-cards
```

This will output a `cardImages` object — copy it to `src/lib/cards.ts`.

Alternatively, use the direct API approach:

```bash
BLOB_READ_WRITE_TOKEN=<your-token> npx tsx scripts/sync-cards-from-api.ts
```

### 3. Background Polling (Automatic)

The system polls for updates automatically via:

**Option A: Vercel Crons (Recommended)**
- `vercel.json` is already configured to run `/api/sync-card-images` daily at 2 AM UTC
- Just deploy to Vercel and crons will activate automatically

**Option B: Manual Trigger**
```bash
curl -X POST https://yoursite.com/api/sync-card-images \
  -H "x-sync-token: your-secret-token"
```

**Option C: External Cron Service (EasyCron, etc.)**
Set up a daily POST request to: `https://yoursite.com/api/sync-card-images`

### 4. Environment Variables

Add to Vercel project settings:

```
BLOB_READ_WRITE_TOKEN=<your-token>
SYNC_CARD_IMAGES_TOKEN=<a-secret-for-manual-triggers>  # Optional
```

## How It Works

1. **Initial Sync**: `scripts/sync-cards-from-api.ts` fetches all cards from Rewards CC API
2. **Image Upload**: Downloads images and uploads to Vercel Blob
3. **Daily Updates**: API route `/api/sync-card-images` runs daily and:
   - Fetches latest image URLs from Rewards CC for each card
   - Detects if image changed
   - Re-uploads only changed images to save bandwidth
   - Logs all updates to response

## Monitoring

Check recent sync runs in:
- **Vercel Dashboard** → Functions → `/api/sync-card-images`
- **Manual trigger response** shows summary of updates

Response format:
```json
{
  "timestamp": "2024-06-09T02:00:00.000Z",
  "summary": {
    "checked": 42,
    "updated": 3,
    "failed": 0
  },
  "updates": {
    "1": {
      "old": "https://old-url.png",
      "new": "https://blob.vercel.com/...",
      "status": "updated"
    }
  }
}
```

## Troubleshooting

**Images not updating?**
- Check `BLOB_READ_WRITE_TOKEN` is set in Vercel
- Verify Rewards CC API is responding: `curl https://api.rewardscc.com/creditcard-card-image/1`
- Check Vercel function logs

**Blob upload fails?**
- Ensure token has write permissions
- Check available Blob storage quota

**Script won't run locally?**
- Install tsx: `npm install -D tsx`
- Ensure `BLOB_READ_WRITE_TOKEN` is exported: `export BLOB_READ_WRITE_TOKEN=...`
