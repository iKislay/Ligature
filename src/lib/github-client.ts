/**
 * Authenticated GitHub REST fetch helper.
 *
 * Every request must carry a valid user access token. There is no anonymous
 * fallback and no shared server token. This keeps each user's GitHub quota
 * separate and avoids leaking a single deployer token.
 */
export async function githubFetch(
  url: string,
  token: string,
  init?: RequestInit,
): Promise<Response> {
  if (!token) {
    throw new Error('A GitHub access token is required for all API calls.');
  }

  const headers: Record<string, string> = {
    'User-Agent': 'Ligature/1.0',
    Authorization: `Bearer ${token}`,
    ...(init?.headers as Record<string, string>),
  };

  return fetch(url, {
    ...init,
    headers,
  });
}

/**
 * Error response used by widget routes when the requested user has not
 * connected their GitHub account yet.
 */
export function authRequiredResponse(type: 'svg' | 'image' = 'svg') {
  if (type === 'svg') {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="200" viewBox="0 0 800 200">
      <rect width="800" height="200" fill="#ffffff"/>
      <text x="400" y="85" text-anchor="middle" fill="#171717" font-size="20" font-family="sans-serif">Connect your GitHub account to generate this widget</text>
      <text x="400" y="120" text-anchor="middle" fill="#6b7280" font-size="14" font-family="sans-serif">Sign in at https://ligature.dev to enable embeds for your username.</text>
    </svg>`;
    return new Response(svg, {
      status: 401,
      headers: { 'Content-Type': 'image/svg+xml' },
    });
  }
  // image/png not easily generated here; callers should render their own.
  return new Response('Authentication required', { status: 401 });
}
