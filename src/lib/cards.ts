import { CreditCardData, CardWithRank, SpendCategory } from "@/types";
import { promotions } from "@/data/promotions";
import cardJson from "@/data/cards.json";

export const allCards: CreditCardData[] = cardJson.creditCards as unknown as CreditCardData[];

export const cardImages: Record<number, string> = {
  4:  "https://ecm.capitalone.com/WCM/card/products/venturex-cg-static-card-1000x630-2.png",
  14: "https://ecm.capitalone.com/WCM/card/products/new-savor-card-art.png",
};

export const cardGradients: Record<number, [string, string]> = {
  1:  ["#1a3a5c", "#2d6aae"],
  2:  ["#0c1b2e", "#1a3a5c"],
  3:  ["#6b6b6b", "#9a9a9a"],
  4:  ["#1a1a2e", "#33334d"],
  5:  ["#003d99", "#1a6aff"],
  6:  ["#1a5276", "#2e86c1"],
  7:  ["#b8860b", "#daa520"],
  8:  ["#d35400", "#e67e22"],
  9:  ["#1e4d2b", "#2d7a45"],
  10: ["#b71c1c", "#e53935"],
  11: ["#7b1a1a", "#a82828"],
  12: ["#1565c0", "#42a5f5"],
  13: ["#8b0000", "#c62828"],
  14: ["#2e7d32", "#43a047"],
  15: ["#0d47a1", "#1976d2"],
  16: ["#1565c0", "#64b5f6"],
  17: ["#00338d", "#0055b8"],
  18: ["#002a5c", "#0050a0"],
  19: ["#232f3e", "#37475a"],
  20: ["#e31837", "#ff3355"],
  21: ["#f5f5f7", "#c7c7cc"],
  22: ["#cc0000", "#e60000"],
  23: ["#2e7d32", "#66bb6a"],
  24: ["#1b5e20", "#388e3c"],
  25: ["#1a237e", "#3949ab"],
  26: ["#0d47a1", "#2196f3"],
  27: ["#002171", "#0050b3"],
  28: ["#880e4f", "#c2185b"],
  29: ["#1a237e", "#283593"],
  30: ["#263238", "#455a64"],
  31: ["#2e7d32", "#4caf50"],
  32: ["#003087", "#009cde"],
  33: ["#1a1a1a", "#3d3d3d"],
  34: ["#003b5c", "#00628a"],
  35: ["#5c1326", "#8e1f3e"],
  36: ["#1c1c1c", "#4a4a4a"],
  37: ["#304cb2", "#5072e4"],
  38: ["#00239c", "#0041c2"],
  39: ["#003a70", "#00529b"],
  40: ["#1a3a5c", "#2d5a8e"],
  41: ["#e65100", "#ff9800"],
  42: ["#c41230", "#e8364e"],
};

const categoryKeywords: Record<SpendCategory, string[]> = {
  dining:    ["dining", "restaurant", "food"],
  groceries: ["grocery", "supermarket"],
  gas:       ["gas", "fuel"],
  travel:    ["travel", "hotel", "car rental", "rental car", "flight", "airline"],
  streaming: ["streaming"],
  flights:   ["flight", "airline"],
  hotels:    ["hotel"],
  pharmacy:  ["pharmacy", "drug", "drugstore"],
  online:    ["online", "amazon", "e-commerce", "internet"],
  all:       ["all", "other", "every"],
};

// Natural language query → SpendCategory. Order is intentional (more specific first).
export function classifyQuery(query: string): SpendCategory {
  const q = query.toLowerCase();
  if (/flight|airline|plane|fly\b|airport|delta\b|united\b|southwest|jetblue|spirit\b|american air/i.test(q)) return "flights";
  if (/hotel|motel|airbnb|marriott|hilton|hyatt|ihg\b|inn\b|resort|lodge|lodging/i.test(q)) return "hotels";
  if (/stream|netflix|hulu|disney\+|spotify|apple music|hbo\b|peacock|paramount|youtube premium/i.test(q)) return "streaming";
  if (/amazon|ebay|etsy|online shop|e.?commerce|shop online/i.test(q)) return "online";
  if (/pharma|drug\s?store|drugstore|cvs\b|walgreens|rite.?aid|prescription|medicine\b/i.test(q)) return "pharmacy";
  if (/gas\b|fuel|gasoline|petrol|shell\b|chevron|exxon|bp\b|mobil\b|sunoco/i.test(q)) return "gas";
  if (/grocer|supermarket|whole.?foods|trader.?joe|safeway|kroger|publix|wegmans|costco|aldi/i.test(q)) return "groceries";
  if (/restaurant|dining|dinner|lunch|breakfast|cafe|coffee|bar\b|pub\b|eat\b|pizza|burger|sushi|doordash|uber.?eats|grubhub|chipotle|mcdonald|starbucks|food\b/i.test(q)) return "dining";
  if (/travel|trip|vacation|holiday|uber\b|lyft|taxi|car.?rental|hertz|enterprise\b|avis\b|transit/i.test(q)) return "travel";
  return "all";
}

function extractNumericRate(rateStr: string): number {
  const match = rateStr.match(/(\d+(?:\.\d+)?)/);
  return match ? parseFloat(match[1]) : 0;
}

function findBestRate(card: CreditCardData, category: SpendCategory): { rate: string; value: number } {
  const keywords = categoryKeywords[category];
  let bestRate = "";
  let bestValue = 0;

  for (const [key, rateStr] of Object.entries(card.rewardsRate)) {
    const keyLower = key.toLowerCase();
    const rateLower = rateStr.toLowerCase();
    for (const kw of keywords) {
      if (keyLower.includes(kw) || rateLower.includes(kw)) {
        const v = extractNumericRate(rateStr);
        if (v > bestValue) {
          bestValue = v;
          bestRate = rateStr;
        }
      }
    }
  }

  if (!bestRate) {
    for (const [key, rateStr] of Object.entries(card.rewardsRate)) {
      if (key === "all" || key === "other") {
        bestRate = rateStr;
        bestValue = extractNumericRate(rateStr);
        break;
      }
    }
  }

  return { rate: bestRate || "1x on other purchases", value: bestValue || 1 };
}

export function rankCards(cards: CreditCardData[], category: SpendCategory): CardWithRank[] {
  const today = new Date();

  const ranked = cards.map((card) => {
    const { rate: baseRate, value: baseValue } = findBestRate(card, category);

    const promo = promotions.find((p) => {
      if (p.cardId !== card.id) return false;
      if (!p.categories.includes(category)) return false;
      const expiry = new Date(p.expiry + "T23:59:59");
      return today <= expiry;
    });

    const promoWins = promo !== undefined && promo.rate > baseValue;

    return {
      ...card,
      categoryRate: promoWins ? promo!.label : baseRate,
      categoryValue: promoWins ? promo!.rate : baseValue,
      rank: 0,
      activePromotion: promoWins ? promo : undefined,
    };
  });

  ranked.sort((a, b) => b.categoryValue - a.categoryValue);
  ranked.forEach((c, i) => (c.rank = i + 1));
  return ranked;
}
