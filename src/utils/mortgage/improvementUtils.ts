
/**
 * Gets the next FICO score band that would improve rate
 * @param currentFico Current FICO score
 * @param loanType Loan type
 * @returns Next FICO band or null if already at highest band
 */
export const getNextFicoBand = (
  currentFico: number, 
  loanType: 'conventional' | 'fha'
): number | null => {
  if (loanType === 'conventional') {
    if (currentFico < 620) return 620;
    if (currentFico < 640) return 640;
    if (currentFico < 660) return 660;
    if (currentFico < 680) return 680;
    if (currentFico < 700) return 700;
    if (currentFico < 720) return 720;
    if (currentFico < 740) return 740;
    return null; // Already at highest band
  } else { // FHA
    if (currentFico < 500) return null; // Below minimum FHA
    if (currentFico < 580) return 580;
    if (currentFico < 620) return 620;
    if (currentFico < 640) return 640;
    if (currentFico < 660) return 660;
    if (currentFico < 680) return 680;
    if (currentFico < 700) return 700;
    if (currentFico < 720) return 720;
    if (currentFico < 740) return 740;
    return null; // Already at highest band
  }
};

/**
 * Gets the next lower LTV threshold that would improve rate
 * @param currentLtv Current LTV
 * @returns Next lower LTV threshold or null if already at lowest band
 */
export const getLowerLtvOption = (currentLtv: number): number | null => {
  if (currentLtv > 97) return 97;
  if (currentLtv > 95) return 95;
  if (currentLtv > 90) return 90;
  if (currentLtv > 85) return 85;
  if (currentLtv > 80) return 80;
  if (currentLtv > 75) return 75;
  if (currentLtv > 70) return 70;
  if (currentLtv > 60) return 60;
  return null; // Already at lowest band
};
