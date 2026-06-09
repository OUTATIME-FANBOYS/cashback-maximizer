/**
 * Seed Vercel KV with card data from cards.json
 * Usage: VERCEL_KV_REST_API_URL=<url> VERCEL_KV_REST_API_TOKEN=<token> npx tsx scripts/seed-cards-to-kv.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { Redis } from '@upstash/redis';

const kv = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

async function seedCards() {
  console.log('Reading cards from cards.json...');

  const cardsJsonPath = path.join(process.cwd(), 'src/data/cards.json');
  const cardsData = JSON.parse(fs.readFileSync(cardsJsonPath, 'utf-8'));
  const cards = cardsData.creditCards;

  console.log(`Found ${cards.length} cards. Seeding to KV...`);

  const CARDS_KEY = 'cards:all';
  const CARD_BY_ID_KEY = (id: number) => `card:${id}`;
  const CARDS_BY_ISSUER_KEY = (issuer: string) => `cards:issuer:${issuer}`;
  const ISSUERS_KEY = 'issuers:list';
  const CARDS_METADATA_KEY = 'cards:metadata';

  try {
    // Store all cards
    console.log('  → Storing all cards...');
    await kv.set(CARDS_KEY, cards);

    // Store individual cards by ID
    console.log('  → Storing individual cards...');
    for (const card of cards) {
      await kv.set(CARD_BY_ID_KEY(card.id), card);
    }

    // Group by issuer
    console.log('  → Grouping by issuer...');
    const byIssuer: Record<string, typeof cards> = {};
    for (const card of cards) {
      if (!byIssuer[card.issuer]) {
        byIssuer[card.issuer] = [];
      }
      byIssuer[card.issuer].push(card);
    }

    // Store issuer groups
    console.log('  → Storing issuer groups...');
    for (const [issuer, issuerCards] of Object.entries(byIssuer)) {
      await kv.set(CARDS_BY_ISSUER_KEY(issuer), issuerCards);
      console.log(`    ✓ ${issuer}: ${issuerCards.length} cards`);
    }

    // Store issuer list
    console.log('  → Storing issuer list...');
    const issuers = Object.keys(byIssuer).sort();
    await kv.set(ISSUERS_KEY, issuers);

    // Store metadata
    console.log('  → Storing metadata...');
    await kv.set(CARDS_METADATA_KEY, {
      totalCards: cards.length,
      lastUpdated: new Date().toISOString(),
      version: '2.0',
    });

    console.log(`\n✅ Successfully seeded ${cards.length} cards to KV!`);
    console.log(`   ${issuers.length} issuers`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding to KV:', error);
    process.exit(1);
  }
}

seedCards();
