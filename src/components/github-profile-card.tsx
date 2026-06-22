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

export function GithubProfileCard({ username }: { username: string }) {
  const [repos, setRepos] = useState<Repo[]>([]);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [totalContributions, setTotalContributions] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

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
      default: return '#8b949e';
    }
  };

  if (loading) {
    return (
      <div className="flex h-[350px] w-full items-center justify-center rounded-xl bg-[#18181A]">
        <div className="size-6 animate-spin rounded-full border-2 border-neutral-600 border-t-neutral-200" />
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="flex h-[350px] w-full items-center justify-center rounded-xl bg-[#18181A] text-sm text-neutral-400">
        User not found
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col rounded-xl bg-[#18181A] p-6 font-sans text-[#c9d1d9] shadow-lg">
      {/* Calendar Section */}
      <div className="mb-6 w-full">
        <div className="mb-3 flex items-center text-sm">
          <span className="mr-1.5 font-bold text-white">{totalContributions !== null ? totalContributions : '...'}</span>
          <span className="text-[#A1A1AA]">Contributions in the last year</span>
        </div>
        <div className="flex w-full overflow-hidden [&>article>footer]:hidden">
          <GitHubCalendar 
            username={username} 
            colorScheme="dark"
            blockSize={10}
            blockMargin={3}
            theme={{
              dark: ['#27272A', '#0e4429', '#006d32', '#26a641', '#39d353']
            }}
            style={{ width: '100%', padding: 0 }}
          />
        </div>
      </div>

      {/* Repositories Header */}
      <div className="mb-3 flex items-center text-sm">
        <div className="flex items-center gap-1.5">
          <span className="text-[#A1A1AA]">Total</span>
          <span className="font-bold text-white">{userData.public_repos}</span>
          <span className="text-[#A1A1AA]">repositories</span>
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
            className="group flex flex-col rounded-lg border border-[#3F3F46] bg-[#18181A] p-4 transition-all hover:border-[#71717A]"
          >
            <div className="mb-2 text-sm leading-tight break-words">
              <span className="text-[#A1A1AA]">{userData.login}/</span>
              <span className="font-bold text-[#E4E4E7] group-hover:text-white">
                {repo.name}
              </span>
            </div>
            
            <p className="line-clamp-2 min-h-[36px] flex-1 text-xs leading-relaxed text-[#A1A1AA]">
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
                    <span className="text-xs text-[#A1A1AA]">{repo.language}</span>
                  </div>
                )}
                {repo.stargazers_count > 0 && (
                  <div className="flex items-center gap-1">
                    <svg className="size-3.5 text-[#A1A1AA]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                    </svg>
                    <span className="text-xs text-[#A1A1AA]">{repo.stargazers_count}</span>
                  </div>
                )}
              </div>
              {/* Removed Share Icon */}
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
