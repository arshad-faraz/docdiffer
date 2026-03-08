/**
 * Table of contents panel
 */

import type { HeadingNode } from '../types';

export function createTOCPanel(headings: HeadingNode[]): HTMLElement {
  const panel = document.createElement('div');
  panel.className = 'toc-panel';

  const title = document.createElement('div');
  title.className = 'toc-title';
  title.textContent = 'Contents';
  panel.appendChild(title);

  if (headings.length === 0) {
    const empty = document.createElement('p');
    empty.style.fontSize = 'var(--font-size-sm)';
    empty.style.color = 'var(--text-secondary)';
    empty.textContent = 'No headings';
    panel.appendChild(empty);
    return panel;
  }

  const list = document.createElement('ul');
  list.className = 'toc-list';

  function renderHeadings(nodes: HeadingNode[], depth: number = 0): HTMLUListElement {
    const ul = document.createElement('ul');
    ul.className = depth > 0 ? 'toc-children' : 'toc-list';

    for (const node of nodes) {
      const li = document.createElement('li');
      li.className = 'toc-item';

      const link = document.createElement('a');
      link.className = 'toc-link';

      if (node.children.length > 0) {
        const toggle = document.createElement('span');
        toggle.className = 'toc-toggle expanded';
        toggle.textContent = '▶';
        link.appendChild(toggle);
      }

      const text = document.createElement('span');
      text.textContent = node.text;
      link.appendChild(text);

      link.addEventListener('click', (e) => {
        e.preventDefault();
        const blockEl = document.getElementById(node.blockId);
        if (blockEl) {
          blockEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });

      li.appendChild(link);

      if (node.children.length > 0) {
        const childrenUl = renderHeadings(node.children, depth + 1);
        li.appendChild(childrenUl);

        const toggleButton = link.querySelector('.toc-toggle') as HTMLElement;
        if (toggleButton) {
          toggleButton.addEventListener('click', (e: Event) => {
            e.preventDefault();
            e.stopPropagation();
            toggleButton.classList.toggle('expanded');
            childrenUl.classList.toggle('hidden');
          });
        }
      }

      ul.appendChild(li);
    }

    return ul;
  }

  panel.appendChild(renderHeadings(headings));

  return panel;
}
