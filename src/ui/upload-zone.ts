/**
 * Drag-and-drop file upload zone
 */

import { appState } from './app';
import { parseFile } from '../parsers';
import { diff } from '../diff/engine';
import { isValidFileType, getFileTypeError } from '../utils/file-reader';

export function createUploadZone(): HTMLElement {
  const zone = document.createElement('div');
  zone.className = 'upload-zone';

  zone.innerHTML = `
    <div class="upload-icon">📄</div>
    <div class="upload-text">
      <div class="upload-primary">Drop files to compare</div>
      <div class="upload-secondary">or click to upload PDF, DOCX, HTML, TXT</div>
    </div>
  `;

  let leftFile: File | null = null;
  let rightFile: File | null = null;

  // Drag and drop
  zone.addEventListener('dragover', (e) => {
    e.preventDefault();
    zone.classList.add('dragover');
  });

  zone.addEventListener('dragleave', () => {
    zone.classList.remove('dragover');
  });

  zone.addEventListener('drop', async (e) => {
    e.preventDefault();
    zone.classList.remove('dragover');

    const files = Array.from(e.dataTransfer?.files || []);
    await handleFiles(files);
  });

  // Click to upload
  zone.addEventListener('click', () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = '.pdf,.docx,.html,.txt';

    input.addEventListener('change', async (e) => {
      const files = Array.from((e.target as HTMLInputElement).files || []);
      await handleFiles(files);
    });

    input.click();
  });

  async function handleFiles(files: File[]): Promise<void> {
    const validFiles = files.filter((f) => {
      const error = getFileTypeError(f);
      if (error) {
        console.warn(error);
        return false;
      }
      return true;
    });

    if (validFiles.length >= 1) {
      leftFile = validFiles[0];
    }
    if (validFiles.length >= 2) {
      rightFile = validFiles[1];
    }

    if (leftFile && rightFile) {
      zone.innerHTML = '<div class="loading"><span class="spinner"></span>Processing files...</div>';

      try {
        const [leftModel, rightModel] = await Promise.all([
          parseFile(leftFile),
          parseFile(rightFile),
        ]);

        const diffResult = diff(leftModel, rightModel);

        appState.setState({
          leftFile,
          rightFile,
          leftModel,
          rightModel,
          diffResult,
        });
      } catch (error) {
        zone.innerHTML = `
          <div style="color: #f87171;">
            <div class="upload-icon">⚠️</div>
            <div class="upload-text">
              <div class="upload-primary">Error processing files</div>
              <div class="upload-secondary">${(error as Error).message}</div>
            </div>
          </div>
        `;
      }
    } else if (leftFile && !rightFile) {
      zone.innerHTML = `
        <div style="color: #818cf8;">
          <div class="upload-icon">✓</div>
          <div class="upload-text">
            <div class="upload-primary">File 1 loaded</div>
            <div class="upload-secondary">Drop the second file to compare</div>
          </div>
        </div>
      `;
    }
  }

  return zone;
}
