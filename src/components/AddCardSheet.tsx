"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CreditCard, X, Check } from "lucide-react";
import { CreditCardData } from "@/types";
import { allCards, cardGradients, cardImages } from "@/lib/cards";
import { springBouncy } from "@/lib/constants";

export function AddCardSheet({
  open,
  onClose,
  myCardIds,
  onToggle,
  cardLast4,
  onSetLast4,
}: {
  open: boolean;
  onClose: () => void;
  myCardIds: Set<number>;
  onToggle: (card: CreditCardData) => void;
  cardLast4: Record<number, string>;
  onSetLast4: (id: number, val: string) => void;
}) {
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
            className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-50 bg-[#1c1c1e] rounded-t-3xl max-h-[85vh] overflow-hidden"
          >
            <div className="flex justify-center py-3">
              <div className="w-10 h-1 bg-white/20 rounded-full" />
            </div>
            <div className="px-5 pb-4 flex items-center justify-between">
              <div>
                <h2 className="text-white text-xl font-bold">My Cards</h2>
                <p className="text-white/50 text-sm">Select cards from your wallet</p>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center"
              >
                <X className="w-4 h-4 text-white/60" />
              </button>
            </div>
            <div className="overflow-y-auto max-h-[65vh] px-5 pb-8 space-y-2">
              {allCards.map((card) => {
                const [from, to] = cardGradients[card.id] || ["#333", "#555"];
                const thumb = cardImages[card.id];
                const isAdded = myCardIds.has(card.id);
                return (
                  <div key={card.id}>
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={() => onToggle(card)}
                      className="w-full rounded-sm p-4 flex items-center gap-4 text-left"
                      style={{
                        background: `linear-gradient(135deg, ${from}40, ${to}30)`,
                        border: isAdded
                          ? "1.5px solid rgba(74, 222, 128, 0.5)"
                          : "1.5px solid rgba(255,255,255,0.08)",
                      }}
                    >
                      <div
                        className="w-14 h-9 rounded-sm overflow-hidden flex items-center justify-center flex-shrink-0"
                        style={thumb ? undefined : { background: `linear-gradient(135deg, ${from}, ${to})` }}
                      >
                        {thumb
                          ? <img src={thumb} alt={card.name} className="w-full h-full object-cover object-center" draggable={false} />
                          : <CreditCard className="w-5 h-5 text-white/70" />
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-white font-medium text-sm truncate">{card.name}</div>
                        <div className="text-white/40 text-xs">
                          {card.issuer} · {card.network} ·{" "}
                          {card.annualFee === 0 ? "No fee" : `$${card.annualFee}/yr`}
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

                    <AnimatePresence>
                      {isAdded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="mx-1 mb-1 mt-1 flex items-center gap-3 bg-white/5 rounded-xl px-4 py-2.5">
                            <span className="text-white/30 text-xs font-mono tracking-widest">•••• •••• ••••</span>
                            <input
                              type="text"
                              inputMode="numeric"
                              maxLength={4}
                              placeholder="1234"
                              value={cardLast4[card.id] ?? ""}
                              onChange={(e) => onSetLast4(card.id, e.target.value.replace(/\D/g, ""))}
                              onClick={(e) => e.stopPropagation()}
                              className="w-12 bg-transparent text-white text-xs font-mono tracking-widest placeholder:text-white/20 focus:outline-none"
                            />
                            <span className="text-white/30 text-[10px] ml-auto">Last 4 digits (optional)</span>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
