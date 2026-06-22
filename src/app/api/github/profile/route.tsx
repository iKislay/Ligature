import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';
export const revalidate = 3600;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const user = searchParams.get('user') || 'gautamkmahato';

    const contributions = 101;
    const totalRepos = 101;
    
    // Generate a mock contribution graph
    const weeks = Array.from({ length: 52 }, () => 
      Array.from({ length: 7 }, () => Math.random() > 0.8 ? Math.floor(Math.random() * 4) + 1 : 0)
    );

    const getLevelColor = (level: number) => {
      if (level === 0) return '#161b22';
      if (level === 1) return '#0e4429';
      if (level === 2) return '#006d32';
      if (level === 3) return '#26a641';
      return '#39d353';
    };

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#1C1C1E',
            color: '#c9d1d9',
            fontFamily: 'sans-serif',
            padding: '40px',
            boxSizing: 'border-box',
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', marginBottom: '20px', fontSize: '18px' }}>
            <span style={{ fontWeight: 'bold', color: '#FFFFFF', marginRight: '6px' }}>{contributions}</span> 
            <span style={{ color: '#A0A0A5' }}>Contributions in the last year</span>
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
              <span style={{ color: '#A0A0A5', marginRight: '6px' }}>Total</span>
              <span style={{ fontWeight: 'bold', color: '#FFFFFF', marginRight: '6px' }}>{totalRepos}</span>
              <span style={{ color: '#A0A0A5' }}>repositories</span>
            </div>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              padding: '8px 16px', 
              backgroundColor: '#2C2C2E', 
              borderRadius: '20px', 
              border: '1px solid #3A3A3C',
              fontSize: '16px',
              fontWeight: '500',
              color: '#FFFFFF'
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
                backgroundColor: '#1C1C1E',
                border: '1px solid #3A3A3C',
                borderRadius: '16px',
                boxSizing: 'border-box'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px', fontSize: '20px' }}>
                  <span style={{ color: '#A0A0A5' }}>{user}/</span>
                  <span style={{ fontWeight: 'bold', color: '#FFFFFF' }}>{repo.name}</span>
                </div>
                
                <div style={{ 
                  display: 'flex', 
                  flex: 1,
                  fontSize: '15px', 
                  color: '#A0A0A5', 
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
                      <span style={{ fontSize: '14px', color: '#A0A0A5' }}>{repo.lang}</span>
                    </div>
                    {repo.stars > 0 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ color: '#A0A0A5' }}>☆</span>
                        <span style={{ fontSize: '14px', color: '#A0A0A5' }}>{repo.stars}</span>
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
                    backgroundColor: '#2C2C2E' 
                  }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#A0A0A5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
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
