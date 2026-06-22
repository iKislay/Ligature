'use client';

import React, { useEffect, useState } from 'react';
import { GitHubCalendar } from './react-github-calendar/index';

interface Repo {
  id: number;
  name: string;
  description: string;
  language: string;
  stargazers_count: number;
  html_url: string;
}

interface UserData {
  public_repos: number;
  login: string;
}

const themeStyles: Record<string, { bg: string; text: string; secondary: string; border: string; primary: string; cardBg: string; calendarColors: string[] }> = {
  geist: {
    bg: '#ffffff', text: '#171717', secondary: '#4d4d4d', border: '#eaeaea', primary: '#006bff', cardBg: '#f5f5f5',
    calendarColors: ['#ebedf0', '#dbeafe', '#93c5fd', '#3b82f6', '#006bff']
  },
  geist_dark: {
    bg: '#0a0a0a', text: '#ededed', secondary: '#a1a1aa', border: '#333333', primary: '#006bff', cardBg: '#1a1a1a',
    calendarColors: ['#161b22', '#1e293b', '#1d4ed8', '#2563eb', '#3b82f6']
  },
  cyberpunk: {
    bg: '#0d0221', text: '#00ff41', secondary: '#00e5ff', border: '#ff003c', primary: '#ff003c', cardBg: '#1a0033',
    calendarColors: ['#1a0033', '#0d3d0d', '#00aa22', '#00dd33', '#00ff41']
  },
  minimal: {
    bg: '#f4f4f5', text: '#27272a', secondary: '#71717a', border: '#e4e4e7', primary: '#18181b', cardBg: '#e4e4e7',
    calendarColors: ['#e4e4e7', '#d4d4d8', '#a1a1aa', '#52525b', '#27272a']
  },
  retro: {
    bg: '#fdf6e3', text: '#657b83', secondary: '#2aa198', border: '#eee8d5', primary: '#cb4b16', cardBg: '#eee8d5',
    calendarColors: ['#eee8d5', '#e6dbb3', '#b58900', '#cb4b16', '#dc322f']
  }
};

export function GithubProfileCard({ username, theme = 'geist' }: { username: string; theme?: string }) {
  const [repos, setRepos] = useState<Repo[]>([]);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [totalContributions, setTotalContributions] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const t = themeStyles[theme] || themeStyles.geist;
  const isDark = theme === 'geist_dark' || theme === 'cyberpunk';

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [userRes, reposRes, contribRes] = await Promise.all([
          fetch(`https://api.github.com/users/${username}`),
          fetch(`https://api.github.com/users/${username}/repos?sort=stargazers_count&per_page=4`),
          fetch(`https://github-contributions-api.jogruber.de/v4/${username}?y=last`)
        ]);

        if (userRes.ok && reposRes.ok) {
          const uData = await userRes.json();
          const rData = await reposRes.json();
          setUserData(uData);
          setRepos(rData);
        }
        
        if (contribRes.ok) {
           const cData = await contribRes.json();
           setTotalContributions(cData?.total?.[new Date().getFullYear()] || cData?.total?.['lastYear'] || Object.values(cData?.total || {})[0] || 0);
        }
      } catch (error) {
        console.error('Error fetching GitHub data:', error);
      } finally {
        setLoading(false);
      }
    }

    if (username) {
      fetchData();
    }
  }, [username]);

  const getLanguageIcon = (lang: string) => {
    if (!lang) return null;
    const map: Record<string, string> = {
      'JavaScript': 'JavaScript',
      'TypeScript': 'TypeScript',
      'Python': 'Python-Dark',
      'Java': 'Java-Dark',
      'HTML': 'HTML',
      'CSS': 'CSS',
      'Go': 'GoLang',
      'Rust': 'Rust',
      'Ruby': 'Ruby',
      'PHP': 'PHP-Dark',
      'C++': 'CPP',
      'C': 'C',
      'C#': 'CS',
      'Swift': 'Swift',
      'Vue': 'VueJS-Dark',
      'Shell': 'Bash-Dark'
    };
    return map[lang] || null;
  };

  const getLanguageColor = (lang: string) => {
    switch (lang?.toLowerCase()) {
      case 'javascript': return '#f1e05a';
      case 'typescript': return '#3178c6';
      case 'python': return '#3572A5';
      case 'java': return '#b07219';
      case 'html': return '#e34c26';
      case 'css': return '#563d7c';
      case 'go': return '#00ADD8';
      case 'rust': return '#dea584';
      default: return t.secondary;
    }
  };

  if (loading) {
    return (
      <div className="flex h-[350px] w-full items-center justify-center rounded-xl" style={{ backgroundColor: t.bg }}>
        <div className="size-6 animate-spin rounded-full border-2" style={{ borderColor: t.border, borderTopColor: t.text }} />
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="flex h-[350px] w-full items-center justify-center rounded-xl text-sm" style={{ backgroundColor: t.bg, color: t.secondary }}>
        User not found
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col rounded-xl p-6 font-sans shadow-lg" style={{ backgroundColor: t.bg, color: t.text }}>
      {/* Calendar Section */}
      <div className="mb-6 w-full">
        <div className="mb-3 flex items-center text-sm">
          <span className="mr-1.5 font-bold" style={{ color: t.text }}>{totalContributions !== null ? totalContributions : '...'}</span>
          <span style={{ color: t.secondary }}>Contributions in the last year</span>
        </div>
        <div className="flex w-full overflow-hidden [&>article>footer]:hidden">
          <GitHubCalendar 
            username={username} 
            colorScheme={isDark ? 'dark' : 'light'}
            blockSize={10}
            blockMargin={3}
            theme={isDark ? { dark: t.calendarColors } : { light: t.calendarColors }}
            style={{ width: '100%', padding: 0 }}
          />
        </div>
      </div>

      {/* Repositories Header */}
      <div className="mb-3 flex items-center text-sm">
        <div className="flex items-center gap-1.5">
          <span style={{ color: t.secondary }}>Total</span>
          <span className="font-bold" style={{ color: t.text }}>{userData.public_repos}</span>
          <span style={{ color: t.secondary }}>repositories</span>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {repos.map((repo) => (
          <a
            key={repo.id}
            href={repo.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col rounded-lg border p-4 transition-all hover:opacity-80"
            style={{ borderColor: t.border, backgroundColor: t.cardBg }}
          >
            <div className="mb-2 text-sm leading-tight break-words">
              <span style={{ color: t.secondary }}>{userData.login}/</span>
              <span className="font-bold" style={{ color: t.text }}>{repo.name}</span>
            </div>
            
            <p className="line-clamp-2 min-h-[36px] flex-1 text-xs leading-relaxed" style={{ color: t.secondary }}>
              {repo.description || 'No description provided.'}
            </p>

            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {repo.language && (
                  <div className="flex items-center gap-1.5">
                    {getLanguageIcon(repo.language) ? (
                      <img 
                        src={`/assets/skills-icon/${getLanguageIcon(repo.language)}.svg`} 
                        alt={repo.language} 
                        className="size-4" 
                      />
                    ) : (
                      <div 
                        className="size-2.5 rounded-full" 
                        style={{ backgroundColor: getLanguageColor(repo.language) }} 
                      />
                    )}
                    <span className="text-xs" style={{ color: t.secondary }}>{repo.language}</span>
                  </div>
                )}
                {repo.stargazers_count > 0 && (
                  <div className="flex items-center gap-1">
                    <svg className="size-3.5" style={{ color: t.secondary }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                    </svg>
                    <span className="text-xs" style={{ color: t.secondary }}>{repo.stargazers_count}</span>
                  </div>
                )}
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
