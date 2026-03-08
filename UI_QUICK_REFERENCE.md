# DocDiffer UI Components - Quick Reference

## Component Usage

### 1. State Management
```typescript
import { appState, AppStateManager } from './ui/app';

// Update state
appState.setState({ viewMode: 'unified' });

// Get current state
const state = appState.getState();

// Subscribe to changes
const unsubscribe = appState.subscribe((newState) => {
  console.log('State changed:', newState);
});

// Convenience methods
appState.setFilters({ showAdded: false });
appState.setViewMode('side-by-side');
appState.setSearchQuery('keyword');
```

### 2. Upload Zone
```typescript
import { createUploadZone } from './ui/upload-zone';

const uploadZone = createUploadZone();
document.body.appendChild(uploadZone);

// Handles:
// - Drag/drop file pairs
// - Click to select files
// - Auto-parsing and diff computation
// - Updates appState.diffResult, leftModel, rightModel
```

### 3. Views
```typescript
import { createSideBySideView } from './ui/side-by-side';
import { createUnifiedView } from './ui/unified-view';
import { createMetadataPanel } from './ui/metadata-panel';

const state = appState.getState();

if (state.diffResult) {
  const view = createSideBySideView(
    state.diffResult.blocks,
    state.filters
  );
  
  const unified = createUnifiedView(
    state.diffResult.blocks,
    state.filters
  );
  
  const metadata = createMetadataPanel(
    state.diffResult.leftModel,
    state.diffResult.rightModel
  );
}
```

### 4. Controls
```typescript
import { createToolbar } from './ui/toolbar';
import { createStatsBar } from './ui/stats-bar';
import { createTOCPanel } from './ui/toc-panel';
import { createSearchOverlay } from './ui/search-overlay';

// Toolbar with view mode switcher, filters, search
const toolbar = createToolbar();

// Statistics display
const stats = createStatsBar(diffResult.stats);

// Table of contents
const toc = createTOCPanel(diffResult.rightModel.headings);

// Search overlay (Cmd+F)
const search = createSearchOverlay(diffResult.blocks);
```

## CSS Classes Reference

### Block Styling
- `.block-unchanged` - No changes
- `.block-added` - Added block
- `.block-deleted` - Deleted block
- `.block-modified` - Modified block
- `.block-moved` - Moved block

### Inline Changes
- `.inline-added` - Added text
- `.inline-deleted` - Deleted text
- `.inline-unchanged` - Unchanged text

### Views
- `.side-by-side` - Side-by-side container
- `.side-by-side__pane` - Individual pane
- `.side-by-side__pane--left` - Left pane
- `.side-by-side__pane--right` - Right pane
- `.side-by-side__divider` - Divider between panes

- `.unified-view` - Unified diff container
- `.unified-view__line` - Single line
- `.unified-view__line--added` - Added line
- `.unified-view__line--deleted` - Deleted line
- `.unified-view__prefix` - +/- prefix

- `.metadata-panel` - Metadata container
- `.metadata-section` - Change category
- `.metadata-section__item` - Single change

### Controls
- `.toolbar` - Main toolbar
- `.toolbar__button` - Toolbar button
- `.toolbar__button--active` - Active button
- `.toolbar__button--filter` - Filter button
- `.toolbar__section` - Toolbar section

- `.stats-bar` - Statistics bar
- `.stats-bar__section` - Stats section
- `.stats-bar__item` - Single stat
- `.stats-bar__progress` - Progress bar

- `.toc-panel` - TOC container
- `.toc-panel__list` - Heading list
- `.toc-panel__item` - Single heading

- `.search-overlay` - Search container
- `.search-overlay__result-item` - Result item
- `.search-overlay__highlight` - Highlighted block

## State Interface
```typescript
interface AppState {
  leftFile?: File;
  rightFile?: File;
  leftModel?: DocumentModel;
  rightModel?: DocumentModel;
  diffResult?: DiffResult;
  viewMode: 'side-by-side' | 'unified' | 'metadata';
  filters: {
    showUnchanged: boolean;
    showAdded: boolean;
    showDeleted: boolean;
    showModified: boolean;
    showMoved: boolean;
  };
  searchQuery: string;
  selectedBlockId?: string;
}
```

## Design Tokens (use in CSS)

```css
/* Colors */
--add-bg: #0d2818;        /* Addition background */
--add-fg: #2ea043;        /* Addition foreground */
--delete-bg: #2a0f0f;     /* Deletion background */
--delete-fg: #d1453b;     /* Deletion foreground */
--modified-bg: #1a1a2e;   /* Modified background */
--moved-bg: #1e1e3f;      /* Moved background */

/* Spacing */
--spacing-xs: 4px;
--spacing-sm: 8px;
--spacing-md: 16px;
--spacing-lg: 24px;

/* Typography */
--font-mono: 'Courier New', monospace;
--font-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

/* Sizing */
--block-padding: 12px;
--header-height: 60px;
--sidebar-width: 300px;
```

## Keyboard Shortcuts

- **Cmd+F / Ctrl+F** - Open search overlay
- **Enter** - Next search result
- **Shift+Enter** - Previous search result
- **Escape** - Close search overlay

## Integration Checklist

- [ ] Import all UI components from `./ui/`
- [ ] Create main layout structure
- [ ] Initialize `appState` at app startup
- [ ] Subscribe to state changes for re-rendering
- [ ] Render appropriate view based on `appState.viewMode`
- [ ] Apply filters from `appState.filters`
- [ ] Show/hide components based on diff presence
- [ ] Handle error states in upload zone
- [ ] Style with provided CSS classes
- [ ] Test all interactive features (filters, view switching, search)

## File Sizes

- app.ts: 2.1 KB
- metadata-panel.ts: 7.3 KB
- search-overlay.ts: 6.9 KB
- side-by-side.ts: 4.6 KB
- stats-bar.ts: 5.2 KB
- toc-panel.ts: 4.1 KB
- toolbar.ts: 5.4 KB
- unified-view.ts: 5.6 KB
- upload-zone.ts: 3.5 KB

**Total: 44.7 KB (uncompressed), 1,626 lines**
