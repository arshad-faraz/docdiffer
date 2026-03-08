/**
 * Block-level diffing using LCS (Longest Common Subsequence)
 * Works on fingerprints for O(1) comparison cost
 */

import { DocumentBlock, BlockDiff, BlockDiffType } from '../types';
import { generateFingerprint } from '../utils/fingerprint';

interface LCSMatch {
  leftIdx: number;
  rightIdx: number;
}

interface LCSDiffOp {
  type: 'match' | 'insert' | 'delete';
  leftIdx?: number;
  rightIdx?: number;
}

export function lcsDiff(
  leftBlocks: DocumentBlock[],
  rightBlocks: DocumentBlock[],
): BlockDiff[] {
  const leftFingerprints = leftBlocks.map(b => b.fingerprint);
  const rightFingerprints = rightBlocks.map(b => b.fingerprint);

  const ops = computeLCS(leftFingerprints, rightFingerprints);
  const diffs = opsToBlockDiffs(ops, leftBlocks, rightBlocks);

  // Second pass: reclassify adjacent add+delete pairs as modified
  return reclassifyModified(diffs);
}

function computeLCS(
  left: string[],
  right: string[],
): LCSDiffOp[] {
  const m = left.length;
  const n = right.length;

  // DP table for LCS length
  const dp: number[][] = Array(m + 1)
    .fill(null)
    .map(() => Array(n + 1).fill(0));

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (left[i - 1] === right[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  // Backtrack to find operations
  const ops: LCSDiffOp[] = [];
  let i = m;
  let j = n;

  while (i > 0 || j > 0) {
    if (i === 0) {
      ops.push({ type: 'insert', rightIdx: --j });
    } else if (j === 0) {
      ops.push({ type: 'delete', leftIdx: --i });
    } else if (left[i - 1] === right[j - 1]) {
      ops.push({ type: 'match', leftIdx: --i, rightIdx: --j });
    } else if ((dp[i - 1][j] || 0) > (dp[i][j - 1] || 0)) {
      ops.push({ type: 'delete', leftIdx: --i });
    } else {
      ops.push({ type: 'insert', rightIdx: --j });
    }
  }

  return ops.reverse();
}

function opsToBlockDiffs(
  ops: LCSDiffOp[],
  leftBlocks: DocumentBlock[],
  rightBlocks: DocumentBlock[],
): BlockDiff[] {
  const diffs: BlockDiff[] = [];

  for (const op of ops) {
    if (op.type === 'match') {
      diffs.push({
        type: 'unchanged',
        left: leftBlocks[op.leftIdx!],
        right: rightBlocks[op.rightIdx!],
      });
    } else if (op.type === 'delete') {
      diffs.push({
        type: 'deleted',
        left: leftBlocks[op.leftIdx!],
      });
    } else if (op.type === 'insert') {
      diffs.push({
        type: 'added',
        right: rightBlocks[op.rightIdx!],
      });
    }
  }

  return diffs;
}

function reclassifyModified(diffs: BlockDiff[]): BlockDiff[] {
  const result = [...diffs];
  const threshold = 0.6;

  for (let i = 0; i < result.length - 1; i++) {
    const curr = result[i];
    const next = result[i + 1];

    // Check for adjacent delete + add pair
    if (
      curr.type === 'deleted' &&
      next.type === 'added' &&
      curr.left &&
      next.right
    ) {
      const similarity = calculateSimilarity(curr.left.text, next.right.text);

      if (similarity >= threshold) {
        // Reclassify as modified
        result[i] = {
          type: 'modified',
          left: curr.left,
          right: next.right,
          similarity,
        };
        result.splice(i + 1, 1);
        i--; // Adjust index since we removed an element
      }
    }
  }

  return result;
}

function calculateSimilarity(leftText: string, rightText: string): number {
  const leftNorm = leftText.toLowerCase().trim();
  const rightNorm = rightText.toLowerCase().trim();

  if (leftNorm === rightNorm) return 1;

  // Simple token-based similarity
  const leftTokens = new Set(leftNorm.split(/\s+/));
  const rightTokens = new Set(rightNorm.split(/\s+/));

  const intersection = Array.from(leftTokens).filter(t => rightTokens.has(t)).length;
  const union = new Set([...leftTokens, ...rightTokens]).size;

  return union === 0 ? 0 : intersection / union;
}
