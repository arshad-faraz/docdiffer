/**
 * DOM to plain text extraction with structure hints
 */

export function extractPlainText(element: HTMLElement | string): string {
  const el = typeof element === 'string' ? stringToElement(element) : element;
  if (!el) return '';

  const parts: string[] = [];
  walkElements(el, parts);
  return parts.join(' ').replace(/\s+/g, ' ').trim();
}

function walkElements(node: Node, parts: string[]): void {
  if (node.nodeType === Node.TEXT_NODE) {
    const text = (node as Text).textContent?.trim();
    if (text) {
      parts.push(text);
    }
    return;
  }

  if (node.nodeType === Node.ELEMENT_NODE) {
    const el = node as HTMLElement;
    const tagName = el.tagName.toLowerCase();

    // Skip script/style tags
    if (tagName === 'script' || tagName === 'style') {
      return;
    }

    for (const child of node.childNodes) {
      walkElements(child, parts);
    }

    // Add spacing after block elements
    if (['p', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'li', 'tr', 'td', 'th'].includes(tagName)) {
      if (parts[parts.length - 1] !== '') {
        parts.push('');
      }
    }
  }
}

function stringToElement(html: string): HTMLElement | null {
  const container = document.createElement('div');
  container.innerHTML = html;
  return container.firstElementChild as HTMLElement | null;
}

/**
 * Extract section path from DOM (ancestor headings)
 */
export function extractSectionPath(element: HTMLElement): string[] {
  const path: string[] = [];
  let current = element.previousElementSibling as HTMLElement | null;

  while (current) {
    const tagName = current.tagName.toLowerCase();
    if (tagName.match(/^h[1-6]$/)) {
      const level = parseInt(tagName[1]);
      const text = extractPlainText(current);
      path.unshift(text);

      // Stop at h1
      if (level === 1) break;
    }
    current = current.previousElementSibling as HTMLElement | null;
  }

  return path;
}
