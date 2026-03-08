/**
 * Inline (word-level) diffing using diff-match-patch semantic mode
 * Applied only to modified blocks
 */

import { diffWords } from 'diff';
import type { BlockDiff, InlineChange } from '../types';

export function applyInlineDiffs(diffs: BlockDiff[]): BlockDiff[] {
  return diffs.map((diff) => {
    if (diff.type === 'modified' && diff.left && diff.right) {
      const wordDiffs = diffWords(diff.left.text, diff.right.text);

      const inlineDiff: InlineChange[] = wordDiffs.map((d) => ({
        type: d.added ? 'added' : d.removed ? 'deleted' : 'unchanged',
        text: d.value,
      }));

      return {
        ...diff,
        inlineDiff,
      };
    }
    return diff;
  });
}

/**
 * Format inline changes as HTML spans with appropriate styling
 */
export function formatInlineChanges(changes: InlineChange[]): string {
  return changes
    .map((change) => {
      if (change.type === 'added') {
        return `<span class="inline-added">${escapeHtml(change.text)}</span>`;
      } else if (change.type === 'deleted') {
        return `<span class="inline-deleted">${escapeHtml(change.text)}</span>`;
      } else {
        return escapeHtml(change.text);
      }
    })
    .join('');
}

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (c) => map[c]);
}
