/**
 * Move detection: identify deleted blocks that appear as added blocks
 * Uses similarity matching to classify pairs as 'moved'
 */

import type { BlockDiff, DocumentBlock } from '../types';
import { jaroWinklerSimilarity } from '../utils/fingerprint';

const MOVE_SIMILARITY_THRESHOLD = 0.75;

export function detectMoves(diffs: BlockDiff[]): BlockDiff[] {
  const deletedDiffs = diffs.filter((d) => d.type === 'deleted');
  const addedDiffs = diffs.filter((d) => d.type === 'added');

  const moveMap = new Map<number, number>();

  // Find high-similarity delete-add pairs
  for (const deletedDiff of deletedDiffs) {
    if (!deletedDiff.left) continue;

    for (const addedDiff of addedDiffs) {
      if (!addedDiff.right) continue;

      const similarity = jaroWinklerSimilarity(
        deletedDiff.left.text,
        addedDiff.right.text
      );

      if (similarity > MOVE_SIMILARITY_THRESHOLD) {
        const deletedIdx = diffs.indexOf(deletedDiff);
        const addedIdx = diffs.indexOf(addedDiff);

        moveMap.set(deletedIdx, addedIdx);
        break;
      }
    }
  }

  // Apply moves to diffs
  const movedIndices = new Set<number>();

  for (const [deletedIdx, addedIdx] of moveMap) {
    const deletedDiff = diffs[deletedIdx];
    const addedDiff = diffs[addedIdx];

    // Mark as moved
    diffs[deletedIdx] = {
      type: 'moved',
      left: deletedDiff.left,
      moveTarget: addedDiff.right?.id,
      similarity: MOVE_SIMILARITY_THRESHOLD,
    };

    diffs[addedIdx] = {
      type: 'moved',
      right: addedDiff.right,
      moveTarget: deletedDiff.left?.id,
      similarity: MOVE_SIMILARITY_THRESHOLD,
    };

    movedIndices.add(deletedIdx);
    movedIndices.add(addedIdx);
  }

  return diffs;
}
