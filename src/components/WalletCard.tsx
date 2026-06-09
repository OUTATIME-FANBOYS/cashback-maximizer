"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Wifi } from "lucide-react";
import { CardWithRank } from "@/types";
import { cardGradients, cardImages } from "@/lib/cards";
import { CARD_PEEK, springSmooth } from "@/lib/constants";
import { networkLabel, formatExpiry } from "@/lib/formatters";

export function WalletCard({
  card,
  index,
  total,
  onTap,
  last4,
  cardHeight,
}: {
  card: CardWithRank;
  index: number;
  total: number;
  onTap: (id: number) => void;
  last4?: string;
  cardHeight: number;
}) {
  const [from, to] = cardGradients[card.id] || ["#333", "#555"];
  const hasPromo = !!card.activePromotion;
  const cardImage = cardImages[card.id];
  const [isPressed, setIsPressed] = useState(false);

  return (
    <motion.div
      onPointerDown={(e) => { e.stopPropagation(); setIsPressed(true); }}
      onPointerLeave={() => setIsPressed(false)}
      onPointerCancel={() => setIsPressed(false)}
      onClick={(e) => {
        e.stopPropagation();
        setIsPressed(false);
        setTimeout(() => onTap(card.id), 60);
      }}
      style={{ zIndex: total - index }}
      className="absolute left-0 right-0 cursor-pointer"
      animate={{ y: index * CARD_PEEK }}
      transition={springSmooth}
    >
      <motion.div
        layoutId={`card-face-${card.id}`}
        transition={{ type: "spring", stiffness: 380, damping: 28 }}
        className="relative mx-auto rounded-2xl overflow-hidden shadow-xl"
        style={{
          background: cardImage ? "#000" : `linear-gradient(135deg, ${from}, ${to})`,
          height: cardHeight,
          border: hasPromo ? "1px solid rgba(249,115,22,0.35)" : "none",
          boxShadow: hasPromo ? `0 0 24px ${from}66` : undefined,
        }}
      >
        <motion.div
          animate={{ scale: isPressed ? 0.96 : 1, y: isPressed ? 3 : 0 }}
          transition={{ type: "spring", stiffness: isPressed ? 700 : 400, damping: isPressed ? 35 : 25 }}
          className="w-full h-full relative"
        >
          {cardImage ? (
            <div className="relative w-full h-full">
              <img
                src={cardImage}
                alt={card.name}
                className="absolute inset-0 w-full h-full object-cover"
                draggable={false}
              />
            </div>
          ) : (
            <>
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/10 pointer-events-none" />
              {isPressed && (
                <div className="absolute inset-0 bg-white/15 pointer-events-none z-10 rounded-2xl" />
              )}
              <div className="relative p-5 flex flex-col" style={{ height: cardHeight }}>
                <div className="flex items-center justify-between mb-5">
                  <span className="text-white/80 text-sm font-medium tracking-wide">{card.issuer}</span>
                  <span className="text-white/60 text-xs font-bold tracking-widest">{networkLabel(card.network)}</span>
                </div>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-7 rounded-md bg-yellow-300/80 border border-yellow-400/40" />
                  <div className="w-8 h-8 rounded-full border-2 border-white/20 flex items-center justify-center">
                    <Wifi className="w-4 h-4 text-white/40 rotate-90" />
                  </div>
                </div>
                <div className="flex items-center gap-3 mb-auto text-white/40 text-xs tracking-[0.22em] font-mono">
                  <span>••••</span><span>••••</span><span>••••</span>
                  <span>{last4 ?? "••••"}</span>
                </div>
                <div className="text-white font-semibold text-base mb-1">{card.name}</div>
                <div className="flex items-end justify-between">
                  <div className="text-white/60 text-xs max-w-[60%] leading-snug">
                    {hasPromo ? card.activePromotion!.label : card.categoryRate}
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <div className={`px-3 py-1 rounded-full ${hasPromo ? "bg-orange-500/80" : "bg-white/15 backdrop-blur-sm"}`}>
                      <span className="text-white font-bold text-sm">{card.categoryValue}x</span>
                    </div>
                    {hasPromo && (
                      <span className="text-orange-300/80 text-[10px]">
                        until {formatExpiry(card.activePromotion!.expiry)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
