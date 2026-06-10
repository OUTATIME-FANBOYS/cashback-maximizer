import type { SpendCategory } from "@/lib/categories";

export type { SpendCategory };

export interface CreditCardData {
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

export interface Promotion {
  cardId: number;
  categories: SpendCategory[];
  rate: number;
  label: string;
  expiry: string; // ISO date "YYYY-MM-DD"
  note?: string;
}

export interface CardWithRank extends CreditCardData {
  categoryRate: string;
  categoryValue: number;
  rank: number;
  activePromotion?: Promotion;
}
