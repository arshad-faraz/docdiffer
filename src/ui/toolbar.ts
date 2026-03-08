/**
 * Toolbar with view switcher, filters, search, and export
 */

import type { FilterState } from '../types';
import { appState } from './app';

export function createToolbar(filters: FilterState): HTMLElement {
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

  // Export button (handled in main render)
  // Placeholder - export is triggered from main.ts with access to diffResult

  toolbar.appendChild(viewSwitcher);
  toolbar.appendChild(filterPills);
  toolbar.appendChild(searchInput);

  return toolbar;
}
