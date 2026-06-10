import {
  Utensils,
  ShoppingCart,
  ShoppingBag,
  Fuel,
  Plane,
  Hotel,
  Tv,
  Sparkles,
  Pill,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

// All spend categories. hidden=true entries are used by classifyQuery + rankCards
// but are not shown as chips in the UI.
export const categories = [
  { key: "dining",    label: "Dining",    icon: Utensils,     hidden: false },
  { key: "groceries", label: "Groceries", icon: ShoppingCart, hidden: false },
  { key: "gas",       label: "Gas",       icon: Fuel,         hidden: false },
  { key: "travel",    label: "Travel",    icon: Plane,        hidden: false },
  { key: "flights",   label: "Flights",   icon: Plane,        hidden: true  },
  { key: "hotels",    label: "Hotels",    icon: Hotel,        hidden: true  },
  { key: "streaming", label: "Streaming", icon: Tv,           hidden: false },
  { key: "pharmacy",  label: "Pharmacy",  icon: Pill,         hidden: false },
  { key: "online",    label: "Online",    icon: ShoppingBag,  hidden: false },
  { key: "all",       label: "All Spend", icon: Sparkles,     hidden: false },
] as const satisfies ReadonlyArray<{ key: string; label: string; icon: LucideIcon; hidden: boolean }>;

export type SpendCategory = (typeof categories)[number]["key"];
