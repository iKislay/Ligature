import { NextRequest } from 'next/server';
import { ArcadeRenderer, ARCADE_GAMES } from '@/lib/widgets';

export const runtime = 'edge';
export const revalidate = 3600;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const user = searchParams.get('user') || 'octocat';
    const game = searchParams.get('game') || 'pacman';
    const themeName = searchParams.get('theme') || 'github';

    if (!ARCADE_GAMES.includes(game as any)) {
      return new Response(`Invalid game: ${game}. Valid options: ${ARCADE_GAMES.join(', ')}`, { status: 400 });
    }

    const svg = await new Promise<string>((resolve, reject) => {
      let generatedSvg = '';
      const renderer = new ArcadeRenderer({
        game: game as any,
        platform: 'github',
        username: user,
        gameTheme: themeName as any,
        playerStyle: 'opportunistic' as any,
        githubSettings: { accessToken: '' },
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
