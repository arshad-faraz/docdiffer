/**
 * Search Overlay - Cmd+F fuzzy search with Fuse.js
 * Highlights matching diffs and allows navigation between results
 */

import type { BlockDiff } from '../types';

// Lazy load Fuse.js
let Fuse: typeof import('fuse.js').default;

/**
 * Create search overlay
 */
export function createSearchOverlay(diffs: BlockDiff[]): HTMLElement {
  const overlay = document.createElement('div');
  overlay.className = 'search-overlay';
  overlay.style.display = 'none';

  const container = document.createElement('div');
  container.className = 'search-overlay__container';

  const header = document.createElement('div');
  header.className = 'search-overlay__header';

  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'search-overlay__input';
  input.placeholder = 'Search differences...';
  input.setAttribute('aria-label', 'Search');

  const controls = document.createElement('div');
  controls.className = 'search-overlay__controls';

  const resultCount = document.createElement('span');
  resultCount.className = 'search-overlay__count';
  resultCount.textContent = '0 results';

  const prevBtn = document.createElement('button');
  prevBtn.className = 'search-overlay__nav-button';
  prevBtn.innerHTML = '↑';
  prevBtn.setAttribute('aria-label', 'Previous result');

  const nextBtn = document.createElement('button');
  nextBtn.className = 'search-overlay__nav-button';
  nextBtn.innerHTML = '↓';
  nextBtn.setAttribute('aria-label', 'Next result');

  const closeBtn = document.createElement('button');
  closeBtn.className = 'search-overlay__close';
  closeBtn.innerHTML = '✕';
  closeBtn.setAttribute('aria-label', 'Close search');

  controls.appendChild(resultCount);
  controls.appendChild(prevBtn);
  controls.appendChild(nextBtn);
  controls.appendChild(closeBtn);

  header.appendChild(input);
  header.appendChild(controls);
  container.appendChild(header);

  // Results list
  const resultsList = document.createElement('div');
  resultsList.className = 'search-overlay__results';

  let searchIndex: any = null;
  let currentResults: any[] = [];
  let currentResultIndex = 0;

  // Initialize search index when first needed
  const initializeSearch = async () => {
    if (searchIndex) return;

    // Lazy load Fuse.js
    if (!Fuse) {
      const module = await import('fuse.js');
      Fuse = module.default;
    }

    const searchableItems = diffs.map((diff, index) => ({
      index,
      type: diff.type,
      text: diff.left?.text || diff.right?.text || '',
      blockId: diff.left?.id || diff.right?.id || '',
    }));

    searchIndex = new Fuse(searchableItems, {
      keys: ['text', 'type'],
      threshold: 0.3,
      minMatchCharLength: 2,
    });
  };

  // Handle search input
  input.addEventListener('input', async (e) => {
    const query = (e.target as HTMLInputElement).value;

    if (!query) {
      resultsList.innerHTML = '';
      resultCount.textContent = '0 results';
      clearAllHighlights();
      return;
    }

    await initializeSearch();

    if (!searchIndex) return;

    currentResults = searchIndex.search(query);
    currentResultIndex = 0;

    resultCount.textContent = `${currentResults.length} result${currentResults.length !== 1 ? 's' : ''}`;

    // Render results
    renderResults(currentResults, diffs, resultsList);

    // Highlight first result
    if (currentResults.length > 0) {
      highlightResult(currentResults[0], diffs);
    }
  });

  // Navigation
  prevBtn.addEventListener('click', () => {
    if (currentResults.length === 0) return;
    currentResultIndex = (currentResultIndex - 1 + currentResults.length) % currentResults.length;
    highlightResult(currentResults[currentResultIndex], diffs);
  });

  nextBtn.addEventListener('click', () => {
    if (currentResults.length === 0) return;
    currentResultIndex = (currentResultIndex + 1) % currentResults.length;
    highlightResult(currentResults[currentResultIndex], diffs);
  });

  // Close
  closeBtn.addEventListener('click', () => {
    overlay.style.display = 'none';
    clearAllHighlights();
    input.value = '';
    resultsList.innerHTML = '';
  });

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if (overlay.style.display === 'none') return;

    if (e.key === 'Enter') {
      if (e.shiftKey) {
        prevBtn.click();
      } else {
        nextBtn.click();
      }
    }
    if (e.key === 'Escape') {
      closeBtn.click();
    }
  });

  container.appendChild(resultsList);
  overlay.appendChild(container);

  // Make overlay toggleable via Cmd+F
  const originalShowSearchOverlay = () => {
    overlay.style.display = 'flex';
    input.focus();
  };

  (overlay as any).show = originalShowSearchOverlay;

  return overlay;
}

/**
 * Render search results list
 */
function renderResults(results: any[], diffs: BlockDiff[], container: HTMLElement): void {
  container.innerHTML = '';

  const fragment = document.createDocumentFragment();
  for (const result of results) {
    const diff = diffs[result.item.index];
    const item = document.createElement('div');
    item.className = 'search-overlay__result-item';
    item.setAttribute('data-block-id', result.item.blockId);

    const text = result.item.text.substring(0, 100);
    const type = document.createElement('span');
    type.className = `search-overlay__result-type result-type-${result.item.type}`;
    type.textContent = result.item.type;

    const content = document.createElement('span');
    content.className = 'search-overlay__result-text';
    content.textContent = text;

    item.appendChild(type);
    item.appendChild(content);

    item.addEventListener('click', () => {
      highlightResult(result, diffs);
    });

    fragment.appendChild(item);
  }

  container.appendChild(fragment);
}

/**
 * Highlight a specific result
 */
function highlightResult(result: any, diffs: BlockDiff[]): void {
  clearAllHighlights();

  const diff = diffs[result.item.index];
  const blockId = result.item.blockId;

  // Scroll to block
  const blockEl = document.querySelector(`[data-block-id="${blockId}"]`);
  if (blockEl) {
    blockEl.classList.add('search-overlay__highlight');
    blockEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  // Highlight result item
  document.querySelectorAll('.search-overlay__result-item').forEach((item) => {
    item.classList.remove('search-overlay__result-item--active');
  });

  const resultItem = document.querySelector(
    `.search-overlay__result-item[data-block-id="${blockId}"]`,
  );
  if (resultItem) {
    resultItem.classList.add('search-overlay__result-item--active');
  }
}

/**
 * Clear all highlights
 */
function clearAllHighlights(): void {
  document.querySelectorAll('.search-overlay__highlight').forEach((el) => {
    el.classList.remove('search-overlay__highlight');
  });

  document.querySelectorAll('.search-overlay__result-item--active').forEach((el) => {
    el.classList.remove('search-overlay__result-item--active');
  });
}
