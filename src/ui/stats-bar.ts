/**
 * Statistics bar showing diff summary
 */

import type { DiffStats } from '../types';

export function createStatsBar(stats: DiffStats): HTMLElement {
  const bar = document.createElement('div');
  bar.className = 'stats-bar';

  const percentFormatted = stats.percentChanged.toFixed(1);

  bar.innerHTML = `
    <div class="stat">
      <span class="stat-value stat-add">+${stats.addedBlocks}</span>
      <span>additions</span>
    </div>
    <div class="stat">
      <span class="stat-value stat-delete">−${stats.deletedBlocks}</span>
      <span>deletions</span>
    </div>
    ${
      stats.modifiedBlocks > 0
        ? `<div class="stat">
           <span class="stat-value stat-modified">${stats.modifiedBlocks}</span>
           <span>modified</span>
         </div>`
        : ''
    }
    ${
      stats.movedBlocks > 0
        ? `<div class="stat">
           <span class="stat-value stat-moved">${stats.movedBlocks}</span>
           <span>moved</span>
         </div>`
        : ''
    }
    <div class="stat">
      <span>${percentFormatted}%</span>
      <span>changed</span>
    </div>
  `;

  return bar;
}
