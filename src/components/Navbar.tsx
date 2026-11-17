import { buildWhatsAppLink } from '../utils/matchday';
import { TwendeLockup } from './TwendeLogo';

interface NavbarProps {
  onNavigateHub?: (tab: 'matchday' | 'events' | 'rentals' | 'tours' | 'creatives' | 'partners' | 'join') => void;
}

export function Navbar({ onNavigateHub }: NavbarProps) {
  const joinHref = buildWhatsAppLink('Hello Twende Events, I’d like to join the list. My name is: ');

  return (
    <header className="sticky top-0 z-40 bg-[#FAFAF8]/95 dark:bg-[#0D1210]/95 backdrop-blur-md border-b border-[#E5E5DF] dark:border-[#1E2924]">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 h-14 sm:h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single-element brand lockup */}
        <a
          href="#top"
          aria-label="Twende Events home"
          className="whitespace-nowrap shrink-0 flex items-center focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#0E5A43]"
        >
          <TwendeLockup wordmarkStyle="title" markSize={28} textClassName="text-lg" />
        </a>

        {/* Zone 2: 5 concise single-line text links */}
        <nav aria-label="Primary" className="hidden md:flex items-center gap-6 text-sm font-medium text-[#4D5752] dark:text-[#A3B1AA]">
          <a
            href="#explore"
            className="hover:text-[#111714] dark:hover:text-[#EEF3F0] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Explore
          </a>
          <a
            href="#matchday"
            onClick={(e) => {
              if (onNavigateHub) {
                e.preventDefault();
                onNavigateHub('matchday');
              }
            }}
            className="hover:text-[#111714] dark:hover:text-[#EEF3F0] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Matchday
          </a>
          <a
            href="#samples"
            className="hover:text-[#111714] dark:hover:text-[#EEF3F0] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Listings
          </a>
          <a
            href="#how"
            className="hover:text-[#111714] dark:hover:text-[#EEF3F0] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            How it works
          </a>
          <a
            href="#about"
            className="hover:text-[#111714] dark:hover:text-[#EEF3F0] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            About
          </a>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center shrink-0">
          <a
            href={joinHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-[#0E5A43] hover:bg-[#0B4735] dark:bg-[#3DBE7C] dark:hover:bg-[#34A86D] text-white dark:text-[#071A11] text-sm font-semibold transition-colors whitespace-nowrap shrink-0"
          >
            Join on WhatsApp
          </a>
        </div>
      </div>
    </header>
  );
}
