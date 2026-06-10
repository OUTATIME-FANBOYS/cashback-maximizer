"use client";

import { motion } from "framer-motion";
import { SpendCategory } from "@/types";
import { categories } from "@/lib/categories";
import { classifyQuery } from "@/lib/cards";

export function CategoryChips({
  selectedCategory,
  searchQuery,
  onChipClick,
}: {
  selectedCategory: SpendCategory | null;
  searchQuery: string;
  onChipClick: (cat: SpendCategory) => void;
}) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
      {categories.filter((c) => !c.hidden).map((cat) => {
        const Icon = cat.icon;
        const isActive =
          selectedCategory === cat.key ||
          (!selectedCategory && searchQuery.trim() && classifyQuery(searchQuery) === cat.key);
        return (
          <motion.button
            key={cat.key}
            whileTap={{ scale: 0.95 }}
            onClick={() => onChipClick(cat.key)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-full whitespace-nowrap transition-all text-xs font-medium ${
              isActive ? "bg-white text-black" : "bg-white/8 text-white/50"
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {cat.label}
          </motion.button>
        );
      })}
    </div>
  );
}
