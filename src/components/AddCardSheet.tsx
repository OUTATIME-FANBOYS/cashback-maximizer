"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CreditCard, ChevronLeft, Check, Search, X } from "lucide-react";
import { CreditCardData } from "@/types";
import { cardGradients, cardImages } from "@/lib/cards";
import { springBouncy } from "@/lib/constants";

export function AddCardSheet({
  open,
  onClose,
  myCardIds,
  onToggle,
  cards,
}: {
  open: boolean;
  onClose: () => void;
  myCardIds: Set<number>;
  onToggle: (card: CreditCardData) => void;
  cards: CreditCardData[];
}) {
  const [filterQuery, setFilterQuery] = useState("");

  useEffect(() => {
    if (!open) setFilterQuery("");
  }, [open]);

  const filteredCards = useMemo(() => {
    const q = filterQuery.toLowerCase().trim();
    if (!q) return cards;
    return cards.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.issuer.toLowerCase().includes(q) ||
        c.network.toLowerCase().includes(q)
    );
  }, [filterQuery, cards]);

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
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={0.15}
            onDragEnd={(_, info) => {
              if (info.offset.y > 80 || info.velocity.y > 400) onClose();
            }}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={springBouncy}
            className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-50 rounded-t-3xl max-h-[85vh] overflow-hidden border-t border-x border-white/[0.12]"
            style={{ background: "rgba(18, 18, 20, 0.72)", backdropFilter: "blur(32px) saturate(180%)", WebkitBackdropFilter: "blur(32px) saturate(180%)" }}
          >
            <div className="flex justify-center py-3">
              <div className="w-10 h-1 bg-white/20 rounded-full" />
            </div>
            <div className="px-5 pb-4 flex items-center gap-3">
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0"
              >
                <ChevronLeft className="w-5 h-5 text-white" />
              </button>
              <div>
                <h2 className="text-white text-xl font-bold">My Cards</h2>
                <p className="text-white/50 text-sm">Select cards from your wallet</p>
              </div>
            </div>
            <div className="px-5 pb-3">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
                <input
                  type="text"
                  value={filterQuery}
                  onChange={(e) => setFilterQuery(e.target.value)}
                  placeholder="Search cards..."
                  className="w-full bg-white/8 border border-white/8 rounded-2xl pl-10 pr-10 py-2.5 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-white/20 transition-colors"
                />
                {filterQuery && (
                  <button
                    onClick={() => setFilterQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white/15 flex items-center justify-center"
                  >
                    <X className="w-3 h-3 text-white/60" />
                  </button>
                )}
              </div>
            </div>
            <div className="overflow-y-auto max-h-[60vh] px-5 pb-8 space-y-2">
              {filteredCards.length === 0 ? (
                <div className="py-12 flex flex-col items-center gap-2">
                  <CreditCard className="w-8 h-8 text-white/20" />
                  <p className="text-white/40 text-sm">No cards found</p>
                </div>
              ) : (
                filteredCards.map((card) => {
                  const [from, to] = cardGradients[card.id] || ["#333", "#555"];
                  const thumb = cardImages[card.id];
                  const isAdded = myCardIds.has(card.id);
                  return (
                    <motion.button
                      key={card.id}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => onToggle(card)}
                      className="w-full rounded-sm p-4 flex items-center gap-4 text-left"
                      style={{
                        background: "rgba(255,255,255,0.05)",
                        border: isAdded
                          ? "1.5px solid rgba(74, 222, 128, 0.45)"
                          : "1.5px solid rgba(255,255,255,0.08)",
                        boxShadow: isAdded
                          ? "0 0 0 1px rgba(74,222,128,0.12) inset, 0 2px 16px rgba(74,222,128,0.18), 0 0 24px rgba(74,222,128,0.08)"
                          : undefined,
                        backdropFilter: isAdded ? "blur(4px)" : undefined,
                      }}
                    >
                      <div
                        className="w-14 h-9 rounded-sm overflow-hidden flex items-center justify-center flex-shrink-0"
                        style={thumb ? undefined : { background: `linear-gradient(135deg, ${from}, ${to})` }}
                      >
                        {thumb ? (
                          <img src={thumb} alt={card.name} className="w-full h-full object-cover object-center" draggable={false} />
                        ) : (
                          <CreditCard className="w-5 h-5 text-white/70" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-white font-medium text-sm truncate">{card.name}</div>
                        <div className="text-white/40 text-xs">
                          {card.issuer} · {card.network}
                        </div>
                      </div>
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                          isAdded ? "bg-green-500" : "border-2 border-white/20"
                        }`}
                      >
                        {isAdded && <Check className="w-3.5 h-3.5 text-white" />}
                      </div>
                    </motion.button>
                  );
                })
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
