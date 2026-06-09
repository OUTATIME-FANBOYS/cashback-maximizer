export function networkLabel(n: string): string {
  if (n === "Visa") return "VISA";
  if (n === "Mastercard") return "MC";
  if (n === "American Express") return "AMEX";
  if (n === "Discover") return "DISCOVER";
  return n.toUpperCase().slice(0, 6);
}

export function formatExpiry(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
