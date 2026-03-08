/**
 * Root app state and view routing
 */

import type { AppState, ViewMode, FilterState } from '../types';

export class AppStateManager {
  private state: AppState;
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.state = {
      viewMode: 'side-by-side',
      filters: {
        showUnchanged: true,
        showAdded: true,
        showDeleted: true,
        showModified: true,
        showMoved: true,
      },
      searchQuery: '',
    };
  }

  getState(): AppState {
    return { ...this.state };
  }

  setState(update: Partial<AppState>): void {
    this.state = { ...this.state, ...update };
    this.notifyListeners();
  }

  setViewMode(mode: ViewMode): void {
    this.setState({ viewMode: mode });
  }

  setFilters(filters: Partial<FilterState>): void {
    this.setState({
      filters: { ...this.state.filters, ...filters },
    });
  }

  toggleFilter(filterKey: keyof FilterState): void {
    const currentFilters = this.state.filters;
    this.setFilters({
      [filterKey]: !currentFilters[filterKey],
    });
  }

  setSearchQuery(query: string): void {
    this.setState({ searchQuery: query });
  }

  setSelectedBlock(blockId?: string): void {
    this.setState({ selectedBlockId: blockId });
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener());
  }
}

export const appState = new AppStateManager();
