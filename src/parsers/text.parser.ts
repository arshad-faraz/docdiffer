import { generateFingerprint } from '../utils/fingerprint';
import { uuidv4 } from '../utils/uuid';
import type { DocumentModel, DocumentBlock } from '../types';

export function parseText(content: string, fileName: string): DocumentModel {
  const blocks: DocumentBlock[] = [];
  const lines = content.split('\n');
  let currentParagraph: string[] = [];

  for (const line of lines) {
    if (line.trim() === '') {
      if (currentParagraph.length > 0) {
        const text = currentParagraph.join('\n').trim();
        if (text) {
          blocks.push({
            id: uuidv4(),
            type: 'paragraph',
            text,
            html: `<p>${escapeHtml(text).replace(/\n/g, '<br>')}</p>`,
            fingerprint: generateFingerprint(text),
            sectionPath: [],
          });
        }
        currentParagraph = [];
      }
    } else {
      currentParagraph.push(line);
    }
  }

  if (currentParagraph.length > 0) {
    const text = currentParagraph.join('\n').trim();
    if (text) {
      blocks.push({
        id: uuidv4(),
        type: 'paragraph',
        text,
        html: `<p>${escapeHtml(text).replace(/\n/g, '<br>')}</p>`,
        fingerprint: generateFingerprint(text),
        sectionPath: [],
      });
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
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (c) => map[c]);
}
