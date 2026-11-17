import { useState, type ComponentType } from 'react';
import {
  ArrowUpRight,
  BedDouble,
  Building2,
  Calendar,
  Car,
  Compass,
  Handshake,
  Palette,
  Utensils,
} from 'lucide-react';
import { EXPLORE_CATEGORIES, type HubTabKey } from '../data/twendeData';
import { buildWhatsAppLink } from '../utils/matchday';

interface ExploreSectionProps {
  searchQuery: string;
  onResetSearch: () => void;
  onSelectHubTab: (tab: HubTabKey) => void;
}

const CATEGORY_ICONS: Record<string, ComponentType<{ className?: string; strokeWidth?: number }>> = {
  events: Calendar,
  stays: BedDouble,
  tours: Compass,
  venues: Building2,
  food: Utensils,
  transport: Car,
  creatives: Palette,
  partners: Handshake,
};

export function ExploreSection({
  searchQuery,
  onResetSearch,
  onSelectHubTab,
}: ExploreSectionProps) {
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
  const query = searchQuery.trim().toLowerCase();
  const filtered = EXPLORE_CATEGORIES.filter(
    (c) => !query || `${c.title} ${c.subtitle}`.toLowerCase().includes(query),
  );

  return (
    <section id="explore" className="py-12 sm:py-16">
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-[#0E5A43] dark:text-[#4AD192]">
              Explore
            </p>
            <h2 className="mt-2 font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#111714] dark:text-[#EEF3F0]">
              What are you looking for?
            </h2>
            <p className="mt-2 text-sm sm:text-base text-[#4D5752] dark:text-[#A3B1AA] max-w-xl">
              Browse by category. Open a guide or message us directly on WhatsApp for what is available right now.
            </p>
          </div>
          {query && (
            <div className="flex items-center gap-3 text-sm">
              <span className="text-[#5C6660] dark:text-[#9AA8A0] font-mono-num">
                {filtered.length} {filtered.length === 1 ? 'result' : 'results'}
              </span>
              <button
                type="button"
                onClick={onResetSearch}
                className="text-[#0E5A43] dark:text-[#4AD192] font-semibold hover:underline cursor-pointer"
              >
                Clear filter
              </button>
            </div>
          )}
        </div>

        {filtered.length > 0 ? (
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {filtered.map((cat) => {
              const Icon = CATEGORY_ICONS[cat.id] ?? Compass;
              const isBroken = !!failedImages[cat.id];
              const commonClass =
                'group flex flex-col overflow-hidden rounded-xl bg-white dark:bg-[#131B18] border border-[#E5E5DF] dark:border-[#222F2A] hover:border-[#0E5A43]/50 dark:hover:border-[#4AD192]/50 transition-colors text-left';

              const cardBody = (
                <>
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#EFEFEA] dark:bg-[#1A2420] border-b border-[#E5E5DF] dark:border-[#222F2A]">
                    {!isBroken ? (
                      <img
                        src={cat.image}
                        alt={cat.imageAlt}
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        onError={() => setFailedImages((prev) => ({ ...prev, [cat.id]: true }))}
                        className={`h-full w-full object-cover ${cat.imagePosition ?? 'object-center'} transition-transform duration-300 group-hover:scale-[1.03]`}
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center">
                        <Icon
                          className="w-7 h-7 text-[#0E5A43] dark:text-[#4AD192]"
                          strokeWidth={1.75}
                          aria-hidden="true"
                        />
                      </div>
                    )}
                  </div>
                  <div className="p-4 flex items-start justify-between gap-3 flex-1">
                    <div>
                      <h3 className="font-display text-base font-semibold text-[#111714] dark:text-[#EEF3F0]">
                        {cat.title}
                      </h3>
                      <p className="mt-0.5 text-sm text-[#5C6660] dark:text-[#9AA8A0]">
                        {cat.subtitle}
                      </p>
                    </div>
                    <ArrowUpRight
                      className="w-4 h-4 mt-1 shrink-0 text-[#8E9892] group-hover:text-[#0E5A43] dark:group-hover:text-[#4AD192] transition-colors"
                      aria-hidden="true"
                    />
                  </div>
                </>
              );

              if (cat.hubTab) {
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => onSelectHubTab(cat.hubTab!)}
                    className={`${commonClass} cursor-pointer`}
                  >
                    {cardBody}
                  </button>
                );
              }

              return (
                <a
                  key={cat.id}
                  href={buildWhatsAppLink(cat.waMessage ?? '')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={commonClass}
                >
                  {cardBody}
                </a>
              );
            })}
          </div>
        ) : (
          <div className="mt-8 p-8 rounded-xl bg-white dark:bg-[#131B18] border border-[#E5E5DF] dark:border-[#222F2A] text-center">
            <p className="text-sm text-[#4D5752] dark:text-[#A3B1AA]">
              Nothing matches “{searchQuery}”. Try “events”, “stay” or “tour”.
            </p>
            <button
              type="button"
              onClick={onResetSearch}
              className="mt-4 px-4 py-2 rounded-lg border border-[#D8D8D0] dark:border-[#2E3C35] text-sm font-semibold text-[#111714] dark:text-[#EEF3F0] hover:bg-[#F3F3EF] dark:hover:bg-[#1C2622] transition-colors cursor-pointer"
            >
              Show all categories
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
