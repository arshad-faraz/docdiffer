// Core document model interfaces

export interface DocumentModel {
  title: string;
  blocks: DocumentBlock[];
  headings: HeadingNode[];
  links: LinkRef[];
  images: ImageRef[];
  tables: any[];
  metadata: Record<string, string>;
}

export interface DocumentBlock {
  id: string;
  type: 'heading' | 'paragraph' | 'list' | 'table' | 'code' | 'macro';
  level?: number;
  text: string;
  html: string;
  fingerprint: string;
  sectionPath: string[];
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

export type BlockDiffType = 'unchanged' | 'added' | 'deleted' | 'modified' | 'moved';

export interface BlockDiff {
  type: BlockDiffType;
  left?: DocumentBlock;
  right?: DocumentBlock;
  inlineDiff?: InlineChange[];
  moveTarget?: string;
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
