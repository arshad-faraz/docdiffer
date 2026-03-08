/**
 * Unified diff view (lazy-loaded CodeMirror)
 */

import type { BlockDiff } from '../types';

export function createUnifiedView(diffs: BlockDiff[]): HTMLElement {
  const container = document.createElement('div');
  container.className = 'unified-diff';

  const content = document.createElement('div');
  content.className = 'unified-content';

  // Generate unified diff text
  let unifiedText = '';

  for (const diff of diffs) {
    if (diff.type === 'unchanged' && diff.left) {
      unifiedText += ` ${diff.left.text}\n`;
    } else if (diff.type === 'deleted' && diff.left) {
      unifiedText += `-${diff.left.text}\n`;
    } else if (diff.type === 'added' && diff.right) {
      unifiedText += `+${diff.right.text}\n`;
    } else if (diff.type === 'modified') {
      if (diff.left) {
        unifiedText += `-${diff.left.text}\n`;
      }
      if (diff.right) {
        unifiedText += `+${diff.right.text}\n`;
      }
    }
  }

  // For now, display as pre-formatted text
  // In a full implementation, this would lazy-load CodeMirror
  const pre = document.createElement('pre');
  pre.textContent = unifiedText;
  pre.style.margin = '0';
  pre.style.height = '100%';
  pre.style.overflow = 'auto';
  pre.style.padding = '1rem';

  content.appendChild(pre);
  container.appendChild(content);

  return container;
}
