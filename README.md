# DocDiffer - State-of-the-Art Document Comparison Tool

A production-quality document comparison tool that supports PDF, HTML/Confluence exports, and DOCX formats. Shareable without a web host via GitHub Pages URL + downloadable single HTML file for offline use.

## Features

- **Multiple Format Support**: PDF, DOCX, HTML, Confluence exports, and plain text
- **Intelligent Diffing**:
  - Block-level alignment using LCS on fingerprints
  - Move detection for relocated sections
  - Word-level inline diffing for modified blocks
  - Metadata tracking (headings, links, images)
- **Intuitive UI**:
  - Side-by-side comparison (primary view)
  - Unified diff view
  - Metadata comparison panel
  - Table of contents with section navigation
  - Smart filtering and search
- **Shareable**:
  - Deploy to GitHub Pages for team access
  - Download standalone HTML for offline viewing
  - Zero external dependencies at runtime (no CDN)

## Tech Stack

- **Diff Engine**: jsdiff + diff-match-patch for semantic diffing
- **Parsers**: Mammoth (DOCX), PDF.js (PDF), htmlparser2 (HTML)
- **UI**: Vanilla TypeScript with CSS custom properties
- **Build**: Vite + vite-plugin-singlefile for standalone builds

## Quick Start

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open http://localhost:5173 and drag two files to compare.

### Build

```bash
# GitHub Pages (chunked)
npm run build

# Standalone HTML (single file, ~5MB)
npm run build:standalone

# Both
npm run build:all
```

## Supported Formats

- **PDF** (.pdf)
- **DOCX** (.docx)
- **HTML** (.html, .htm) - including Confluence exports
- **Text** (.txt)

## Architecture

### Core Pipeline

```
File Input
  ↓ [Parser: HTML/DOCX/PDF/Text]
DocumentModel (blocks, headings, links, metadata)
  ↓ [Normalizer] - whitespace, Confluence noise
  ↓ [Block Differ] - LCS on fingerprints → add/delete/modify
  ↓ [Move Detector] - high-similarity reclassification
  ↓ [Inline Differ] - word-level diff on modified
  ↓ [Metadata Differ] - independent pass
DiffResult → UI
```

### Key Files

- `src/parsers/` - Document format parsers
- `src/diff/` - Diffing engine pipeline
- `src/ui/` - UI components and state management
- `src/styles/` - CSS design tokens and layouts
- `vite.singlefile.config.ts` - Single-file standalone build

## Design Tokens

Dark theme with semantic colors:

| Element | BG | Text | Border |
|---------|-----|------|--------|
| **Added** | `#0d2818` | `#4ade80` | `#16a34a` |
| **Deleted** | `#2a0f0f` | `#f87171` | `#dc2626` |
| **Modified** | `#1e1a00` | `#fbbf24` | `#f59e0b` |
| **Moved** | `#1a1a2e` | `#818cf8` | `#6366f1` |

## Deployment

### GitHub Pages

1. Push to `main` branch
2. GitHub Actions auto-builds and deploys to `gh-pages` branch
3. Enable GitHub Pages in repo settings pointing to `gh-pages`
4. Available at `https://[org].github.io/docdiffer/`

### Standalone HTML

Use `dist-standalone/index.html` offline without any server:
- Download and open in browser
- All functionality works offline
- PDF.js worker embedded as Blob URL
- ~5MB total bundle size

## Performance

- **Bundle Size**: ~1.95MB (chunked), ~5MB (standalone with all dependencies)
  - Lazy-loaded: Mammoth (280KB), PDF.js (1.1MB), CodeMirror 6 (300KB)
- **Scroll Sync**: Synchronized pane scrolling with height ratio calculations
- **Large Documents**: LCS algorithm optimized for block-level comparison

## Advanced Features

### Move Detection

The engine detects when blocks are moved between documents using:
1. Jaro-Winkler similarity matching (threshold: 0.75)
2. Fingerprint-based block identification
3. Reclassification from delete+add to "moved" type

### Inline Diffing

Modified blocks get word-level analysis:
- Uses `diffWords` from jsdiff v5
- Renders inline highlights for added/deleted words
- Preserves unchanged sections for context

### Confluence Support

Automatically strips navigation noise:
- `#breadcrumb-section`, `#footer`, `#navigation`
- TOC macros, recently-updated, children macros
- Preserves content macros (info, warning, code, expand)

## Export

Generate self-contained HTML reports:
- Summary statistics
- All changed blocks with context
- Inline diff highlights
- Print-friendly styling

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

---

Built with ❤️ for teams who care about document accuracy.
