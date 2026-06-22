import { Hero } from '@/components/Hero';
import { PreviewSection } from '@/components/PreviewSection';
import { Suspense } from 'react';

export default function Home() {
  return (
    <div className="mx-auto flex w-[95%] flex-col gap-16 px-4 py-12">
      <div>
        <Hero />
      </div>

      <Suspense
        fallback={
          <section className="flex min-h-[50vh] items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neutral-900 dark:border-white"></div>
          </section>
        }
      >
        <PreviewSection />
      </Suspense>
    </div>
  );
}
