/**
 * Metadata diffing for headings, links, and images
 * Tracks structural changes in document organization
 */

import { DocumentModel, HeadingNode, LinkRef, ImageRef, BlockDiff } from '../types';

export interface MetadataDiff {
  headingChanges: HeadingChange[];
  linkChanges: LinkChange[];
  imageChanges: ImageChange[];
}

export interface HeadingChange {
  type: 'added' | 'deleted' | 'modified';
  level: number;
  text: string;
  oldText?: string;
}

export interface LinkChange {
  type: 'added' | 'deleted' | 'modified';
  url: string;
  label: string;
  oldUrl?: string;
  oldLabel?: string;
}

export interface ImageChange {
  type: 'added' | 'deleted' | 'modified';
  src: string;
  alt: string;
  oldSrc?: string;
  oldAlt?: string;
}

export function diffMetadata(
  leftModel: DocumentModel,
  rightModel: DocumentModel,
  blockDiffs: BlockDiff[],
): MetadataDiff {
  const headingChanges = diffHeadings(leftModel.headings, rightModel.headings);
  const linkChanges = diffLinks(leftModel.links, rightModel.links, blockDiffs);
  const imageChanges = diffImages(leftModel.images, rightModel.images, blockDiffs);

  return { headingChanges, linkChanges, imageChanges };
}

function diffHeadings(
  leftHeadings: HeadingNode[],
  rightHeadings: HeadingNode[],
): HeadingChange[] {
  const changes: HeadingChange[] = [];
  const leftMap = new Map<string, HeadingNode>();
  const rightMap = new Map<string, HeadingNode>();

  function flattenHeadings(headings: HeadingNode[], map: Map<string, HeadingNode>) {
    for (const heading of headings) {
      map.set(heading.text, heading);
      if (heading.children) {
        flattenHeadings(heading.children, map);
      }
    }
  }

  flattenHeadings(leftHeadings, leftMap);
  flattenHeadings(rightHeadings, rightMap);

  // Detect deletions
  for (const [text, heading] of leftMap) {
    if (!rightMap.has(text)) {
      changes.push({
        type: 'deleted',
        level: heading.level,
        text,
      });
    }
  }

  // Detect additions
  for (const [text, heading] of rightMap) {
    if (!leftMap.has(text)) {
      changes.push({
        type: 'added',
        level: heading.level,
        text,
      });
    }
  }

  return changes;
}

function diffLinks(
  leftLinks: LinkRef[],
  rightLinks: LinkRef[],
  blockDiffs: BlockDiff[],
): LinkChange[] {
  const changes: LinkChange[] = [];
  const leftMap = new Map<string, LinkRef>();
  const rightMap = new Map<string, LinkRef>();

  for (const link of leftLinks) {
    const key = `${link.url}|${link.label}`;
    leftMap.set(key, link);
  }

  for (const link of rightLinks) {
    const key = `${link.url}|${link.label}`;
    rightMap.set(key, link);
  }

  // Detect deletions
  for (const [key, link] of leftMap) {
    if (!rightMap.has(key)) {
      changes.push({
        type: 'deleted',
        url: link.url,
        label: link.label,
      });
    }
  }

  // Detect additions
  for (const [key, link] of rightMap) {
    if (!leftMap.has(key)) {
      changes.push({
        type: 'added',
        url: link.url,
        label: link.label,
      });
    }
  }

  return changes;
}

function diffImages(
  leftImages: ImageRef[],
  rightImages: ImageRef[],
  blockDiffs: BlockDiff[],
): ImageChange[] {
  const changes: ImageChange[] = [];
  const leftMap = new Map<string, ImageRef>();
  const rightMap = new Map<string, ImageRef>();

  for (const image of leftImages) {
    const key = image.src;
    leftMap.set(key, image);
  }

  for (const image of rightImages) {
    const key = image.src;
    rightMap.set(key, image);
  }

  // Detect deletions
  for (const [key, image] of leftMap) {
    if (!rightMap.has(key)) {
      changes.push({
        type: 'deleted',
        src: image.src,
        alt: image.alt,
      });
    }
  }

  // Detect additions
  for (const [key, image] of rightMap) {
    if (!leftMap.has(key)) {
      changes.push({
        type: 'added',
        src: image.src,
        alt: image.alt,
      });
    }
  }

  return changes;
}
