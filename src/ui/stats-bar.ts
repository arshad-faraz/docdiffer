/**
 * Stats Bar - Displays statistics about the diff
 * Shows additions, deletions, percentage changed
 */

import type { DiffStats } from '../types';

/**
 * Create stats bar component
 */
export function createStatsBar(stats: DiffStats): HTMLElement {
  const bar = document.createElement('div');
  bar.className = 'stats-bar';

  // Blocks section
  const blocksSection = createStatSection(
    'Blocks',
    [
      { label: 'Added', value: stats.addedBlocks, className: 'stat-added' },
      { label: 'Deleted', value: stats.deletedBlocks, className: 'stat-deleted' },
      { label: 'Modified', value: stats.modifiedBlocks, className: 'stat-modified' },
      { label: 'Moved', value: stats.movedBlocks, className: 'stat-moved' },
      { label: 'Unchanged', value: stats.unchangedBlocks, className: 'stat-unchanged' },
    ],
  );
  bar.appendChild(blocksSection);

  // Character changes section
  const charSection = createCharChangesSection(stats);
  bar.appendChild(charSection);

  // Overall percentage section
  const percentSection = createPercentSection(stats);
  bar.appendChild(percentSection);

  return bar;
}

/**
 * Create a section of stats
 */
function createStatSection(
  title: string,
  stats: Array<{ label: string; value: number; className: string }>,
): HTMLElement {
  const section = document.createElement('div');
  section.className = 'stats-bar__section';

  const titleEl = document.createElement('h3');
  titleEl.className = 'stats-bar__title';
  titleEl.textContent = title;
  section.appendChild(titleEl);

  const grid = document.createElement('div');
  grid.className = 'stats-bar__grid';

  for (const stat of stats) {
    const item = document.createElement('div');
    item.className = `stats-bar__item ${stat.className}`;

    const label = document.createElement('span');
    label.className = 'stats-bar__label';
    label.textContent = stat.label;

    const value = document.createElement('span');
    value.className = 'stats-bar__value';
    value.textContent = stat.value.toString();

    item.appendChild(value);
    item.appendChild(label);
    grid.appendChild(item);
  }

  section.appendChild(grid);
  return section;
}

/**
 * Create character changes section
 */
function createCharChangesSection(stats: DiffStats): HTMLElement {
  const section = document.createElement('div');
  section.className = 'stats-bar__section stats-bar__section--changes';

  const titleEl = document.createElement('h3');
  titleEl.className = 'stats-bar__title';
  titleEl.textContent = 'Character Changes';
  section.appendChild(titleEl);

  const container = document.createElement('div');
  container.className = 'stats-bar__changes';

  // Additions
  const additionsEl = document.createElement('div');
  additionsEl.className = 'stats-bar__change stat-added';

  const addIcon = document.createElement('span');
  addIcon.className = 'stats-bar__change-icon';
  addIcon.textContent = '+';

  const addValue = document.createElement('span');
  addValue.className = 'stats-bar__change-value';
  addValue.textContent = formatNumber(stats.charAdditions);

  additionsEl.appendChild(addIcon);
  additionsEl.appendChild(addValue);
  container.appendChild(additionsEl);

  // Deletions
  const deletionsEl = document.createElement('div');
  deletionsEl.className = 'stats-bar__change stat-deleted';

  const delIcon = document.createElement('span');
  delIcon.className = 'stats-bar__change-icon';
  delIcon.textContent = '−';

  const delValue = document.createElement('span');
  delValue.className = 'stats-bar__change-value';
  delValue.textContent = formatNumber(stats.charDeletions);

  deletionsEl.appendChild(delIcon);
  deletionsEl.appendChild(delValue);
  container.appendChild(deletionsEl);

  section.appendChild(container);
  return section;
}

/**
 * Create percentage changed section
 */
function createPercentSection(stats: DiffStats): HTMLElement {
  const section = document.createElement('div');
  section.className = 'stats-bar__section stats-bar__section--percent';

  const titleEl = document.createElement('h3');
  titleEl.className = 'stats-bar__title';
  titleEl.textContent = 'Overall Change';
  section.appendChild(titleEl);

  const percentEl = document.createElement('div');
  percentEl.className = 'stats-bar__percent';

  const valueEl = document.createElement('span');
  valueEl.className = 'stats-bar__percent-value';
  valueEl.textContent = `${stats.percentChanged}%`;

  const textEl = document.createElement('span');
  textEl.className = 'stats-bar__percent-text';
  textEl.textContent = 'of content changed';

  percentEl.appendChild(valueEl);
  percentEl.appendChild(textEl);
  section.appendChild(percentEl);

  // Progress bar
  const progressBar = document.createElement('div');
  progressBar.className = 'stats-bar__progress';

  const progressFill = document.createElement('div');
  progressFill.className = 'stats-bar__progress-fill';
  progressFill.style.width = `${stats.percentChanged}%`;

  progressBar.appendChild(progressFill);
  section.appendChild(progressBar);

  return section;
}

/**
 * Format large numbers with K/M suffix
 */
function formatNumber(num: number): string {
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(1)}M`;
  }
  if (num >= 1_000) {
    return `${(num / 1_000).toFixed(1)}K`;
  }
  return num.toString();
}
