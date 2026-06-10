"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, Flame } from "lucide-react";
import { CardWithRank } from "@/types";
import { formatExpiry, camelToLabel } from "@/lib/formatters";
import { CardFace } from "@/components/CardFace";

export function CardDetailPage({
  card,
  onClose,
  last4,
  cardHeight,
}: {
  card: CardWithRank;
  onClose: () => void;
  last4?: string;
  cardHeight: number;
}) {
  const [showContent, setShowContent] = useState(false);
  const hasPromo = !!card.activePromotion;

  useEffect(() => {
    const t = setTimeout(() => setShowContent(true), 300);
    return () => clearTimeout(t);
  }, []);

  return (
    <motion.div
      initial={false}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      drag="y"
      dragConstraints={{ top: 0 }}
      dragElastic={0.15}
      onDragEnd={(_, info) => {
        if (info.offset.y > 100 || info.velocity.y > 500) onClose();
      }}
      className="fixed inset-0 z-50"
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        className="fixed inset-0 bg-[#0a0a0a] -z-10"
      />
      <div className="w-full max-w-[430px] mx-auto h-screen overflow-y-auto">
        <div className="px-5 pt-14 pb-4 flex items-center gap-3">
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center active:bg-white/20 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <motion.h2
            animate={{ opacity: showContent ? 1 : 0, x: showContent ? 0 : -8 }}
            transition={{ duration: 0.3 }}
            className="text-white font-semibold text-lg truncate"
          >
            {card.name}
          </motion.h2>
        </div>

        <div className="px-5 mb-6">
          <motion.div
            layoutId={`card-face-${card.id}`}
            transition={{ type: "spring", stiffness: 380, damping: 28 }}
            className="rounded-2xl overflow-hidden shadow-2xl relative"
            style={{ height: cardHeight }}
          >
            <CardFace card={card} last4={last4} cardHeight={cardHeight} />
          </motion.div>
        </div>

        <motion.div
          animate={{ opacity: showContent ? 1 : 0, y: showContent ? 0 : 16 }}
          transition={{ duration: 0.35 }}
          className="px-5 pb-12 space-y-3"
        >
          {hasPromo && (
            <div className="bg-orange-500/15 border border-orange-500/30 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <Flame className="w-3.5 h-3.5 text-orange-400" />
                <span className="text-orange-400 text-xs font-semibold uppercase tracking-wide">Limited Time Offer</span>
              </div>
              <p className="text-white text-sm font-medium">{card.activePromotion!.label}</p>
              <p className="text-white/50 text-xs mt-1">
                Expires {formatExpiry(card.activePromotion!.expiry)}
                {card.activePromotion!.note ? ` · ${card.activePromotion!.note}` : ""}
              </p>
            </div>
          )}

          <div className="bg-white/5 rounded-2xl p-4">
            <h4 className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-3">Rewards Rates</h4>
            <div className="space-y-2.5">
              {Object.entries(card.rewardsRate).map(([key, value]) => (
                <div key={key} className="flex items-start justify-between gap-4">
                  <span className="text-white/70 text-sm shrink-0">{camelToLabel(key)}</span>
                  <span className="text-white text-sm font-semibold text-right">{value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/5 rounded-2xl p-4">
              <div className="text-white/50 text-xs mb-1">Annual Fee</div>
              <div className="text-white font-bold text-xl">
                {card.annualFee === 0 ? "$0" : `$${card.annualFee}`}
              </div>
            </div>
            <div className="bg-white/5 rounded-2xl p-4">
              <div className="text-white/50 text-xs mb-1">Credit Score</div>
              <div className="text-white font-semibold text-sm leading-snug">{card.creditScoreNeeded}</div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
