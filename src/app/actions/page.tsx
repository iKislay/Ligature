import { Suspense } from 'react';

export default function ActionsPage() {
  return (
    <div className="mx-auto flex w-[95%] flex-col gap-16 px-4 py-12">
      <div className="flex flex-col items-center justify-center space-y-4 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">GitHub Actions</h1>
        <p className="max-w-[600px] text-lg text-neutral-500 dark:text-neutral-400">
          Discover and integrate powerful GitHub Actions to automate your workflows perfectly.
        </p>
      </div>

      <div className="w-full rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black p-4 md:p-12 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center text-center space-y-3">
          <h3 className="text-xl font-semibold tracking-tight">Coming Soon</h3>
          <p className="text-neutral-500 dark:text-neutral-400 text-sm max-w-sm">
            Our GitHub Actions marketplace is currently in development.
          </p>
        </div>
      </div>
    </div>
  );
}
