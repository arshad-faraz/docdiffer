/**
 * Toolbar with view switcher, filters, search, and export
 */

import type { FilterState, DiffResult } from '../types';
import { appState } from './app';

export function createToolbar(filters: FilterState, diffResult: DiffResult): HTMLElement {
  const toolbar = document.createElement('div');
  toolbar.className = 'toolbar';

  // View switcher
  const viewSwitcher = document.createElement('div');
  viewSwitcher.className = 'view-switcher';

  const modes = [
    { id: 'side-by-side', label: 'Side-by-Side' },
    { id: 'unified', label: 'Unified' },
    { id: 'metadata', label: 'Metadata' },
  ];

  modes.forEach((mode) => {
    const btn = document.createElement('button');
    btn.textContent = mode.label;
    btn.className = 'side-by-side' === mode.id ? 'active' : '';
    btn.addEventListener('click', () => {
      appState.setViewMode(mode.id as any);
      updateViewMode();
    });
    viewSwitcher.appendChild(btn);
  });

  function updateViewMode() {
    const buttons = viewSwitcher.querySelectorAll('button');
    const currentMode = appState.getState().viewMode;
    buttons.forEach((btn, idx) => {
      btn.classList.toggle('active', modes[idx].id === currentMode);
    });
  }

  // Filter pills
  const filterPills = document.createElement('div');
  filterPills.className = 'filter-pills';

  const filterOptions = [
    { key: 'showAdded', label: 'Additions' },
    { key: 'showDeleted', label: 'Deletions' },
    { key: 'showModified', label: 'Modified' },
    { key: 'showMoved', label: 'Moved' },
    { key: 'showUnchanged', label: 'Unchanged' },
  ];

  filterOptions.forEach((opt) => {
    const pill = document.createElement('button');
    pill.className = 'filter-pill';
    pill.textContent = opt.label;
    pill.classList.toggle('active', filters[opt.key as keyof FilterState]);

    pill.addEventListener('click', () => {
      appState.toggleFilter(opt.key as keyof FilterState);
      pill.classList.toggle('active');
    });

    filterPills.appendChild(pill);
  });

  // Search input
  const searchInput = document.createElement('input');
  searchInput.className = 'search-input';
  searchInput.placeholder = 'Search changes (Cmd+F)...';
  searchInput.addEventListener('input', (e) => {
    appState.setSearchQuery((e.target as HTMLInputElement).value);
  });

  // Export button
  const exportBtn = document.createElement('button');
  exportBtn.className = 'btn btn-secondary';
  exportBtn.textContent = '⬇️ Export';
  exportBtn.addEventListener('click', () => {
    exportDiffReport(diffResult);
  });

  toolbar.appendChild(viewSwitcher);
  toolbar.appendChild(filterPills);
  toolbar.appendChild(searchInput);
  toolbar.appendChild(exportBtn);

  return toolbar;
}

function exportDiffReport(diffResult: DiffResult): void {
  const html = generateExportHTML(diffResult);
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'diff-report.html';
  a.click();
  URL.revokeObjectURL(url);
}

function generateExportHTML(diffResult: DiffResult): string {
  const { blocks, stats, leftModel, rightModel } = diffResult;

  let html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Document Diff Report</title>
      <style>
        body { font-family: system-ui; margin: 2rem; background: #0f1117; color: #e2e4ed; }
        h1 { font-size: 2rem; margin-bottom: 1rem; }
        .summary { background: #1a1d27; padding: 1rem; border-radius: 6px; margin-bottom: 2rem; }
        .stat { display: inline-block; margin-right: 2rem; }
        .diff-block { margin-bottom: 1.5rem; padding: 1rem; border-radius: 6px; }
        .added { background: #0d2818; border-left: 3px solid #16a34a; }
        .deleted { background: #2a0f0f; border-left: 3px solid #dc2626; }
        .modified { background: #1e1a00; border-left: 3px solid #f59e0b; }
        .moved { background: #1a1a2e; border-left: 3px solid #6366f1; }
        .label { font-weight: 600; font-size: 0.875rem; margin-bottom: 0.5rem; opacity: 0.7; }
        @media print { body { margin: 0; } }
      </style>
    </head>
    <body>
      <h1>Document Comparison Report</h1>
      <div class="summary">
        <h2>Summary</h2>
        <div class="stat">+${stats.addedBlocks} additions</div>
        <div class="stat">−${stats.deletedBlocks} deletions</div>
        <div class="stat">${stats.modifiedBlocks} modified</div>
        <div class="stat">${stats.movedBlocks} moved</div>
        <div class="stat">${stats.percentChanged.toFixed(1)}% changed</div>
      </div>
      <h2>Changes</h2>
  `;

  for (const diff of blocks) {
    let className = diff.type;
    let label = diff.type.toUpperCase();

    html += `<div class="diff-block ${className}">`;
    html += `<div class="label">${label}</div>`;

    if (diff.left) {
      html += `<div><strong>Old:</strong> ${diff.left.text}</div>`;
    }
    if (diff.right) {
      html += `<div><strong>New:</strong> ${diff.right.text}</div>`;
    }

    html += '</div>';
  }

  html += '</body></html>';

  return html;
}
