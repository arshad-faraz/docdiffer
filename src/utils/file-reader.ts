export async function readFile(file: File): Promise<string | ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    const name = file.name.toLowerCase();

    if (name.endsWith('.pdf')) {
      reader.readAsArrayBuffer(file);
    } else {
      reader.readAsText(file, 'utf-8');
    }

    reader.onload = () => resolve(reader.result as string | ArrayBuffer);
    reader.onerror = () => reject(new Error(`Failed to read file: ${file.name}`));
  });
}

export function detectFileFormat(file: File): 'pdf' | 'docx' | 'html' | 'text' {
  const name = file.name.toLowerCase();
  if (name.endsWith('.pdf')) return 'pdf';
  if (name.endsWith('.docx')) return 'docx';
  if (name.endsWith('.html') || name.endsWith('.htm')) return 'html';
  return 'text';
}

export function getFileTypeError(file: File): string | null {
  const format = detectFileFormat(file);
  if (!['html', 'docx', 'pdf', 'text'].includes(format)) {
    return `Unsupported file type. Supported: PDF, DOCX, HTML, TXT`;
  }
  return null;
}
