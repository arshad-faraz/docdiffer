import { parseFile } from '../parsers/index';
import { diff } from '../diff/engine';
import { appState } from './app';

export function createUploadZone(): HTMLElement {
  const zone = document.createElement('div');
  zone.className = 'upload-zone';
  zone.style.cssText = 'display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1.5rem; padding: 2rem; min-height: 100%; border: 2px dashed #3d444d; border-radius: 8px; cursor: pointer; background: #1a1d27; margin: 1.5rem;';

  zone.innerHTML = `
    <div style="font-size: 3rem; opacity: 0.7;">📄</div>
    <div style="text-align: center;">
      <div style="font-size: 1.125rem; font-weight: 600; color: #e2e4ed; margin-bottom: 0.5rem;">Drop two files to compare</div>
      <div style="font-size: 0.875rem; color: #a8adb8;">Supports: PDF, DOCX, HTML, TXT</div>
    </div>
  `;

  let leftFile: File | null = null;
  let rightFile: File | null = null;

  zone.addEventListener('dragover', (e) => {
    e.preventDefault();
    zone.style.borderColor = '#818cf8';
    zone.style.background = '#252a35';
  });

  zone.addEventListener('dragleave', () => {
    zone.style.borderColor = '#3d444d';
    zone.style.background = '#1a1d27';
  });

  zone.addEventListener('drop', async (e) => {
    e.preventDefault();
    zone.style.borderColor = '#3d444d';
    zone.style.background = '#1a1d27';

    const files = Array.from(e.dataTransfer?.files || []);
    await handleFiles(files);
  });

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
    if (files.length >= 1) leftFile = files[0];
    if (files.length >= 2) rightFile = files[1];

    if (leftFile && rightFile) {
      zone.innerHTML = '<div style="text-align: center;"><div style="display: inline-block; border: 2px solid #818cf8; border-top-color: transparent; border-radius: 50%; width: 1em; height: 1em; animation: spin 0.6s linear infinite;"></div> Processing files...</div>';

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
        zone.innerHTML = `<div style="color: #f87171; text-align: center;"><div style="font-size: 3rem; opacity: 0.7;">⚠️</div><div style="font-weight: 600;">Error processing files</div><div style="font-size: 0.875rem;">${(error as Error).message}</div></div>`;
      }
    } else if (leftFile && !rightFile) {
      zone.innerHTML = `<div style="color: #818cf8; text-align: center;"><div style="font-size: 3rem; opacity: 0.7;">✓</div><div style="font-weight: 600;">File 1 loaded</div><div style="font-size: 0.875rem;">Drop the second file to compare</div></div>`;
    }
  }

  return zone;
}
