/**
 * File reading and type detection utilities
 */

import type { FileFormat } from '../types';

export async function readFile(file: File): Promise<string | ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    const format = detectFileFormat(file);
    if (format === 'pdf') {
      reader.readAsArrayBuffer(file);
    } else {
      reader.readAsText(file, 'utf-8');
    }

    reader.onload = () => resolve(reader.result as string | ArrayBuffer);
    reader.onerror = () => reject(new Error(`Failed to read file: ${file.name}`));
  });
}

export function detectFileFormat(file: File): FileFormat {
  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();

  if (name.endsWith('.pdf') || type === 'application/pdf') {
    return 'pdf';
  }

  if (
    name.endsWith('.docx') ||
    type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    return 'docx';
  }

  if (name.endsWith('.html') || name.endsWith('.htm') || type.includes('text/html')) {
    return 'html';
  }

  // Default to text
  return 'text';
}

export function isValidFileType(file: File): boolean {
  const format = detectFileFormat(file);
  return ['html', 'docx', 'pdf', 'text'].includes(format);
}

export function getFileTypeError(file: File): string | null {
  if (!isValidFileType(file)) {
    return `Unsupported file type: ${file.type || file.name.split('.').pop()}. Supported: PDF, DOCX, HTML, TXT`;
  }
  return null;
}
