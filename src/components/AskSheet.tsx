"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, CreditCard } from "lucide-react";
import { CardWithRank, SpendCategory } from "@/types";
import { allCards, cardGradients, cardImages, rankCards, classifyQuery } from "@/lib/cards";
import { categories } from "@/lib/categories";
import { springBouncy } from "@/lib/constants";
import { networkLabel } from "@/lib/formatters";

const HINTS = [
  "Dinner at a restaurant",
  "Grocery shopping",
  "Gas station",
  "Flight booking",
  "Online shopping",
];

export function AskSheet({
  open,
  onClose,
  myCardIds,
  cardLast4,
  cardHeight,
  onOpenCard,
}: {
  open: boolean;
  onClose: () => void;
  myCardIds: Set<number>;
  cardLast4: Record<number, string>;
  cardHeight: number;
  onOpenCard: (card: CardWithRank) => void;
}) {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<{ ranked: CardWithRank[]; category: SpendCategory } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQuery("");
      setResult(null);
      setTimeout(() => inputRef.current?.focus(), 350);
    }
  }, [open]);

  useEffect(() => {
    if (!query.trim()) { setResult(null); return; }
    const t = setTimeout(() => {
      const category = classifyQuery(query);
      const myCards = allCards.filter((c) => myCardIds.has(c.id));
      const ranked = rankCards(myCards, category);
      setResult({ ranked, category });
    }, 250);
    return () => clearTimeout(t);
  }, [query, myCardIds]);

  const best = result?.ranked[0] ?? null;
  const runners = result?.ranked.slice(1, 3) ?? [];
  const cat = result ? categories.find((c) => c.key === result.category) : null;
  const catLabel = cat?.label ?? "All Spend";
  const CatIcon = cat?.icon ?? Sparkles;
  const miniHeight = Math.round(cardHeight * 0.72);

  function handleOpenCard(card: CardWithRank) {
    onClose();
    setTimeout(() => onOpenCard(card), 50);
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={springBouncy}
            className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-50 bg-[#1c1c1e] rounded-t-3xl"
          >
            <div className="flex justify-center py-3">
              <div className="w-10 h-1 bg-white/20 rounded-full" />
            </div>

            <div className="px-5 pb-4 flex items-start justify-between">
              <div>
                <h2 className="text-white text-xl font-bold">Ask CardSense</h2>
                <p className="text-white/50 text-sm">What are you buying?</p>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center mt-0.5"
              >
                <X className="w-4 h-4 text-white/60" />
              </button>
            </div>

            <div className="px-5 pb-4">
              <div className="relative">
                <Sparkles className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400 pointer-events-none" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="e.g. dinner at a restaurant..."
                  className="w-full bg-white/8 border border-white/10 rounded-2xl pl-10 pr-10 py-3.5 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-purple-500/40 transition-colors"
                />
                {query && (
                  <button
                    onClick={() => setQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white/15 flex items-center justify-center"
                  >
                    <X className="w-3 h-3 text-white/60" />
                  </button>
                )}
              </div>
            </div>

            <AnimatePresence mode="wait">
              {!query.trim() ? (
                <motion.div
                  key="hints"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="px-5 pb-10"
                >
                  <p className="text-white/30 text-xs mb-3 uppercase tracking-wider">Try asking about...</p>
                  <div className="flex flex-wrap gap-2">
                    {HINTS.map((hint) => (
                      <button
                        key={hint}
                        onClick={() => setQuery(hint)}
                        className="px-3 py-1.5 rounded-full bg-white/8 text-white/60 text-sm active:bg-white/15 transition-colors"
                      >
                        {hint}
                      </button>
                    ))}
                  </div>
                </motion.div>
              ) : best ? (
                <motion.div
                  key={`result-${best.id}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="px-5 pb-10 space-y-3"
                >
                  <div className="flex items-center gap-1.5">
                    <CatIcon className="w-3.5 h-3.5 text-purple-400" />
                    <span className="text-purple-400 text-xs font-semibold">Best for {catLabel}</span>
                  </div>

                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleOpenCard(best)}
                    className="w-full text-left"
                  >
                    <MiniCardFace card={best} last4={cardLast4[best.id]} height={miniHeight} />
                    <div className="mt-2.5 flex items-center justify-between px-1">
                      <div>
                        <p className="text-white font-semibold text-sm">{best.name}</p>
                        <p className="text-white/50 text-xs mt-0.5">{best.categoryRate}</p>
                      </div>
                      <div className={`px-3 py-1 rounded-full ${best.activePromotion ? "bg-orange-500/80" : "bg-white/15"}`}>
                        <span className="text-white font-bold text-sm">{best.categoryValue}x</span>
                      </div>
                    </div>
                  </motion.button>

                  {runners.length > 0 && (
                    <div className="space-y-2 pt-1">
                      <p className="text-white/30 text-xs uppercase tracking-wider">Also consider</p>
                      {runners.map((card) => {
                        const [from, to] = cardGradients[card.id] || ["#333", "#555"];
                        const thumb = cardImages[card.id];
                        return (
                          <motion.button
                            key={card.id}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => handleOpenCard(card)}
                            className="w-full flex items-center gap-3 p-3 rounded-2xl bg-white/5 text-left active:bg-white/10 transition-colors"
                          >
                            <div
                              className="w-12 h-8 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center"
                              style={thumb ? undefined : { background: `linear-gradient(135deg, ${from}, ${to})` }}
                            >
                              {thumb
                                ? <img src={thumb} alt={card.name} className="w-full h-full object-cover" draggable={false} />
                                : <CreditCard className="w-4 h-4 text-white/50" />
                              }
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-white text-sm font-medium truncate">{card.name}</p>
                              <p className="text-white/40 text-xs">{card.categoryRate}</p>
                            </div>
                            <div className="px-2.5 py-1 rounded-full bg-white/10">
                              <span className="text-white/70 font-semibold text-sm">{card.categoryValue}x</span>
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="px-5 pb-10 flex flex-col items-center py-8 text-center"
                >
                  <CreditCard className="w-8 h-8 text-white/20 mb-2" />
                  <p className="text-white/40 text-sm">No cards in your wallet yet.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function MiniCardFace({ card, last4, height }: { card: CardWithRank; last4?: string; height: number }) {
  const [from, to] = cardGradients[card.id] || ["#333", "#555"];
  const cardImage = cardImages[card.id];

  return (
    <div
      className="w-full rounded-2xl overflow-hidden shadow-lg"
      style={{
        height,
        background: cardImage ? "#000" : `linear-gradient(135deg, ${from}, ${to})`,
      }}
    >
      {cardImage ? (
        <img src={cardImage} alt={card.name} className="w-full h-full object-cover" draggable={false} />
      ) : (
        <div className="relative w-full h-full p-4 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <span className="text-white/80 text-xs font-medium">{card.issuer}</span>
            <span className="text-white/60 text-[10px] font-bold tracking-widest">{networkLabel(card.network)}</span>
          </div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-5 rounded bg-yellow-300/80 border border-yellow-400/40" />
          </div>
          <div className="flex items-center gap-2 text-white/40 text-[10px] tracking-[0.18em] font-mono mb-auto">
            <span>••••</span><span>••••</span><span>••••</span>
            <span>{last4 ?? "••••"}</span>
          </div>
          <div className="text-white font-semibold text-sm">{card.name}</div>
        </div>
      )}
    </div>
  );
}
