import { NextRequest } from 'next/server';
import { ArcadeRenderer, ARCADE_GAMES } from '@/lib/widgets';
import type { GameType } from '@/lib/widgets';
import type { ThemeKeys } from '@/lib/widgets/shared/types';
import { GAME_THEMES } from '@/lib/widgets/shared/constants';
import { PlayerStyle } from '@/lib/widgets';
import { resolveToken } from '@/lib/github-client';
import { getUserToken } from '@/lib/user-token';

export const runtime = 'nodejs';
export const revalidate = 3600;
export const dynamic = 'force-dynamic';

function errorSvg(message: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="200" viewBox="0 0 800 200">
    <rect width="800" height="200" fill="#ffffff"/>
    <text x="400" y="85" text-anchor="middle" fill="#171717" font-size="20" font-family="sans-serif">Unable to load game widget</text>
    <text x="400" y="120" text-anchor="middle" fill="#6b7280" font-size="14" font-family="sans-serif">${message}</text>
  </svg>`;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const user = searchParams.get('user') || 'octocat';
    const game = searchParams.get('game') || 'pacman';
    const themeName = searchParams.get('theme') || 'geist';
    const mode = searchParams.get('mode') || 'light';

    if (!ARCADE_GAMES.includes(game as GameType)) {
      return new Response(`Invalid game: ${game}. Valid options: ${ARCADE_GAMES.join(', ')}`, { status: 400 });
    }

    const userToken = await getUserToken(user);
    const token = resolveToken(userToken);
    if (!token) {
      return new Response(errorSvg('Server configuration is missing. Please contact the administrator.'), {
        status: 503,
        headers: {
          'Content-Type': 'image/svg+xml',
          'Cache-Control': 'no-cache',
        },
      });
    }

    const isDark = mode === 'dark';
    const darkKey = `${themeName}_dark` as ThemeKeys;
    const resolvedTheme = isDark && GAME_THEMES[darkKey]
      ? darkKey
      : themeName as ThemeKeys;

    const svg = await new Promise<string>((resolve, reject) => {
      let generatedSvg = '';
      const renderer = new ArcadeRenderer({
        game: game as GameType,
        platform: 'github',
        username: user,
        gameTheme: resolvedTheme,
        playerStyle: PlayerStyle.OPPORTUNISTIC,
        githubSettings: { accessToken: token },
        svgCallback: (svgContent: string) => {
          generatedSvg = svgContent;
        },
        gameOverCallback: () => {
          resolve(generatedSvg);
        },
        pointsIncreasedCallback: () => {}
      });
      renderer.start().catch(reject);
    });

    return new Response(svg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('Error generating game widget:', error);
    return new Response('Failed to generate image', { status: 500 });
  }
}
