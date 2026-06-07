import { Promotion } from "@/types";

// Limited-time rotating category offers. Add / remove as promos change.
export const promotions: Promotion[] = [
  {
    cardId: 8, // Discover it Cash Back
    categories: ["dining", "pharmacy"],
    rate: 5,
    label: "5% at Restaurants & Drug Stores",
    expiry: "2026-06-30",
    note: "Q2 2026 Rotating Category — activation required, up to $1,500/quarter then 1%",
  },
  {
    cardId: 41, // Discover it Miles
    categories: ["dining", "pharmacy"],
    rate: 3, // 1.5x miles = effectively 3% toward travel
    label: "3% at Restaurants & Drug Stores (via miles)",
    expiry: "2026-06-30",
    note: "Q2 2026 Rotating Category — 1.5x miles on rotating categories",
  },
];
