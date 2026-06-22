import Link from 'next/link';
import { Github } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-black/80 backdrop-blur">
      <nav className="mx-auto flex w-[95%] flex-col flex-wrap items-start justify-start gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <Link
          aria-label="Ligature home"
          className="flex items-center gap-2 font-medium"
          href="/"
        >
          <div className="w-5 h-5 bg-black dark:bg-white rounded-sm" />
          <span className="font-medium tracking-tight text-neutral-900 dark:text-white">Ligature</span>
        </Link>
        <ul className="flex flex-wrap items-center gap-4">
          <li>
            <Link
              className="text-sm underline-offset-4 text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
              href="/"
            >
              Home
            </Link>
          </li>
          <li>
            <Link
              className="text-sm underline-offset-4 text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
              href="/docs"
            >
              Docs
            </Link>
          </li>
          <li>
            <Link
              className="text-sm underline-offset-4 text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
              href="https://github.com/iKislay/Ligature"
            >
              GitHub
            </Link>
          </li>
          <li>
            <ThemeToggle />
          </li>
        </ul>
      </nav>
    </header>
  );
}
