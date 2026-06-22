import Link from 'next/link';

export function SiteFooter() {
  return (
    <footer className="border-t border-neutral-200 dark:border-neutral-800">
      <div className="mx-auto flex w-[95%] flex-wrap items-center justify-between gap-8 px-4 py-6 font-medium text-sm text-neutral-500">
        <span>
          Built by{' '}
          <a
            className="text-neutral-900 dark:text-neutral-100 hover:underline"
            href="https://github.com/iKislay"
            rel="noopener noreferrer"
            target="_blank"
          >
            @iKislay
          </a>
          . The source code is available on{' '}
          <a
            className="text-neutral-900 dark:text-neutral-100 hover:underline"
            href="https://github.com/iKislay/Ligature"
            rel="noopener noreferrer"
            target="_blank"
          >
            GitHub
          </a>
          .
        </span>
        <nav className="flex items-center gap-2">
          <a
            aria-label="GitHub"
            className="hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
            href="https://github.com/iKislay"
            rel="noopener noreferrer"
            target="_blank"
          >
            GitHub
          </a>
          <span aria-hidden="true" className="select-none">
            /
          </span>
          <a
            aria-label="Twitter"
            className="hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
            href="https://twitter.com"
            rel="noopener noreferrer"
            target="_blank"
          >
            Twitter
          </a>
        </nav>
      </div>
    </footer>
  );
}
