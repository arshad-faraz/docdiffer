/**
 * Text normalization utilities
 * Removes whitespace, Confluence artifacts, and other noise
 */

export function normalizeText(text: string): string {
  // Remove HTML tags and entities
  let normalized = text
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

  // Remove Confluence-specific noise
  normalized = removeConfluenceArtifacts(normalized);

  // Collapse multiple whitespace to single space
  normalized = normalized.replace(/\s+/g, ' ').trim();

  return normalized;
}

function removeConfluenceArtifacts(text: string): string {
  // Remove Confluence macro markers
  text = text
    .replace(/\{[a-z-]+[^}]*\}/gi, ' ') // {macro-name ...}
    .replace(/\[~.*?\]/g, ' ') // [~user] mentions
    .replace(/\{panel[^}]*\}/gi, ' ')
    .replace(/\{code[^}]*\}/gi, ' ')
    .replace(/\{warning[^}]*\}/gi, ' ')
    .replace(/\{info[^}]*\}/gi, ' ')
    .replace(/\{note[^}]*\}/gi, ' ')
    .replace(/\{tip[^}]*\}/gi, ' ')
    .replace(/\{expand[^}]*\}/gi, ' ')
    .replace(/\{expand\}/gi, ' ')
    .replace(/\{children[^}]*\}/gi, ' ')
    .replace(/\{toc[^}]*\}/gi, ' ');

  // Remove emoticons
  text = text.replace(/:[a-z-]+:/gi, ' ');

  return text;
}

export function normalizeForComparison(text: string): string {
  // Case-insensitive comparison
  return normalizeText(text).toLowerCase();
}
