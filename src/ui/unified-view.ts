/**
 * Unified View - Unified diff format
 * Shows changes in a traditional unified diff style
 */

import type { BlockDiff, FilterState } from '../types';

/**
 * Create unified diff view
 */
export function createUnifiedView(diffs: BlockDiff[], filters: FilterState): HTMLElement {
  const container = document.createElement('div');
  container.className = 'unified-view';

  const filteredDiffs = diffs.filter(shouldShowDiff(filters));

  // Add header with file info
  const header = document.createElement('div');
  header.className = 'unified-view__header';
  header.innerHTML = `
    <div class="unified-view__file unified-view__file--left">
      <span class="unified-view__label">LEFT</span>
      <span class="unified-view__name" id="left-filename"></span>
    </div>
    <div class="unified-view__file unified-view__file--right">
      <span class="unified-view__label">RIGHT</span>
      <span class="unified-view__name" id="right-filename"></span>
    </div>
  `;
  container.appendChild(header);

  // Create diff output
  const diffOutput = document.createElement('pre');
  diffOutput.className = 'unified-view__output';

  const fragment = document.createDocumentFragment();

  for (const blockDiff of filteredDiffs) {
    // Add block separator
    const separator = document.createElement('div');
    separator.className = 'unified-view__separator';
    separator.innerHTML = `<span class="unified-view__location">${blockDiff.left?.sectionPath.join(' › ') || blockDiff.right?.sectionPath.join(' › ') || 'Unknown'}</span>`;
    fragment.appendChild(separator);

    // Render lines based on diff type
    const lines = createUnifiedLines(blockDiff);
    lines.forEach(line => fragment.appendChild(line));
  }

  diffOutput.appendChild(fragment);
  container.appendChild(diffOutput);

  return container;
}

/**
 * Create unified diff lines for a block
 */
function createUnifiedLines(blockDiff: BlockDiff): HTMLElement[] {
  const lines: HTMLElement[] = [];

  switch (blockDiff.type) {
    case 'unchanged':
      if (blockDiff.left) {
        const line = createUnifiedLine(' ', blockDiff.left.text, 'context');
        lines.push(line);
      }
      break;

    case 'added':
      if (blockDiff.right) {
        const line = createUnifiedLine('+', blockDiff.right.text, 'added');
        lines.push(line);
      }
      break;

    case 'deleted':
      if (blockDiff.left) {
        const line = createUnifiedLine('-', blockDiff.left.text, 'deleted');
        lines.push(line);
      }
      break;

    case 'modified':
      if (blockDiff.left) {
        const deleteLine = createUnifiedLine('-', blockDiff.left.text, 'deleted');
        lines.push(deleteLine);
      }
      if (blockDiff.inlineDiff) {
        const addLine = createUnifiedLineWithInline('+', blockDiff.inlineDiff, 'added');
        lines.push(addLine);
      } else if (blockDiff.right) {
        const addLine = createUnifiedLine('+', blockDiff.right.text, 'added');
        lines.push(addLine);
      }
      break;

    case 'moved':
      if (blockDiff.left) {
        const line = createUnifiedLine('-', blockDiff.left.text, 'deleted');
        lines.push(line);
      }
      if (blockDiff.right) {
        const line = createUnifiedLine('+', blockDiff.right.text, 'added');
        lines.push(line);
      }
      const moveNote = document.createElement('div');
      moveNote.className = 'unified-view__note unified-view__note--moved';
      moveNote.textContent = '(moved)';
      lines.push(moveNote);
      break;
  }

  return lines;
}

/**
 * Create a single unified diff line
 */
function createUnifiedLine(prefix: string, text: string, type: 'context' | 'added' | 'deleted'): HTMLElement {
  const line = document.createElement('div');
  line.className = `unified-view__line unified-view__line--${type}`;

  const prefixEl = document.createElement('span');
  prefixEl.className = 'unified-view__prefix';
  prefixEl.textContent = prefix;

  const contentEl = document.createElement('span');
  contentEl.className = 'unified-view__content';
  contentEl.textContent = text;

  line.appendChild(prefixEl);
  line.appendChild(contentEl);

  return line;
}

/**
 * Create a unified diff line with inline changes highlighted
 */
function createUnifiedLineWithInline(prefix: string, inlineDiff: any[], type: 'added' | 'deleted'): HTMLElement {
  const line = document.createElement('div');
  line.className = `unified-view__line unified-view__line--${type}`;

  const prefixEl = document.createElement('span');
  prefixEl.className = 'unified-view__prefix';
  prefixEl.textContent = prefix;

  const contentEl = document.createElement('span');
  contentEl.className = 'unified-view__content';

  const contentFragment = document.createDocumentFragment();
  for (const change of inlineDiff) {
    if (change.type === 'unchanged') {
      const span = document.createElement('span');
      span.textContent = change.text;
      contentFragment.appendChild(span);
    } else {
      const span = document.createElement('span');
      span.className = `inline-${change.type}`;
      span.textContent = change.text;
      contentFragment.appendChild(span);
    }
  }

  contentEl.appendChild(contentFragment);
  line.appendChild(prefixEl);
  line.appendChild(contentEl);

  return line;
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
