/**
 * Parser factory and registry
 */

import type { DocumentModel, FileFormat } from '../types';
import { parseText } from './text.parser';
import { parseHTML } from './html.parser';
import { parseDOCX } from './docx.parser';
import { parsePDF } from './pdf.parser';
import { detectFileFormat, readFile } from '../utils/file-reader';

export async function parseFile(file: File): Promise<DocumentModel> {
  const format = detectFileFormat(file);
  const content = await readFile(file);

  switch (format) {
    case 'text':
      return parseText(content as string, file.name);

    case 'html':
      return parseHTML(content as string);

    case 'docx':
      return parseDOCX(content as ArrayBuffer);

    case 'pdf':
      return parsePDF(content as ArrayBuffer, file.name);

    default:
      throw new Error(`Unsupported file format: ${format}`);
  }
}
