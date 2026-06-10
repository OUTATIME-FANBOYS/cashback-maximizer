import { NextRequest, NextResponse } from 'next/server';
import {
  getAllCards,
  getCardsByIssuer,
  getIssuers,
  getCardById,
  getCardsMetadata,
  getPromotions,
} from '@/lib/cards-store';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const issuer = searchParams.get('issuer');
  const cardId = searchParams.get('id');

  try {
    if (cardId) {
      const card = await getCardById(Number(cardId));
      if (!card) {
        return NextResponse.json({ error: 'Card not found' }, { status: 404 });
      }
      return NextResponse.json(card);
    }

    if (issuer) {
      const cards = await getCardsByIssuer(issuer);
      return NextResponse.json({ issuer, cards });
    }

    // Default: return all cards, promotions, and metadata
    const [cards, issuers, metadata, promotions] = await Promise.all([
      getAllCards(),
      getIssuers(),
      getCardsMetadata(),
      getPromotions(),
    ]);

    return NextResponse.json(
      { creditCards: cards, issuers, metadata, promotions },
      { headers: { "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400" } }
    );
  } catch (error) {
    console.error('Error fetching cards:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cards' },
      { status: 500 }
    );
  }
}
