/**
 * Diff engine: orchestrates the full diffing pipeline
 */

import type { DocumentModel, DiffResult, DiffStats, BlockDiff } from '../types';
import { normalizeModel } from './normalizer';
import { diffBlocks } from './block-differ';
import { detectMoves } from './move-detector';
import { applyInlineDiffs } from './inline-differ';
import { diffMetadata } from './metadata-differ';

export function diff(leftModel: DocumentModel, rightModel: DocumentModel): DiffResult {
  // Stage 1: Normalize
  const normalizedLeft = normalizeModel(leftModel);
  const normalizedRight = normalizeModel(rightModel);

  // Stage 2: Block-level diffing (LCS on fingerprints)
  let blockDiffs = diffBlocks(normalizedLeft.blocks, normalizedRight.blocks);

  // Stage 3: Move detection
  blockDiffs = detectMoves(blockDiffs);

  // Stage 4: Inline diffing (word-level for modified blocks)
  blockDiffs = applyInlineDiffs(blockDiffs);

  // Stage 5: Metadata diffing (independent)
  // const metadataDiff = diffMetadata(normalizedLeft, normalizedRight); // TODO: integrate metadata into result

  // Calculate statistics
  const stats = calculateStats(blockDiffs);

  return {
    blocks: blockDiffs,
    stats,
    leftModel: normalizedLeft,
    rightModel: normalizedRight,
  };
}

function calculateStats(blockDiffs: BlockDiff[]): DiffStats {
  const stats: DiffStats = {
    addedBlocks: 0,
    deletedBlocks: 0,
    modifiedBlocks: 0,
    movedBlocks: 0,
    unchangedBlocks: 0,
    percentChanged: 0,
    charAdditions: 0,
    charDeletions: 0,
  };

  for (const diff of blockDiffs) {
    switch (diff.type) {
      case 'added':
        stats.addedBlocks++;
        if (diff.right) {
          stats.charAdditions += diff.right.text.length;
        }
        break;
      case 'deleted':
        stats.deletedBlocks++;
        if (diff.left) {
          stats.charDeletions += diff.left.text.length;
        }
        break;
      case 'modified':
        stats.modifiedBlocks++;
        if (diff.left && diff.right) {
          stats.charDeletions += diff.left.text.length;
          stats.charAdditions += diff.right.text.length;
        }
        break;
      case 'moved':
        stats.movedBlocks++;
        break;
      case 'unchanged':
        stats.unchangedBlocks++;
        break;
    }
  }

  const totalBlocks = stats.unchangedBlocks + stats.modifiedBlocks + stats.addedBlocks + stats.deletedBlocks;
  const changedBlocks = stats.addedBlocks + stats.deletedBlocks + stats.modifiedBlocks;

  stats.percentChanged = totalBlocks > 0 ? (changedBlocks / totalBlocks) * 100 : 0;

  return stats;
}
