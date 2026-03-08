import type { DocumentModel, DocumentBlock } from '../types';
import { generateFingerprint } from '../utils/fingerprint';
import { uuidv4 } from '../utils/uuid';

export async function parsePDF(arrayBuffer: ArrayBuffer, fileName: string): Promise<DocumentModel> {
  const pdfjsLib = await import('pdfjs-dist');

  try {
    if (pdfjsLib.GlobalWorkerOptions) {
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
    }

    const pdf = await pdfjsLib.getDocument(new Uint8Array(arrayBuffer)).promise;
    const blocks: DocumentBlock[] = [];

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();

      const lines: string[] = [];
      let currentLine = '';
      let lastY: number | null = null;

      for (const item of textContent.items) {
        const text = 'str' in item ? item.str : '';
        const y = 'transform' in item ? item.transform[5] : 0;

        if (lastY !== null && Math.abs(y - lastY) > 5) {
          if (currentLine.trim()) lines.push(currentLine.trim());
          currentLine = text;
        } else {
          currentLine += text;
        }
        lastY = y;
      }

      if (currentLine.trim()) lines.push(currentLine.trim());

      const pageText = lines.join('\n');
      if (pageText.trim()) {
        blocks.push({
          id: uuidv4(),
          type: 'paragraph',
          text: pageText.trim(),
          html: `<p>${escapeHtml(pageText).replace(/\n/g, '<br>')}</p>`,
          fingerprint: generateFingerprint(pageText),
          sectionPath: [`Page ${pageNum}`],
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
      metadata: { pages: pdf.numPages.toString() },
    };
  } catch (error) {
    throw new Error(`Failed to parse PDF: ${(error as Error).message}`);
  }
}

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (c) => map[c]);
}
