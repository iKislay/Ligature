'use client';

import React, { useEffect, useState } from 'react';

interface InlineSvgProps {
  src: string;
  className?: string;
  fallback?: React.ReactNode;
}

export function InlineSvg({ src, className, fallback }: InlineSvgProps) {
  const [svgContent, setSvgContent] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setSvgContent(null);
    setError(false);

    fetch(src)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load');
        return res.text();
      })
      .then((text) => {
        if (!cancelled) setSvgContent(text);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });

    return () => { cancelled = true; };
  }, [src]);

  if (error) {
    return fallback ? <>{fallback}</> : (
      <div className="flex min-h-[200px] w-full items-center justify-center rounded-lg bg-neutral-50 dark:bg-neutral-900">
        <p className="text-sm text-neutral-500">Failed to load preview.</p>
      </div>
    );
  }

  if (!svgContent) {
    return (
      <div className="flex min-h-[200px] w-full items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-600 dark:border-neutral-600 dark:border-t-neutral-300" />
      </div>
    );
  }

  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: svgContent }}
    />
  );
}
