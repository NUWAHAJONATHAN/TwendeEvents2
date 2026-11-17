import { ArrowRight, Search, X } from 'lucide-react';
import type { FormEvent } from 'react';
import { EXPLORE_CATEGORIES, type HubTabKey } from '../data/twendeData';
import { buildWhatsAppLink } from '../utils/matchday';

interface HeroSectionProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onQuickJump: (tab?: HubTabKey) => void;
}

export function HeroSection({ searchQuery, onSearchChange, onQuickJump }: HeroSectionProps) {
  const earlyAccessHref = buildWhatsAppLink('Hello Twende Events, I’d like early access. My name is: ');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const target = document.getElementById('explore');
    target?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="top" className="pt-12 pb-12 sm:pt-16 sm:pb-16 border-b border-[#E5E5DF] dark:border-[#1E2924]">
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        <div className="max-w-3xl">
          <p className="text-xs font-medium text-[#0E5A43] dark:text-[#4AD192]">
            Events · Stays · Tours · East Africa
          </p>
          <h1 className="mt-4 font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#111714] dark:text-[#EEF3F0] leading-[1.08] text-balance">
            Twende.{' '}
            <span className="text-[#0E5A43] dark:text-[#4AD192]">Let’s go.</span>
          </h1>
          <p className="mt-5 text-base sm:text-lg text-[#4D5752] dark:text-[#A3B1AA] max-w-2xl leading-relaxed">
            Find events, places to stay and tours in Kampala, Nairobi, Dar es Salaam and beyond.
            Pick what you like, then book straight on WhatsApp.
          </p>

          {/* Search bar */}
          <form
            onSubmit={handleSubmit}
            role="search"
            className="mt-8 flex items-center gap-2 max-w-xl bg-white dark:bg-[#131B18] border border-[#D8D8D0] dark:border-[#28352F] rounded-xl p-1.5 focus-within:border-[#0E5A43] dark:focus-within:border-[#4AD192] transition-colors"
          >
            <Search className="w-4 h-4 ml-3 text-[#6B756F] dark:text-[#8E9B94] shrink-0" aria-hidden="true" />
            <label htmlFor="hero-search" className="sr-only">
              Search events, stays, tours
            </label>
            <input
              id="hero-search"
              type="search"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search events, stays, tours…"
              className="flex-1 min-w-0 bg-transparent px-2 py-2 text-sm sm:text-base text-[#111714] dark:text-[#EEF3F0] placeholder:text-[#78827C] focus:outline-none"
            />
            {searchQuery.trim() && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                aria-label="Clear search"
                className="p-2 text-[#6B756F] hover:text-[#111714] dark:text-[#8E9B94] dark:hover:text-[#EEF3F0] rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              type="submit"
              className="px-4 sm:px-5 py-2.5 rounded-lg bg-[#0E5A43] hover:bg-[#0B4735] dark:bg-[#3DBE7C] dark:hover:bg-[#34A86D] text-white dark:text-[#071A11] text-sm font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Search
            </button>
          </form>

          {/* Primary + secondary CTA */}
          <div className="mt-6 flex flex-wrap items-center gap-5">
            <a
              href={earlyAccessHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#111714] hover:bg-[#242E29] dark:bg-[#EEF3F0] dark:hover:bg-[#DCE4DF] text-white dark:text-[#111714] text-sm font-semibold transition-colors whitespace-nowrap shrink-0"
            >
              Get early access
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </a>
            <a
              href="#how"
              className="text-sm font-semibold text-[#3C4641] dark:text-[#B5C2BB] hover:text-[#0E5A43] dark:hover:text-[#4AD192] transition-colors whitespace-nowrap shrink-0"
            >
              How it works
            </a>
          </div>
        </div>

        {/* Minimalist quick-access directory links */}
        <div className="mt-12 pt-6 border-t border-[#E5E5DF] dark:border-[#1E2924] flex items-center gap-x-6 gap-y-2 overflow-x-auto no-scrollbar">
          <span className="text-xs font-medium text-[#6B756F] dark:text-[#8E9B94] whitespace-nowrap shrink-0">
            Quick browse:
          </span>
          {EXPLORE_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                if (cat.hubTab) {
                  onQuickJump(cat.hubTab);
                } else {
                  const el = document.getElementById('explore');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="text-sm font-medium text-[#4D5752] dark:text-[#A3B1AA] hover:text-[#0E5A43] dark:hover:text-[#4AD192] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              {cat.title}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
