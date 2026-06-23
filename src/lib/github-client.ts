/**
 * Authenticated GitHub REST fetch helper.
 *
 * Tries the user's personal token first, then falls back to the server-wide
 * GITHUB_TOKEN env var so that public-data widgets work without requiring
 * every visitor to authenticate.
 */

function getServerToken(): string {
  return process.env.GITHUB_TOKEN ?? '';
}

export async function githubFetch(
  url: string,
  token: string,
  init?: RequestInit,
): Promise<Response> {
  const effectiveToken = token || getServerToken();

  const headers: Record<string, string> = {
    'User-Agent': 'Ligature/1.0',
    ...(init?.headers as Record<string, string>),
  };

  if (effectiveToken) {
    headers['Authorization'] = `Bearer ${effectiveToken}`;
  }

  return fetch(url, {
    ...init,
    headers,
  });
}

/**
 * Returns a usable token: the user's own token if present, otherwise
 * the server token. Returns null only when neither exists (shouldn't
 * happen in production if GITHUB_TOKEN is set).
 */
export function resolveToken(userToken: string | null): string | null {
  return userToken || getServerToken() || null;
}

/**
 * Friendly SVG shown when even the server token is missing.
 */
export function authRequiredResponse(type: 'svg' | 'image' = 'svg') {
  if (type === 'svg') {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="200" viewBox="0 0 800 200">
      <rect width="800" height="200" fill="#ffffff"/>
      <text x="400" y="85" text-anchor="middle" fill="#171717" font-size="20" font-family="sans-serif">Widget temporarily unavailable</text>
      <text x="400" y="120" text-anchor="middle" fill="#6b7280" font-size="14" font-family="sans-serif">Server configuration is missing. Please contact the administrator.</text>
    </svg>`;
    return new Response(svg, {
      status: 503,
      headers: { 'Content-Type': 'image/svg+xml' },
    });
  }
  return new Response('Service temporarily unavailable', { status: 503 });
}
