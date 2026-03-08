/**
 * Diff engine - orchestrates the complete pipeline
 * Coordinates normalizer, block-differ, move detector, inline-differ
 */

import { DocumentModel, BlockDiff, DiffResult, DiffStats } from '../types';
import { normalizeText } from './normalizer';
import { lcsDiff } from './block-differ';
import { detectMoves } from './move-detector';
import { computeInlineDiffs, countInlineChanges } from './inline-differ';
import { diffMetadata } from './metadata-differ';

export function diff(leftModel: DocumentModel, rightModel: DocumentModel): DiffResult {
  // Step 1: Normalize text in blocks
  const normalizedLeftBlocks = leftModel.blocks.map(block => ({
    ...block,
    text: normalizeText(block.text),
  }));

  const normalizedRightBlocks = rightModel.blocks.map(block => ({
    ...block,
    text: normalizeText(block.text),
  }));

  // Step 2: LCS-based block alignment
  let blockDiffs = lcsDiff(normalizedLeftBlocks, normalizedRightBlocks);

  // Step 3: Detect moved blocks
  blockDiffs = detectMoves(blockDiffs);

  // Step 4: Compute inline diffs for modified/moved blocks
  blockDiffs = computeInlineDiffs(blockDiffs);

  // Step 5: Compute statistics
  const stats = computeStats(blockDiffs);

  return {
    blocks: blockDiffs,
    stats,
    leftModel,
    rightModel,
  };
}

function computeStats(blockDiffs: BlockDiff[]): DiffStats {
  let addedBlocks = 0;
  let deletedBlocks = 0;
  let modifiedBlocks = 0;
  let movedBlocks = 0;
  let unchangedBlocks = 0;
  let charAdditions = 0;
  let charDeletions = 0;

  for (const diff of blockDiffs) {
    switch (diff.type) {
      case 'added':
        addedBlocks++;
        if (diff.right) {
          charAdditions += diff.right.text.length;
        }
        break;

      case 'deleted':
        deletedBlocks++;
        if (diff.left) {
          charDeletions += diff.left.text.length;
        }
        break;

      case 'modified':
        modifiedBlocks++;
        if (diff.inlineDiff) {
          const { added, deleted } = countInlineChanges(diff.inlineDiff);
          charAdditions += added;
          charDeletions += deleted;
        } else if (diff.left && diff.right) {
          // Fallback: count character differences
          charDeletions += diff.left.text.length;
          charAdditions += diff.right.text.length;
        }
        break;

      case 'moved':
        movedBlocks++;
        if (diff.inlineDiff) {
          const { added, deleted } = countInlineChanges(diff.inlineDiff);
          charAdditions += added;
          charDeletions += deleted;
        }
        break;

      case 'unchanged':
        unchangedBlocks++;
        break;
    }
  }

  const totalBlocks = blockDiffs.length;
  const changedBlocks = addedBlocks + deletedBlocks + modifiedBlocks + movedBlocks;
  const percentChanged =
    totalBlocks === 0 ? 0 : Math.round((changedBlocks / totalBlocks) * 100);

  return {
    addedBlocks,
    deletedBlocks,
    modifiedBlocks,
    movedBlocks,
    unchangedBlocks,
    percentChanged,
    charAdditions,
    charDeletions,
  };
}

export function diffWithMetadata(
  leftModel: DocumentModel,
  rightModel: DocumentModel,
): DiffResult & { metadata: ReturnType<typeof diffMetadata> } {
  const result = diff(leftModel, rightModel);
  const metadata = diffMetadata(leftModel, rightModel, result.blocks);

  return {
    ...result,
    metadata,
  };
}
