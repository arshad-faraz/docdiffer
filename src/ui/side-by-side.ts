/**
 * Side-by-Side View - Renders two panes with synchronized scrolling
 * Shows left and right documents with diff highlighting
 */

import type { BlockDiff, FilterState } from '../types';

/**
 * Create side-by-side diff view
 */
export function createSideBySideView(diffs: BlockDiff[], filters: FilterState): HTMLElement {
  const container = document.createElement('div');
  container.className = 'side-by-side';

  const leftPane = document.createElement('div');
  leftPane.className = 'side-by-side__pane side-by-side__pane--left';

  const rightPane = document.createElement('div');
  rightPane.className = 'side-by-side__pane side-by-side__pane--right';

  const divider = document.createElement('div');
  divider.className = 'side-by-side__divider';

  // Render blocks to respective panes
  const filteredDiffs = diffs.filter(shouldShowDiff(filters));

  const leftFragment = document.createDocumentFragment();
  const rightFragment = document.createDocumentFragment();

  for (const blockDiff of filteredDiffs) {
    if (blockDiff.left) {
      leftFragment.appendChild(createBlockElement(blockDiff, 'left'));
    }

    if (blockDiff.type === 'unchanged' || blockDiff.type === 'modified' || blockDiff.type === 'moved') {
      if (blockDiff.right) {
        rightFragment.appendChild(createBlockElement(blockDiff, 'right'));
      }
    } else if (blockDiff.type === 'added') {
      if (blockDiff.right) {
        rightFragment.appendChild(createBlockElement(blockDiff, 'right'));
      }
    }
  }

  leftPane.appendChild(leftFragment);
  rightPane.appendChild(rightFragment);

  container.appendChild(leftPane);
  container.appendChild(divider);
  container.appendChild(rightPane);

  // Set up synchronized scrolling
  setupSyncScroll(leftPane, rightPane);

  return container;
}

/**
 * Create a diff block element
 */
function createBlockElement(blockDiff: BlockDiff, side: 'left' | 'right'): HTMLElement {
  const blockEl = document.createElement('div');
  blockEl.className = 'diff-block';
  blockEl.classList.add(`block-${blockDiff.type}`);

  const block = side === 'left' ? blockDiff.left : blockDiff.right;
  if (!block) {
    return blockEl;
  }

  blockEl.setAttribute('data-block-id', block.id);
  blockEl.setAttribute('data-block-type', block.type);

  // Add block header with type indicator
  const header = document.createElement('div');
  header.className = 'diff-block__header';
  header.innerHTML = `
    <span class="diff-block__type">${block.type}</span>
    <span class="diff-block__status">${blockDiff.type}</span>
  `;

  // Add block content
  const content = document.createElement('div');
  content.className = 'diff-block__content';

  if (blockDiff.inlineDiff && (blockDiff.type === 'modified' || blockDiff.type === 'moved')) {
    // Render inline changes
    const inlineFragment = document.createDocumentFragment();
    for (const change of blockDiff.inlineDiff) {
      const span = document.createElement('span');
      span.className = `inline-${change.type}`;
      span.textContent = change.text;
      inlineFragment.appendChild(span);
    }
    content.appendChild(inlineFragment);
  } else {
    // Render plain text
    content.textContent = block.text;
  }

  blockEl.appendChild(header);
  blockEl.appendChild(content);

  // Add similarity badge for moved blocks
  if (blockDiff.type === 'moved' && blockDiff.similarity !== undefined) {
    const badge = document.createElement('span');
    badge.className = 'diff-block__badge';
    badge.textContent = `${Math.round(blockDiff.similarity * 100)}% match`;
    header.appendChild(badge);
  }

  return blockEl;
}

/**
 * Set up synchronized scrolling between panes
 */
function setupSyncScroll(leftPane: HTMLElement, rightPane: HTMLElement): void {
  let isScrolling = false;

  const syncScroll = (source: HTMLElement, target: HTMLElement) => {
    if (isScrolling) return;

    isScrolling = true;
    const ratio = target.scrollHeight / source.scrollHeight;
    target.scrollTop = source.scrollTop * ratio;
    isScrolling = false;
  };

  leftPane.addEventListener('scroll', () => syncScroll(leftPane, rightPane));
  rightPane.addEventListener('scroll', () => syncScroll(rightPane, leftPane));
}

/**
 * Create filter predicate function
 */
function shouldShowDiff(filters: FilterState) {
  return (diff: BlockDiff): boolean => {
    switch (diff.type) {
      case 'unchanged':
        return filters.showUnchanged;
      case 'added':
        return filters.showAdded;
      case 'deleted':
        return filters.showDeleted;
      case 'modified':
        return filters.showModified;
      case 'moved':
        return filters.showMoved;
      default:
        return true;
    }
  };
}
