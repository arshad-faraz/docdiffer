/**
 * Upload Zone - Drag and drop file upload component
 * Handles file selection and parsing, triggers diff computation
 */

import { parseFile } from '../parsers/index';
import { diff } from '../diff/engine';
import { appState } from './app';

/**
 * Create the upload zone component
 */
export function createUploadZone(): HTMLElement {
  const container = document.createElement('div');
  container.className = 'upload-zone';

  const dropZone = document.createElement('div');
  dropZone.className = 'upload-zone__drop-area';
  dropZone.innerHTML = `
    <svg class="upload-zone__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
      <polyline points="17 8 12 3 7 8"></polyline>
      <line x1="12" y1="3" x2="12" y2="15"></line>
    </svg>
    <p class="upload-zone__text">Drop files here or click to select</p>
    <p class="upload-zone__hint">Supports PDF, DOCX, HTML, TXT</p>
    <input
      type="file"
      class="upload-zone__input"
      id="file-input"
      multiple
      accept=".pdf,.docx,.html,.txt,.doc"
      hidden
    />
  `;

  const fileInput = dropZone.querySelector('#file-input') as HTMLInputElement;

  // Click to select files
  dropZone.addEventListener('click', () => {
    fileInput.click();
  });

  // Drag and drop
  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropZone.classList.add('upload-zone__drop-area--active');
  });

  dropZone.addEventListener('dragleave', (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropZone.classList.remove('upload-zone__drop-area--active');
  });

  dropZone.addEventListener('drop', async (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropZone.classList.remove('upload-zone__drop-area--active');

    const files = Array.from(e.dataTransfer?.files || []);
    if (files.length >= 2) {
      await handleFilePair(files[0], files[1], container);
    } else if (files.length === 1) {
      // Store first file, wait for second
      fileInput.click();
    }
  });

  // File input change
  fileInput.addEventListener('change', async (e) => {
    const files = Array.from((e.target as HTMLInputElement).files || []);
    if (files.length >= 2) {
      await handleFilePair(files[0], files[1], container);
    }
  });

  container.appendChild(dropZone);
  return container;
}

/**
 * Handle file pair and compute diff
 */
async function handleFilePair(
  leftFile: File,
  rightFile: File,
  container: HTMLElement,
): Promise<void> {
  // Show loading state
  const dropZone = container.querySelector('.upload-zone__drop-area') as HTMLElement;
  if (dropZone) {
    dropZone.innerHTML = '<p class="upload-zone__text">Processing files...</p>';
  }

  try {
    // Parse both files
    const [leftModel, rightModel] = await Promise.all([
      parseFile(leftFile),
      parseFile(rightFile),
    ]);

    // Compute diff
    const diffResult = diff(leftModel, rightModel);

    // Update app state
    appState.setState({
      leftFile,
      rightFile,
      leftModel,
      rightModel,
      diffResult,
    });

    // Hide upload zone
    container.style.display = 'none';
  } catch (error) {
    console.error('Error processing files:', error);
    if (dropZone) {
      dropZone.innerHTML = `
        <p class="upload-zone__text" style="color: var(--delete-fg);">
          Error: ${error instanceof Error ? error.message : 'Unknown error'}
        </p>
        <p class="upload-zone__hint">Try different files or refresh the page</p>
      `;
    }
  }
}
