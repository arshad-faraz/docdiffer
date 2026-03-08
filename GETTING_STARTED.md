# Getting Started with DocDiffer

## Prerequisites

- Node.js 16+ (18+ recommended)
- npm or yarn
- A modern browser (Chrome 90+, Firefox 88+, Safari 14+)

## Installation

### 1. Clone and Install

```bash
cd docdiffer
npm install
```

### 2. Development Server

```bash
npm run dev
```

Open http://localhost:5173 in your browser.

### 3. Test the App

1. Find two documents to compare (PDF, DOCX, HTML, or TXT)
2. Drag both files into the upload zone
3. View the side-by-side diff
4. Try the filters, search (Cmd+F), and view modes

## Building for Production

### Build for GitHub Pages

```bash
npm run build
```

Outputs to `dist/`. Deploy by:
1. Pushing to your GitHub repo
2. GitHub Actions automatically builds and deploys to `gh-pages` branch
3. Enable GitHub Pages in repo settings
4. Access at `https://your-org.github.io/docdiffer/`

### Build Standalone HTML

```bash
npm run build:standalone
```

Outputs to `dist-standalone/index.html`. This is a single 5MB HTML file:
- Works offline with no server
- All dependencies embedded
- Share via email or cloud storage
- Open directly in any browser

### Build Both

```bash
npm run build:all
```

## Project Structure

```
docdiffer/
├── src/
│   ├── main.ts              # App entry point
│   ├── types.ts             # TypeScript interfaces
│   ├── parsers/             # Document format parsers
│   ├── diff/                # Diff algorithm engine
│   ├── ui/                  # UI components
│   ├── utils/               # Utilities (fingerprint, UUID, etc.)
│   └── styles/              # CSS
├── index.html               # HTML template
├── package.json
├── tsconfig.json
├── vite.config.ts           # Vite config (GitHub Pages build)
├── vite.singlefile.config.ts # Vite config (standalone build)
└── README.md
```

## Key Features

### Supported Formats
- **PDF** (.pdf)
- **DOCX** (.docx)
- **HTML** (.html) - including Confluence exports
- **Text** (.txt)

### Diff Views
- **Side-by-Side**: Left and right panes with synchronized scrolling
- **Unified**: Traditional unified diff format
- **Metadata**: Structural changes (headings, links, images)

### Smart Filtering
- Filter by change type: Additions, Deletions, Modifications, Moved sections, Unchanged
- Fuzzy search within changes (Cmd+F)
- Table of contents for navigation

### Confluence Support
Automatically cleans up:
- Navigation breadcrumbs
- TOC macros
- Recently-updated sections
- Navigation footers

Preserves:
- Content macros (code, warning, info, note, tip, expand)
- All text content
- Links and images

## Configuration

### Environment Variables

Create `.env` (not tracked in git):

```
# Optional: Configure for your GitHub Pages domain
VITE_REPO_URL=https://github.com/your-org/docdiffer
```

### Customize Theme

Edit `src/styles/tokens.css`:

```css
:root {
  --bg-primary: #0f1117;        /* Dark background */
  --text-primary: #e2e4ed;      /* Light text */
  --add-bg: #0d2818;            /* Green for additions */
  --delete-bg: #2a0f0f;         /* Red for deletions */
  /* ... customize colors */
}
```

## Deployment

### Option 1: GitHub Pages (Free, Automatic)

1. Create GitHub repo
2. Push code to `main` branch
3. Go to Settings → Pages
4. Set source to `gh-pages` branch
5. GitHub Actions auto-deploys on push

### Option 2: Self-Hosted

Build then deploy `dist/` folder:

```bash
npm run build
# Deploy dist/ to your server:
# - Netlify: drag & drop dist/
# - Vercel: vercel deploy dist/
# - Your server: scp -r dist/* user@server:/var/www/docdiffer/
```

### Option 3: Standalone File

```bash
npm run build:standalone
# Download dist-standalone/index.html
# Share via email, Slack, etc.
# Works offline in any browser
```

## Troubleshooting

### Port 5173 Already in Use

```bash
npm run dev -- --port 5174
```

### PDF Files Not Loading

Check browser console. PDF.js worker should load on first PDF drop. If issue persists:
1. Clear browser cache
2. Check that `pdfjs-dist` is installed: `npm ls pdfjs-dist`
3. Try in a different browser

### Large Documents Are Slow

- Side-by-side view with thousands of changes may be slow
- Try the unified view or filter by change type
- Consider splitting large documents

### Builds Failing

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Try building standalone (it's more strict)
npm run build:standalone
```

## Tips & Tricks

### Comparing Confluence Exports
1. Open Confluence page
2. Tools → Export as PDF or HTML
3. Download
4. Drop in DocDiffer

### Comparing Revisions
- Keep a "baseline" copy of documents
- Compare new versions against baseline
- Use filters to see only what changed

### Creating Reports
1. Compare documents
2. Click "Export" button
3. Generates self-contained HTML report
4. Share with team

### Keyboard Shortcuts
- **Cmd+F / Ctrl+F**: Search changes
- **Esc**: Close modals
- **Click heading in TOC**: Jump to section

## Performance Tips

- For documents with >5000 blocks, filter by change type first
- Unified view is faster for large diffs
- Metadata view loads instantly (no rendering)

## Getting Help

### Common Questions

**Q: Can I compare more than 2 documents?**
A: Currently supports pairwise comparison. For multi-document diffs, compare A→B, then B→C.

**Q: Does it work offline?**
A: Yes! Use `dist-standalone/index.html` (built with `npm run build:standalone`).

**Q: What's the bundle size?**
A: ~400KB base + lazy-loaded parsers:
- PDF: +1.1MB
- DOCX: +280KB
- Standalone all-in: ~5MB

**Q: Can I self-host?**
A: Yes, deploy `dist/` folder anywhere (GitHub Pages, Netlify, your server, etc.).

**Q: Is there an API?**
A: Not yet, but the code is modular. You can import parsers and diff engine:
```typescript
import { parseFile } from './src/parsers';
import { diff } from './src/diff/engine';

const model1 = await parseFile(file1);
const model2 = await parseFile(file2);
const result = diff(model1, model2);
```

### Reporting Issues

If you find a bug:
1. Note the document formats and sizes
2. Check browser console for errors
3. Try with a simpler test case
4. Open an issue with reproducible steps

## Next Steps

1. **Read CLAUDE.md** for architecture and development guide
2. **Explore src/ folder** to understand the codebase
3. **Try the different views** (side-by-side, unified, metadata)
4. **Experiment with filters** and search
5. **Deploy to GitHub Pages** for your team
