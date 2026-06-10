"use client";

import { useState, useEffect, useCallback } from "react";
import { CreditCardData } from "@/types";

export function useMyCards() {
  const [myCardIds, setMyCardIds] = useState<Set<number>>(new Set());
  const [cardLast4, setCardLast4] = useState<Record<number, string>>({});

  useEffect(() => {
    try {
      const saved = localStorage.getItem("cb-max-cards");
      if (saved) setMyCardIds(new Set(JSON.parse(saved)));
    } catch {}
    try {
      const savedLast4 = localStorage.getItem("cb-max-last4");
      if (savedLast4) setCardLast4(JSON.parse(savedLast4));
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem("cb-max-cards", JSON.stringify([...myCardIds]));
  }, [myCardIds]);

  useEffect(() => {
    localStorage.setItem("cb-max-last4", JSON.stringify(cardLast4));
  }, [cardLast4]);

  const toggleCard = useCallback((card: CreditCardData) => {
    setMyCardIds((prev) => {
      const next = new Set(prev);
      if (next.has(card.id)) next.delete(card.id);
      else next.add(card.id);
      return next;
    });
  }, []);

  const setLast4 = useCallback((id: number, val: string) => {
    setCardLast4((prev) => ({ ...prev, [id]: val }));
  }, []);

  return { myCardIds, cardLast4, toggleCard, setLast4 };
}
