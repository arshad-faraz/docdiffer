/**
 * DOCX parser using Mammoth
 */

import mammoth from 'mammoth';
import { parseHTML } from './html.parser';
import { DocumentModel } from '../types';

export async function parseDOCX(arrayBuffer: ArrayBuffer): Promise<DocumentModel> {
  try {
    const result = await mammoth.convertToHtml({ arrayBuffer });
    const html = result.value;

    // Parse the HTML output from Mammoth
    const model = parseHTML(html);

    return model;
  } catch (error) {
    throw new Error(`Failed to parse DOCX: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
