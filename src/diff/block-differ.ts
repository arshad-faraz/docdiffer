/**
 * Block-level diffing using LCS (Longest Common Subsequence)
 * on block fingerprints, with similarity-based reclassification
 */

import type { DocumentBlock, BlockDiff } from '../types';
import { jaroWinklerSimilarity } from '../utils/fingerprint';

export function diffBlocks(leftBlocks: DocumentBlock[], rightBlocks: DocumentBlock[]): BlockDiff[] {
  // LCS alignment on fingerprints
  const alignment = lcsDiff(
    leftBlocks.map((b) => b.fingerprint),
    rightBlocks.map((b) => b.fingerprint)
  );

  const result: BlockDiff[] = [];

  // Convert LCS alignment to BlockDiff array
  for (const op of alignment) {
    if (op.type === 'match') {
      result.push({
        type: 'unchanged',
        left: leftBlocks[op.leftIdx!],
        right: rightBlocks[op.rightIdx!],
      });
    } else if (op.type === 'delete') {
      result.push({
        type: 'deleted',
        left: leftBlocks[op.leftIdx!],
      });
    } else if (op.type === 'insert') {
      result.push({
        type: 'added',
        right: rightBlocks[op.rightIdx!],
      });
    }
  }

  // Post-process: reclassify adjacent add/delete pairs as modified if similar
  reclassifyModified(result);

  return result;
}

interface AlignmentOp {
  type: 'match' | 'delete' | 'insert';
  leftIdx?: number;
  rightIdx?: number;
}

function lcsDiff(leftFingerprints: string[], rightFingerprints: string[]): AlignmentOp[] {
  const m = leftFingerprints.length;
  const n = rightFingerprints.length;

  // Build LCS matrix
  const lcs = Array(m + 1)
    .fill(null)
    .map(() => Array(n + 1).fill(0));

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (leftFingerprints[i - 1] === rightFingerprints[j - 1]) {
        lcs[i][j] = lcs[i - 1][j - 1] + 1;
      } else {
        lcs[i][j] = Math.max(lcs[i - 1][j], lcs[i][j - 1]);
      }
    }
  }

  // Backtrack to reconstruct alignment
  const alignment: AlignmentOp[] = [];
  let i = m;
  let j = n;

  while (i > 0 || j > 0) {
    if (i === 0) {
      alignment.unshift({ type: 'insert', rightIdx: j - 1 });
      j--;
    } else if (j === 0) {
      alignment.unshift({ type: 'delete', leftIdx: i - 1 });
      i--;
    } else if (leftFingerprints[i - 1] === rightFingerprints[j - 1]) {
      alignment.unshift({ type: 'match', leftIdx: i - 1, rightIdx: j - 1 });
      i--;
      j--;
    } else if (lcs[i - 1][j] > lcs[i][j - 1]) {
      alignment.unshift({ type: 'delete', leftIdx: i - 1 });
      i--;
    } else {
      alignment.unshift({ type: 'insert', rightIdx: j - 1 });
      j--;
    }
  }

  return alignment;
}

function reclassifyModified(result: BlockDiff[]): void {
  for (let i = 0; i < result.length - 1; i++) {
    const curr = result[i];
    const next = result[i + 1];

    // Find adjacent delete + insert with high similarity
    if (
      curr.type === 'deleted' &&
      next.type === 'added' &&
      curr.left &&
      next.right
    ) {
      const similarity = jaroWinklerSimilarity(curr.left.text, next.right.text);

      if (similarity > 0.6) {
        // Reclassify as modified
        result[i] = {
          type: 'modified',
          left: curr.left,
          right: next.right,
          similarity,
        };
        result.splice(i + 1, 1);
      }
    }
  }
}
