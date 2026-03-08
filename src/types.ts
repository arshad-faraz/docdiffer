// Core document model interfaces

export interface DocumentModel {
  title: string;
  blocks: DocumentBlock[];
  headings: HeadingNode[];
  links: LinkRef[];
  images: ImageRef[];
  tables: TableBlock[];
  metadata: Record<string, string>;
}

export interface DocumentBlock {
  id: string;
  type: 'heading' | 'paragraph' | 'list' | 'table' | 'code' | 'macro';
  level?: number;
  text: string;                // normalized plain text for diffing
  html: string;                // sanitized display HTML
  fingerprint: string;         // 20-word shingle hash
  sectionPath: string[];       // ancestor headings
}

export interface HeadingNode {
  id: string;
  level: number;
  text: string;
  blockId: string;
  children: HeadingNode[];
}

export interface LinkRef {
  url: string;
  label: string;
  blockId: string;
}

export interface ImageRef {
  src: string;
  alt: string;
  blockId: string;
}

export interface TableBlock extends DocumentBlock {
  rows: TableRow[];
}

export interface TableRow {
  cells: string[];
}

// Diff result types

export type BlockDiffType = 'unchanged' | 'added' | 'deleted' | 'modified' | 'moved';

export interface BlockDiff {
  type: BlockDiffType;
  left?: DocumentBlock;
  right?: DocumentBlock;
  inlineDiff?: InlineChange[];  // word-level for 'modified' blocks
  moveTarget?: string;          // block id it moved to/from
  similarity?: number;
}

export interface InlineChange {
  type: 'added' | 'deleted' | 'unchanged';
  text: string;
}

export interface DiffResult {
  blocks: BlockDiff[];
  stats: DiffStats;
  leftModel: DocumentModel;
  rightModel: DocumentModel;
}

export interface DiffStats {
  addedBlocks: number;
  deletedBlocks: number;
  modifiedBlocks: number;
  movedBlocks: number;
  unchangedBlocks: number;
  percentChanged: number;
  charAdditions: number;
  charDeletions: number;
}

// Parser types

export type FileFormat = 'html' | 'docx' | 'pdf' | 'text';

export interface ParseResult {
  format: FileFormat;
  model: DocumentModel;
  rawContent?: string;
}

// UI state types

export type ViewMode = 'side-by-side' | 'unified' | 'metadata';

export interface FilterState {
  showUnchanged: boolean;
  showAdded: boolean;
  showDeleted: boolean;
  showModified: boolean;
  showMoved: boolean;
}

export interface AppState {
  leftFile?: File;
  rightFile?: File;
  leftModel?: DocumentModel;
  rightModel?: DocumentModel;
  diffResult?: DiffResult;
  viewMode: ViewMode;
  filters: FilterState;
  searchQuery: string;
  selectedBlockId?: string;
}

export interface ExportOptions {
  includeSummary: boolean;
  includeMetadata: boolean;
  includePrintStyles: boolean;
}
