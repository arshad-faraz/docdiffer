# DocDiffer Development Guide

## Architecture Overview

DocDiffer follows a three-stage architecture:

1. **Parser Layer** (`src/parsers/`) - Converts various document formats to `DocumentModel`
2. **Diff Engine** (`src/diff/`) - Implements the LCS-based diffing pipeline
3. **UI Layer** (`src/ui/`) - Renders diffs with state management via `AppStateManager`

### Data Flow

```
File → Parser → DocumentModel → Normalizer → Block Differ → Move Detector
→ Inline Differ → DiffResult → UI Components
```

## Key Design Decisions

### 1. Fingerprint-Based Block Alignment
- Blocks are identified using rolling hash fingerprints (20-word shingles)
- LCS algorithm on fingerprint arrays finds the optimal block alignment
- This avoids expensive string comparison until needed

### 2. Two-Pass Similarity Reclassification
- First pass: LCS produces add/delete/match operations
- Second pass: Adjacent add+delete pairs with >0.6 similarity are reclassified as "modified"
- Move detection happens in a third pass with >0.75 threshold

### 3. Lazy-Loading Heavy Dependencies
- PDF.js (~1.1MB) only loads when user drops a PDF
- Mammoth (~280KB) only loads for DOCX
- Bundle size without these: ~400KB

### 4. Vanilla TypeScript + CSS
- No heavy frameworks (no React, Vue, etc.)
- CSS custom properties for theming
- Direct DOM manipulation for views

## File Structure

```
src/
├── main.ts                    # Entry point, renders root component
├── types.ts                   # All TypeScript interfaces
├── parsers/
│   ├── index.ts              # Parser factory
│   ├── text.parser.ts        # Plain text (simplest)
│   ├── html.parser.ts        # HTML + Confluence (most complex)
│   ├── docx.parser.ts        # DOCX (uses Mammoth)
│   └── pdf.parser.ts         # PDF (uses PDF.js)
├── diff/
│   ├── engine.ts             # Orchestrates pipeline
│   ├── normalizer.ts         # Text normalization
│   ├── block-differ.ts       # LCS alignment
│   ├── move-detector.ts      # Moved section detection
│   ├── inline-differ.ts      # Word-level diff
│   └── metadata-differ.ts    # Heading/link/image diff
├── ui/
│   ├── app.ts               # State manager
│   ├── upload-zone.ts       # File input
│   ├── side-by-side.ts      # Primary view
│   ├── unified-view.ts      # Unified diff
│   ├── metadata-panel.ts    # Structure panel
│   ├── toolbar.ts           # Filters + controls
│   ├── stats-bar.ts         # Statistics
│   ├── toc-panel.ts         # Table of contents
│   └── search-overlay.ts    # Cmd+F search
├── utils/
│   ├── uuid.ts              # UUID generation
│   ├── fingerprint.ts       # Hashing + similarity
│   ├── text-extract.ts      # DOM → text
│   └── file-reader.ts       # File I/O
└── styles/
    ├── tokens.css           # Design tokens
    ├── base.css             # Global styles
    ├── layout.css           # Grid/flex layouts
    ├── diff.css             # Diff-specific styles
    └── components.css       # UI components
```

## Core Algorithms

### LCS (Longest Common Subsequence)
- Implemented in `src/diff/block-differ.ts`
- O(m*n) time, O(m*n) space for two documents with m and n blocks
- Fingerprints reduce string comparison overhead

### Jaro-Winkler Similarity
- Implemented in `src/utils/fingerprint.ts`
- Used for move detection and modified block classification
- Returns 0-1 (1 = identical)

### Fuse.js Fuzzy Search
- Integrated in `src/ui/search-overlay.ts`
- Allows Cmd+F searching within changed blocks only
- 0.3 threshold for matching relevance

## State Management

`AppStateManager` in `src/ui/app.ts` provides:
- Centralized app state
- Subscriber pattern for reactive updates
- Minimal API: `setState()`, `getState()`, `subscribe()`

```typescript
const unsubscribe = appState.subscribe(() => {
  // Re-render on any state change
});
```

## Build System

### Development
```bash
npm run dev
# Starts Vite dev server on :5173
# HMR enabled
```

### Production - Two Builds

1. **GitHub Pages** (`npm run build`)
   - Chunked build (manual chunks for parsers)
   - Code-split PDF.js, Mammoth into separate files
   - Output to `dist/`

2. **Standalone** (`npm run build:standalone`)
   - Single HTML file with all dependencies inlined
   - Uses `vite-plugin-singlefile`
   - Output to `dist-standalone/`
   - ~5MB total

## Confluence HTML Handling

The HTML parser automatically:
- Strips navigation, breadcrumbs, footer noise
- Removes TOC, recently-updated, children macros
- Preserves content macros (code, warning, info, note, tip, expand)
- Converts `ac:link` to plain text labels
- Removes emoticons

This is defined in `removeConfluenceNoise()` in `src/parsers/html.parser.ts`.

## Testing Checklist

After modifying core logic:

1. **Parsers**: `npm run build` and test with sample PDFs, DOCX, HTML files
2. **Diff Engine**: Compare two similar documents → should show modifications, not add+delete
3. **Move Detection**: Move a section → should show as "moved", not delete+add
4. **Standalone Build**: Run `npm run build:standalone` → open `dist-standalone/index.html` offline
5. **Bundle Size**: `ls -lh dist-standalone/index.html` should be <5MB

## Common Modifications

### Add a New Parser
1. Create `src/parsers/format.parser.ts`
2. Export function `parseFormat(content): DocumentModel`
3. Register in `src/parsers/index.ts` `parseFile()` switch statement
4. Update `src/utils/file-reader.ts` `detectFileFormat()` and `isValidFileType()`

### Add a New View Mode
1. Create `src/ui/view-name.ts` with `createViewNameView(diffs, filters): HTMLElement`
2. Add mode to `ViewMode` type in `src/types.ts`
3. Update `src/main.ts` render() to handle new mode in the switch
4. Add button in toolbar

### Customize Theme
Edit `src/styles/tokens.css`:
```css
:root {
  --add-bg: #0d2818;     /* green background for additions */
  --delete-bg: #2a0f0f;  /* red background for deletions */
  /* ... etc */
}
```

### Improve Performance
- Profile in Chrome DevTools → Rendering tab
- Common bottlenecks:
  - LCS algorithm: O(m*n) complexity, consider block reduction
  - DOM rendering: Use DocumentFragment for batch updates
  - Scroll sync: Debounce scroll events

## Debugging Tips

### Enable verbose logging
Add to `src/main.ts`:
```typescript
console.log('DiffResult:', diffResult);
console.log('Blocks:', diffResult.blocks.map(b => ({ type: b.type, left: b.left?.text.slice(0, 50), right: b.right?.text.slice(0, 50) })));
```

### Inspect DocumentModel
After parsing:
```typescript
const model = await parseFile(file);
console.log('Blocks:', model.blocks.length);
console.log('Headings:', model.headings.length);
console.log('Links:', model.links.length);
```

### Test diff algorithm in isolation
```typescript
import { diff } from './src/diff/engine';
const result = diff(leftModel, rightModel);
console.log('Stats:', result.stats);
console.log('Diffs:', result.blocks.map(b => b.type));
```

## Dependencies

### Direct
- `diff` (jsdiff) - word/line diffing
- `diff-match-patch` - semantic diffing
- `htmlparser2` - HTML AST parsing
- `dompurify` - HTML sanitization
- `turndown` - HTML to Markdown (currently unused, consider removing)
- `fuse.js` - fuzzy search

### Lazy-Loaded
- `mammoth` - DOCX parsing
- `pdfjs-dist` - PDF text extraction
- `lit-html` - not currently used, consider removing

### Dev
- `vite` - build tool
- `vite-plugin-singlefile` - single-file builds
- `typescript` - type checking

## Known Limitations

1. **PDF text extraction**: Preserves reading order but may miss columnar layouts
2. **Move detection**: Works best for large blocks; small changes may not be detected as moves
3. **Large documents**: LCS is O(m*n); >10,000 blocks may be slow
4. **Scroll sync**: Based on height ratio; doesn't account for variable line heights

## Future Enhancements

- [ ] CodeMirror 6 integration for unified view (currently lazy-loads but not integrated)
- [ ] Table-aware diffing
- [ ] Better handling of list reordering
- [ ] Visual diff for images (pixel-level)
- [ ] Three-way merge support
- [ ] Real-time collaborative diffing
