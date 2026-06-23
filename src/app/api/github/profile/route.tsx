import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { getTheme, ThemeMode } from '@/lib/themes';
import { githubFetch, resolveToken } from '@/lib/github-client';
import { getUserToken } from '@/lib/user-token';

export const runtime = 'nodejs';
export const revalidate = 3600;
export const dynamic = 'force-dynamic';

interface Repo {
  name: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  html_url: string;
}

interface ContributionDay {
  date: string;
  count: number;
  level: number;
}

const STAR_PATH = 'M12 .587l3.668 7.568 8.332 1.151-6.064 5.828 1.48 8.279-7.416-3.967-7.417 3.967 1.481-8.279-6.064-5.828 8.332-1.151z';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const month = MONTHS[d.getMonth()];
  const day = d.getDate();
  return `${month} ${day}`;
}

function getLanguageColor(lang: string): string {
  switch (lang?.toLowerCase()) {
    case 'javascript': return '#f1e05a';
    case 'typescript': return '#3178c6';
    case 'python': return '#3572A5';
    case 'java': return '#b07219';
    case 'html': return '#e34c26';
    case 'css': return '#563d7c';
    case 'go': return '#00ADD8';
    case 'rust': return '#dea584';
    case 'ruby': return '#701516';
    case 'php': return '#4F5D95';
    case 'c++': return '#f34b7d';
    case 'c': return '#555555';
    case 'swift': return '#F05138';
    case 'kotlin': return '#A97BFF';
    case 'dart': return '#00B4AB';
    case 'vue': return '#41b883';
    case 'svelte': return '#ff3e00';
    case 'shell': return '#89e051';
    case 'dockerfile': return '#384d54';
    default: return '#8b949e';
  }
}

function getContributionColor(level: number, themeName: string, mode: ThemeMode): string {
  const palettes: Record<string, { light: string[]; dark: string[] }> = {
    geist: {
      light: ['#ebedf0', '#dbeafe', '#93c5fd', '#3b82f6', '#1d4ed8'],
      dark: ['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353'],
    },
    cyberpunk: {
      light: ['#f3e8ff', '#c084fc', '#a855f7', '#9333ea', '#7e22ce'],
      dark: ['#1a0033', '#0d3d0d', '#00aa22', '#00dd33', '#00ff41'],
    },
    minimal: {
      light: ['#e4e4e7', '#d4d4d8', '#a1a1aa', '#52525b', '#27272a'],
      dark: ['#27272a', '#3f3f46', '#52525b', '#71717a', '#a1a1aa'],
    },
    retro: {
      light: ['#eee8d5', '#e6dbb3', '#b58900', '#cb4b16', '#dc322f'],
      dark: ['#073642', '#586e75', '#b58900', '#cb4b16', '#dc322f'],
    },
  };

  const palette = palettes[themeName] || palettes.geist;
  const colors = palette[mode] || palette.light;

  if (level === 0) return colors[0];
  if (level === 1) return colors[1];
  if (level === 2) return colors[2];
  if (level === 3) return colors[3];
  return colors[4] || colors[3];
}

function generateSvg(
  displayUser: string,
  totalRepos: number,
  contributions: number,
  weeks: number[][],
  allDays: ContributionDay[],
  rData: Repo[],
  themeName: string,
  mode: ThemeMode,
  theme: ReturnType<typeof getTheme>
): string {
  const cellSize = 11;
  const cellGap = 3;
  const cardWidth = 370;
  const cardHeight = 120;
  const cardGap = 16;
  const svgWidth = 800;
  const padding = 22;

  const repoCardsHtml = rData.map((repo, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = padding + col * (cardWidth + cardGap);
    const y = 230 + row * (cardHeight + cardGap);

    const langColor = repo.language ? getLanguageColor(repo.language) : '';
    const repoName = escapeXml(repo.name);
    const repoDesc = escapeXml(repo.description || 'No description provided.');
    const repoUrl = escapeXml(repo.html_url);

    return `
      <a href="${repoUrl}" target="_blank" rel="noopener noreferrer" style="text-decoration: none;">
        <rect x="${x}" y="${y}" width="${cardWidth}" height="${cardHeight}" rx="10" ry="10"
          fill="transparent" stroke="${theme.colors.border}" stroke-width="1"/>
        <text x="${x + 16}" y="${y + 28}" font-family="${escapeXml(theme.typography.fontFamily)}" font-size="14" font-weight="600" fill="${theme.colors.text}">
          <tspan fill="${theme.colors.secondary}">${escapeXml(displayUser)}/</tspan>${repoName}
        </text>
        <text x="${x + 16}" y="${y + 50}" font-family="${escapeXml(theme.typography.fontFamily)}" font-size="12" fill="${theme.colors.secondary}">
          ${repoDesc.length > 45 ? repoDesc.slice(0, 45) + '...' : repoDesc}
        </text>
        <g transform="translate(${x + 16}, ${y + 90})">
          ${repo.language ? `
            <circle cx="5" cy="0" r="5" fill="${langColor}"/>
            <text x="16" y="4" font-family="${escapeXml(theme.typography.fontFamily)}" font-size="12" fill="${theme.colors.secondary}">${escapeXml(repo.language)}</text>
          ` : ''}
          ${repo.stargazers_count > 0 ? `
            <g transform="translate(${repo.language ? 100 : 0}, 0)">
              <svg x="0" y="-8" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="${theme.colors.secondary}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
              <text x="18" y="4" font-family="${escapeXml(theme.typography.fontFamily)}" font-size="12" fill="${theme.colors.secondary}">${repo.stargazers_count.toLocaleString()}</text>
            </g>
          ` : ''}
        </g>
      </a>
    `;
  }).join('');

  const contributionCellsHtml = weeks.map((week, weekIdx) => {
    return week.map((level, dayIdx) => {
      const dayIndex = weekIdx * 7 + dayIdx;
      const dayData = allDays[dayIndex];
      const dateStr = dayData?.date || '';
      const count = dayData?.count || 0;
      const color = getContributionColor(level, themeName, mode);
      const x = weekIdx * (cellSize + cellGap);
      const y = dayIdx * (cellSize + cellGap);
      const tooltipText = `${count} contribution${count !== 1 ? 's' : ''} on ${formatDate(dateStr)}`;

      return `<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" rx="2" ry="2" fill="${color}">
        <title>${escapeXml(tooltipText)}</title>
      </rect>`;
    }).join('\n');
  }).join('\n');

  const monthLabelsHtml = (() => {
    const labels: string[] = [];
    let lastMonth = -1;
    weeks.forEach((_, weekIdx) => {
      const dayIndex = weekIdx * 7;
      const dayData = allDays[dayIndex];
      if (dayData?.date) {
        const d = new Date(dayData.date);
        const month = d.getMonth();
        if (month !== lastMonth) {
          lastMonth = month;
          const x = weekIdx * (cellSize + cellGap);
          labels.push(`<text x="${x}" y="${7 * (cellSize + cellGap) + 18}" font-family="${escapeXml(theme.typography.fontFamily)}" font-size="10" fill="${theme.colors.secondary}">${MONTHS[month]}</text>`);
        }
      }
    });
    return labels.join('\n');
  })();

  const graphHeight = 7 * (cellSize + cellGap);
  const svgHeight = 230 + Math.ceil(rData.length / 2) * (cardHeight + cardGap) + padding;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 ${svgWidth} ${svgHeight}" style="max-width: 100%; height: auto;">
  <style>
    text { -webkit-font-smoothing: antialiased; }
  </style>

  <!-- Header -->
  <text x="${padding}" y="32" font-family="${escapeXml(theme.typography.fontFamily)}" font-size="16">
    <tspan font-weight="700" fill="${theme.colors.primary}">${contributions.toLocaleString()}</tspan>
    <tspan fill="${theme.colors.secondary}" dx="6">Contributions in the last year</tspan>
  </text>

  <!-- Contribution Graph -->
  <g transform="translate(${padding}, 56)">
    ${contributionCellsHtml}
    ${monthLabelsHtml}
  </g>

  <!-- Repos Header -->
  <text x="${padding}" y="${graphHeight + 106}" font-family="${escapeXml(theme.typography.fontFamily)}" font-size="14" fill="${theme.colors.secondary}">
    <tspan fill="${theme.colors.secondary}">Total</tspan>
    <tspan fill="${theme.colors.text}" font-weight="600" dx="6">${totalRepos}</tspan>
    <tspan fill="${theme.colors.secondary}" dx="6">repositories</tspan>
  </text>

  <!-- Repo Cards -->
  ${repoCardsHtml}
</svg>`;
}

function generatePngFallback(
  displayUser: string,
  totalRepos: number,
  contributions: number,
  weeks: number[][],
  rData: Repo[],
  themeName: string,
  mode: ThemeMode,
  theme: ReturnType<typeof getTheme>
): ImageResponse {
  const getContributionColorPng = (level: number): string => {
    return getContributionColor(level, themeName, mode);
  };

  const getLanguageColorPng = (lang: string): string => {
    return getLanguageColor(lang);
  };

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'transparent',
          color: theme.colors.text,
          fontFamily: theme.typography.fontFamily,
          padding: '40px',
          boxSizing: 'border-box',
        }}
      >
        <div style={{ display: 'flex', marginBottom: '16px', fontSize: '16px' }}>
          <span style={{ fontWeight: 'bold', color: theme.colors.primary, marginRight: '6px' }}>{contributions.toLocaleString()}</span>
          <span style={{ color: theme.colors.secondary }}>Contributions in the last year</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', width: '100%', marginBottom: '24px' }}>
          <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignSelf: 'flex-start' }}>
            {weeks.map((week, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                {week.map((day, j) => (
                  <div
                    key={j}
                    style={{
                      width: '11px',
                      height: '11px',
                      backgroundColor: getContributionColorPng(day),
                      borderRadius: '2px'
                    }}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', fontSize: '14px' }}>
            <span style={{ color: theme.colors.secondary, marginRight: '6px' }}>Total</span>
            <span style={{ fontWeight: 'bold', color: theme.colors.text, marginRight: '6px' }}>{totalRepos}</span>
            <span style={{ color: theme.colors.secondary }}>repositories</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
          {rData.map((repo, i) => (
            <div key={i} style={{
              display: 'flex',
              flexDirection: 'column',
              width: '370px',
              height: '110px',
              padding: '16px',
              backgroundColor: 'transparent',
              border: `1px solid ${theme.colors.border}`,
              borderRadius: '10px',
              boxSizing: 'border-box'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px', fontSize: '14px' }}>
                <span style={{ color: theme.colors.secondary }}>{displayUser}/</span>
                <span style={{ fontWeight: 'bold', color: theme.colors.text }}>{repo.name}</span>
              </div>

              <div style={{
                display: 'flex',
                flex: 1,
                fontSize: '12px',
                color: theme.colors.secondary,
                lineHeight: '1.4',
                overflow: 'hidden'
              }}>
                {repo.description || 'No description provided.'}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  {repo.language && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ width: '10px', height: '10px', backgroundColor: getLanguageColorPng(repo.language), borderRadius: '50%' }} />
                      <span style={{ fontSize: '12px', color: theme.colors.secondary }}>{repo.language}</span>
                    </div>
                  )}
                  {repo.stargazers_count > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={theme.colors.secondary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                      <span style={{ fontSize: '12px', color: theme.colors.secondary }}>{repo.stargazers_count.toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
    {
      width: 800,
      height: 600,
    }
  );
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const user = searchParams.get('user') || 'iKislay';
    const themeName = searchParams.get('theme') || 'geist';
    const format = searchParams.get('format') || 'svg';
    const modeParam = searchParams.get('mode') as ThemeMode | null;
    const mode: ThemeMode = modeParam === 'light' ? 'light' : 'dark';
    const theme = getTheme(themeName, mode);

    const userToken = await getUserToken(user);
    const token = resolveToken(userToken);
    if (!token) {
      const errorSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="840" height="600" viewBox="0 0 840 600">
  <text x="420" y="290" text-anchor="middle" font-family="system-ui, sans-serif" font-size="20" font-weight="bold" fill="${theme.colors.text}">Widget temporarily unavailable</text>
  <text x="420" y="320" text-anchor="middle" font-family="system-ui, sans-serif" font-size="14" fill="${theme.colors.secondary}">Server configuration is missing. Please contact the administrator.</text>
</svg>`;
      return new Response(errorSvg, {
        headers: { 'Content-Type': 'image/svg+xml', 'Cache-Control': 'public, max-age=3600' },
      });
    }

    const [userRes, reposRes, contribRes] = await Promise.all([
      githubFetch(`https://api.github.com/users/${user}`, token),
      githubFetch(`https://api.github.com/users/${user}/repos?per_page=100`, token),
      fetch(`https://github-contributions-api.jogruber.de/v4/${user}?y=last`)
    ]);

    const uData = userRes.ok ? await userRes.json() : null;
    const allRepos = reposRes.ok ? (await reposRes.json()) as Repo[] : [];
    const rData = allRepos
      .sort((a, b) => (b.stargazers_count || 0) - (a.stargazers_count || 0))
      .slice(0, 4);
    const cData = contribRes.ok ? await contribRes.json() : null;

    const displayUser = uData?.login || user;
    const totalRepos = uData?.public_repos ?? allRepos.length;

    if (!uData && allRepos.length === 0) {
      const errorSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="840" height="600" viewBox="0 0 840 600">
  <text x="420" y="300" text-anchor="middle" font-family="system-ui, sans-serif" font-size="20" font-weight="bold" fill="${theme.colors.text}">GitHub API Rate Limit Exceeded or User Not Found</text>
</svg>`;
      return new Response(errorSvg, {
        headers: { 'Content-Type': 'image/svg+xml', 'Cache-Control': 'public, max-age=3600' },
      });
    }

    const contributions = cData?.total?.[new Date().getFullYear()] || cData?.total?.['lastYear'] || Object.values(cData?.total || {})[0] || 0;

    const allDays: ContributionDay[] = cData?.contributions || [];
    const recentDays = allDays.slice(-364);
    const weeks: number[][] = [];
    for (let i = 0; i < 52; i++) {
      const week: number[] = [];
      for (let j = 0; j < 7; j++) {
        const day = recentDays[i * 7 + j];
        week.push(day ? day.level : 0);
      }
      weeks.push(week);
    }

    if (format === 'png') {
      return generatePngFallback(displayUser, totalRepos, contributions, weeks, rData, themeName, mode, theme);
    }

    const svg = generateSvg(displayUser, totalRepos, contributions, weeks, allDays, rData, themeName, mode, theme);

    return new Response(svg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('Error generating GitHub profile widget:', error);
    return new Response('Failed to generate image', { status: 500 });
  }
}
