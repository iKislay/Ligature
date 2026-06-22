/**
 * Authenticated GitHub REST fetch helper.
 *
 * Priority:
 * 1. GITHUB_TOKEN env var as a Bearer token in the Authorization header.
 * 2. GITHUB_ID + GITHUB_SECRET env vars appended as query params for OAuth-app
 *    rate-limiting (used only when no user token is available).
 */
export function githubAuthUrl(url: string): string {
  if (process.env.GITHUB_TOKEN) {
    return url;
  }

  const id = process.env.GITHUB_ID;
  const secret = process.env.GITHUB_SECRET;
  if (!id || !secret) {
    return url;
  }

  const sep = url.includes('?') ? '&' : '?';
  return `${url}${sep}client_id=${encodeURIComponent(id)}&client_secret=${encodeURIComponent(secret)}`;
}

export async function githubFetch(url: string, init?: RequestInit): Promise<Response> {
  const authenticatedUrl = githubAuthUrl(url);
  const headers: Record<string, string> = {
    'User-Agent': 'Ligature/1.0',
    ...(init?.headers as Record<string, string>),
  };

  if (process.env.GITHUB_TOKEN) {
    headers['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  return fetch(authenticatedUrl, {
    ...init,
    headers,
  });
}
