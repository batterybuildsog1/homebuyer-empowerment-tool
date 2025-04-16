
/**
 * Get credit history option based on FICO score
 */
export function getCreditHistoryOption(ficoScore: number): string {
  if (ficoScore >= 760) return "760+";
  if (ficoScore >= 720) return "720-759";
  if (ficoScore >= 680) return "680-719";
  if (ficoScore >= 640) return "640-679";
  return "<640";
}
