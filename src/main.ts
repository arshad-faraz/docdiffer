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

  appState.subscribe(() => render());

  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'f') {
      e.preventDefault();
      if (searchOverlay) (searchOverlay as any).show?.();
    }
    if (e.key === 'Escape') searchOverlay && (searchOverlay.style.display = 'none');
  });

  function render(): void {
    const state = appState.getState();
    app.innerHTML = '';

    if (!state.diffResult) {
      app.appendChild(createUploadZone());
      return;
    }

    // Header
    const header = document.createElement('div');
    header.className = 'header';
    header.innerHTML = '<h1 class="header-title">DocDiffer</h1>';
    app.appendChild(header);

    // Stats bar
    app.appendChild(createStatsBar(state.diffResult.stats));

    // Main container
    const mainContainer = document.createElement('div');
    mainContainer.className = 'main-container';

    // Sidebar
    const sidebar = document.createElement('div');
    sidebar.className = 'sidebar';
    sidebar.appendChild(createTOCPanel(state.diffResult.leftModel.headings));
    mainContainer.appendChild(sidebar);

    // Content area
    const contentArea = document.createElement('div');
    contentArea.className = 'content-area';
    contentArea.appendChild(createToolbar(state.filters));

    // View container
    const viewContainer = document.createElement('div');
    viewContainer.className = 'view-container';

    if (state.viewMode === 'side-by-side') {
      viewContainer.appendChild(createSideBySideView(state.diffResult.blocks, state.filters));
    } else if (state.viewMode === 'unified') {
      viewContainer.appendChild(createUnifiedView(state.diffResult.blocks));
    } else if (state.viewMode === 'metadata') {
      viewContainer.appendChild(createMetadataPanel(state.diffResult.leftModel, state.diffResult.rightModel));
    }

    contentArea.appendChild(viewContainer);
    mainContainer.appendChild(contentArea);
    app.appendChild(mainContainer);

    if (!searchOverlay && state.diffResult) {
      searchOverlay = createSearchOverlay(state.diffResult.blocks);
      app.appendChild(searchOverlay);
    }
  }

  render();
}

main();
