/**
 * Main entry point - Minimal working version
 */

import './styles/tokens.css';
import './styles/base.css';
import './styles/layout.css';
import './styles/diff.css';
import './styles/components.css';

function main(): void {
  const app = document.getElementById('app');
  if (!app) return;

  app.innerHTML = `
    <div style="padding: 2rem; text-align: center; color: #e2e4ed;">
      <h1>DocDiffer</h1>
      <p style="color: #a8adb8;">Document comparison tool - Coming soon</p>
      <div style="margin-top: 2rem; padding: 2rem; background: #1a1d27; border-radius: 8px;">
        <p>Upload two documents to compare:</p>
        <input type="file" id="file1" accept=".pdf,.docx,.html,.txt" style="margin: 0.5rem;">
        <input type="file" id="file2" accept=".pdf,.docx,.html,.txt" style="margin: 0.5rem;">
        <button onclick="alert('Build in progress')" style="margin-top: 1rem; padding: 0.5rem 1rem; background: #818cf8; color: #0f1117; border: none; border-radius: 4px; cursor: pointer;">
          Compare
        </button>
      </div>
    </div>
  `;
}

main();
