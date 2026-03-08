/**
 * Rolling hash fingerprinting using 20-word shingles
 * Used for block similarity and move detection
 */

const SHINGLE_SIZE = 20;

export function generateFingerprint(text: string): string {
  const words = text.trim().toLowerCase().split(/\s+/).slice(0, SHINGLE_SIZE);

  if (words.length === 0) {
    return '0';
  }

  // Simple rolling hash for 20-word shingle
  let hash = 0;
  for (const word of words) {
    hash = ((hash << 5) - hash) + hashWord(word);
    hash = hash & hash; // Keep it 32-bit
  }

  return Math.abs(hash).toString(36);
}

function hashWord(word: string): number {
  let hash = 0;
  for (let i = 0; i < word.length; i++) {
    const char = word.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash;
}

/**
 * Jaro-Winkler similarity between two strings
 * Returns 0-1 where 1 is identical
 */
export function jaroWinklerSimilarity(a: string, b: string): number {
  if (a === b) return 1;
  if (a.length === 0 || b.length === 0) return 0;

  const aLen = a.length;
  const bLen = b.length;
  const matchWindow = Math.max(aLen, bLen) / 2 - 1;

  const aMatches = new Array(aLen).fill(false);
  const bMatches = new Array(bLen).fill(false);

  let matches = 0;
  let transpositions = 0;

  // Find matches
  for (let i = 0; i < aLen; i++) {
    const start = Math.max(0, i - matchWindow);
    const end = Math.min(i + matchWindow + 1, bLen);

    for (let j = start; j < end; j++) {
      if (bMatches[j] || a[i] !== b[j]) continue;
      aMatches[i] = true;
      bMatches[j] = true;
      matches++;
      break;
    }
  }

  if (matches === 0) return 0;

  // Count transpositions
  let k = 0;
  for (let i = 0; i < aLen; i++) {
    if (!aMatches[i]) continue;
    while (!bMatches[k]) k++;
    if (a[i] !== b[k]) transpositions++;
    k++;
  }

  const jaro =
    (matches / aLen + matches / bLen + (matches - transpositions / 2) / matches) / 3;

  // Jaro-Winkler: add prefix bonus for common starting characters
  const prefixLen = Math.min(4, Math.min(aLen, bLen));
  let prefix = 0;
  for (let i = 0; i < prefixLen; i++) {
    if (a[i] === b[i]) prefix++;
    else break;
  }

  return jaro + prefix * 0.1 * (1 - jaro);
}
