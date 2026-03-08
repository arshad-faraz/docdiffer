/**
 * Plain text parser
 */

import { generateFingerprint } from '../utils/fingerprint';
import { uuidv4 } from '../utils/uuid';
import { DocumentModel, DocumentBlock } from '../types';

export function parseText(content: string, fileName: string): DocumentModel {
  const blocks: DocumentBlock[] = [];
  const lines = content.split('\n');

  let currentParagraph: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Empty line marks paragraph boundary
    if (line.trim() === '') {
      if (currentParagraph.length > 0) {
        const text = currentParagraph.join('\n').trim();
        if (text) {
          const block: DocumentBlock = {
            id: uuidv4(),
            type: 'paragraph',
            text,
            html: `<p>${escapeHtml(text).replace(/\n/g, '<br>')}</p>`,
            fingerprint: generateFingerprint(text),
            sectionPath: [],
          };
          blocks.push(block);
        }
        currentParagraph = [];
      }
    } else {
      currentParagraph.push(line);
    }
  }

  // Don't forget last paragraph
  if (currentParagraph.length > 0) {
    const text = currentParagraph.join('\n').trim();
    if (text) {
      const block: DocumentBlock = {
        id: uuidv4(),
        type: 'paragraph',
        text,
        html: `<p>${escapeHtml(text).replace(/\n/g, '<br>')}</p>`,
        fingerprint: generateFingerprint(text),
        sectionPath: [],
      };
      blocks.push(block);
    }
  }

  return {
    title: fileName,
    blocks,
    headings: [],
    links: [],
    images: [],
    tables: [],
    metadata: {},
  };
}

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (c) => map[c]);
}
