"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CardWithRank } from "@/types";
import { cardGradients, cardImages } from "@/lib/cards";
import { CARD_PEEK, springSmooth } from "@/lib/constants";
import { CardFace } from "@/components/CardFace";

const TAP_DELAY_MS = 60; // prevents ghost double-tap on touch devices

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
        setTimeout(() => onTap(card.id), TAP_DELAY_MS);
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
          <CardFace
            card={card}
            last4={last4}
            cardHeight={cardHeight}
            isPressed={isPressed}
            showPromoExpiry
          />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
