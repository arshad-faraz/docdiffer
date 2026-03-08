/**
 * AppStateManager - Centralized state management for the UI
 * Provides setState, getState, and subscribe methods for reactive updates
 */

import type { AppState, ViewMode, FilterState } from '../types';

/**
 * AppStateManager class handles all application state and notifications
 */
export class AppStateManager {
  private state: AppState;
  private subscribers: Set<(state: AppState) => void> = new Set();

  constructor(initialState: Partial<AppState> = {}) {
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
      ...initialState,
    };
  }

  /**
   * Update state and notify all subscribers
   */
  setState(updates: Partial<AppState>): void {
    this.state = {
      ...this.state,
      ...updates,
    };
    this.notifySubscribers();
  }

  /**
   * Get current state
   */
  getState(): AppState {
    return { ...this.state };
  }

  /**
   * Subscribe to state changes
   * Returns unsubscribe function
   */
  subscribe(callback: (state: AppState) => void): () => void {
    this.subscribers.add(callback);
    return () => {
      this.subscribers.delete(callback);
    };
  }

  /**
   * Update filters specifically
   */
  setFilters(filters: Partial<FilterState>): void {
    this.setState({
      filters: {
        ...this.state.filters,
        ...filters,
      },
    });
  }

  /**
   * Update view mode
   */
  setViewMode(viewMode: ViewMode): void {
    this.setState({ viewMode });
  }

  /**
   * Update search query
   */
  setSearchQuery(query: string): void {
    this.setState({ searchQuery: query });
  }

  /**
   * Clear search query
   */
  clearSearchQuery(): void {
    this.setState({ searchQuery: '' });
  }

  /**
   * Notify all subscribers of state change
   */
  private notifySubscribers(): void {
    const currentState = this.getState();
    this.subscribers.forEach(callback => callback(currentState));
  }
}

/**
 * Global app state instance
 */
export const appState = new AppStateManager();
