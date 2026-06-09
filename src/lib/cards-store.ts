import { Redis } from '@upstash/redis';

const kv = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

export type Card = {
  id: number;
  name: string;
  issuer: string;
  network: string;
  type: string;
  image: string;
  annualFee: number;
  signupBonus: string;
  aprRange: string;
  rewardsRate: Record<string, string>;
  benefits: string[];
  creditScoreNeeded: string;
};

const CARDS_KEY = 'cards:all';
const CARD_BY_ID_KEY = (id: number) => `card:${id}`;
const CARDS_BY_ISSUER_KEY = (issuer: string) => `cards:issuer:${issuer}`;
const ISSUERS_KEY = 'issuers:list';
const CARDS_METADATA_KEY = 'cards:metadata';

export async function getAllCards(): Promise<Card[]> {
  const cards = await kv.get<Card[]>(CARDS_KEY);
  return cards || [];
}

export async function getCardById(id: number): Promise<Card | null> {
  const card = await kv.get<Card>(CARD_BY_ID_KEY(id));
  return card || null;
}

export async function getCardsByIssuer(issuer: string): Promise<Card[]> {
  const cards = await kv.get<Card[]>(CARDS_BY_ISSUER_KEY(issuer));
  return cards || [];
}

export async function getIssuers(): Promise<string[]> {
  const issuers = await kv.get<string[]>(ISSUERS_KEY);
  return issuers || [];
}

export async function getCardsMetadata() {
  const metadata = await kv.get<{ totalCards: number; lastUpdated: string; version: string }>(
    CARDS_METADATA_KEY
  );
  return metadata || { totalCards: 0, lastUpdated: '', version: '' };
}

export async function seedCards(cards: Card[]): Promise<void> {
  // Store all cards
  await kv.set(CARDS_KEY, cards);

  // Store individual cards by ID
  for (const card of cards) {
    await kv.set(CARD_BY_ID_KEY(card.id), card);
  }

  // Group by issuer and store
  const byIssuer: Record<string, Card[]> = {};
  for (const card of cards) {
    if (!byIssuer[card.issuer]) {
      byIssuer[card.issuer] = [];
    }
    byIssuer[card.issuer].push(card);
  }

  for (const [issuer, issuerCards] of Object.entries(byIssuer)) {
    await kv.set(CARDS_BY_ISSUER_KEY(issuer), issuerCards);
  }

  // Store issuer list
  const issuers = Object.keys(byIssuer).sort();
  await kv.set(ISSUERS_KEY, issuers);

  // Store metadata
  await kv.set(CARDS_METADATA_KEY, {
    totalCards: cards.length,
    lastUpdated: new Date().toISOString(),
    version: '2.0',
  });
}

export async function updateCardImage(cardId: number, imageUrl: string): Promise<void> {
  const card = await getCardById(cardId);
  if (!card) {
    throw new Error(`Card ${cardId} not found`);
  }

  const updatedCard = { ...card, image: imageUrl };

  // Update individual card
  await kv.set(CARD_BY_ID_KEY(cardId), updatedCard);

  // Update in all cards list
  const allCards = await getAllCards();
  const updatedCards = allCards.map(c => (c.id === cardId ? updatedCard : c));
  await kv.set(CARDS_KEY, updatedCards);

  // Update in issuer-specific list
  const issuerCards = await getCardsByIssuer(card.issuer);
  const updatedIssuerCards = issuerCards.map(c => (c.id === cardId ? updatedCard : c));
  await kv.set(CARDS_BY_ISSUER_KEY(card.issuer), updatedIssuerCards);
}
