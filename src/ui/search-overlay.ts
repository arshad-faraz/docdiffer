/**
 * Search overlay using Fuse.js for fuzzy search
 */

import Fuse from 'fuse.js';
import type { BlockDiff } from '../types';

export function createSearchOverlay(diffs: BlockDiff[]): HTMLElement {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.style.display = 'none';

  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.style.minWidth = '500px';

  // Header
  const header = document.createElement('div');
  header.className = 'modal-header';

  const title = document.createElement('h2');
  title.className = 'modal-title';
  title.textContent = 'Search Changes';
  title.style.margin = '0';
  header.appendChild(title);

  const closeBtn = document.createElement('button');
  closeBtn.className = 'modal-close';
  closeBtn.textContent = '×';
  closeBtn.addEventListener('click', () => {
    overlay.style.display = 'none';
  });
  header.appendChild(closeBtn);

  // Body
  const body = document.createElement('div');
  body.className = 'modal-body';

  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'search-input';
  input.placeholder = 'Type to search...';
  input.style.width = '100%';
  input.style.marginBottom = 'var(--spacing-md)';
  body.appendChild(input);

  const results = document.createElement('div');
  results.style.maxHeight = '400px';
  results.style.overflowY = 'auto';
  body.appendChild(results);

  // Initialize Fuse.js
  const searchItems = diffs
    .filter((d) => d.left || d.right)
    .map((diff) => {
      const text = (diff.left?.text || '') + ' ' + (diff.right?.text || '');
      return {
        text,
        type: diff.type,
        id: (diff.left?.id || diff.right?.id || ''),
      };
    });

  const fuse = new Fuse(searchItems, {
    keys: ['text'],
    threshold: 0.3,
  });

  // Search handler
  input.addEventListener('input', () => {
    const query = input.value;
    results.innerHTML = '';

    if (!query) {
      results.innerHTML = '<p style="color: var(--text-secondary); font-size: var(--font-size-sm);">Start typing to search...</p>';
      return;
    }

    const searchResults = fuse.search(query);

    if (searchResults.length === 0) {
      results.innerHTML = '<p style="color: var(--text-secondary); font-size: var(--font-size-sm);">No results found</p>';
      return;
    }

    for (const result of searchResults) {
      const resultEl = document.createElement('div');
      resultEl.style.padding = 'var(--spacing-md)';
      resultEl.style.borderBottom = '1px solid var(--border)';
      resultEl.style.cursor = 'pointer';
      resultEl.addEventListener('mouseenter', () => {
        resultEl.style.background = 'var(--bg-surface)';
      });
      resultEl.addEventListener('mouseleave', () => {
        resultEl.style.background = 'transparent';
      });
      resultEl.addEventListener('click', () => {
        const blockEl = document.getElementById(result.item.id);
        if (blockEl) {
          blockEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
          blockEl.style.boxShadow = '0 0 0 3px var(--move-border)';
          setTimeout(() => {
            blockEl.style.boxShadow = 'none';
          }, 2000);
        }
        overlay.style.display = 'none';
      });

      const badge = document.createElement('span');
      badge.className = `badge badge-${result.item.type}`;
      badge.textContent = result.item.type.toUpperCase();
      resultEl.appendChild(badge);

      const text = document.createElement('div');
      text.style.marginTop = 'var(--spacing-sm)';
      text.style.fontSize = 'var(--font-size-sm)';
      text.style.color = 'var(--text-secondary)';
      text.textContent = result.item.text.substring(0, 100);
      resultEl.appendChild(text);

      results.appendChild(resultEl);
    }
  });

  // Focus input on open
  const show = () => {
    overlay.style.display = 'flex';
    input.focus();
    input.value = '';
    results.innerHTML = '<p style="color: var(--text-secondary); font-size: var(--font-size-sm);">Start typing to search...</p>';
  };

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      overlay.style.display = 'none';
    }
  });

  modal.appendChild(header);
  modal.appendChild(body);
  overlay.appendChild(modal);

  // Export show method
  (overlay as any).show = show;

  return overlay;
}
