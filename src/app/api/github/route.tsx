import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { getTheme } from '@/lib/themes';
import { githubFetch } from '@/lib/github-client';

export const runtime = 'edge';

// Aggressive caching (60 minutes) to prevent rate-limiting as per constraints
export const revalidate = 3600;

async function fetchAllRepos(username: string): Promise<Array<{ stargazers_count: number }>> {
  const repos: Array<{ stargazers_count: number }> = [];
  let page = 1;
  while (page <= 10) {
    const res = await githubFetch(
      `https://api.github.com/users/${username}/repos?per_page=100&page=${page}&sort=pushed`
    );
    if (!res.ok) break;
    const data = (await res.json()) as Array<{ stargazers_count: number }>;
    repos.push(...data);
    if (data.length < 100) break;
    page++;
  }
  return repos;
}

async function fetchTotalStars(username: string): Promise<number> {
  const repos = await fetchAllRepos(username);
  return repos.reduce((sum, repo) => sum + (repo.stargazers_count || 0), 0);
}

async function fetchSearchCount(username: string, type: 'pr' | 'issue'): Promise<number> {
  const res = await githubFetch(
    `https://api.github.com/search/issues?q=author:${username}+type:${type}&per_page=1`
  );
  if (!res.ok) return 0;
  const data = (await res.json()) as { total_count?: number };
  return data.total_count || 0;
}

async function fetchContributionsLastYear(username: string): Promise<number> {
  const res = await fetch(
    `https://github-contributions-api.jogruber.de/v4/${username}?y=last`
  );
  if (!res.ok) return 0;
  const data = (await res.json()) as { total?: Record<string, number> };
  const total = data.total || {};
  return (
    total['lastYear'] ||
    total[new Date().getFullYear()] ||
    Object.values(total)[0] ||
    0
  );
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const user = searchParams.get('user') || 'octocat';
    const themeName = searchParams.get('theme') || 'geist';
    const theme = getTheme(themeName);

    const [commits, prs, issues, stars] = await Promise.all([
      fetchContributionsLastYear(user),
      fetchSearchCount(user, 'pr'),
      fetchSearchCount(user, 'issue'),
      fetchTotalStars(user),
    ]);

    const stats = {
      commits,
      prs,
      issues,
      stars,
    };

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            justifyContent: 'center',
            backgroundColor: theme.colors.background,
            color: theme.colors.text,
            fontFamily: theme.typography.fontFamily,
            padding: '40px',
            border: `1px solid ${theme.colors.border}`,
            borderRadius: '12px',
          }}
        >
          <div style={{ display: 'flex', marginBottom: '32px', alignItems: 'center' }}>
            <img
              src={`https://github.com/${user}.png`}
              alt={user}
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '32px',
                marginRight: '20px',
                border: `2px solid ${theme.colors.border}`,
              }}
            />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '28px', fontWeight: 'bold' }}>@{user}</span>
              <span style={{ fontSize: '18px', color: theme.colors.secondary }}>
                GitHub Contributions
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '48px' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '16px', color: theme.colors.secondary, marginBottom: '8px' }}>Commits</span>
              <span style={{ fontSize: '32px', fontWeight: 'bold', color: theme.colors.primary }}>
                {stats.commits}
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '16px', color: theme.colors.secondary, marginBottom: '8px' }}>PRs</span>
              <span style={{ fontSize: '32px', fontWeight: 'bold', color: theme.colors.primary }}>
                {stats.prs}
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '16px', color: theme.colors.secondary, marginBottom: '8px' }}>Issues</span>
              <span style={{ fontSize: '32px', fontWeight: 'bold', color: theme.colors.primary }}>
                {stats.issues}
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '16px', color: theme.colors.secondary, marginBottom: '8px' }}>Stars</span>
              <span style={{ fontSize: '32px', fontWeight: 'bold', color: theme.colors.primary }}>
                {stats.stars}
              </span>
            </div>
          </div>
        </div>
      ),
      {
        width: 800,
        height: 400,
      }
    );
  } catch (error) {
    console.error('Error generating GitHub widget:', error);
    return new Response('Failed to generate image', { status: 500 });
  }
}
