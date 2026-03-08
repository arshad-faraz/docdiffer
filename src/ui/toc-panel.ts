/**
 * TOC Panel - Collapsible table of contents
 * Shows document structure with headings
 */

import type { HeadingNode } from '../types';

/**
 * Create table of contents panel
 */
export function createTOCPanel(headings: HeadingNode[]): HTMLElement {
  const panel = document.createElement('div');
  panel.className = 'toc-panel';

  const header = document.createElement('div');
  header.className = 'toc-panel__header';

  const title = document.createElement('h3');
  title.className = 'toc-panel__title';
  title.textContent = 'Table of Contents';
  header.appendChild(title);

  const collapseBtn = document.createElement('button');
  collapseBtn.className = 'toc-panel__toggle';
  collapseBtn.setAttribute('aria-label', 'Toggle table of contents');
  collapseBtn.innerHTML = '▼';

  let isCollapsed = false;
  collapseBtn.addEventListener('click', () => {
    isCollapsed = !isCollapsed;
    list.style.display = isCollapsed ? 'none' : 'block';
    collapseBtn.innerHTML = isCollapsed ? '▶' : '▼';
  });

  header.appendChild(collapseBtn);
  panel.appendChild(header);

  // Build tree view
  const list = document.createElement('ul');
  list.className = 'toc-panel__list';

  const fragment = document.createDocumentFragment();
  for (const heading of headings) {
    const item = createHeadingItem(heading);
    fragment.appendChild(item);
  }

  list.appendChild(fragment);
  panel.appendChild(list);

  return panel;
}

/**
 * Create a heading item with children
 */
function createHeadingItem(heading: HeadingNode): HTMLElement {
  const item = document.createElement('li');
  item.className = 'toc-panel__item';
  item.setAttribute('data-level', heading.level.toString());

  const link = document.createElement('a');
  link.className = 'toc-panel__link';
  link.href = `#${heading.blockId}`;
  link.textContent = heading.text;

  // Indent based on level
  link.style.paddingLeft = `${(heading.level - 1) * 16}px`;

  link.addEventListener('click', (e) => {
    e.preventDefault();
    const targetBlock = document.querySelector(`[data-block-id="${heading.blockId}"]`);
    if (targetBlock) {
      targetBlock.scrollIntoView({ behavior: 'smooth' });
      targetBlock.classList.add('toc-panel__highlight');
      setTimeout(() => {
        targetBlock.classList.remove('toc-panel__highlight');
      }, 2000);
    }
  });

  item.appendChild(link);

  // Add children if any
  if (heading.children && heading.children.length > 0) {
    const childList = document.createElement('ul');
    childList.className = 'toc-panel__sublist';

    const childFragment = document.createDocumentFragment();
    for (const child of heading.children) {
      const childItem = createHeadingItem(child);
      childFragment.appendChild(childItem);
    }

    childList.appendChild(childFragment);
    item.appendChild(childList);
  }

  return item;
}

/**
 * Create TOC panel with collapse/expand all buttons
 */
export function createTOCPanelWithControls(headings: HeadingNode[]): HTMLElement {
  const container = document.createElement('div');
  container.className = 'toc-panel-container';

  const controlsSection = document.createElement('div');
  controlsSection.className = 'toc-panel__controls';

  const expandAllBtn = document.createElement('button');
  expandAllBtn.className = 'toc-panel__control-button';
  expandAllBtn.textContent = 'Expand All';

  const collapseAllBtn = document.createElement('button');
  collapseAllBtn.className = 'toc-panel__control-button';
  collapseAllBtn.textContent = 'Collapse All';

  controlsSection.appendChild(expandAllBtn);
  controlsSection.appendChild(collapseAllBtn);
  container.appendChild(controlsSection);

  const panel = createTOCPanel(headings);
  container.appendChild(panel);

  // Add expand/collapse functionality
  expandAllBtn.addEventListener('click', () => {
    panel.querySelectorAll('.toc-panel__sublist').forEach((sublist) => {
      (sublist as HTMLElement).style.display = 'block';
    });
  });

  collapseAllBtn.addEventListener('click', () => {
    panel.querySelectorAll('.toc-panel__sublist').forEach((sublist) => {
      (sublist as HTMLElement).style.display = 'none';
    });
  });

  return container;
}
