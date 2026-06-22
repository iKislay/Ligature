import { NextRequest } from 'next/server';
import { getSummaryTheme } from '@/lib/github-summary-cards/themes';
import { generateStatsCard } from '@/lib/github-summary-cards/stats-card';
import { generateDonutChartCard } from '@/lib/github-summary-cards/donut-chart-card';
import { generateProfileDetailsCard } from '@/lib/github-summary-cards/profile-details-card';
import { generateProductiveTimeCard } from '@/lib/github-summary-cards/productive-time-card';

export const runtime = 'nodejs';
export const revalidate = 3600;

const VALID_CARDS = ['profile-details', 'repos-per-language', 'most-commit-language', 'stats', 'productive-time'] as const;

function mockMonthlyData() {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return months.map((month) => ({
    month,
    contributions: Math.floor(Math.random() * 200) + 20,
  }));
}

function mockHourlyData() {
  return Array.from({ length: 24 }, (_, hour) => ({
    hour,
    contributions: Math.floor(Math.random() * 50),
  }));
}

function mockLanguageData() {
  return [
    { label: 'TypeScript', value: 42, color: '#3178c6' },
    { label: 'JavaScript', value: 28, color: '#f1e05a' },
    { label: 'Python', value: 15, color: '#3572A5' },
    { label: 'Rust', value: 8, color: '#dea584' },
    { label: 'Go', value: 5, color: '#00ADD8' },
    { label: 'Other', value: 2, color: '#6e7681' },
  ];
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const user = searchParams.get('user') || 'octocat';
    const themeName = searchParams.get('theme') || 'default';
    const cardType = searchParams.get('card') || 'stats';

    if (!VALID_CARDS.includes(cardType as any)) {
      return new Response(`Invalid card type: ${cardType}. Valid: ${VALID_CARDS.join(', ')}`, { status: 400 });
    }

    const theme = getSummaryTheme(themeName);
    let svg = '';

    switch (cardType) {
      case 'stats':
        svg = generateStatsCard(theme, {
          totalStars: 999,
          totalCommits: 1337,
          totalPRs: 234,
          totalIssues: 56,
          contributedTo: 42,
        });
        break;

      case 'profile-details':
        svg = generateProfileDetailsCard(theme, user, 1234, mockMonthlyData());
        break;

      case 'repos-per-language':
        svg = generateDonutChartCard('Top Languages by Repo', theme, mockLanguageData());
        break;

      case 'most-commit-language':
        svg = generateDonutChartCard('Top Languages by Commit', theme, mockLanguageData().reverse());
        break;

      case 'productive-time':
        svg = generateProductiveTimeCard(theme, 0, mockHourlyData());
        break;
    }

    return new Response(svg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('Error generating summary card:', error);
    return new Response('Failed to generate card', { status: 500 });
  }
}
