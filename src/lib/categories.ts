import {
  Utensils,
  ShoppingCart,
  ShoppingBag,
  Fuel,
  Plane,
  Tv,
  Sparkles,
  Pill,
} from "lucide-react";
import type { SpendCategory } from "@/types";

export const categories: { key: SpendCategory; label: string; icon: typeof Utensils }[] = [
  { key: "dining",    label: "Dining",    icon: Utensils },
  { key: "groceries", label: "Groceries", icon: ShoppingCart },
  { key: "gas",       label: "Gas",       icon: Fuel },
  { key: "travel",    label: "Travel",    icon: Plane },
  { key: "streaming", label: "Streaming", icon: Tv },
  { key: "pharmacy",  label: "Pharmacy",  icon: Pill },
  { key: "online",    label: "Online",    icon: ShoppingBag },
  { key: "all",       label: "All Spend", icon: Sparkles },
];
