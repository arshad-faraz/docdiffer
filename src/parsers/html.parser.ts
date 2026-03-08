import DOMPurify from 'dompurify';
import { generateFingerprint } from '../utils/fingerprint';
import { uuidv4 } from '../utils/uuid';
import type { DocumentModel, DocumentBlock } from '../types';

export function parseHTML(content: string): DocumentModel {
  let cleaned = removeConfluenceNoise(content);
  const parser = new DOMParser();
  const doc = parser.parseFromString(cleaned, 'text/html');

  const blocks: DocumentBlock[] = [];
  const headings = [];
  const links = [];
  const images = [];
  let title = 'Untitled Document';

  const titleEl = doc.querySelector('title');
  if (titleEl) title = titleEl.textContent || title;

  const bodyContent = doc.body;
  if (bodyContent) {
    const result = processElements(bodyContent, []);
    blocks.push(...result.blocks);
    headings.push(...result.headings);
    links.push(...result.links);
    images.push(...result.images);
  }

  return { title, blocks, headings, links, images, tables: [], metadata: {} };
}

function processElements(parent: Element, sectionPath: string[]): any {
  const blocks: DocumentBlock[] = [];
  const headings = [];
  const links = [];
  const images = [];

  for (const child of Array.from(parent.children)) {
    const tagName = child.tagName.toLowerCase();

    if (tagName.match(/^h[1-6]$/)) {
      const level = parseInt(tagName[1]);
      const text = child.textContent || '';
      const blockId = uuidv4();
      blocks.push({
        id: blockId,
        type: 'heading',
        level,
        text,
        html: child.innerHTML,
        fingerprint: generateFingerprint(text),
        sectionPath,
      });
      sectionPath = [...sectionPath.slice(0, level - 1), text];
    } else if (tagName === 'p' && (child.textContent || child.querySelector('img'))) {
      const text = extractTextContent(child);
      if (text) {
        const blockId = uuidv4();
        blocks.push({
          id: blockId,
          type: 'paragraph',
          text,
          html: DOMPurify.sanitize(child.innerHTML),
          fingerprint: generateFingerprint(text),
          sectionPath,
        });

        for (const link of child.querySelectorAll('a')) {
          const href = link.getAttribute('href');
          const label = link.textContent || '';
          if (href && label) links.push({ url: href, label, blockId });
        }

        for (const img of child.querySelectorAll('img')) {
          const src = img.getAttribute('src') || '';
          const alt = img.getAttribute('alt') || '';
          if (src) images.push({ src, alt, blockId });
        }
      }
    } else if ((tagName === 'ul' || tagName === 'ol') && child.textContent?.trim()) {
      const text = extractTextContent(child);
      if (text) {
        blocks.push({
          id: uuidv4(),
          type: 'list',
          text,
          html: DOMPurify.sanitize(child.innerHTML),
          fingerprint: generateFingerprint(text),
          sectionPath,
        });
      }
    } else if (tagName === 'pre' && child.textContent?.trim()) {
      blocks.push({
        id: uuidv4(),
        type: 'code',
        text: child.textContent,
        html: `<pre>${DOMPurify.sanitize(child.innerHTML)}</pre>`,
        fingerprint: generateFingerprint(child.textContent),
        sectionPath,
      });
    } else if (['div', 'section', 'article'].includes(tagName)) {
      const result = processElements(child, sectionPath);
      blocks.push(...result.blocks);
      headings.push(...result.headings);
      links.push(...result.links);
      images.push(...result.images);
    }
  }

  return { blocks, headings, links, images };
}

function extractTextContent(element: Element): string {
  const parts: string[] = [];
  for (const node of element.childNodes) {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = (node as Text).textContent?.trim();
      if (text) parts.push(text);
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as Element;
      if (el.tagName.toLowerCase() === 'img') {
        parts.push(el.getAttribute('alt') || '[image]');
      } else {
        parts.push(extractTextContent(el));
      }
    }
  }
  return parts.join(' ').replace(/\s+/g, ' ').trim();
}

function removeConfluenceNoise(html: string): string {
  let cleaned = html;
  cleaned = cleaned.replace(/<[^>]*id="breadcrumb-section"[^>]*>[\s\S]*?<\/[^>]*>/gi, '');
  cleaned = cleaned.replace(/<[^>]*id="footer"[^>]*>[\s\S]*?<\/[^>]*>/gi, '');
  cleaned = cleaned.replace(/<[^>]*id="navigation"[^>]*>[\s\S]*?<\/[^>]*>/gi, '');
  cleaned = cleaned.replace(/<ac:structured-macro[^>]*ac:name="toc"[^>]*>[\s\S]*?<\/ac:structured-macro>/gi, '');
  return cleaned;
}
