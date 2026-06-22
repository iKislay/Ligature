import HeroPreview from '@/components/HeroPreview';
import Customizer from '@/components/Customizer';

export default function Home() {
  return (
    <main className="min-h-screen bg-white dark:bg-[#0a0a0a] text-neutral-900 dark:text-neutral-100 font-sans selection:bg-blue-200 dark:selection:bg-blue-900">
      {/* Header */}
      <header className="px-8 py-6 flex items-center justify-between border-b border-neutral-100 dark:border-neutral-900">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-black dark:bg-white rounded-sm" />
          <span className="font-semibold text-lg tracking-tight">Ligature</span>
        </div>
        <nav className="hidden sm:flex space-x-6 text-sm font-medium text-neutral-500">
          <a href="#customizer" className="hover:text-black dark:hover:text-white transition-colors">Customizer</a>
          <a href="https://github.com/iKislay/Ligature" className="hover:text-black dark:hover:text-white transition-colors">GitHub</a>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="px-8 pt-24 pb-16 max-w-7xl mx-auto flex flex-col items-center text-center">
        <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6 leading-tight">
          One Directory. <br />
          <span className="text-neutral-400 dark:text-neutral-600">Infinite Themes.</span>
        </h1>
        <p className="max-w-2xl text-lg md:text-xl text-neutral-600 dark:text-neutral-400 mb-12">
          Ligature unifies your GitHub README stats, WakaTime hours, and Discord presence under a single, globally applied design system. Stateless, edge-rendered SVGs.
        </p>

        <HeroPreview />
      </section>

      {/* Customizer Section */}
      <section id="customizer" className="px-8 py-24 bg-neutral-50 dark:bg-black border-t border-neutral-100 dark:border-neutral-900">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12">
            <h2 className="text-3xl font-bold tracking-tight mb-4">Build Your Snippet</h2>
            <p className="text-neutral-600 dark:text-neutral-400 max-w-xl">
              Configure your widget visually. The generated URL is stateless and caches responses intelligently to prevent rate limits. No JavaScript required to embed.
            </p>
          </div>
          
          <Customizer />
        </div>
      </section>

      {/* Footer */}
      <footer className="px-8 py-12 border-t border-neutral-100 dark:border-neutral-900 text-center text-sm text-neutral-500">
        <p>Ligature &copy; {new Date().getFullYear()}. Open Source.</p>
      </footer>
    </main>
  );
}
