"use client";

import { Wifi } from "lucide-react";
import { CardWithRank } from "@/types";
import { cardGradients, cardImages } from "@/lib/cards";
import { networkLabel, formatExpiry } from "@/lib/formatters";

export function CardFace({
  card,
  last4,
  cardHeight,
  isPressed = false,
  showPromoExpiry = false,
}: {
  card: CardWithRank;
  last4?: string;
  cardHeight: number;
  isPressed?: boolean;
  showPromoExpiry?: boolean;
}) {
  const [from, to] = cardGradients[card.id] || ["#333", "#555"];
  const hasPromo = !!card.activePromotion;
  const cardImage = cardImages[card.id];

  if (cardImage) {
    return (
      <img
        src={cardImage}
        alt={card.name}
        className="absolute inset-0 w-full h-full object-cover"
        draggable={false}
      />
    );
  }

  return (
    <div
      className="w-full h-full relative"
      style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
    >
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
            {showPromoExpiry && hasPromo && (
              <span className="text-orange-300/80 text-[10px]">
                until {formatExpiry(card.activePromotion!.expiry)}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
