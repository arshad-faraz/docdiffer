/**
 * Move detection using Jaro-Winkler similarity
 * Identifies blocks that have been moved to a different position
 */

import { BlockDiff, DocumentBlock } from '../types';
import { jaroWinklerSimilarity } from '../utils/fingerprint';
import { normalizeText } from './normalizer';

interface MoveCandidate {
  originalIdx: number;
  newIdx: number;
  similarity: number;
}

export function detectMoves(diffs: BlockDiff[]): BlockDiff[] {
  const threshold = 0.75;
  const deletedBlocks: Array<{ idx: number; block: DocumentBlock }> = [];
  const addedBlocks: Array<{ idx: number; block: DocumentBlock }> = [];

  // Collect deleted and added blocks
  for (let i = 0; i < diffs.length; i++) {
    if (diffs[i].type === 'deleted' && diffs[i].left) {
      deletedBlocks.push({ idx: i, block: diffs[i].left! });
    } else if (diffs[i].type === 'added' && diffs[i].right) {
      addedBlocks.push({ idx: i, block: diffs[i].right! });
    }
  }

  // Find potential moves
  const moves = findMoves(deletedBlocks, addedBlocks, threshold);

  // Apply moves to diffs
  const result = [...diffs];
  const processedIndices = new Set<number>();

  for (const move of moves) {
    const deletedIdx = move.originalIdx;
    const addedIdx = move.newIdx;

    if (!processedIndices.has(deletedIdx) && !processedIndices.has(addedIdx)) {
      result[deletedIdx] = {
        type: 'moved',
        left: deletedBlocks.find(d => d.idx === deletedIdx)?.block,
        right: addedBlocks.find(a => a.idx === addedIdx)?.block,
        similarity: move.similarity,
      };

      result[addedIdx] = {
        type: 'moved',
        left: deletedBlocks.find(d => d.idx === deletedIdx)?.block,
        right: addedBlocks.find(a => a.idx === addedIdx)?.block,
        moveTarget: String(deletedIdx),
        similarity: move.similarity,
      };

      processedIndices.add(deletedIdx);
      processedIndices.add(addedIdx);
    }
  }

  return result;
}

function findMoves(
  deleted: Array<{ idx: number; block: DocumentBlock }>,
  added: Array<{ idx: number; block: DocumentBlock }>,
  threshold: number,
): MoveCandidate[] {
  const candidates: MoveCandidate[] = [];

  for (const delItem of deleted) {
    for (const addItem of added) {
      const similarity = jaroWinklerSimilarity(
        normalizeText(delItem.block.text),
        normalizeText(addItem.block.text),
      );

      if (similarity >= threshold) {
        candidates.push({
          originalIdx: delItem.idx,
          newIdx: addItem.idx,
          similarity,
        });
      }
    }
  }

  // Sort by similarity (descending) and return best matches
  candidates.sort((a, b) => b.similarity - a.similarity);

  // Greedy matching: take best match, remove from consideration
  const moves: MoveCandidate[] = [];
  const usedOriginal = new Set<number>();
  const usedNew = new Set<number>();

  for (const candidate of candidates) {
    if (!usedOriginal.has(candidate.originalIdx) && !usedNew.has(candidate.newIdx)) {
      moves.push(candidate);
      usedOriginal.add(candidate.originalIdx);
      usedNew.add(candidate.newIdx);
    }
  }

  return moves;
}

export function isMoved(diff: BlockDiff): boolean {
  return diff.type === 'moved';
}
