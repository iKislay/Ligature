import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { getTheme } from '@/lib/themes';
import { githubFetch } from '@/lib/github-client';

export const runtime = 'edge';
export const revalidate = 3600;

async function getStarHistoryData(repo: string) {
  const repoRes = await githubFetch(`https://api.github.com/repos/${repo}`);
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
      const res = await githubFetch(`https://api.github.com/repos/${repo}/stargazers?per_page=100&page=${page}`, {
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
  }

  return { data: starData, repoData };
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const repo = searchParams.get('repo') || 'iKislay/Ligature';
    const themeName = searchParams.get('theme') || 'geist';
    const theme = getTheme(themeName);

    const history = await getStarHistoryData(repo);

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
    const maxDate = new Date().getTime(); // up to today
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

    const isDark = themeName.includes('dark') || themeName === 'cyberpunk' || themeName === 'monokai';
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
              <span style={{ color: theme.colors.secondary, fontSize: '16px' }}>★</span>
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
                  <text x={paddingLeft - 8} y={line.y + 4} fill={labelColor} fontSize="12" textAnchor="end" fontFamily="sans-serif">
                    {line.val}
                  </text>
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
              
              {/* Date Labels (Min/Max) */}
              <text x={paddingLeft} y={height} fill={labelColor} fontSize="12" textAnchor="start" fontFamily="sans-serif">
                {new Date(minDate).toLocaleDateString()}
              </text>
              <text x={width} y={height} fill={labelColor} fontSize="12" textAnchor="end" fontFamily="sans-serif">
                Today
              </text>
            </svg>
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
