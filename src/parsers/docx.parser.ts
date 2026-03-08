import { parseHTML } from './html.parser';
import type { DocumentModel } from '../types';

export async function parseDOCX(arrayBuffer: ArrayBuffer): Promise<DocumentModel> {
  try {
    const mammoth = await import('mammoth');
    const result = await mammoth.convertToHtml({ arrayBuffer });
    return parseHTML(result.value);
  } catch (error) {
    throw new Error(`Failed to parse DOCX: ${(error as Error).message}`);
  }
}
