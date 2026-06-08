"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Utensils,
  ShoppingCart,
  ShoppingBag,
  Fuel,
  Plane,
  Tv,
  Sparkles,
  CreditCard,
  Plus,
  X,
  Check,
  Trophy,
  Wallet,
  Wifi,
  Search,
  Flame,
  Pill,
  ChevronLeft,
} from "lucide-react";
import { CreditCardData, CardWithRank, SpendCategory } from "@/types";
import { allCards, cardGradients, cardImages, rankCards, classifyQuery } from "@/lib/cards";

/* ───── category config ───── */
const categories: { key: SpendCategory; label: string; icon: typeof Utensils }[] = [
  { key: "dining",     label: "Dining",     icon: Utensils },
  { key: "groceries",  label: "Groceries",  icon: ShoppingCart },
  { key: "gas",        label: "Gas",        icon: Fuel },
  { key: "travel",     label: "Travel",     icon: Plane },
  { key: "streaming",  label: "Streaming",  icon: Tv },
  { key: "pharmacy",   label: "Pharmacy",   icon: Pill },
  { key: "online",     label: "Online",     icon: ShoppingBag },
  { key: "all",        label: "All Spend",  icon: Sparkles },
];

/* ───── card dimensions ───── */
const CARD_HEIGHT = 246;
const CARD_PEEK   = 72;

/* ───── spring configs ───── */
const springSmooth = { type: "spring" as const, stiffness: 300, damping: 30 };
const springBouncy = { type: "spring" as const, stiffness: 400, damping: 28 };

/* ───── press burst particles (fixed positions, no randomness) ───── */
const BURST_PARTICLES: { x: number; y: number; w: number; h: number }[] = [
  { x:   0, y: -62, w: 4, h: 4 },
  { x:  26, y: -57, w: 3, h: 5 },
  { x:  50, y: -40, w: 5, h: 3 },
  { x:  62, y:  -8, w: 3, h: 3 },
  { x:  62, y:  18, w: 4, h: 4 },
  { x:  48, y:  42, w: 5, h: 5 },
  { x:  22, y:  60, w: 3, h: 3 },
  { x:  -6, y:  65, w: 4, h: 4 },
  { x: -30, y:  57, w: 3, h: 5 },
  { x: -52, y:  40, w: 5, h: 3 },
  { x: -64, y:  12, w: 3, h: 3 },
  { x: -60, y: -16, w: 4, h: 4 },
  { x: -44, y: -44, w: 5, h: 3 },
  { x: -18, y: -62, w: 3, h: 3 },
  { x:  36, y: -14, w: 3, h: 3 },
  { x: -36, y:  30, w: 3, h: 3 },
];

/* ───── helpers ───── */
function networkLabel(n: string) {
  if (n === "Visa") return "VISA";
  if (n === "Mastercard") return "MC";
  if (n === "American Express") return "AMEX";
  if (n === "Discover") return "DISCOVER";
  return n.toUpperCase().slice(0, 6);
}

function formatExpiry(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/* ═══════════════════════════════════════════
   Single Credit Card Component (simplified — no inline expansion)
   ═══════════════════════════════════════════ */
function WalletCard({
  card,
  index,
  total,
  onTap,
  last4,
  pressingCardId,
}: {
  card: CardWithRank;
  index: number;
  total: number;
  onTap: (id: number) => void;
  last4?: string;
  pressingCardId: number | null;
}) {
  const [from, to] = cardGradients[card.id] || ["#333", "#555"];
  const hasPromo = !!card.activePromotion;
  const cardImage = cardImages[card.id];
  const isPressing = pressingCardId === card.id;
  const isDimmed   = pressingCardId !== null && !isPressing;

  return (
    <motion.div
      onClick={(e) => { e.stopPropagation(); onTap(card.id); }}
      style={{ zIndex: total - index }}
      className="absolute left-0 right-0 cursor-pointer"
      animate={{ y: index * CARD_PEEK, opacity: isDimmed ? 0.2 : 1, scale: isDimmed ? 0.97 : 1 }}
      transition={springSmooth}
    >
      {/* Pixel burst — lives outside overflow-hidden card div */}
      <AnimatePresence>
        {isPressing && BURST_PARTICLES.map((p, i) => (
          <motion.div
            key={i}
            initial={{ x: 0, y: 0, opacity: 0.9, scale: 0 }}
            animate={{ x: p.x, y: p.y, opacity: 0, scale: 1 }}
            exit={{}}
            transition={{ duration: 0.38, ease: [0.2, 0, 0.4, 1], delay: 0.03 }}
            style={{
              position: "absolute",
              left: "50%",
              top: CARD_HEIGHT / 2,
              width: p.w,
              height: p.h,
              background: from,
              borderRadius: 1,
              pointerEvents: "none",
              zIndex: 10,
              marginLeft: -p.w / 2,
              marginTop: -p.h / 2,
            }}
          />
        ))}
      </AnimatePresence>

      <motion.div
        animate={{ scale: isPressing ? 0.93 : 1 }}
        transition={{ duration: 0.12, ease: "easeOut" }}
        className="relative mx-auto rounded-lg overflow-hidden shadow-xl"
        style={{
          background: cardImage ? "#000" : `linear-gradient(135deg, ${from}, ${to})`,
          height: CARD_HEIGHT,
          border: isPressing
            ? `1.5px solid ${from}cc`
            : hasPromo
              ? "1px solid rgba(249,115,22,0.35)"
              : "none",
          boxShadow: isPressing
            ? `0 0 32px ${from}88, 0 0 8px ${from}44`
            : hasPromo
              ? `0 0 24px ${from}66`
              : undefined,
        }}
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
            {/* White flash on press */}
            <AnimatePresence>
              {isPressing && (
                <motion.div
                  initial={{ opacity: 0.25 }}
                  animate={{ opacity: 0 }}
                  exit={{}}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0 bg-white pointer-events-none z-10"
                />
              )}
            </AnimatePresence>
            <div className="relative p-5 flex flex-col" style={{ height: CARD_HEIGHT }}>
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
  );
}

/* ═══════════════════════════════════════════
   Card Detail Full-Page View
   ═══════════════════════════════════════════ */
function CardDetailPage({
  card,
  onClose,
  last4,
}: {
  card: CardWithRank;
  onClose: () => void;
  last4?: string;
}) {
  const [showContent, setShowContent] = useState(false);
  const [from, to] = cardGradients[card.id] || ["#333", "#555"];
  const cardImage = cardImages[card.id];
  const hasPromo = !!card.activePromotion;

  useEffect(() => {
    const t = setTimeout(() => setShowContent(true), 300);
    return () => clearTimeout(t);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      className="fixed inset-0 z-50 bg-[#0a0a0a] overflow-y-auto"
    >
      <div className="w-full max-w-[430px] mx-auto min-h-screen">
        {/* Header */}
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

        {/* Card face */}
        <div className="px-5 mb-6">
          <motion.div
            initial={{ scale: 0.88, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.32, ease: [0.2, 0, 0.2, 1] }}
            className="rounded-2xl overflow-hidden shadow-2xl"
            style={{ height: CARD_HEIGHT }}
          >
            {cardImage ? (
              <img src={cardImage} alt={card.name} className="w-full h-full object-cover" draggable={false} />
            ) : (
              <div
                className="w-full h-full relative"
                style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/10" />
                <div className="relative p-5 flex flex-col h-full">
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
                    <div className={`px-3 py-1 rounded-full ${hasPromo ? "bg-orange-500/80" : "bg-white/15"}`}>
                      <span className="text-white font-bold text-sm">{card.categoryValue}x</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Detail content */}
        <motion.div
          animate={{ opacity: showContent ? 1 : 0, y: showContent ? 0 : 16 }}
          transition={{ duration: 0.35 }}
          className="px-5 pb-12 space-y-3"
        >
          {/* Active promo */}
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

          {/* Rewards rates */}
          <div className="bg-white/5 rounded-2xl p-4">
            <h4 className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-3">Rewards Rates</h4>
            <div className="space-y-2.5">
              {Object.entries(card.rewardsRate).map(([key, value]) => (
                <div key={key} className="flex items-start justify-between gap-4">
                  <span className="text-white/70 text-sm capitalize shrink-0">{key}</span>
                  <span className="text-white text-sm font-semibold text-right">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Fee + credit score */}
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

/* ═══════════════════════════════════════════
   Add Card Bottom Sheet
   ═══════════════════════════════════════════ */
function AddCardSheet({
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
                      className="w-full rounded-2xl p-4 flex items-center gap-4 text-left"
                      style={{
                        background: `linear-gradient(135deg, ${from}40, ${to}30)`,
                        border: isAdded
                          ? "1.5px solid rgba(74, 222, 128, 0.5)"
                          : "1.5px solid rgba(255,255,255,0.08)",
                      }}
                    >
                      <div
                        className="w-14 h-9 rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0"
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
                              onChange={(e) =>
                                onSetLast4(card.id, e.target.value.replace(/\D/g, ""))
                              }
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

/* ═══════════════════════════════════════════
   Main Page
   ═══════════════════════════════════════════ */
export default function Home() {
  const [myCardIds, setMyCardIds] = useState<Set<number>>(new Set());
  const [cardLast4, setCardLast4] = useState<Record<number, string>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<SpendCategory | null>(null);
  const [detailCard, setDetailCard] = useState<CardWithRank | null>(null);
  const [pressingCardId, setPressingCardId] = useState<number | null>(null);
  const [showAddSheet, setShowAddSheet] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("cb-max-cards");
    if (saved) {
      try { setMyCardIds(new Set(JSON.parse(saved))); } catch {}
    }
    const savedLast4 = localStorage.getItem("cb-max-last4");
    if (savedLast4) {
      try { setCardLast4(JSON.parse(savedLast4)); } catch {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("cb-max-cards", JSON.stringify([...myCardIds]));
  }, [myCardIds]);

  useEffect(() => {
    localStorage.setItem("cb-max-last4", JSON.stringify(cardLast4));
  }, [cardLast4]);

  const handleSetLast4 = useCallback((id: number, val: string) => {
    setCardLast4((prev) => ({ ...prev, [id]: val }));
  }, []);

  const toggleCard = useCallback((card: CreditCardData) => {
    setMyCardIds((prev) => {
      const next = new Set(prev);
      if (next.has(card.id)) next.delete(card.id);
      else next.add(card.id);
      return next;
    });
  }, []);

  const effectiveCategory = useMemo<SpendCategory>(() => {
    if (selectedCategory) return selectedCategory;
    if (searchQuery.trim()) return classifyQuery(searchQuery);
    return "all";
  }, [selectedCategory, searchQuery]);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (value.trim()) setSelectedCategory(null);
  };

  const handleChipClick = (cat: SpendCategory) => {
    setSelectedCategory((prev) => prev === cat ? null : cat);
    setSearchQuery("");
  };

  const myCards = allCards.filter((c) => myCardIds.has(c.id));
  const ranked = rankCards(myCards, effectiveCategory);
  const bestCard = ranked[0] ?? null;
  const activeCategoryLabel = categories.find((c) => c.key === effectiveCategory)?.label ?? "this";
  const stackHeight = (ranked.length - 1) * CARD_PEEK + CARD_HEIGHT + 20;

  const handleCardTap = useCallback((id: number) => {
    const card = ranked.find((c) => c.id === id);
    if (!card) return;
    setPressingCardId(id);
    setTimeout(() => {
      setDetailCard(card);
      setPressingCardId(null);
    }, 380);
  }, [ranked]);

  return (
    <div className="min-h-screen bg-black text-white flex justify-center">
      <div className="w-full max-w-[430px] min-h-screen relative">

        {/* ─── Header ─── */}
        <div className="safe-top px-5 pt-4 pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wallet className="w-6 h-6 text-white/80" />
              <h1 className="text-2xl font-bold tracking-tight">Cashback Max</h1>
            </div>
            <button
              onClick={() => setShowAddSheet(true)}
              className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center active:bg-white/20 transition-colors"
            >
              <Plus className="w-5 h-5 text-white/80" />
            </button>
          </div>
        </div>

        {/* ─── Search Bar ─── */}
        <div className="px-5 pt-3 pb-2">
          <p className="text-white/40 text-xs font-medium uppercase tracking-wider mb-2.5">
            What are you spending on?
          </p>
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Coffee shop, gas station, Amazon..."
              className="w-full bg-[#1c1c1e] border border-white/8 rounded-2xl pl-10 pr-10 py-3 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-white/20 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => { setSearchQuery(""); setSelectedCategory(null); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white/15 flex items-center justify-center"
              >
                <X className="w-3 h-3 text-white/60" />
              </button>
            )}
          </div>
        </div>

        {/* ─── Quick Category Chips ─── */}
        <div className="px-5 pb-3">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isActive =
                selectedCategory === cat.key ||
                (!selectedCategory && searchQuery.trim() && classifyQuery(searchQuery) === cat.key);
              return (
                <motion.button
                  key={cat.key}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleChipClick(cat.key)}
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
        </div>

        {/* ─── Best Card Banner ─── */}
        <AnimatePresence mode="wait">
          {bestCard && (
            <motion.div
              key={`${effectiveCategory}-${bestCard.id}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mx-5 mb-4 rounded-2xl overflow-hidden"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: bestCard.activePromotion
                  ? "1px solid rgba(249,115,22,0.35)"
                  : "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <div className="px-4 py-3 flex items-center gap-3">
                <div className="p-1">
                  {bestCard.activePromotion
                    ? <Flame className="w-5 h-5 text-orange-400" />
                    : <Trophy className="w-5 h-5 text-yellow-400" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white/50 text-xs">
                    {bestCard.activePromotion ? "Limited Offer · " : ""}
                    Best for {activeCategoryLabel}
                  </p>
                  <p className="text-white font-semibold text-sm truncate">{bestCard.name}</p>
                  {bestCard.activePromotion && (
                    <p className="text-orange-400/70 text-[11px] mt-0.5">
                      until {formatExpiry(bestCard.activePromotion.expiry)}
                    </p>
                  )}
                </div>
                <div className={`px-3 py-1.5 rounded-full ${bestCard.activePromotion ? "bg-orange-500/80" : "bg-white/15"}`}>
                  <span className="text-white font-bold text-lg">{bestCard.categoryValue}x</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── Card Stack ─── */}
        <div className="px-5">
          {ranked.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-20"
            >
              <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center mb-4">
                <CreditCard className="w-10 h-10 text-white/20" />
              </div>
              <h3 className="text-white/60 font-semibold text-lg mb-1">No cards yet</h3>
              <p className="text-white/30 text-sm text-center max-w-[250px] mb-6">
                Add your credit cards to see which gives you the best cashback
              </p>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowAddSheet(true)}
                className="bg-white text-black px-6 py-3 rounded-full font-semibold text-sm flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Cards
              </motion.button>
            </motion.div>
          ) : (
            <div className="relative" style={{ height: stackHeight }}>
              {ranked.map((card, i) => (
                <WalletCard
                  key={card.id}
                  card={card}
                  index={i}
                  total={ranked.length}
                  onTap={handleCardTap}
                  last4={cardLast4[card.id]}
                  pressingCardId={pressingCardId}
                />
              ))}
            </div>
          )}
        </div>

        {/* ─── Add Card Sheet ─── */}
        <AddCardSheet
          open={showAddSheet}
          onClose={() => setShowAddSheet(false)}
          myCardIds={myCardIds}
          onToggle={toggleCard}
          cardLast4={cardLast4}
          onSetLast4={handleSetLast4}
        />
      </div>

      {/* ─── Card Detail Full Page ─── */}
      <AnimatePresence>
        {detailCard && (
          <CardDetailPage
            key={detailCard.id}
            card={detailCard}
            onClose={() => setDetailCard(null)}
            last4={cardLast4[detailCard.id]}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
