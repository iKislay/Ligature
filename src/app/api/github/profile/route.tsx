import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { getTheme } from '@/lib/themes';
import { githubFetch } from '@/lib/github-client';
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

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const user = searchParams.get('user') || 'iKislay';
    const themeName = searchParams.get('theme') || 'geist';
    const theme = getTheme(themeName);

    const token = await getUserToken(user);
    if (!token) {
      return new ImageResponse(
        (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', backgroundColor: theme.colors.background, color: theme.colors.text, fontFamily: 'sans-serif', padding: '40px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '12px' }}>Connect your GitHub account</div>
              <div style={{ fontSize: '16px', color: theme.colors.secondary }}>Sign in at ligature.dev to enable widgets for @{user}</div>
            </div>
          </div>
        ),
        { width: 840, height: 600 }
      );
    }

    const [userRes, reposRes, contribRes] = await Promise.all([
      githubFetch(token, `https://api.github.com/users/${user}`),
      githubFetch(token, `https://api.github.com/users/${user}/repos?per_page=100`),
      fetch(`https://github-contributions-api.jogruber.de/v4/${user}?y=last`)
    ]);

    const uData = userRes.ok ? await userRes.json() : null;
    const allRepos = reposRes.ok ? (await reposRes.json()) as Repo[] : [];
    // GitHub ignores `sort=stargazers_count`; sort client-side.
    const rData = allRepos
      .sort((a, b) => (b.stargazers_count || 0) - (a.stargazers_count || 0))
      .slice(0, 4);
    const cData = contribRes.ok ? await contribRes.json() : null;

    // Degrade gracefully if the user endpoint is rate-limited:
    // use the username from the query and derive repo count from the repos call.
    const displayUser = uData?.login || user;
    const totalRepos = uData?.public_repos ?? allRepos.length;

    // Only hard-fail if we have nothing to show.
    if (!uData && allRepos.length === 0) {
      return new ImageResponse(
        (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', backgroundColor: theme.colors.background, color: theme.colors.text, fontFamily: 'sans-serif' }}>
            <h2>GitHub API Rate Limit Exceeded or User Not Found</h2>
          </div>
        ),
        { width: 840, height: 600 }
      );
    }
    const contributions = cData?.total?.[new Date().getFullYear()] || cData?.total?.['lastYear'] || Object.values(cData?.total || {})[0] || 0;
    
    // Process contributions into weeks array (52 weeks, 7 days)
    // The API returns contributions array of { date, count, level }
    const allDays = cData?.contributions || [];
    // We want the last 364 days to form exactly 52 weeks of 7 days
    const recentDays = allDays.slice(-364);
    const weeks: number[][] = [];
    for (let i = 0; i < 52; i++) {
      const week = [];
      for (let j = 0; j < 7; j++) {
        const day = recentDays[i * 7 + j];
        week.push(day ? day.level : 0);
      }
      weeks.push(week);
    }

    const getLevelColor = (level: number) => {
      const intensityColors = ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39'];
      const themeIntensity: Record<string, string[]> = {
        geist: ['#ebedf0', '#dbeafe', '#93c5fd', '#3b82f6', '#006bff'],
        geist_dark: ['#1a1a1a', '#1e293b', '#1d4ed8', '#2563eb', '#3b82f6'],
        cyberpunk: ['#1a0033', '#0d3d0d', '#00aa22', '#00dd33', '#00ff41'],
        minimal: ['#e4e4e7', '#d4d4d8', '#a1a1aa', '#52525b', '#27272a'],
        retro: ['#eee8d5', '#e6dbb3', '#b58900', '#cb4b16', '#dc322f'],
      };
      const colors = themeIntensity[themeName] || intensityColors;
      if (level === 0) return colors[0];
      if (level === 1) return colors[1];
      if (level === 2) return colors[2];
      if (level === 3) return colors[3];
      return colors[4] || colors[3];
    };

    const getLanguageColor = (lang: string) => {
      switch (lang?.toLowerCase()) {
        case 'javascript': return '#f1e05a';
        case 'typescript': return '#3178c6';
        case 'python': return '#3572A5';
        case 'java': return '#b07219';
        case 'html': return '#e34c26';
        case 'css': return '#563d7c';
        case 'go': return '#00ADD8';
        case 'rust': return '#dea584';
        default: return '#8b949e';
      }
    };

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: theme.colors.background,
            color: theme.colors.text,
            fontFamily: theme.typography.fontFamily,
            padding: '40px',
            boxSizing: 'border-box',
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', marginBottom: '16px', fontSize: '16px' }}>
            <span style={{ fontWeight: 'bold', color: theme.colors.primary, marginRight: '6px' }}>{contributions}</span> 
            <span style={{ color: theme.colors.secondary }}>Contributions in the last year</span>
          </div>

          {/* Graph */}
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
                        backgroundColor: getLevelColor(day),
                        borderRadius: '2px' 
                      }} 
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Repos Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', fontSize: '16px' }}>
              <span style={{ color: theme.colors.secondary, marginRight: '6px' }}>Total</span>
              <span style={{ fontWeight: 'bold', color: theme.colors.text, marginRight: '6px' }}>{totalRepos}</span>
              <span style={{ color: theme.colors.secondary }}>repositories</span>
            </div>
          </div>

          {/* Cards Grid */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
            {rData.map((repo, i) => (
              <div key={i} style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                width: '370px',
                height: '140px',
                padding: '16px',
                backgroundColor: theme.colors.background,
                border: `1px solid ${theme.colors.border}`,
                borderRadius: '12px',
                boxSizing: 'border-box'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px', fontSize: '16px' }}>
                  <span style={{ color: theme.colors.secondary }}>{displayUser}/</span>
                  <span style={{ fontWeight: 'bold', color: theme.colors.text }}>{repo.name}</span>
                </div>
                
                <div style={{ 
                  display: 'flex', 
                  flex: 1,
                  fontSize: '13px',  
                  color: theme.colors.secondary, 
                  lineHeight: '1.4',
                  overflow: 'hidden'
                }}>
                  {repo.description || 'No description provided.'}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    {repo.language && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{ width: '10px', height: '10px', backgroundColor: getLanguageColor(repo.language), borderRadius: '50%' }} />
                        <span style={{ fontSize: '13px', color: theme.colors.secondary }}>{repo.language}</span>
                      </div>
                    )}
                    {repo.stargazers_count > 0 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ color: theme.colors.secondary, fontSize: '13px' }}>★</span>
                        <span style={{ fontSize: '13px', color: theme.colors.secondary }}>{repo.stargazers_count}</span>
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
        width: 840,
        height: 600,
      }
    );
  } catch (error) {
    console.error('Error generating GitHub profile widget:', error);
    return new Response('Failed to generate image', { status: 500 });
  }
}

