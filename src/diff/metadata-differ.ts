/**
 * Metadata diffing: headings, links, images
 * Independent pass separate from block diffing
 */

import type { DocumentModel } from '../types';

export interface MetadataDiff {
  headingsAdded: string[];
  headingsDeleted: string[];
  headingsModified: Array<{ old: string; new: string }>;

  linksAdded: Array<{ url: string; label: string }>;
  linksDeleted: Array<{ url: string; label: string }>;

  imagesAdded: string[];
  imagesDeleted: string[];
}

export function diffMetadata(left: DocumentModel, right: DocumentModel): MetadataDiff {
  const leftHeadings = left.headings.map((h) => h.text);
  const rightHeadings = right.headings.map((h) => h.text);

  const leftLinks = left.links.map((l) => `${l.url}|${l.label}`);
  const rightLinks = right.links.map((l) => `${l.url}|${l.label}`);

  const leftImages = left.images.map((i) => i.src);
  const rightImages = right.images.map((i) => i.src);

  return {
    headingsAdded: rightHeadings.filter((h) => !leftHeadings.includes(h)),
    headingsDeleted: leftHeadings.filter((h) => !rightHeadings.includes(h)),
    headingsModified: [],

    linksAdded: right.links.filter((l) => !leftLinks.includes(`${l.url}|${l.label}`)),
    linksDeleted: left.links.filter((l) => !rightLinks.includes(`${l.url}|${l.label}`)),

    imagesAdded: rightImages.filter((i) => !leftImages.includes(i)),
    imagesDeleted: leftImages.filter((i) => !rightImages.includes(i)),
  };
}
