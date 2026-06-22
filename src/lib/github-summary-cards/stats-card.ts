import { SummaryCard } from './card';
import { getIcon } from './themes';
import type { SummaryCardTheme } from './card';

interface StatsEntry {
  icon: string;
  label: string;
  value: string;
}

function formatNumber(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  return n.toLocaleString();
}

export function generateStatsCard(
  theme: SummaryCardTheme,
  stats: {
    totalStars: number;
    totalCommits: number;
    totalPRs: number;
    totalIssues: number;
    contributedTo: number;
  },
): string {
  const card = new SummaryCard('Stats', 340, 200, theme);
  const svg = card.svg;

  const entries: StatsEntry[] = [
    { icon: getIcon('star'), label: 'Total Stars:', value: formatNumber(stats.totalStars) },
    { icon: getIcon('commit'), label: 'Total Commits:', value: formatNumber(stats.totalCommits) },
    { icon: getIcon('pr'), label: 'Total PRs:', value: formatNumber(stats.totalPRs) },
    { icon: getIcon('issue'), label: 'Total Issues:', value: formatNumber(stats.totalIssues) },
    { icon: getIcon('collaborator'), label: 'Contributed to:', value: formatNumber(stats.contributedTo) },
  ];

  const labelHeight = 30;

  entries.forEach((entry, index) => {
    const y = labelHeight * index * 1.8;

    card.appendIcon(svg, entry.icon, 0, y);

    svg
      .append('text')
      .attr('x', 25)
      .attr('y', y + 14)
      .style('font-size', '14px')
      .style('fill', theme.text)
      .text(entry.label);

    svg
      .append('text')
      .attr('x', 170)
      .attr('y', y + 14)
      .style('font-size', '14px')
      .style('fill', theme.text)
      .style('font-weight', 'bold')
      .text(entry.value);
  });

  return card.toString();
}
