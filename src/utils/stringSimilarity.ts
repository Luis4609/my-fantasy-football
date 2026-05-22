/**
 * Calculates the Levenshtein distance between two strings.
 * Measures the number of single-character edits required to change one string into another.
 */
export function getLevenshteinDistance(a: string, b: string): number {
  const tmp: number[][] = [];
  for (let i = 0; i <= a.length; i++) tmp[i] = [i];
  for (let j = 0; j <= b.length; j++) tmp[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      tmp[i][j] = Math.min(
        tmp[i - 1][j] + 1, // deletion
        tmp[i][j - 1] + 1, // insertion
        tmp[i - 1][j - 1] + (a[i - 1].toLowerCase() === b[j - 1].toLowerCase() ? 0 : 1) // substitution
      );
    }
  }
  return tmp[a.length][b.length];
}

/**
 * Calculates a smart similarity percentage between two strings.
 * Combines Levenshtein character distance and token-based overlap similarity.
 * - Levenshtein (40% weight): Good for catching typos/spelling errors.
 * - Token Overlap (60% weight): Good for catching abbreviations or missing names (e.g. "Luis M." vs "Luis Miguel").
 * 
 * Returns a value between 0 (completely different) and 100 (identical).
 */
export function getSmartSimilarity(a: string, b: string): number {
  const cleanA = a.trim().toLowerCase();
  const cleanB = b.trim().toLowerCase();
  
  if (cleanA === cleanB) return 100;
  if (!cleanA || !cleanB) return 0;
  
  // 1. Levenshtein edit similarity
  const levDistance = getLevenshteinDistance(cleanA, cleanB);
  const maxLength = Math.max(cleanA.length, cleanB.length);
  const levSimilarity = ((maxLength - levDistance) / maxLength) * 100;
  
  // 2. Token overlap similarity
  const tokensA = cleanA.split(/\s+/).filter(t => t.length > 0);
  const tokensB = cleanB.split(/\s+/).filter(t => t.length > 0);
  
  let commonTokensCount = 0;
  
  for (const tokenA of tokensA) {
    // Check if tokenA is identical or a prefix/suffix of any token in B, or vice-versa
    const hasOverlap = tokensB.some(tokenB => {
      if (tokenA === tokenB) return true;
      if (tokenA.length > 1 && tokenB.startsWith(tokenA)) return true;
      if (tokenB.length > 1 && tokenA.startsWith(tokenB)) return true;
      return false;
    });
    
    if (hasOverlap) {
      commonTokensCount++;
    }
  }
  
  const tokenSimilarity = (commonTokensCount / Math.max(tokensA.length, tokensB.length)) * 100;
  
  // Combined weighted score
  const combined = 0.4 * levSimilarity + 0.6 * tokenSimilarity;
  return Math.round(combined);
}
