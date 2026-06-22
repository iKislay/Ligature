'use client';

import { useState } from 'react';
import { themes } from '@/lib/themes';

const themeKeys = Object.keys(themes);

export default function Customizer() {
  const [username, setUsername] = useState('torvalds');
  const [selectedTheme, setSelectedTheme] = useState('geist');

  const imageUrl = `/api/github?user=${username || 'torvalds'}&theme=${selectedTheme}`;
  
  // Real-world domain would go here. We use a placeholder for now.
  const fullImageUrl = `https://ligature.dev${imageUrl}`;
  const markdownSnippet = `[![${username}'s GitHub Stats](${fullImageUrl})](https://github.com/${username})`;

  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(markdownSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 my-16">
      
      {/* Controls */}
      <div className="lg:col-span-4 flex flex-col space-y-8">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100 mb-6">
            Configure Widget
          </h2>
          
          <div className="space-y-6">
            <div className="flex flex-col space-y-2">
              <label htmlFor="username" className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                GitHub Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="px-4 py-3 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow text-neutral-900 dark:text-neutral-100"
                placeholder="torvalds"
              />
            </div>

            <div className="flex flex-col space-y-2">
              <label htmlFor="theme" className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                Theme
              </label>
              <div className="relative">
                <select
                  id="theme"
                  value={selectedTheme}
                  onChange={(e) => setSelectedTheme(e.target.value)}
                  className="w-full appearance-none px-4 py-3 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow text-neutral-900 dark:text-neutral-100 uppercase tracking-wider text-sm font-medium"
                >
                  {themeKeys.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-neutral-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-neutral-200 dark:border-neutral-800">
          <h3 className="text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-3">
            Markdown Snippet
          </h3>
          <div className="relative group">
            <pre className="p-4 bg-neutral-100 dark:bg-neutral-900 rounded-lg text-xs font-mono text-neutral-800 dark:text-neutral-300 overflow-x-auto border border-neutral-200 dark:border-neutral-800">
              {markdownSnippet}
            </pre>
            <button
              onClick={handleCopy}
              className="absolute top-3 right-3 px-3 py-1.5 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 shadow-sm rounded-md text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>
      </div>

      {/* Preview */}
      <div className="lg:col-span-8">
        <div className="sticky top-12 bg-neutral-50 dark:bg-neutral-950 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-8 min-h-[400px] flex items-center justify-center">
          <img 
            src={imageUrl} 
            alt="Widget Preview"
            className="w-full max-w-[800px] shadow-xl rounded-xl"
          />
        </div>
      </div>

    </div>
  );
}
