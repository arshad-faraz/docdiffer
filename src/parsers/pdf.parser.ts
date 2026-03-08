/**
 * PDF parser using PDF.js
 */

import type { DocumentModel, DocumentBlock } from '../types';
import { generateFingerprint } from '../utils/fingerprint';
import { uuidv4 } from '../utils/uuid';

export async function parsePDF(arrayBuffer: ArrayBuffer, fileName: string): Promise<DocumentModel> {
  // Lazy load PDF.js to minimize bundle size
  const pdfjsLib = await import('pdfjs-dist');

  // Set up worker for PDF.js
  try {
    // Try to load worker from CDN or local path
    const workerUrl = new URL(/* @vite-ignore */ 'pdfjs-dist/build/pdf.worker.min.js', import.meta.url).href;
    pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;
  } catch {
    // Fallback: worker will be loaded on demand
  }

  try {
    const pdf = await pdfjsLib.getDocument(new Uint8Array(arrayBuffer)).promise;
    const blocks: DocumentBlock[] = [];

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();

      let pageText = '';
      let lastY: number | null = null;

      // Group text by y-position (lines)
      const lines: string[] = [];
      let currentLine = '';

      for (const item of textContent.items) {
        const text = 'str' in item ? item.str : '';
        const y = 'transform' in item ? item.transform[5] : 0;

        if (lastY !== null && Math.abs(y - lastY) > 5) {
          if (currentLine.trim()) {
            lines.push(currentLine.trim());
          }
          currentLine = text;
        } else {
          currentLine += text;
        }
        lastY = y;
      }

      if (currentLine.trim()) {
        lines.push(currentLine.trim());
      }

      pageText = lines.join('\n');

      if (pageText.trim()) {
        const block: DocumentBlock = {
          id: uuidv4(),
          type: 'paragraph',
          text: pageText.trim(),
          html: `<p>${escapeHtml(pageText).replace(/\n/g, '<br>')}</p>`,
          fingerprint: generateFingerprint(pageText),
          sectionPath: [`Page ${pageNum}`],
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
      metadata: {
        pages: pdf.numPages.toString(),
      },
    };
  } catch (error) {
    throw new Error(`Failed to parse PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
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
