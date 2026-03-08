/**
 * Metadata Panel - Shows structural changes in headings, links, images
 * Displays document structure differences
 */

import type { DocumentModel } from '../types';

interface MetadataChange {
  type: 'added' | 'deleted' | 'modified';
  category: 'heading' | 'link' | 'image';
  oldValue?: string;
  newValue?: string;
  location?: string;
}

/**
 * Create metadata panel
 */
export function createMetadataPanel(leftModel: DocumentModel, rightModel: DocumentModel): HTMLElement {
  const container = document.createElement('div');
  container.className = 'metadata-panel';

  // Compute changes
  const changes = computeMetadataChanges(leftModel, rightModel);

  // Headings section
  const headingsSection = createMetadataSection(
    'Headings',
    changes.filter(c => c.category === 'heading'),
  );
  container.appendChild(headingsSection);

  // Links section
  const linksSection = createMetadataSection(
    'Links',
    changes.filter(c => c.category === 'link'),
  );
  container.appendChild(linksSection);

  // Images section
  const imagesSection = createMetadataSection(
    'Images',
    changes.filter(c => c.category === 'image'),
  );
  container.appendChild(imagesSection);

  // Global metadata section
  const globalSection = createGlobalMetadataSection(leftModel, rightModel);
  container.appendChild(globalSection);

  return container;
}

/**
 * Create a metadata section with changes
 */
function createMetadataSection(title: string, changes: MetadataChange[]): HTMLElement {
  const section = document.createElement('div');
  section.className = 'metadata-section';

  const header = document.createElement('div');
  header.className = 'metadata-section__header';
  header.innerHTML = `
    <h3 class="metadata-section__title">${title}</h3>
    <span class="metadata-section__count">${changes.length}</span>
  `;
  section.appendChild(header);

  if (changes.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'metadata-section__empty';
    empty.textContent = 'No changes';
    section.appendChild(empty);
    return section;
  }

  const list = document.createElement('ul');
  list.className = 'metadata-section__list';

  for (const change of changes) {
    const item = document.createElement('li');
    item.className = `metadata-section__item metadata-section__item--${change.type}`;

    const typeLabel = document.createElement('span');
    typeLabel.className = 'metadata-section__type';
    typeLabel.textContent = change.type.toUpperCase();

    const content = document.createElement('span');
    content.className = 'metadata-section__content';

    if (change.type === 'added') {
      content.innerHTML = `<strong>${change.newValue}</strong>`;
    } else if (change.type === 'deleted') {
      content.innerHTML = `<strong>${change.oldValue}</strong>`;
    } else {
      content.innerHTML = `<strong>${change.oldValue}</strong> → <strong>${change.newValue}</strong>`;
    }

    item.appendChild(typeLabel);
    item.appendChild(content);

    if (change.location) {
      const location = document.createElement('span');
      location.className = 'metadata-section__location';
      location.textContent = change.location;
      item.appendChild(location);
    }

    list.appendChild(item);
  }

  section.appendChild(list);
  return section;
}

/**
 * Create global metadata section
 */
function createGlobalMetadataSection(leftModel: DocumentModel, rightModel: DocumentModel): HTMLElement {
  const section = document.createElement('div');
  section.className = 'metadata-section';

  const header = document.createElement('div');
  header.className = 'metadata-section__header';
  header.innerHTML = '<h3 class="metadata-section__title">Document Metadata</h3>';
  section.appendChild(header);

  const grid = document.createElement('div');
  grid.className = 'metadata-grid';

  // Title
  const titleRow = createMetadataRow('Title', leftModel.title, rightModel.title);
  grid.appendChild(titleRow);

  // Block count
  const blockRow = createMetadataRow(
    'Blocks',
    leftModel.blocks.length.toString(),
    rightModel.blocks.length.toString(),
  );
  grid.appendChild(blockRow);

  // Heading count
  const headingRow = createMetadataRow(
    'Headings',
    leftModel.headings.length.toString(),
    rightModel.headings.length.toString(),
  );
  grid.appendChild(headingRow);

  // Link count
  const linkRow = createMetadataRow(
    'Links',
    leftModel.links.length.toString(),
    rightModel.links.length.toString(),
  );
  grid.appendChild(linkRow);

  // Image count
  const imageRow = createMetadataRow(
    'Images',
    leftModel.images.length.toString(),
    rightModel.images.length.toString(),
  );
  grid.appendChild(imageRow);

  section.appendChild(grid);
  return section;
}

/**
 * Create a single metadata row
 */
function createMetadataRow(label: string, leftValue: string, rightValue: string): HTMLElement {
  const row = document.createElement('div');
  row.className = 'metadata-row';

  const labelEl = document.createElement('span');
  labelEl.className = 'metadata-row__label';
  labelEl.textContent = label;

  const leftEl = document.createElement('span');
  leftEl.className = 'metadata-row__value metadata-row__value--left';
  leftEl.textContent = leftValue;

  const rightEl = document.createElement('span');
  rightEl.className = 'metadata-row__value metadata-row__value--right';
  rightEl.textContent = rightValue;

  row.appendChild(labelEl);
  row.appendChild(leftEl);
  row.appendChild(rightEl);

  return row;
}

/**
 * Compute metadata changes between two documents
 */
function computeMetadataChanges(leftModel: DocumentModel, rightModel: DocumentModel): MetadataChange[] {
  const changes: MetadataChange[] = [];

  // Heading changes
  const leftHeadings = new Set(leftModel.headings.map(h => h.text));
  const rightHeadings = new Set(rightModel.headings.map(h => h.text));

  leftHeadings.forEach(heading => {
    if (!rightHeadings.has(heading)) {
      changes.push({
        type: 'deleted',
        category: 'heading',
        oldValue: heading,
      });
    }
  });

  rightHeadings.forEach(heading => {
    if (!leftHeadings.has(heading)) {
      changes.push({
        type: 'added',
        category: 'heading',
        newValue: heading,
      });
    }
  });

  // Link changes
  const leftLinks = new Set(leftModel.links.map(l => l.url));
  const rightLinks = new Set(rightModel.links.map(l => l.url));

  leftLinks.forEach(url => {
    if (!rightLinks.has(url)) {
      const link = leftModel.links.find(l => l.url === url);
      changes.push({
        type: 'deleted',
        category: 'link',
        oldValue: `${link?.label} (${url})`,
      });
    }
  });

  rightLinks.forEach(url => {
    if (!leftLinks.has(url)) {
      const link = rightModel.links.find(l => l.url === url);
      changes.push({
        type: 'added',
        category: 'link',
        newValue: `${link?.label} (${url})`,
      });
    }
  });

  // Image changes
  const leftImages = new Set(leftModel.images.map(i => i.src));
  const rightImages = new Set(rightModel.images.map(i => i.src));

  leftImages.forEach(src => {
    if (!rightImages.has(src)) {
      changes.push({
        type: 'deleted',
        category: 'image',
        oldValue: src,
      });
    }
  });

  rightImages.forEach(src => {
    if (!leftImages.has(src)) {
      changes.push({
        type: 'added',
        category: 'image',
        newValue: src,
      });
    }
  });

  return changes;
}
