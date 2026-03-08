/**
 * Metadata panel showing structural changes (headings, links, images)
 */

import type { DocumentModel } from '../types';

export function createMetadataPanel(
  leftModel: DocumentModel,
  rightModel: DocumentModel
): HTMLElement {
  const panel = document.createElement('div');
  panel.className = 'metadata-panel';
  panel.style.padding = 'var(--spacing-lg)';
  panel.style.overflowY = 'auto';

  // Headings
  const headingsSection = createSection('Headings');
  const headingsContent = createMetadataComparison(
    leftModel.headings.map((h) => h.text),
    rightModel.headings.map((h) => h.text)
  );
  headingsSection.appendChild(headingsContent);
  panel.appendChild(headingsSection);

  // Links
  const linksSection = createSection('Links');
  const linksContent = document.createElement('div');
  const leftLinks = leftModel.links.map((l) => `${l.label} (${l.url})`);
  const rightLinks = rightModel.links.map((l) => `${l.label} (${l.url})`);
  const linksComparison = createMetadataComparison(leftLinks, rightLinks);
  linksSection.appendChild(linksComparison);
  panel.appendChild(linksSection);

  // Images
  const imagesSection = createSection('Images');
  const leftImages = leftModel.images.map((i) => i.alt || i.src);
  const rightImages = rightModel.images.map((i) => i.alt || i.src);
  const imagesComparison = createMetadataComparison(leftImages, rightImages);
  imagesSection.appendChild(imagesComparison);
  panel.appendChild(imagesSection);

  return panel;
}

function createSection(title: string): HTMLElement {
  const div = document.createElement('div');
  div.style.marginBottom = 'var(--spacing-lg)';

  const h3 = document.createElement('h3');
  h3.style.marginTop = '0';
  h3.textContent = title;
  div.appendChild(h3);

  return div;
}

function createMetadataComparison(left: string[], right: string[]): HTMLElement {
  const container = document.createElement('div');
  container.style.display = 'grid';
  container.style.gridTemplateColumns = '1fr 1fr';
  container.style.gap = 'var(--spacing-lg)';

  // Left column
  const leftCol = document.createElement('div');
  const leftTitle = document.createElement('h4');
  leftTitle.textContent = 'Removed';
  leftTitle.style.color = 'var(--delete-text)';
  leftCol.appendChild(leftTitle);

  for (const item of left) {
    if (!right.includes(item)) {
      const el = document.createElement('div');
      el.className = 'badge badge-delete';
      el.style.marginBottom = 'var(--spacing-sm)';
      el.textContent = item;
      leftCol.appendChild(el);
    }
  }

  // Right column
  const rightCol = document.createElement('div');
  const rightTitle = document.createElement('h4');
  rightTitle.textContent = 'Added';
  rightTitle.style.color = 'var(--add-text)';
  rightCol.appendChild(rightTitle);

  for (const item of right) {
    if (!left.includes(item)) {
      const el = document.createElement('div');
      el.className = 'badge badge-add';
      el.style.marginBottom = 'var(--spacing-sm)';
      el.textContent = item;
      rightCol.appendChild(el);
    }
  }

  container.appendChild(leftCol);
  container.appendChild(rightCol);

  return container;
}
