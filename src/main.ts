/**
 * Main entry point
 */

import './styles/tokens.css';
import './styles/base.css';
import './styles/layout.css';
import './styles/diff.css';
import './styles/components.css';

import { appState } from './ui/app';
import { createUploadZone } from './ui/upload-zone';
import { createStatsBar } from './ui/stats-bar';
import { createToolbar } from './ui/toolbar';
import { createTOCPanel } from './ui/toc-panel';
import { createSideBySideView } from './ui/side-by-side';
import { createUnifiedView } from './ui/unified-view';
import { createMetadataPanel } from './ui/metadata-panel';
import { createSearchOverlay } from './ui/search-overlay';

function main(): void {
  const app = document.getElementById('app')!;
  let searchOverlay: HTMLElement | null = null;

  // Subscribe to state changes
  appState.subscribe(() => {
    render();
  });

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    // Cmd+F or Ctrl+F for search
    if ((e.metaKey || e.ctrlKey) && e.key === 'f') {
      e.preventDefault();
      if (searchOverlay) {
        (searchOverlay as any).show?.();
      }
    }
    // Escape to close search
    if (e.key === 'Escape') {
      searchOverlay?.style && (searchOverlay.style.display = 'none');
    }
  });

  function render(): void {
    const state = appState.getState();

    app.innerHTML = '';

    if (!state.diffResult) {
      // Show upload zone
      const uploadZone = createUploadZone();
      app.appendChild(uploadZone);
      return;
    }

    // Header
    const header = document.createElement('div');
    header.className = 'header';
    header.innerHTML = `<h1 class="header-title">DocDiffer</h1>`;
    app.appendChild(header);

    // Stats bar
    const statsBar = createStatsBar(state.diffResult.stats);
    app.appendChild(statsBar);

    // Main container
    const mainContainer = document.createElement('div');
    mainContainer.className = 'main-container';

    // Sidebar (TOC)
    const sidebar = document.createElement('div');
    sidebar.className = 'sidebar';
    sidebar.appendChild(
      createTOCPanel(state.diffResult.leftModel.headings)
    );
    mainContainer.appendChild(sidebar);

    // Content area
    const contentArea = document.createElement('div');
    contentArea.className = 'content-area';

    // Toolbar
    const toolbar = createToolbar(state.filters);

    // Add export button to toolbar
    const exportBtn = document.createElement('button');
    exportBtn.className = 'btn btn-secondary';
    exportBtn.textContent = '⬇️ Export';
    exportBtn.addEventListener('click', () => {
      generateExportReport(state.diffResult!);
    });
    toolbar.appendChild(exportBtn);

    contentArea.appendChild(toolbar);

    // View container
    const viewContainer = document.createElement('div');
    viewContainer.className = 'view-container';

    // Render appropriate view
    if (state.viewMode === 'side-by-side') {
      const sideBySide = createSideBySideView(state.diffResult.blocks, state.filters);
      viewContainer.appendChild(sideBySide);
    } else if (state.viewMode === 'unified') {
      const unified = createUnifiedView(state.diffResult.blocks);
      viewContainer.appendChild(unified);
    } else if (state.viewMode === 'metadata') {
      const metadata = createMetadataPanel(
        state.diffResult.leftModel,
        state.diffResult.rightModel
      );
      viewContainer.appendChild(metadata);
    }

    contentArea.appendChild(viewContainer);
    mainContainer.appendChild(contentArea);

    app.appendChild(mainContainer);

    // Create search overlay (only once)
    if (!searchOverlay && state.diffResult) {
      searchOverlay = createSearchOverlay(state.diffResult.blocks);
      app.appendChild(searchOverlay);
    }
  }

  // Initial render
  render();
}

function generateExportReport(diffResult: any): void {
  const { blocks, stats } = diffResult;

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

  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'diff-report.html';
  a.click();
  URL.revokeObjectURL(url);
}

main();
