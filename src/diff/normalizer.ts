/**
 * DocumentModel normalization
 * - Collapses excessive whitespace
 * - Removes Confluence noise
 * - Normalizes text for reliable diffing
 */

import type { DocumentModel, DocumentBlock } from '../types';

export function normalizeModel(model: DocumentModel): DocumentModel {
  return {
    ...model,
    blocks: model.blocks.map(normalizeBlock),
  };
}

function normalizeBlock(block: DocumentBlock): DocumentBlock {
  const normalizedText = normalizeText(block.text);

  return {
    ...block,
    text: normalizedText,
  };
}

function normalizeText(text: string): string {
  // Collapse multiple spaces/newlines
  let normalized = text
    .replace(/\s+/g, ' ')
    .trim();

  // Remove common Confluence/HTML artifacts
  normalized = normalized
    .replace(/^\[edit\]/i, '')
    .replace(/\[collapse\]/gi, '')
    .replace(/\[expand\]/gi, '')
    .replace(/\[\+\]/g, '')
    .replace(/\[-\]/g, '');

  // Remove zero-width characters and other invisible Unicode
  normalized = normalized.replace(/[\u200B-\u200D\uFEFF]/g, '');

  // Normalize quotes
  normalized = normalized
    .replace(/[""]/g, '"')
    .replace(/['']/g, "'");

  return normalized.trim();
}
