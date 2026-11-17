import { useState } from 'react';
import { Moon, Star, Sun } from 'lucide-react';
import {
  PRINCIPLES,
  SAMPLE_LISTINGS,
  type HubTabKey,
} from '../data/twendeData';
import { buildWhatsAppLink } from '../utils/matchday';
import { BrandLogoModal, TwendeLockup } from './TwendeLogo';

interface ShowcaseAndInfoProps {
  isDark: boolean;
  onToggleTheme: () => void;
  onNavigateHub: (tab: HubTabKey) => void;
}

const ECOSYSTEM_AREAS: { label: string; tab: HubTabKey }[] = [
  { label: 'Events', tab: 'events' },
  { label: 'Stays', tab: 'rentals' },
  { label: 'Tours', tab: 'tours' },
  { label: 'Creatives', tab: 'creatives' },
  { label: 'Partners', tab: 'partners' },
  { label: 'Chapters', tab: 'join' },
];

const AUDIENCE_SEGMENTS = [
  'Visitors & fans',
  'Businesses',
  'Creatives',
  'Organisers',
  'Companies',
];

export function ShowcaseAndInfo({
  isDark,
  onToggleTheme,
  onNavigateHub,
}: ShowcaseAndInfoProps) {
  const [logoModalOpen, setLogoModalOpen] = useState(false);

  return (
    <>
      {/* SAMPLE LISTINGS */}
      <section id="samples" className="py-16 sm:py-20">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <p className="text-xs font-medium text-[#0E5A43] dark:text-[#4AD192]">
            What a listing looks like
          </p>
          <h2 className="mt-2 font-display text-2xl sm:text-3xl font-bold tracking-tight">
            Real details, honest ratings
          </h2>
          <p className="mt-2 text-sm sm:text-base text-[#4D5752] dark:text-[#A3B1AA] max-w-xl">
            These four are samples to show the layout. They are not real businesses or real ratings.
          </p>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {SAMPLE_LISTINGS.map((item) => (
              <article
                key={item.title}
                className="p-5 rounded-xl bg-white dark:bg-[#131B18] border border-[#E5E5DF] dark:border-[#222F2A] flex flex-col justify-between"
              >
                <div>
                  <p className="text-xs font-medium text-[#5C6660] dark:text-[#9AA8A0]">
                    Sample listing · not a real rating
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <Star className="w-4 h-4 fill-[#D99B16] text-[#D99B16]" aria-hidden="true" />
                    <span className="font-mono-num text-xl font-bold text-[#111714] dark:text-[#EEF3F0]">
                      {item.rating}
                    </span>
                  </div>
                  <h3 className="mt-2 font-display text-base font-semibold text-[#111714] dark:text-[#EEF3F0]">
                    {item.title}
                  </h3>
                  <dl className="mt-3 space-y-1 text-xs text-[#5C6660] dark:text-[#9AA8A0]">
                    <div className="flex justify-between gap-2">
                      <dt className="font-medium text-[#111714] dark:text-[#EEF3F0]">Where</dt>
                      <dd>{item.where}</dd>
                    </div>
                    <div className="flex justify-between gap-2">
                      <dt className="font-medium text-[#111714] dark:text-[#EEF3F0]">When</dt>
                      <dd>{item.when}</dd>
                    </div>
                    <div className="flex justify-between gap-2">
                      <dt className="font-medium text-[#111714] dark:text-[#EEF3F0]">Price</dt>
                      <dd>{item.price}</dd>
                    </div>
                  </dl>
                </div>
                <p className="mt-4 pt-3 border-t border-[#E5E5DF] dark:border-[#222F2A] text-xs text-[#4D5752] dark:text-[#A3B1AA]">
                  {item.note}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section
        id="how"
        className="py-10 sm:py-12 bg-[#F3F3EF] dark:bg-[#111715] border-y border-[#E5E5DF] dark:border-[#1E2924]"
      >
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <div>
              <p className="text-xs font-medium text-[#0E5A43] dark:text-[#4AD192]">
                How it works
              </p>
              <h2 className="mt-1 font-display text-xl sm:text-2xl font-bold tracking-tight">
                Three steps, no middleman
              </h2>
            </div>
            <p className="font-display text-base sm:text-lg font-bold tracking-tight text-[#111714] dark:text-[#EEF3F0]">
              Book direct.{' '}
              <span className="text-[#0E5A43] dark:text-[#4AD192]">Twende.</span>
            </p>
          </div>

          <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              {
                num: '01',
                title: 'Find it',
                desc: 'Browse events, stays and tours by city, day and budget.',
              },
              {
                num: '02',
                title: 'Ask on WhatsApp',
                desc: 'Message the business directly to agree price, dates and payment.',
              },
              {
                num: '03',
                title: 'Go',
                desc: 'Show up, enjoy it, then tell others what it was really like.',
              },
            ].map((step) => (
              <div
                key={step.num}
                className="p-4 rounded-xl bg-white dark:bg-[#131B18] border border-[#E5E5DF] dark:border-[#222F2A]"
              >
                <div className="flex items-baseline gap-2">
                  <span className="font-mono-num text-xs font-semibold text-[#0E5A43] dark:text-[#4AD192]">
                    {step.num}
                  </span>
                  <h3 className="font-display text-sm sm:text-base font-bold text-[#111714] dark:text-[#EEF3F0]">
                    {step.title}
                  </h3>
                </div>
                <p className="mt-1 text-xs sm:text-sm text-[#4D5752] dark:text-[#A3B1AA]">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ABOUT & PRINCIPLES */}
      <section id="about" className="py-12 sm:py-14">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pb-10 border-b border-[#E5E5DF] dark:border-[#222F2A]">
            <div className="md:col-span-4">
              <p className="text-xs font-medium text-[#0E5A43] dark:text-[#4AD192]">
                About Twende Events
              </p>
              <h2 className="mt-2 font-display text-2xl font-bold">Built for East Africa</h2>
              <button
                type="button"
                onClick={() => setLogoModalOpen(true)}
                className="mt-4 inline-flex items-center gap-2.5 px-3 py-2 rounded-lg border border-[#E5E5DF] dark:border-[#222F2A] bg-white dark:bg-[#131B18] hover:border-[#0E5A43] dark:hover:border-[#4AD192] text-xs font-semibold text-[#111714] dark:text-[#EEF3F0] transition-colors cursor-pointer"
              >
                <TwendeLockup wordmarkStyle="compact" markSize={20} textClassName="text-xs" />
                <span className="text-[#5C6660] dark:text-[#9AA8A0] font-normal">· Logo kit</span>
              </button>
            </div>
            <div className="md:col-span-8">
              <p className="text-base text-[#4D5752] dark:text-[#A3B1AA] leading-relaxed">
                Twende means “let’s go” in Swahili. Twende Events is a community-led guide to what is happening and where to stay across East Africa. We bring together events, rentals and apartments, tours and travel, creatives and local partners in one place, so fans, visitors and locals can plan with confidence and businesses can be found.
              </p>

              {/* Six ecosystem areas */}
              <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
                {ECOSYSTEM_AREAS.map((area) => (
                  <button
                    key={area.label}
                    type="button"
                    onClick={() => onNavigateHub(area.tab)}
                    className="py-2.5 px-3 rounded-lg bg-white dark:bg-[#131B18] border border-[#E5E5DF] dark:border-[#222F2A] hover:border-[#0E5A43] dark:hover:border-[#4AD192] text-xs font-semibold text-center transition-colors cursor-pointer"
                  >
                    {area.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Who we serve */}
          <div className="rounded-xl bg-[#0E5A43] dark:bg-[#10382B] text-white p-6 sm:p-10">
            <div className="text-center max-w-xl mx-auto">
              <p className="text-xs font-medium text-white/75">
                Built for everyone who is going somewhere
              </p>
              <h3 className="mt-2 font-display text-2xl sm:text-3xl font-bold">Who we serve</h3>
            </div>
            <div className="mt-8 grid grid-cols-2 sm:grid-cols-5 gap-3 border-t border-white/20 pt-6 text-center">
              {AUDIENCE_SEGMENTS.map((seg) => (
                <div key={seg} className="text-xs sm:text-sm font-semibold tracking-wide text-white/95">
                  {seg}
                </div>
              ))}
            </div>
          </div>

          {/* Our principles */}
          <div>
            <h3 className="font-display text-lg sm:text-xl font-bold">Our principles</h3>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {PRINCIPLES.map((p, idx) => (
                <div
                  key={p.title}
                  className="p-4 rounded-xl bg-white dark:bg-[#131B18] border border-[#E5E5DF] dark:border-[#222F2A]"
                >
                  <div className="flex items-baseline gap-2">
                    <span className="font-mono-num text-xs font-semibold text-[#0E5A43] dark:text-[#4AD192]">
                      0{idx + 1}
                    </span>
                    <h4 className="font-display text-sm sm:text-base font-semibold text-[#111714] dark:text-[#EEF3F0]">
                      {p.title}
                    </h4>
                  </div>
                  <p className="mt-1 text-xs sm:text-sm text-[#4D5752] dark:text-[#A3B1AA]">{p.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* EARLY ACCESS CALLOUT */}
      <section className="py-16 bg-[#111714] dark:bg-[#080C0A] text-[#FAFAF8]">
        <div className="max-w-3xl mx-auto px-5 sm:px-8 text-center">
          <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight">
            Get on the first list
          </h2>
          <p className="mt-3 text-sm sm:text-base text-white/75">
            Be first to hear when new listings, events and the Twende Matchday guide for the 2027 football tournament go live. We are an independent guide and are not part of the tournament organisers.
          </p>
          <a
            href={buildWhatsAppLink(
              'Hello Twende Events, please add me to the first list. My name and city: ',
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center justify-center px-6 py-3 rounded-lg bg-[#FFD23F] hover:bg-[#F5C62E] text-[#14120F] text-sm font-bold transition-colors"
          >
            Join on WhatsApp
          </a>
        </div>
      </section>

      {/* QUIET FOOTER */}
      <footer
        id="contact"
        className="bg-[#FAFAF8] dark:bg-[#0D1210] border-t border-[#E5E5DF] dark:border-[#1E2924] py-12 text-sm"
      >
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[#5C6660] dark:text-[#9AA8A0]">
                Categories
              </h4>
              <ul className="mt-3 space-y-2 text-[#3C4641] dark:text-[#C4D0C9]">
                <li>
                  <button
                    type="button"
                    onClick={() => onNavigateHub('events')}
                    className="hover:underline cursor-pointer"
                  >
                    Events
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => onNavigateHub('rentals')}
                    className="hover:underline cursor-pointer"
                  >
                    Stays &amp; rentals
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => onNavigateHub('tours')}
                    className="hover:underline cursor-pointer"
                  >
                    Tours &amp; travel
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => onNavigateHub('matchday')}
                    className="hover:underline cursor-pointer"
                  >
                    Twende Matchday
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => onNavigateHub('creatives')}
                    className="hover:underline cursor-pointer"
                  >
                    Creatives
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[#5C6660] dark:text-[#9AA8A0]">
                Cities
              </h4>
              <ul className="mt-3 space-y-2 text-[#3C4641] dark:text-[#C4D0C9]">
                <li>Kampala</li>
                <li>Entebbe</li>
                <li>Jinja</li>
                <li>Nairobi</li>
                <li>Dar es Salaam</li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[#5C6660] dark:text-[#9AA8A0]">
                Twende Events
              </h4>
              <ul className="mt-3 space-y-2 text-[#3C4641] dark:text-[#C4D0C9]">
                <li>
                  <a href="#about" className="hover:underline">
                    About us
                  </a>
                </li>
                <li>
                  <a href="#how" className="hover:underline">
                    How it works
                  </a>
                </li>
                <li>
                  <a href="#samples" className="hover:underline">
                    Sample listings
                  </a>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => onNavigateHub('partners')}
                    className="hover:underline cursor-pointer"
                  >
                    Partner with us
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => onNavigateHub('join')}
                    className="hover:underline cursor-pointer"
                  >
                    Lead a chapter
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setLogoModalOpen(true)}
                    className="hover:underline cursor-pointer"
                  >
                    Brand logo
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[#5C6660] dark:text-[#9AA8A0]">
                Contact
              </h4>
              <ul className="mt-3 space-y-2 text-[#3C4641] dark:text-[#C4D0C9]">
                <li>
                  WhatsApp:{' '}
                  <a
                    href={buildWhatsAppLink('Hello Twende Events, ')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono-num hover:underline text-[#0E5A43] dark:text-[#4AD192]"
                  >
                    +256 768 561 755
                  </a>
                </li>
                <li>Kampala, Uganda</li>
              </ul>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-[#E5E5DF] dark:border-[#1E2924] flex flex-wrap items-center justify-between gap-4 text-xs text-[#5C6660] dark:text-[#9AA8A0]">
            <div className="flex flex-wrap items-center gap-3">
              <TwendeLockup wordmarkStyle="title" markSize={22} textClassName="text-sm" />
              <span>· An independent guide, not part of any tournament’s organisers.</span>
            </div>
            <button
              type="button"
              onClick={onToggleTheme}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#D8D8D0] dark:border-[#2E3C35] text-[#3C4641] dark:text-[#C4D0C9] hover:bg-[#EFEFEA] dark:hover:bg-[#19231E] transition-colors cursor-pointer"
            >
              {isDark ? <Sun className="w-3.5 h-3.5" aria-hidden="true" /> : <Moon className="w-3.5 h-3.5" aria-hidden="true" />}
              <span>{isDark ? 'Light mode' : 'Dark mode'}</span>
            </button>
          </div>
        </div>
      </footer>

      <BrandLogoModal open={logoModalOpen} onClose={() => setLogoModalOpen(false)} />
    </>
  );
}
