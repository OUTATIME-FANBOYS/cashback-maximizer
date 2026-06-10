"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic,
  CreditCard,
  Plus,
  X,
  Trophy,
  Wallet,
  Search,
  Flame,
} from "lucide-react";
import { CardWithRank, CreditCardData, SpendCategory } from "@/types";
import { allCards, rankCards, classifyQuery } from "@/lib/cards";
import { CARD_ASPECT, CARD_PEEK } from "@/lib/constants";
import { categories } from "@/lib/categories";
import { formatExpiry } from "@/lib/formatters";
import { WalletCard } from "@/components/WalletCard";
import { CardDetailPage } from "@/components/CardDetailPage";
import { AddCardSheet } from "@/components/AddCardSheet";
import { AskSheet } from "@/components/AskSheet";

export default function Home() {
  const [cardHeight, setCardHeight] = useState(246);
  const [cards, setCards] = useState<CreditCardData[]>(allCards);
  const [myCardIds, setMyCardIds] = useState<Set<number>>(new Set());
  const [cardLast4, setCardLast4] = useState<Record<number, string>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<SpendCategory | null>(null);
  const [detailCard, setDetailCard] = useState<CardWithRank | null>(null);
  const [showAddSheet, setShowAddSheet] = useState(false);
  const [showAskSheet, setShowAskSheet] = useState(false);

  useEffect(() => {
    const update = () => {
      const w = Math.min(window.innerWidth, 430) - 40;
      setCardHeight(Math.round(w / CARD_ASPECT));
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    fetch("/api/cards")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data.creditCards) && data.creditCards.length > 0) {
          setCards(data.creditCards);
        }
      })
      .catch(() => {});
  }, []);

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
    setSelectedCategory((prev) => (prev === cat ? null : cat));
    setSearchQuery("");
  };

  const myCards = cards.filter((c) => myCardIds.has(c.id));
  const ranked = rankCards(myCards, effectiveCategory);
  const bestCard = ranked[0] ?? null;
  const activeCategoryLabel = categories.find((c) => c.key === effectiveCategory)?.label ?? "this";
  const stackHeight = (ranked.length - 1) * CARD_PEEK + cardHeight + 20;

  const handleCardTap = useCallback(
    (id: number) => {
      const card = ranked.find((c) => c.id === id);
      if (!card) return;
      setDetailCard(card);
    },
    [ranked]
  );

  return (
    <div className="min-h-screen bg-black text-white flex justify-center">
      <div className="w-full max-w-[430px] min-h-screen relative">

        {/* ─── Header ─── */}
        <div className="safe-top px-5 pt-4 pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wallet className="w-6 h-6 text-white/80" />
              <h1 className="text-2xl font-bold tracking-tight">CardSense</h1>
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
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
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
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={() => setShowAskSheet(true)}
              className="w-11 h-11 rounded-2xl bg-white/10 flex items-center justify-center flex-shrink-0 border border-white/8"
            >
              <Mic className="w-4 h-4 text-white/60" />
            </motion.button>
          </div>
        </div>

        {/* ─── Category Chips ─── */}
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
                  cardHeight={cardHeight}
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
          cards={cards}
        />

        {/* ─── Ask Sheet ─── */}
        <AskSheet
          open={showAskSheet}
          onClose={() => setShowAskSheet(false)}
          onResult={(query) => { setSearchQuery(query); setSelectedCategory(null); }}
        />

      </div>

      {/* ─── Card Detail ─── */}
      <AnimatePresence>
        {detailCard && (
          <CardDetailPage
            key={detailCard.id}
            card={detailCard}
            onClose={() => setDetailCard(null)}
            last4={cardLast4[detailCard.id]}
            cardHeight={cardHeight}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
