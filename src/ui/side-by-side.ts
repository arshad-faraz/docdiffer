/**
 * Side-by-side diff view (primary view)
 */

import type { BlockDiff, FilterState, DocumentBlock } from '../types';

export function createSideBySideView(
  diffs: BlockDiff[],
  filters: FilterState
): HTMLElement {
  const container = document.createElement('div');
  container.className = 'side-by-side';

  const leftPane = document.createElement('div');
  leftPane.className = 'diff-pane';

  const rightPane = document.createElement('div');
  rightPane.className = 'diff-pane';

  // Filter diffs based on active filters
  const filteredDiffs = diffs.filter((diff) => {
    switch (diff.type) {
      case 'added':
        return filters.showAdded;
      case 'deleted':
        return filters.showDeleted;
      case 'modified':
        return filters.showModified;
      case 'moved':
        return filters.showMoved;
      case 'unchanged':
        return filters.showUnchanged;
      default:
        return true;
    }
  });

  // Render diffs - align left/right blocks
  for (const diff of filteredDiffs) {
    const leftBlockEl = diff.left
      ? createBlockElement(diff.left, diff.type)
      : createEmptyPlaceholder();

    const rightBlockEl = diff.right
      ? createBlockElement(diff.right, diff.type)
      : createEmptyPlaceholder();

    leftPane.appendChild(leftBlockEl);
    rightPane.appendChild(rightBlockEl);
  }

  container.appendChild(leftPane);
  container.appendChild(rightPane);

  // Scroll sync
  syncPanesScroll(leftPane, rightPane);

  return container;
}

function createBlockElement(block: DocumentBlock, diffType: string): HTMLElement {
  const div = document.createElement('div');
  div.className = `diff-block block-${diffType}`;
  div.id = block.id;

  const label = document.createElement('div');
  label.className = 'block-label';
  label.textContent = diffType.toUpperCase();

  const content = document.createElement('div');
  content.className = 'block-content';
  content.innerHTML = block.html;

  div.appendChild(label);
  div.appendChild(content);

  return div;
}

function createEmptyPlaceholder(): HTMLElement {
  const div = document.createElement('div');
  div.style.height = '100px';
  div.style.visibility = 'hidden';
  return div;
}

function syncPanesScroll(left: HTMLElement, right: HTMLElement): void {
  const syncScroll = (source: HTMLElement, target: HTMLElement) => {
    return () => {
      const ratio = source.scrollHeight > 0 ? source.scrollTop / (source.scrollHeight - source.clientHeight) : 0;
      target.scrollTop = ratio * (target.scrollHeight - target.clientHeight);
    };
  };

  left.addEventListener('scroll', syncScroll(left, right), { passive: true });
  right.addEventListener('scroll', syncScroll(right, left), { passive: true });
}
