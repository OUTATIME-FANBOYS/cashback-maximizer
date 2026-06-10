import { describe, it, expect } from "vitest";
import { classifyQuery, rankCards } from "./cards";
import { camelToLabel } from "./formatters";
import type { CreditCardData, Promotion } from "@/types";

// ─── classifyQuery ────────────────────────────────────────────────────────────

describe("classifyQuery", () => {
  it("classifies restaurant names as dining", () => {
    expect(classifyQuery("Chipotle")).toBe("dining");
    expect(classifyQuery("Starbucks coffee")).toBe("dining");
    expect(classifyQuery("McDonald's run")).toBe("dining");
  });

  it("classifies food keywords as dining", () => {
    expect(classifyQuery("restaurant")).toBe("dining");
    expect(classifyQuery("dinner out")).toBe("dining");
    expect(classifyQuery("coffee shop")).toBe("dining");
    expect(classifyQuery("DoorDash order")).toBe("dining");
  });

  it("classifies grocery stores as groceries", () => {
    expect(classifyQuery("Trader Joe's")).toBe("groceries");
    expect(classifyQuery("Whole Foods")).toBe("groceries");
    expect(classifyQuery("Kroger run")).toBe("groceries");
    expect(classifyQuery("supermarket")).toBe("groceries");
  });

  it("classifies gas stations as gas", () => {
    expect(classifyQuery("Shell station")).toBe("gas");
    expect(classifyQuery("fill up gas")).toBe("gas");
    expect(classifyQuery("Chevron")).toBe("gas");
  });

  it("classifies flights before hotels (more specific first)", () => {
    expect(classifyQuery("Delta flight")).toBe("flights");
    expect(classifyQuery("airline ticket")).toBe("flights");
    expect(classifyQuery("fly to NYC")).toBe("flights");
  });

  it("classifies hotels", () => {
    expect(classifyQuery("Marriott stay")).toBe("hotels");
    expect(classifyQuery("hotel booking")).toBe("hotels");
    expect(classifyQuery("Airbnb")).toBe("hotels");
  });

  it("classifies streaming services", () => {
    expect(classifyQuery("Netflix")).toBe("streaming");
    expect(classifyQuery("Spotify subscription")).toBe("streaming");
    expect(classifyQuery("Disney+ renewal")).toBe("streaming");
  });

  it("classifies online shopping", () => {
    expect(classifyQuery("Amazon order")).toBe("online");
    expect(classifyQuery("eBay purchase")).toBe("online");
  });

  it("classifies pharmacy purchases", () => {
    expect(classifyQuery("CVS")).toBe("pharmacy");
    expect(classifyQuery("Walgreens pickup")).toBe("pharmacy");
    expect(classifyQuery("prescription refill")).toBe("pharmacy");
  });

  it("falls back to 'all' for unrecognized queries", () => {
    expect(classifyQuery("random thing")).toBe("all");
    expect(classifyQuery("birthday gift")).toBe("all");
    expect(classifyQuery("")).toBe("all");
  });
});

// ─── rankCards ────────────────────────────────────────────────────────────────

const makeCard = (overrides: Partial<CreditCardData> & { id: number }): CreditCardData => ({
  name: `Card ${overrides.id}`,
  issuer: "Test",
  network: "Visa",
  type: "Cash Back",
  image: "",
  annualFee: 0,
  signupBonus: "",
  aprRange: "",
  benefits: [],
  creditScoreNeeded: "Good",
  rewardsRate: { all: "1x on everything" },
  ...overrides,
});

describe("rankCards", () => {
  it("returns empty array for empty input", () => {
    expect(rankCards([], "dining")).toEqual([]);
  });

  it("ranks by category rate descending", () => {
    const cards = [
      makeCard({ id: 1, rewardsRate: { dining: "2x on dining", all: "1x" } }),
      makeCard({ id: 2, rewardsRate: { dining: "4x on dining", all: "1x" } }),
      makeCard({ id: 3, rewardsRate: { dining: "3x on dining", all: "1x" } }),
    ];
    const ranked = rankCards(cards, "dining");
    expect(ranked.map((c) => c.id)).toEqual([2, 3, 1]);
    expect(ranked[0].rank).toBe(1);
    expect(ranked[1].rank).toBe(2);
  });

  it("falls back to 'all' rate when no category match", () => {
    const card = makeCard({ id: 1, rewardsRate: { all: "1.5x on all purchases" } });
    const [result] = rankCards([card], "dining");
    expect(result.categoryValue).toBe(1.5);
  });

  it("applies active promotion when it beats base rate", () => {
    const card = makeCard({ id: 1, rewardsRate: { dining: "3x on dining" } });
    const promo: Promotion = {
      cardId: 1,
      categories: ["dining"],
      rate: 5,
      label: "5x dining promo",
      expiry: "2099-12-31",
    };
    const [result] = rankCards([card], "dining", [promo]);
    expect(result.categoryValue).toBe(5);
    expect(result.activePromotion).toBeDefined();
  });

  it("ignores promotion when base rate is higher", () => {
    const card = makeCard({ id: 1, rewardsRate: { dining: "6x on dining" } });
    const promo: Promotion = {
      cardId: 1,
      categories: ["dining"],
      rate: 3,
      label: "3x dining promo",
      expiry: "2099-12-31",
    };
    const [result] = rankCards([card], "dining", [promo]);
    expect(result.categoryValue).toBe(6);
    expect(result.activePromotion).toBeUndefined();
  });

  it("ignores expired promotions", () => {
    const card = makeCard({ id: 1, rewardsRate: { dining: "2x on dining" } });
    const expiredPromo: Promotion = {
      cardId: 1,
      categories: ["dining"],
      rate: 10,
      label: "10x (expired)",
      expiry: "2000-01-01",
    };
    const [result] = rankCards([card], "dining", [expiredPromo]);
    expect(result.categoryValue).toBe(2);
    expect(result.activePromotion).toBeUndefined();
  });

  it("ignores promotion for wrong category", () => {
    const card = makeCard({ id: 1, rewardsRate: { dining: "2x on dining" } });
    const wrongCatPromo: Promotion = {
      cardId: 1,
      categories: ["gas"],
      rate: 10,
      label: "10x gas promo",
      expiry: "2099-12-31",
    };
    const [result] = rankCards([card], "dining", [wrongCatPromo]);
    expect(result.categoryValue).toBe(2);
    expect(result.activePromotion).toBeUndefined();
  });
});

// ─── camelToLabel ─────────────────────────────────────────────────────────────

describe("camelToLabel", () => {
  it("converts camelCase to spaced title case", () => {
    expect(camelToLabel("onlineGrocery")).toBe("Online Grocery");
    expect(camelToLabel("portalTravel")).toBe("Portal Travel");
    expect(camelToLabel("otherTravel")).toBe("Other Travel");
    expect(camelToLabel("portalDining")).toBe("Portal Dining");
  });

  it("handles single-word keys", () => {
    expect(camelToLabel("dining")).toBe("Dining");
    expect(camelToLabel("all")).toBe("All");
  });

  it("handles keys that are already capitalized", () => {
    expect(camelToLabel("other")).toBe("Other");
  });

  it("handles consecutive capitals gracefully", () => {
    expect(camelToLabel("aprRange")).toBe("Apr Range");
  });
});
