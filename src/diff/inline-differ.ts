/**
 * Word-level inline diffing using diffWords
 * Provides character-level change tracking within blocks
 */

import { diffWords } from 'diff';
import { BlockDiff, InlineChange, DocumentBlock } from '../types';

export function computeInlineDiffs(diffs: BlockDiff[]): BlockDiff[] {
  return diffs.map(diff => {
    if (
      (diff.type === 'modified' || diff.type === 'moved') &&
      diff.left &&
      diff.right
    ) {
      const inlineDiff = diffWords(diff.left.text, diff.right.text);
      return {
        ...diff,
        inlineDiff: inlineDiff.map(change => ({
          type: change.added ? 'added' : change.removed ? 'deleted' : 'unchanged',
          text: change.value,
        })),
      };
    }

    return diff;
  });
}

export function getInlineChanges(diff: BlockDiff): InlineChange[] {
  return diff.inlineDiff || [];
}

export function summarizeInlineChanges(
  inlineChanges: InlineChange[],
): { added: string; deleted: string } {
  const added = inlineChanges
    .filter(c => c.type === 'added')
    .map(c => c.text)
    .join('');

  const deleted = inlineChanges
    .filter(c => c.type === 'deleted')
    .map(c => c.text)
    .join('');

  return { added, deleted };
}

export function countInlineChanges(
  inlineChanges: InlineChange[],
): { added: number; deleted: number } {
  let added = 0;
  let deleted = 0;

  for (const change of inlineChanges) {
    if (change.type === 'added') {
      added += change.text.length;
    } else if (change.type === 'deleted') {
      deleted += change.text.length;
    }
  }

  return { added, deleted };
}
