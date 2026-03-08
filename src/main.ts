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
    const toolbar = createToolbar(state.filters, state.diffResult);
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

main();
