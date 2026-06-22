import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { getTheme } from '@/lib/themes';

export const runtime = 'edge';
export const revalidate = 3600;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const user = searchParams.get('user') || 'gautamkmahato';
    const themeName = searchParams.get('theme') || 'geist';
    const theme = getTheme(themeName);

    const contributions = 101;
    const totalRepos = 101;
    
    const weeks = Array.from({ length: 52 }, () => 
      Array.from({ length: 7 }, () => Math.random() > 0.8 ? Math.floor(Math.random() * 4) + 1 : 0)
    );

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
      return colors[4];
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
          <div style={{ display: 'flex', marginBottom: '20px', fontSize: '18px' }}>
            <span style={{ fontWeight: 'bold', color: theme.colors.primary, marginRight: '6px' }}>{contributions}</span> 
            <span style={{ color: theme.colors.secondary }}>Contributions in the last year</span>
          </div>

          {/* Graph */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '40px' }}>
            <div style={{ display: 'flex', gap: '4px', alignSelf: 'flex-start' }}>
              {weeks.map((week, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {week.map((day, j) => (
                    <div 
                      key={j} 
                      style={{ 
                        width: '12px', 
                        height: '12px', 
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div style={{ display: 'flex', fontSize: '18px' }}>
              <span style={{ color: theme.colors.secondary, marginRight: '6px' }}>Total</span>
              <span style={{ fontWeight: 'bold', color: theme.colors.text, marginRight: '6px' }}>{totalRepos}</span>
              <span style={{ color: theme.colors.secondary }}>repositories</span>
            </div>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              padding: '8px 16px', 
              backgroundColor: theme.colors.background,
              borderRadius: '20px', 
              border: `1px solid ${theme.colors.border}`,
              fontSize: '16px',
              fontWeight: '500',
              color: theme.colors.text
            }}>
              Pinned Repositories <span style={{ marginLeft: '8px', fontSize: '12px' }}>▼</span>
            </div>
          </div>

          {/* Cards Grid */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
            {[
              { name: 'generative-art-opensource', desc: 'Create generative art by using the canvas api and node js, feel free to contribute to this...', lang: 'JavaScript', color: '#f1e05a', stars: 1, isJS: true },
              { name: 'SqlCraft', desc: 'A lightweight online Sqlite editor', lang: 'TypeScript', color: '#3178c6', stars: 0, isTS: true },
              { name: 'Swagger-UI', desc: '', lang: 'JavaScript', color: '#f1e05a', stars: 0, isJS: true },
              { name: 'tts', desc: 'A Python based Text to speech app', lang: 'Python', color: '#3572A5', stars: 0, isPy: true }
            ].map((repo, i) => (
              <div key={i} style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                width: '370px',
                height: '160px',
                padding: '20px',
                backgroundColor: theme.colors.background,
                border: `1px solid ${theme.colors.border}`,
                borderRadius: '16px',
                boxSizing: 'border-box'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px', fontSize: '20px' }}>
                  <span style={{ color: theme.colors.secondary }}>{user}/</span>
                  <span style={{ fontWeight: 'bold', color: theme.colors.text }}>{repo.name}</span>
                </div>
                
                <div style={{ 
                  display: 'flex', 
                  flex: 1,
                  fontSize: '15px', 
                  color: theme.colors.secondary, 
                  lineHeight: '1.4',
                  overflow: 'hidden'
                }}>
                  {repo.desc}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {repo.isJS && (
                         <div style={{ width: '20px', height: '20px', backgroundColor: '#f1e05a', color: 'black', fontSize: '10px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px' }}>JS</div>
                      )}
                      {repo.isTS && (
                         <div style={{ width: '20px', height: '20px', backgroundColor: '#3178c6', color: 'white', fontSize: '10px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px' }}>TS</div>
                      )}
                      {repo.isPy && (
                         <div style={{ width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px' }}>
                            <span style={{ fontSize: '16px' }}>🐍</span>
                         </div>
                      )}
                      <span style={{ fontSize: '14px', color: theme.colors.secondary }}>{repo.lang}</span>
                    </div>
                    {repo.stars > 0 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ color: theme.colors.secondary }}>☆</span>
                        <span style={{ fontSize: '14px', color: theme.colors.secondary }}>{repo.stars}</span>
                      </div>
                    )}
                  </div>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    width: '32px', 
                    height: '32px', 
                    borderRadius: '50%', 
                    backgroundColor: theme.colors.border
                  }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={theme.colors.secondary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
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