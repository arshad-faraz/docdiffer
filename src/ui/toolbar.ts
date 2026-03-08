/**
 * Toolbar - View switcher, filter pills, search input
 * Main control panel for the diff viewer
 */

import type { ViewMode, FilterState } from '../types';
import { appState } from './app';

/**
 * Create toolbar component
 */
export function createToolbar(): HTMLElement {
  const toolbar = document.createElement('div');
  toolbar.className = 'toolbar';

  // View mode switcher
  const viewModeSwitcher = createViewModeSwitcher();
  toolbar.appendChild(viewModeSwitcher);

  // Divider
  const divider1 = document.createElement('div');
  divider1.className = 'toolbar__divider';
  toolbar.appendChild(divider1);

  // Filter pills
  const filterSection = createFilterSection();
  toolbar.appendChild(filterSection);

  // Divider
  const divider2 = document.createElement('div');
  divider2.className = 'toolbar__divider';
  toolbar.appendChild(divider2);

  // Search input
  const searchInput = createSearchInput();
  toolbar.appendChild(searchInput);

  // Subscribe to state changes to update active states
  appState.subscribe(() => {
    updateToolbarState(toolbar);
  });

  return toolbar;
}

/**
 * Create view mode switcher
 */
function createViewModeSwitcher(): HTMLElement {
  const section = document.createElement('div');
  section.className = 'toolbar__section toolbar__section--view-mode';

  const modes: ViewMode[] = ['side-by-side', 'unified', 'metadata'];
  const labels: Record<ViewMode, string> = {
    'side-by-side': 'Side-by-Side',
    'unified': 'Unified',
    'metadata': 'Metadata',
  };

  for (const mode of modes) {
    const button = document.createElement('button');
    button.className = 'toolbar__button toolbar__button--view-mode';
    button.setAttribute('data-view-mode', mode);
    button.textContent = labels[mode];

    button.addEventListener('click', () => {
      appState.setViewMode(mode);
    });

    section.appendChild(button);
  }

  return section;
}

/**
 * Create filter section
 */
function createFilterSection(): HTMLElement {
  const section = document.createElement('div');
  section.className = 'toolbar__section toolbar__section--filters';

  const filters: Array<[keyof FilterState, string]> = [
    ['showAdded', 'Added'],
    ['showDeleted', 'Deleted'],
    ['showModified', 'Modified'],
    ['showMoved', 'Moved'],
    ['showUnchanged', 'Unchanged'],
  ];

  for (const [filterKey, label] of filters) {
    const button = document.createElement('button');
    button.className = 'toolbar__button toolbar__button--filter';
    button.setAttribute('data-filter', filterKey);
    button.textContent = label;

    button.addEventListener('click', () => {
      const state = appState.getState();
      appState.setFilters({
        [filterKey]: !state.filters[filterKey],
      });
    });

    section.appendChild(button);
  }

  return section;
}

/**
 * Create search input
 */
function createSearchInput(): HTMLElement {
  const section = document.createElement('div');
  section.className = 'toolbar__section toolbar__section--search';

  const inputWrapper = document.createElement('div');
  inputWrapper.className = 'toolbar__search-wrapper';

  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'toolbar__search-input';
  input.placeholder = 'Search... (Cmd+F)';
  input.setAttribute('aria-label', 'Search differences');

  const clearButton = document.createElement('button');
  clearButton.className = 'toolbar__search-clear';
  clearButton.innerHTML = '×';
  clearButton.setAttribute('aria-label', 'Clear search');
  clearButton.style.display = 'none';

  // Update app state on input
  input.addEventListener('input', (e) => {
    const query = (e.target as HTMLInputElement).value;
    appState.setSearchQuery(query);
    clearButton.style.display = query ? 'block' : 'none';
  });

  // Clear search
  clearButton.addEventListener('click', () => {
    input.value = '';
    appState.clearSearchQuery();
    clearButton.style.display = 'none';
    input.focus();
  });

  // Keyboard shortcut (Cmd+F / Ctrl+F)
  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'f') {
      e.preventDefault();
      input.focus();
    }
    if (e.key === 'Escape' && document.activeElement === input) {
      clearButton.click();
    }
  });

  inputWrapper.appendChild(input);
  inputWrapper.appendChild(clearButton);
  section.appendChild(inputWrapper);

  return section;
}

/**
 * Update toolbar visual state based on app state
 */
function updateToolbarState(toolbar: HTMLElement): void {
  const state = appState.getState();

  // Update view mode buttons
  toolbar.querySelectorAll('[data-view-mode]').forEach((btn) => {
    const mode = (btn as HTMLElement).getAttribute('data-view-mode') as ViewMode;
    if (mode === state.viewMode) {
      btn.classList.add('toolbar__button--active');
    } else {
      btn.classList.remove('toolbar__button--active');
    }
  });

  // Update filter buttons
  toolbar.querySelectorAll('[data-filter]').forEach((btn) => {
    const filterKey = (btn as HTMLElement).getAttribute('data-filter') as keyof FilterState;
    if (state.filters[filterKey]) {
      btn.classList.add('toolbar__button--active');
    } else {
      btn.classList.remove('toolbar__button--active');
    }
  });

  // Update search input
  const searchInput = toolbar.querySelector('.toolbar__search-input') as HTMLInputElement;
  if (searchInput && searchInput.value !== state.searchQuery) {
    searchInput.value = state.searchQuery;
  }
}
