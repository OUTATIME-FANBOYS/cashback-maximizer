import chaseCards from './chase.json';
import capitalOneCards from './capital-one.json';
import amexCards from './american-express.json';
import citiCards from './citi.json';
import discoverCards from './discover.json';
import wellsFargoCards from './wells-fargo.json';
import boaCards from './bank-of-america.json';
import usbankCards from './us-bank.json';
import otherCards from './other.json';

export interface Card {
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
}

export interface CardsByIssuer {
  [issuer: string]: Card[];
}

type RawCard = {
  id: number;
  name: string;
  issuer: string;
  network: string;
  type: string;
  image: string;
  annualFee: number;
  signupBonus: string;
  aprRange: string;
  rewardsRate: Record<string, string | undefined>;
  benefits: string[];
  creditScoreNeeded: string;
};

function normalizeCards(raw: RawCard[]): Card[] {
  return raw.map(c => ({
    ...c,
    rewardsRate: Object.fromEntries(
      Object.entries(c.rewardsRate).filter((entry): entry is [string, string] => entry[1] !== undefined)
    ),
  }));
}

const issuerData: CardsByIssuer = {
  Chase: normalizeCards(chaseCards.creditCards as RawCard[]),
  'Capital One': normalizeCards(capitalOneCards.creditCards as RawCard[]),
  'American Express': normalizeCards(amexCards.creditCards as RawCard[]),
  Citi: normalizeCards(citiCards.creditCards as RawCard[]),
  Discover: normalizeCards(discoverCards.creditCards as RawCard[]),
  'Wells Fargo': normalizeCards(wellsFargoCards.creditCards as RawCard[]),
  'Bank of America': normalizeCards(boaCards.creditCards as RawCard[]),
  'U.S. Bank': normalizeCards(usbankCards.creditCards as RawCard[]),
  'Apple/Goldman Sachs': normalizeCards(otherCards.creditCards.filter(c => c.issuer === 'Apple/Goldman Sachs') as RawCard[]),
  'TD Bank': normalizeCards(otherCards.creditCards.filter(c => c.issuer === 'TD Bank') as RawCard[]),
  'Synchrony Bank': normalizeCards(otherCards.creditCards.filter(c => c.issuer === 'Synchrony Bank') as RawCard[]),
};

export function getAllCards(): Card[] {
  return Object.values(issuerData).flat();
}

export function getCardsByIssuer(): CardsByIssuer {
  return issuerData;
}

export function getCardsByIssuerName(issuer: string): Card[] {
  return issuerData[issuer] || [];
}

export function getIssuerList(): string[] {
  return Object.keys(issuerData);
}

export function getCardById(id: number): Card | undefined {
  return getAllCards().find(card => card.id === id);
}
