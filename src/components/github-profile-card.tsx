'use client';

import React from 'react';

export function GithubProfileCard({ username, theme = 'geist' }: { username: string; theme?: string }) {
  return (
    <img
      src={`/api/github/profile?user=${encodeURIComponent(username)}&theme=${encodeURIComponent(theme)}`}
      alt={`${username}'s GitHub profile overview`}
      className="w-full max-w-[840px] rounded-xl border border-neutral-200 shadow-lg dark:border-neutral-800"
    />
  );
}
