/**
 * HTML and Confluence export parser
 */

import DOMPurify from 'dompurify';
import { generateFingerprint } from '../utils/fingerprint';
import { uuidv4 } from '../utils/uuid';
import { DocumentModel, DocumentBlock, HeadingNode, LinkRef, ImageRef } from '../types';

export function parseHTML(content: string): DocumentModel {
  // Clean up Confluence noise
  let cleaned = removeConfluenceNoise(content);

  // Create DOM parser
  const parser = new DOMParser();
  const doc = parser.parseFromString(cleaned, 'text/html');

  const blocks: DocumentBlock[] = [];
  const headings: HeadingNode[] = [];
  const links: LinkRef[] = [];
  const images: ImageRef[] = [];
  let title = 'Untitled Document';

  // Extract title
  const titleEl = doc.querySelector('title');
  if (titleEl) {
    title = titleEl.textContent || title;
  }

  // Process content
  const bodyContent = doc.body;
  if (bodyContent) {
    const result = processElements(bodyContent, []);
    blocks.push(...result.blocks);
    headings.push(...result.headings);
    links.push(...result.links);
    images.push(...result.images);
  }

  return {
    title,
    blocks,
    headings,
    links,
    images,
    tables: extractTables(),
    metadata: extractMetadata(doc),
  };
}

interface ProcessResult {
  blocks: DocumentBlock[];
  headings: HeadingNode[];
  links: LinkRef[];
  images: ImageRef[];
}

function processElements(parent: Element, sectionPath: string[]): ProcessResult {
  const blocks: DocumentBlock[] = [];
  const headings: HeadingNode[] = [];
  const links: LinkRef[] = [];
  const images: ImageRef[] = [];

  for (const child of Array.from(parent.children)) {
    const tagName = child.tagName.toLowerCase();

    // Skip navigation and footer noise
    if (
      child.id === 'breadcrumb-section' ||
      child.id === 'footer' ||
      child.id === 'navigation'
    ) {
      continue;
    }

    // Process headings
    if (tagName.match(/^h[1-6]$/)) {
      const level = parseInt(tagName[1]);
      const text = child.textContent || '';
      const blockId = uuidv4();

      const heading: HeadingNode = {
        id: blockId,
        level,
        text,
        blockId,
        children: [],
      };
      headings.push(heading);

      const block: DocumentBlock = {
        id: blockId,
        type: 'heading',
        level,
        text,
        html: child.innerHTML,
        fingerprint: generateFingerprint(text),
        sectionPath,
      };
      blocks.push(block);

      // Update section path
      sectionPath = [...sectionPath.slice(0, level - 1), text];
    }

    // Process paragraphs
    else if (tagName === 'p' && (child.textContent || child.querySelector('img'))) {
      const text = extractTextContent(child);
      if (text) {
        const blockId = uuidv4();
        const block: DocumentBlock = {
          id: blockId,
          type: 'paragraph',
          text,
          html: DOMPurify.sanitize(child.innerHTML),
          fingerprint: generateFingerprint(text),
          sectionPath,
        };
        blocks.push(block);

        // Extract links from paragraph
        const pLinks = child.querySelectorAll('a');
        for (const link of pLinks) {
          const href = link.getAttribute('href');
          const label = link.textContent || '';
          if (href && label) {
            links.push({
              url: href,
              label,
              blockId,
            });
          }
        }

        // Extract images from paragraph
        const pImages = child.querySelectorAll('img');
        for (const img of pImages) {
          const src = img.getAttribute('src') || '';
          const alt = img.getAttribute('alt') || '';
          if (src) {
            images.push({
              src,
              alt,
              blockId,
            });
          }
        }
      }
    }

    // Process lists
    else if ((tagName === 'ul' || tagName === 'ol') && child.textContent?.trim()) {
      const text = extractTextContent(child);
      if (text) {
        const block: DocumentBlock = {
          id: uuidv4(),
          type: 'list',
          text,
          html: DOMPurify.sanitize(child.innerHTML),
          fingerprint: generateFingerprint(text),
          sectionPath,
        };
        blocks.push(block);
      }
    }

    // Process code blocks
    else if (tagName === 'pre' && child.textContent?.trim()) {
      const text = child.textContent;
      const block: DocumentBlock = {
        id: uuidv4(),
        type: 'code',
        text,
        html: `<pre>${DOMPurify.sanitize(child.innerHTML)}</pre>`,
        fingerprint: generateFingerprint(text),
        sectionPath,
      };
      blocks.push(block);
    }

    // Process tables
    else if (tagName === 'table' && child.textContent?.trim()) {
      const text = extractTextContent(child);
      if (text) {
        const block: DocumentBlock = {
          id: uuidv4(),
          type: 'table',
          text,
          html: DOMPurify.sanitize(child.innerHTML),
          fingerprint: generateFingerprint(text),
          sectionPath,
        };
        blocks.push(block);
      }
    }

    // Process Confluence macros
    else if (tagName === 'ac:structured-macro') {
      const result = processConfluenceMacro(child, sectionPath);
      blocks.push(...result.blocks);
      images.push(...result.images);
    }

    // Recursively process other elements
    else if (
      ['div', 'section', 'article', 'main'].includes(tagName) &&
      !child.querySelector('h1, h2, h3, h4, h5, h6, p, ul, ol, table, pre')
    ) {
      const result = processElements(child, sectionPath);
      blocks.push(...result.blocks);
      headings.push(...result.headings);
      links.push(...result.links);
      images.push(...result.images);
    }
  }

  return { blocks, headings, links, images };
}

function processConfluenceMacro(element: Element, sectionPath: string[]): ProcessResult {
  const blocks: DocumentBlock[] = [];
  const images: ImageRef[] = [];

  const macroName = element.getAttribute('ac:name') || 'unknown';

  // Skip TOC and navigation macros
  if (['toc', 'recently-updated', 'children'].includes(macroName)) {
    return { blocks, headings: [], links: [], images };
  }

  // Preserve code/warning/info/note/tip/expand macros as blocks
  if (['code', 'warning', 'info', 'note', 'tip', 'expand'].includes(macroName)) {
    const text = extractTextContent(element);
    if (text) {
      const block: DocumentBlock = {
        id: uuidv4(),
        type: 'macro',
        text,
        html: element.innerHTML,
        fingerprint: generateFingerprint(text),
        sectionPath,
      };
      blocks.push(block);
    }
  }

  return { blocks, headings: [], links: [], images };
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
        const alt = el.getAttribute('alt') || '[image]';
        parts.push(alt);
      } else {
        parts.push(extractTextContent(el));
      }
    }
  }

  return parts.join(' ').replace(/\s+/g, ' ').trim();
}

function removeConfluenceNoise(html: string): string {
  let cleaned = html;

  // Remove navigation elements
  cleaned = cleaned.replace(/<[^>]*id="breadcrumb-section"[^>]*>[\s\S]*?<\/[^>]*>/gi, '');
  cleaned = cleaned.replace(/<[^>]*id="footer"[^>]*>[\s\S]*?<\/[^>]*>/gi, '');
  cleaned = cleaned.replace(/<[^>]*id="navigation"[^>]*>[\s\S]*?<\/[^>]*>/gi, '');

  // Remove Confluence TOC and recently-updated macros
  cleaned = cleaned.replace(
    /<ac:structured-macro[^>]*ac:name="toc"[^>]*>[\s\S]*?<\/ac:structured-macro>/gi,
    ''
  );
  cleaned = cleaned.replace(
    /<ac:structured-macro[^>]*ac:name="recently-updated"[^>]*>[\s\S]*?<\/ac:structured-macro>/gi,
    ''
  );
  cleaned = cleaned.replace(
    /<ac:structured-macro[^>]*ac:name="children"[^>]*>[\s\S]*?<\/ac:structured-macro>/gi,
    ''
  );

  // Replace ac:link with plain text
  cleaned = cleaned.replace(/<ac:link[^>]*>[\s\S]*?<ac:link-body>([^<]*)<\/ac:link-body>[\s\S]*?<\/ac:link>/gi, '$1');

  // Remove emoticons
  cleaned = cleaned.replace(/<ac:emoticon[^>]*\/>/gi, '');

  return cleaned;
}

function extractTables(): Array<any> {
  // Placeholder for table extraction
  return [];
}

function extractMetadata(doc: Document): Record<string, string> {
  const metadata: Record<string, string> = {};

  // Extract meta tags
  for (const meta of doc.querySelectorAll('meta')) {
    const name = meta.getAttribute('name') || meta.getAttribute('property');
    const content = meta.getAttribute('content');
    if (name && content) {
      metadata[name] = content;
    }
  }

  return metadata;
}
