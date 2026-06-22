import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { getTheme } from '@/lib/themes';

export const runtime = 'edge';

// Aggressive caching (60 minutes) to prevent rate-limiting as per constraints
export const revalidate = 3600;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const user = searchParams.get('user') || 'octocat';
    const themeName = searchParams.get('theme') || 'geist';
    const theme = getTheme(themeName);

    // TODO: Connect to Redis (Upstash) for caching actual API responses
    // TODO: Fetch real GitHub data using the username

    // Mock data for Phase 1 Scaffold
    const stats = {
      commits: 1337,
      prs: 42,
      issues: 12,
      stars: 128,
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
            {/* User Avatar Placeholder */}
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '32px',
                backgroundColor: theme.colors.primary,
                marginRight: '20px',
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
