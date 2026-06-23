import { NextRequest } from 'next/server';
import { createSvg } from '@/lib/github-3d-contrib/create-svg';
import {
  NormalSettings,
  NorthSeasonSettings,
  SouthSeasonSettings,
  NightViewSettings,
  HalloweenSettings,
  GitBlockSettings
} from '@/lib/github-3d-contrib/color-template';
import { githubFetch, resolveToken } from '@/lib/github-client';
import { getUserToken } from '@/lib/user-token';
import type { UserInfo, NormalColorSettings } from '@/lib/github-3d-contrib/type';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface Repo {
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  fork: boolean;
}

interface ContribDay {
  date: string;
  count?: number;
  level?: number;
}

const STANDARD_THEME_MAP: Record<string, Partial<NormalColorSettings>> = {
  geist: {
    type: 'normal',
    backgroundColor: '#ffffff',
    foregroundColor: '#171717',
    strongColor: '#171717',
    weakColor: '#6b7280',
    radarColor: '#006bff',
    contribColors: ['#ebedf0', '#dbeafe', '#93c5fd', '#3b82f6', '#006bff'],
  },
  geist_dark: {
    type: 'normal',
    backgroundColor: '#0a0a0a',
    foregroundColor: '#ededed',
    strongColor: '#ededed',
    weakColor: '#52525b',
    radarColor: '#006bff',
    contribColors: ['#161b22', '#1e293b', '#1d4ed8', '#2563eb', '#3b82f6'],
  },
  cyberpunk: {
    type: 'normal',
    backgroundColor: '#f5f0ff',
    foregroundColor: '#1a0033',
    strongColor: '#ff003c',
    weakColor: '#6b21a8',
    radarColor: '#ff003c',
    contribColors: ['#f3e8ff', '#c084fc', '#a855f7', '#9333ea', '#7e22ce'],
  },
  cyberpunk_dark: {
    type: 'normal',
    backgroundColor: '#0d0221',
    foregroundColor: '#00ff41',
    strongColor: '#ff003c',
    weakColor: '#00e5ff',
    radarColor: '#ff003c',
    contribColors: ['#1a0033', '#0d3d0d', '#00aa22', '#00dd33', '#00ff41'],
  },
  minimal: {
    type: 'normal',
    backgroundColor: '#f4f4f5',
    foregroundColor: '#27272a',
    strongColor: '#27272a',
    weakColor: '#71717a',
    radarColor: '#18181b',
    contribColors: ['#e4e4e7', '#d4d4d8', '#a1a1aa', '#52525b', '#27272a'],
  },
  minimal_dark: {
    type: 'normal',
    backgroundColor: '#09090b',
    foregroundColor: '#fafafa',
    strongColor: '#fafafa',
    weakColor: '#a1a1aa',
    radarColor: '#fafafa',
    contribColors: ['#27272a', '#3f3f46', '#52525b', '#71717a', '#a1a1aa'],
  },
  retro: {
    type: 'normal',
    backgroundColor: '#fdf6e3',
    foregroundColor: '#657b83',
    strongColor: '#cb4b16',
    weakColor: '#2aa198',
    radarColor: '#cb4b16',
    contribColors: ['#eee8d5', '#e6dbb3', '#b58900', '#cb4b16', '#dc322f'],
  },
  retro_dark: {
    type: 'normal',
    backgroundColor: '#002b36',
    foregroundColor: '#93a1a1',
    strongColor: '#cb4b16',
    weakColor: '#2aa198',
    radarColor: '#cb4b16',
    contribColors: ['#073642', '#586e75', '#b58900', '#cb4b16', '#dc322f'],
  },
};

function getSettings(themeName: string, mode: string = 'light') {
  const isDark = mode === 'dark';
  const resolvedTheme = isDark && STANDARD_THEME_MAP[`${themeName}_dark`]
    ? `${themeName}_dark`
    : themeName;

  const standard = STANDARD_THEME_MAP[resolvedTheme];
  if (standard) {
    return { ...NormalSettings, ...standard } as NormalColorSettings;
  }

  switch (resolvedTheme) {
    case 'north':
      return NorthSeasonSettings;
    case 'south':
      return SouthSeasonSettings;
    case 'night':
      return NightViewSettings;
    case 'halloween':
      return HalloweenSettings;
    case 'gitblock':
      return GitBlockSettings;
    default:
      return NormalSettings;
  }
}

async function fetchUserInfo(token: string, username: string): Promise<UserInfo> {
  const [reposRes, contribRes] = await Promise.all([
    githubFetch(`https://api.github.com/users/${username}/repos?per_page=100`, token),
    fetch(`https://github-contributions-api.jogruber.de/v4/${username}?y=last`),
  ]);

  if (!reposRes.ok) {
    throw new Error(`GitHub repos API failed: ${reposRes.status} ${reposRes.statusText}`);
  }
  if (!contribRes.ok) {
    throw new Error(`Contributions API failed: ${contribRes.status} ${contribRes.statusText}`);
  }

  const repos = (await reposRes.json()) as Repo[];
  const contribData = await contribRes.json();

  const contributionCalendar =
    (contribData?.contributions as ContribDay[] | undefined)?.map((day) => ({
      date: new Date(day.date),
      contributionCount: day.count || 0,
      contributionLevel: day.level || 0,
    })) || [];

  const totalContributions =
    contribData?.total?.lastYear ||
    contribData?.total?.[new Date().getFullYear()] ||
    contributionCalendar.reduce((sum, d) => sum + d.contributionCount, 0);

  const languageMap = new Map<string, { color: string; count: number }>();
  for (const repo of repos) {
    const lang = repo.language;
    if (!lang) continue;
    const entry = languageMap.get(lang) || { color: getLanguageColor(lang), count: 0 };
    entry.count += 1;
    languageMap.set(lang, entry);
  }
  const contributesLanguage = Array.from(languageMap.entries())
    .map(([language, { color, count }]) => ({ language, color, contributions: count }))
    .sort((a, b) => b.contributions - a.contributions);

  const totalForkCount = repos.filter(r => !r.fork).reduce((sum, r) => sum + (r.forks_count || 0), 0);
  const totalStargazerCount = repos.filter(r => !r.fork).reduce(
    (sum, r) => sum + (r.stargazers_count || 0),
    0
  );

  return {
    isHalloween: false,
    contributionCalendar,
    contributesLanguage,
    totalContributions,
    totalCommitContributions: totalContributions,
    totalIssueContributions: 0,
    totalPullRequestContributions: 0,
    totalPullRequestReviewContributions: 0,
    totalRepositoryContributions: repos.length,
    totalForkCount,
    totalStargazerCount,
  };
}

function getLanguageColor(lang: string): string {
  switch (lang.toLowerCase()) {
    case 'javascript':
      return '#f1e05a';
    case 'typescript':
      return '#3178c6';
    case 'python':
      return '#3572A5';
    case 'java':
      return '#b07219';
    case 'html':
      return '#e34c26';
    case 'css':
      return '#563d7c';
    case 'go':
      return '#00ADD8';
    case 'rust':
      return '#dea584';
    default:
      return '#8b949e';
  }
}

function errorSvg(message: string, themeName: string, mode: string = 'light'): string {
  const isDark = mode === 'dark';
  const isCyberpunkDark = themeName === 'cyberpunk' && isDark;
  const bg = isDark ? '#0a0a0a' : '#ffffff';
  const fg = isDark ? '#ededed' : '#171717';
  const accent = isCyberpunkDark ? '#00ff41' : fg;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="400" viewBox="0 0 800 400">
    <rect width="800" height="400" fill="${bg}"/>
    <text x="400" y="180" text-anchor="middle" fill="${fg}" font-size="24" font-family="sans-serif">Unable to load 3D contribution graph</text>
    <text x="400" y="220" text-anchor="middle" fill="${fg}" font-size="14" font-family="sans-serif">${message}</text>
  </svg>`;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const user = searchParams.get('user') || 'iKislay';
    const theme = searchParams.get('theme') || 'geist';
    const mode = searchParams.get('mode') || 'light';
    const animate = searchParams.get('animate') === 'true';

    const userToken = await getUserToken(user);
    const token = resolveToken(userToken);
    if (!token) {
      return new Response(
        errorSvg('Server configuration is missing. Please contact the administrator.', theme, mode),
        {
          status: 503,
          headers: {
            'Content-Type': 'image/svg+xml',
            'Cache-Control': 'no-cache',
          },
        },
      );
    }

    const settings = getSettings(theme, mode);
    const userInfo = await fetchUserInfo(token, user);
    const svgContent = createSvg(userInfo, settings, animate);

    return new Response(svgContent, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('Error generating 3D contrib:', error);
    const message = error instanceof Error ? error.message : 'GitHub API rate limit or network error';
    return new Response(errorSvg(message, 'geist', 'light'), {
      status: 503,
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'no-cache',
      },
    });
  }
}
