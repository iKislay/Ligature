import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { getTheme, ThemeMode } from '@/lib/themes';
import { githubFetch, resolveToken, authRequiredResponse } from '@/lib/github-client';
import { getUserToken } from '@/lib/user-token';

export const runtime = 'nodejs';
export const revalidate = 3600;

async function getStarHistoryData(repo: string, token: string) {
  const repoRes = await githubFetch(`https://api.github.com/repos/${repo}`, token);
  if (!repoRes.ok) return null;
  const repoData = await repoRes.json();
  const totalStars = repoData.stargazers_count;
  const createdAt = repoData.created_at;

  const starData: { date: Date; count: number }[] = [];
  starData.push({ date: new Date(createdAt), count: 0 });

  if (totalStars > 0) {
    const MAX_PAGES = 10;
    const totalPages = Math.ceil(totalStars / 100);
    const pagesToFetch = [];
    
    if (totalPages <= MAX_PAGES) {
      for (let i = 1; i <= totalPages; i++) pagesToFetch.push(i);
    } else {
      pagesToFetch.push(1);
      for (let i = 1; i < MAX_PAGES - 1; i++) {
        pagesToFetch.push(Math.floor((totalPages / (MAX_PAGES - 1)) * i));
      }
      pagesToFetch.push(totalPages);
    }

    const fetchPage = async (page: number) => {
      const res = await githubFetch(`https://api.github.com/repos/${repo}/stargazers?per_page=100&page=${page}`, token, {
        headers: { Accept: 'application/vnd.github.v3.star+json' }
      });
      if (!res.ok) return [];
      return await res.json();
    };

    const pagesData = await Promise.all(pagesToFetch.map(p => fetchPage(p)));
    
    for (let i = 0; i < pagesToFetch.length; i++) {
      const pageData = pagesData[i];
      if (pageData.length > 0) {
        // Sample points from within the page if it's the only page (to get more dots for small repos)
        if (totalPages === 1) {
          pageData.forEach((item: any, idx: number) => {
            if (idx % 10 === 0 || idx === pageData.length - 1) {
              starData.push({ date: new Date(item.starred_at), count: idx + 1 });
            }
          });
        } else {
          // Just take the last star of the page
          const lastItem = pageData[pageData.length - 1];
          const count = (pagesToFetch[i] - 1) * 100 + pageData.length;
          starData.push({ date: new Date(lastItem.starred_at), count });
        }
      }
    }
    
    // Ensure final point is up to date
    const lastCount = starData[starData.length - 1].count;
    if (lastCount < totalStars) {
       starData.push({ date: new Date(), count: totalStars });
    }
  } else {
    // If 0 stars, just draw a line from creation to today
    starData.push({ date: new Date(), count: 0 });
  }

  return { data: starData, repoData };
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const repo = searchParams.get('repo') || 'iKislay/Ligature';
    const themeName = searchParams.get('theme') || 'geist';
    const modeParam = searchParams.get('mode');
    const mode: ThemeMode = modeParam === 'dark' ? 'dark' : 'light';
    const theme = getTheme(themeName, mode);

    // Use the repo owner to check for a token
    const owner = repo.split('/')[0];
    const userToken = await getUserToken(owner);
    const token = resolveToken(userToken);
    if (!token) {
      return authRequiredResponse('image');
    }

    const history = await getStarHistoryData(repo, token);

    if (!history) {
      return new ImageResponse(
        (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', backgroundColor: theme.colors.background, color: theme.colors.text }}>
            <h2>Repository not found or rate limit exceeded</h2>
          </div>
        ),
        { width: 840, height: 400 }
      );
    }

    const { data, repoData } = history;

    // Chart dimensions
    const width = 760; // 840 - 40*2 padding
    const height = 220; // 400 - header height and padding
    const paddingLeft = 40;
    const paddingBottom = 30;
    const chartWidth = width - paddingLeft;
    const chartHeight = height - paddingBottom;

    const minDate = data[0].date.getTime();
    let maxDate = new Date().getTime(); // up to today
    if (maxDate - minDate < 86400000) {
      maxDate = minDate + 86400000; // Force at least 1 day spread to avoid divide by zero
    }
    const maxCount = Math.max(repoData.stargazers_count, 10); // Minimum 10 scale

    const getX = (date: Date) => paddingLeft + ((date.getTime() - minDate) / (maxDate - minDate)) * chartWidth;
    const getY = (count: number) => chartHeight - (count / maxCount) * chartHeight;

    let pathString = `M ${getX(data[0].date)},${getY(data[0].count)}`;
    for (let i = 1; i < data.length; i++) {
      pathString += ` L ${getX(data[i].date)},${getY(data[i].count)}`;
    }
    
    // Add shading under the line
    const areaPathString = `${pathString} L ${getX(data[data.length-1].date)},${chartHeight} L ${paddingLeft},${chartHeight} Z`;

    const yGridLines = [0, 0.25, 0.5, 0.75, 1].map(mult => {
      const val = Math.round(maxCount * mult);
      return { val, y: getY(val) };
    });

    const isDark = mode === 'dark';
    const gridColor = isDark ? '#333333' : '#e5e5e5';
    const labelColor = theme.colors.secondary;

    // Convert colors for SVG
    const strokeColor = theme.colors.primary;

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
            border: `1px solid ${theme.colors.border}`,
            borderRadius: '12px',
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '24px', fontWeight: 'bold' }}>{repo}</span>
              <span style={{ fontSize: '14px', color: theme.colors.secondary }}>Star History</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill={theme.colors.secondary}>
                <path fillRule="evenodd" d="M8 .25a.75.75 0 01.673.418l1.882 3.815 4.21.612a.75.75 0 01.416 1.279l-3.046 2.97.719 4.192a.75.75 0 01-1.088.791L8 12.347l-3.766 1.98a.75.75 0 01-1.088-.79l.72-4.194L.818 6.374a.75.75 0 01.416-1.28l4.21-.611L7.327.668A.75.75 0 018 .25z"></path>
              </svg>
              <span style={{ fontSize: '24px', fontWeight: 'bold', color: theme.colors.primary }}>{repoData.stargazers_count}</span>
            </div>
          </div>

          {/* Chart Area */}
          <div style={{ display: 'flex', flex: 1, position: 'relative', width: '100%' }}>
            <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ position: 'absolute', top: 0, left: 0 }}>
              <defs>
                <linearGradient id="gradient" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor={strokeColor} stopOpacity="0.3" />
                  <stop offset="100%" stopColor={strokeColor} stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              {yGridLines.map((line, i) => (
                <g key={i}>
                  <line x1={paddingLeft} y1={line.y} x2={width} y2={line.y} stroke={gridColor} strokeWidth="1" strokeDasharray="4 4" />
                </g>
              ))}

              {/* Area */}
              <path d={areaPathString} fill="url(#gradient)" />

              {/* Line */}
              <path d={pathString} fill="none" stroke={strokeColor} strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />

              {/* Points */}
              {data.map((point, i) => (
                <circle key={i} cx={getX(point.date)} cy={getY(point.count)} r="4" fill={theme.colors.background} stroke={strokeColor} strokeWidth="2" />
              ))}
            </svg>
            
            {/* Y-Axis Labels as HTML */}
            {yGridLines.map((line, i) => (
              <div
                key={`y-label-${i}`}
                style={{
                  position: 'absolute',
                  left: 0,
                  top: line.y - 7,
                  width: paddingLeft - 8,
                  display: 'flex',
                  justifyContent: 'flex-end',
                  color: labelColor,
                  fontSize: '12px',
                  fontFamily: 'sans-serif'
                }}
              >
                {line.val}
              </div>
            ))}

            {/* Date Labels (Min/Max) as HTML */}
            <div
              style={{
                position: 'absolute',
                left: paddingLeft,
                top: height,
                display: 'flex',
                color: labelColor,
                fontSize: '12px',
                fontFamily: 'sans-serif'
              }}
            >
              {new Date(minDate).toLocaleDateString()}
            </div>
            <div
              style={{
                position: 'absolute',
                right: width - chartWidth - paddingLeft,
                top: height,
                display: 'flex',
                color: labelColor,
                fontSize: '12px',
                fontFamily: 'sans-serif'
              }}
            >
              Today
            </div>
          </div>
        </div>
      ),
      {
        width: 840,
        height: 400,
      }
    );
  } catch (error) {
    console.error('Error generating star history widget:', error);
    return new Response('Failed to generate image', { status: 500 });
  }
}
