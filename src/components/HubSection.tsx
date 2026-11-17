import { ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import {
  CREATIVES_TRACKS,
  EVENTS_CALENDAR,
  HUB_TAB_MEDIA,
  HUB_TABS,
  KAMPALA_AREAS,
  MATCHDAY_EVENT_IDEAS,
  PARTNER_INDUSTRIES,
  PARTNER_TRACKS,
  RENTAL_MATCHWEEK_TIPS,
  RENTAL_SAFETY_TIPS,
  RENTAL_TYPES,
  TOURS_ACTIVITIES,
  TOURS_CHECKLIST,
  TOURS_TRANSPORT_TIPS,
  type HubTabKey,
} from '../data/twendeData';
import { buildWhatsAppLink, validateChapterApplication } from '../utils/matchday';
import { MatchdayWorkspace } from './MatchdayWorkspace';

interface HubSectionProps {
  activeTab: HubTabKey;
  onTabChange: (tab: HubTabKey) => void;
}

function TabHeroMedia({ tabKey }: { tabKey: HubTabKey }) {
  const media = HUB_TAB_MEDIA[tabKey];
  if (!media) return null;
  return (
    <div className="overflow-hidden rounded-xl border border-[#E5E5DF] dark:border-[#222F2A] bg-[#EFEFEA] dark:bg-[#1A2420] aspect-[16/10] w-full">
      <img
        src={media.src}
        alt={media.alt}
        loading="lazy"
        referrerPolicy="no-referrer"
        className={`h-full w-full object-cover ${media.objectPosition ?? 'object-center'}`}
      />
    </div>
  );
}

export function HubSection({ activeTab, onTabChange }: HubSectionProps) {
  // Lead a chapter form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [why, setWhy] = useState('');
  const [experience, setExperience] = useState('');
  const [reach, setReach] = useState('Under 20');
  const [agreed, setAgreed] = useState(false);
  const [chapterError, setChapterError] = useState('');
  const [submittedWhatsAppUrl, setSubmittedWhatsAppUrl] = useState<string | null>(null);

  const handleChapterSubmit = (e: FormEvent) => {
    e.preventDefault();
    const err = validateChapterApplication({
      name,
      email,
      phone,
      city,
      why,
      experience,
      agreed,
    });
    if (err) {
      setChapterError(err);
      return;
    }
    setChapterError('');
    const msg = `Hi, I'd like to apply to lead a Twende Events chapter.\nName: ${name.trim()}\nEmail: ${email.trim()}\nPhone: ${phone.trim()}\nCity: ${city.trim()}\nWhy: ${why.trim()}\nExperience: ${experience.trim()}\nFirst 3 months: ${reach}`;
    const url = buildWhatsAppLink(msg);
    setSubmittedWhatsAppUrl(url);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <section
      id="more"
      className="py-16 sm:py-20 bg-[#F3F3EF] dark:bg-[#111715] border-y border-[#E5E5DF] dark:border-[#1E2924]"
    >
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        <div>
          <p className="text-xs font-medium text-[#0E5A43] dark:text-[#4AD192]">
            Guides &amp; workspaces
          </p>
          <h2 className="mt-1.5 font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#111714] dark:text-[#EEF3F0]">
            Matchday, stays, tours &amp; events
          </h2>
        </div>

        {/* Underline tab bar */}
        <div
          role="tablist"
          aria-label="Twende Events sections"
          className="mt-6 flex flex-wrap sm:flex-nowrap items-center gap-x-5 gap-y-1 sm:gap-6 border-b border-[#D8D8D0] dark:border-[#24302B] sm:overflow-x-auto no-scrollbar"
        >
          {HUB_TABS.map((tab) => {
            const isSelected = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                id={`tab-${tab.key}`}
                role="tab"
                type="button"
                aria-selected={isSelected}
                aria-controls={`panel-${tab.key}`}
                onClick={() => onTabChange(tab.key)}
                className={`relative py-3.5 text-sm font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  isSelected
                    ? 'text-[#0E5A43] dark:text-[#4AD192]'
                    : 'text-[#5C6660] dark:text-[#9AA8A0] hover:text-[#111714] dark:hover:text-[#EEF3F0]'
                }`}
              >
                {tab.label}
                {isSelected && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 bottom-0 h-0.5 bg-[#0E5A43] dark:bg-[#4AD192]"
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Panel Content */}
        <div className="mt-8">
          {/* MATCHDAY */}
          {activeTab === 'matchday' && (
            <div id="panel-matchday" role="tabpanel" aria-labelledby="tab-matchday">
              <MatchdayWorkspace />
            </div>
          )}

          {/* EVENTS */}
          {activeTab === 'events' && (
            <div id="panel-events" role="tabpanel" aria-labelledby="tab-events" className="space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                <div className="md:col-span-7">
                  <p className="text-xs font-medium text-[#0E5A43] dark:text-[#4AD192]">
                    What’s on
                  </p>
                  <h3 className="mt-1 font-display text-2xl font-bold">Events</h3>
                  <p className="mt-2 text-sm sm:text-base text-[#4D5752] dark:text-[#A3B1AA]">
                    What Twende Events is planning, plus ideas for match-day gatherings. Dates and venues are announced to the waitlist first.
                  </p>
                </div>
                <div className="md:col-span-5">
                  <TabHeroMedia tabKey="events" />
                </div>
              </div>

              <div>
                <h4 className="font-display text-base font-semibold text-[#111714] dark:text-[#EEF3F0]">
                  First on the calendar
                </h4>
                <div className="mt-4 divide-y divide-[#E5E5DF] dark:divide-[#222F2A] rounded-xl bg-white dark:bg-[#131B18] border border-[#E5E5DF] dark:border-[#222F2A]">
                  {EVENTS_CALENDAR.map((ev, idx) => (
                    <div key={ev.title} className="p-5 flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-6">
                      <span className="font-mono-num text-xs font-semibold text-[#0E5A43] dark:text-[#4AD192] shrink-0">
                        0{idx + 1}
                      </span>
                      <div>
                        <h5 className="font-display text-base font-semibold text-[#111714] dark:text-[#EEF3F0]">
                          {ev.title}
                        </h5>
                        <p className="mt-1 text-sm text-[#4D5752] dark:text-[#A3B1AA]">{ev.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-display text-base font-semibold text-[#111714] dark:text-[#EEF3F0]">
                  Match-day gatherings (ideas)
                </h4>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                  {MATCHDAY_EVENT_IDEAS.map((idea) => (
                    <div
                      key={idea.title}
                      className="p-5 rounded-xl bg-white dark:bg-[#131B18] border border-[#E5E5DF] dark:border-[#222F2A]"
                    >
                      <h5 className="font-display text-base font-semibold">{idea.title}</h5>
                      <p className="mt-1.5 text-sm text-[#4D5752] dark:text-[#A3B1AA]">{idea.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-xs text-[#5C6660] dark:text-[#9AA8A0] max-w-2xl">
                  These are plans and ideas, not confirmed events. Twende Events is an independent community and is not part of the tournament organisers, so check the tournament’s official channels for fixtures and tickets.
                </p>
                <div className="flex flex-wrap gap-3">
                  <a
                    href={buildWhatsAppLink(
                      "Hello, I'd like to join the Twende Events events waitlist. My name is: ",
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#0E5A43] hover:bg-[#0B4735] dark:bg-[#3DBE7C] text-white dark:text-[#071A11] text-sm font-semibold transition-colors"
                  >
                    Join the waitlist
                  </a>
                  <a
                    href={buildWhatsAppLink(
                      "Hello, I'd like to host a celebration (staff party / launch / awards) with Twende Events. Company and date: ",
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-[#D8D8D0] dark:border-[#2E3C35] bg-white dark:bg-[#131B18] text-sm font-semibold hover:bg-[#FAFAF8] dark:hover:bg-[#1C2622] transition-colors"
                  >
                    Host your celebration
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* RENTALS */}
          {activeTab === 'rentals' && (
            <div id="panel-rentals" role="tabpanel" aria-labelledby="tab-rentals" className="space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                <div className="md:col-span-7">
                  <p className="text-xs font-medium text-[#0E5A43] dark:text-[#4AD192]">
                    Stay
                  </p>
                  <h3 className="mt-1 font-display text-2xl font-bold">Rentals &amp; apartments</h3>
                  <p className="mt-2 text-sm sm:text-base text-[#4D5752] dark:text-[#A3B1AA]">
                    Places to stay in and around Kampala, for a match weekend or a longer move. This is a guide, not a list of live availability: ask for current rooms and prices before you plan.
                  </p>
                </div>
                <div className="md:col-span-5">
                  <TabHeroMedia tabKey="rentals" />
                </div>
              </div>

              <div>
                <h4 className="font-display text-base font-semibold">What you can rent</h4>
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {RENTAL_TYPES.map((item) => (
                    <div
                      key={item.title}
                      className="p-5 rounded-xl bg-white dark:bg-[#131B18] border border-[#E5E5DF] dark:border-[#222F2A]"
                    >
                      <h5 className="font-display text-base font-semibold">{item.title}</h5>
                      <p className="mt-1.5 text-sm text-[#4D5752] dark:text-[#A3B1AA]">{item.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-display text-base font-semibold">Areas visitors ask about</h4>
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {KAMPALA_AREAS.map((area) => (
                    <div
                      key={area.title}
                      className="p-5 rounded-xl bg-white dark:bg-[#131B18] border border-[#E5E5DF] dark:border-[#222F2A]"
                    >
                      <h5 className="font-display text-base font-semibold">{area.title}</h5>
                      <p className="mt-1.5 text-sm text-[#4D5752] dark:text-[#A3B1AA]">{area.description}</p>
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-xs text-[#5C6660] dark:text-[#9AA8A0]">
                  Area descriptions are general. Check distance, traffic and the route to the stadium before you book.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="p-6 rounded-xl bg-white dark:bg-[#131B18] border border-[#E5E5DF] dark:border-[#222F2A]">
                  <h4 className="font-display text-base font-semibold">Before you pay</h4>
                  <ul className="mt-3 space-y-2 text-sm text-[#4D5752] dark:text-[#A3B1AA] list-disc pl-5">
                    {RENTAL_SAFETY_TIPS.map((tip) => (
                      <li key={tip}>{tip}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-6 rounded-xl bg-white dark:bg-[#131B18] border border-[#E5E5DF] dark:border-[#222F2A] flex flex-col justify-between">
                  <div>
                    <h4 className="font-display text-base font-semibold">Match-week tips</h4>
                    <ul className="mt-3 space-y-2 text-sm text-[#4D5752] dark:text-[#A3B1AA] list-disc pl-5">
                      {RENTAL_MATCHWEEK_TIPS.map((tip) => (
                        <li key={tip}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <a
                      href={buildWhatsAppLink(
                        "Hello, I'd like to list a rental or apartment with Twende Events / Twende Matchday. Name, area and type: ",
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2.5 rounded-lg bg-[#0E5A43] hover:bg-[#0B4735] dark:bg-[#3DBE7C] text-white dark:text-[#071A11] text-sm font-semibold transition-colors"
                    >
                      List your property
                    </a>
                    <a
                      href={buildWhatsAppLink(
                        "Hello, I'm looking for a place to stay. Area, dates and number of people: ",
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2.5 rounded-lg border border-[#D8D8D0] dark:border-[#2E3C35] text-sm font-semibold hover:bg-[#FAFAF8] dark:hover:bg-[#1C2622] transition-colors"
                    >
                      Ask for help finding a place
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TOURS */}
          {activeTab === 'tours' && (
            <div id="panel-tours" role="tabpanel" aria-labelledby="tab-tours" className="space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                <div className="md:col-span-7">
                  <p className="text-xs font-medium text-[#0E5A43] dark:text-[#4AD192]">
                    Explore
                  </p>
                  <h3 className="mt-1 font-display text-2xl font-bold">Tours &amp; travel</h3>
                  <p className="mt-2 text-sm sm:text-base text-[#4D5752] dark:text-[#A3B1AA]">
                    Ideas for what to do before or after the matches, and how to travel safely. Prices, permits and opening times change, so confirm them with the operator.
                  </p>
                </div>
                <div className="md:col-span-5">
                  <TabHeroMedia tabKey="tours" />
                </div>
              </div>

              <div>
                <h4 className="font-display text-base font-semibold">What to do</h4>
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {TOURS_ACTIVITIES.map((act) => (
                    <div
                      key={act.title}
                      className="p-5 rounded-xl bg-white dark:bg-[#131B18] border border-[#E5E5DF] dark:border-[#222F2A]"
                    >
                      <h5 className="font-display text-base font-semibold">{act.title}</h5>
                      <p className="mt-1.5 text-sm text-[#4D5752] dark:text-[#A3B1AA]">{act.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="p-6 rounded-xl bg-white dark:bg-[#131B18] border border-[#E5E5DF] dark:border-[#222F2A]">
                  <h4 className="font-display text-base font-semibold">Getting around</h4>
                  <ul className="mt-3 space-y-2 text-sm text-[#4D5752] dark:text-[#A3B1AA] list-disc pl-5">
                    {TOURS_TRANSPORT_TIPS.map((tip) => (
                      <li key={tip}>{tip}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-6 rounded-xl bg-white dark:bg-[#131B18] border border-[#E5E5DF] dark:border-[#222F2A]">
                  <h4 className="font-display text-base font-semibold">Planning checklist</h4>
                  <ul className="mt-3 space-y-2 text-sm text-[#4D5752] dark:text-[#A3B1AA] list-disc pl-5">
                    {TOURS_CHECKLIST.map((tip) => (
                      <li key={tip}>{tip}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-xs text-[#5C6660] dark:text-[#9AA8A0]">
                  This is general information, not a booking service. Always confirm details with the operator, park authority or official source.
                </p>
                <div className="flex flex-wrap gap-3">
                  <a
                    href={buildWhatsAppLink(
                      "Hello, I'd like to list my tours/travel business with Twende Events / Twende Matchday. Company, location and services: ",
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-2.5 rounded-lg bg-[#0E5A43] hover:bg-[#0B4735] dark:bg-[#3DBE7C] text-white dark:text-[#071A11] text-sm font-semibold transition-colors"
                  >
                    List your tour company
                  </a>
                  <a
                    href={buildWhatsAppLink(
                      "Hello, I'd like help planning a trip around the tournament. Dates, group size and interests: ",
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-2.5 rounded-lg border border-[#D8D8D0] dark:border-[#2E3C35] bg-white dark:bg-[#131B18] text-sm font-semibold hover:bg-[#FAFAF8] dark:hover:bg-[#1C2622] transition-colors"
                  >
                    Ask for a trip plan
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* CREATIVES */}
          {activeTab === 'creatives' && (
            <div id="panel-creatives" role="tabpanel" aria-labelledby="tab-creatives" className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                <div className="md:col-span-7">
                  <p className="text-xs font-medium text-[#0E5A43] dark:text-[#4AD192]">
                    Community
                  </p>
                  <h3 className="mt-1 font-display text-2xl font-bold">For creatives</h3>
                  <p className="mt-2 text-sm sm:text-base text-[#4D5752] dark:text-[#A3B1AA]">
                    A home for the people who make Uganda look and sound good. Get seen, meet collaborators and connect with brands looking for talent.
                  </p>
                </div>
                <div className="md:col-span-5">
                  <TabHeroMedia tabKey="creatives" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {CREATIVES_TRACKS.map((track) => (
                  <div
                    key={track.title}
                    className="p-6 rounded-xl bg-white dark:bg-[#131B18] border border-[#E5E5DF] dark:border-[#222F2A]"
                  >
                    <h4 className="font-display text-base font-semibold">{track.title}</h4>
                    <p className="mt-2 text-sm text-[#4D5752] dark:text-[#A3B1AA]">{track.description}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                <a
                  href={buildWhatsAppLink(
                    "Hello, I'm a creative (film, content or fashion) and I'd like to join Twende Events. My name is: ",
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#0E5A43] hover:bg-[#0B4735] dark:bg-[#3DBE7C] text-white dark:text-[#071A11] text-sm font-semibold transition-colors"
                >
                  Apply as a creative
                  <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
                </a>
                <p className="text-xs text-[#5C6660] dark:text-[#9AA8A0]">
                  Opportunities and paid work depend on partners and are not guaranteed.
                </p>
              </div>
            </div>
          )}

          {/* PARTNERS */}
          {activeTab === 'partners' && (
            <div id="panel-partners" role="tabpanel" aria-labelledby="tab-partners" className="space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                <div className="md:col-span-7">
                  <p className="text-xs font-medium text-[#0E5A43] dark:text-[#4AD192]">
                    Collaborate
                  </p>
                  <h3 className="mt-1 font-display text-2xl font-bold">Partner with us</h3>
                  <p className="mt-2 text-sm sm:text-base text-[#4D5752] dark:text-[#A3B1AA]">
                    Reach an engaged, verified audience of young professionals and founders through event sponsorship, activations, content and corporate memberships. We report on attendance, leads and results after every activation.
                  </p>
                </div>
                <div className="md:col-span-5">
                  <TabHeroMedia tabKey="partners" />
                </div>
              </div>

              <div>
                <h4 className="font-display text-base font-semibold">We’re inviting</h4>
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {PARTNER_TRACKS.map((track) => (
                    <div
                      key={track.title}
                      className="p-5 rounded-xl bg-white dark:bg-[#131B18] border border-[#E5E5DF] dark:border-[#222F2A] flex flex-col justify-between"
                    >
                      <div>
                        <h5 className="font-display text-base font-semibold">{track.title}</h5>
                        <p className="mt-1.5 text-sm text-[#4D5752] dark:text-[#A3B1AA]">
                          {track.description}
                        </p>
                      </div>
                      <a
                        href={buildWhatsAppLink(track.waMessage)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-5 inline-flex items-center justify-center px-3.5 py-2 rounded-lg border border-[#D8D8D0] dark:border-[#2E3C35] text-sm font-semibold hover:bg-[#FAFAF8] dark:hover:bg-[#1C2622] transition-colors"
                      >
                        Invite me
                      </a>
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-xs text-[#5C6660] dark:text-[#9AA8A0]">
                  Partnerships with creatives are credit-based and paid work is not guaranteed. Terms are agreed in writing.
                </p>
              </div>

              <div>
                <h4 className="font-display text-sm font-semibold text-[#5C6660] dark:text-[#9AA8A0]">
                  Sectors we work with
                </h4>
                <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-sm text-[#3C4641] dark:text-[#C4D0C9]">
                  {PARTNER_INDUSTRIES.map((industry) => (
                    <div
                      key={industry}
                      className="py-2 px-3 rounded-lg bg-white dark:bg-[#131B18] border border-[#E5E5DF] dark:border-[#222F2A]"
                    >
                      {industry}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <a
                  href={buildWhatsAppLink("Hello, I'd like the Twende Events partner pack.")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 rounded-lg bg-[#0E5A43] hover:bg-[#0B4735] dark:bg-[#3DBE7C] text-white dark:text-[#071A11] text-sm font-semibold transition-colors"
                >
                  Request our partner pack
                </a>
                <a
                  href={buildWhatsAppLink(
                    'Hello, I run a cafe / gym / clinic and I’d like to be a Twende Events perk partner. Business name: ',
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 rounded-lg border border-[#D8D8D0] dark:border-[#2E3C35] bg-white dark:bg-[#131B18] text-sm font-semibold hover:bg-[#FAFAF8] dark:hover:bg-[#1C2622] transition-colors"
                >
                  Be a perk partner
                </a>
                <a
                  href={buildWhatsAppLink(
                    "Hello, I'd like to host a celebration (staff party / launch / awards) with Twende Events. Company and date: ",
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 rounded-lg border border-[#D8D8D0] dark:border-[#2E3C35] bg-white dark:bg-[#131B18] text-sm font-semibold hover:bg-[#FAFAF8] dark:hover:bg-[#1C2622] transition-colors"
                >
                  Host your celebration
                </a>
              </div>
            </div>
          )}

          {/* LEAD A CHAPTER */}
          {activeTab === 'join' && (
            <div id="panel-join" role="tabpanel" aria-labelledby="tab-join" className="max-w-xl space-y-6">
              <div>
                <p className="text-xs font-medium text-[#0E5A43] dark:text-[#4AD192]">
                  Chapters
                </p>
                <h3 className="mt-1 font-display text-2xl font-bold">Lead a Twende Events chapter</h3>
                <p className="mt-2 text-sm sm:text-base text-[#4D5752] dark:text-[#A3B1AA]">
                  Want to build Twende Events in your city? Chapter leads run local events under Twende Events’ code of conduct, safety and financial standards. Terms are agreed in writing, and chapters open once a city has enough interested members and partners.
                </p>
              </div>

              {submittedWhatsAppUrl ? (
                <div className="p-6 rounded-xl bg-white dark:bg-[#131B18] border border-[#0E5A43] dark:border-[#4AD192] space-y-3">
                  <div className="flex items-center gap-2 text-[#0E5A43] dark:text-[#4AD192] font-display font-bold text-lg">
                    <CheckCircle2 className="w-5 h-5" aria-hidden="true" />
                    <span>Application ready on WhatsApp</span>
                  </div>
                  <p className="text-sm text-[#4D5752] dark:text-[#A3B1AA]">
                    WhatsApp should now be open with your application. Please tap Send so we receive it.
                  </p>
                  <div className="flex flex-wrap gap-3 pt-2">
                    <a
                      href={submittedWhatsAppUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-lg bg-[#0E5A43] dark:bg-[#3DBE7C] text-white dark:text-[#071A11] text-sm font-semibold"
                    >
                      Open WhatsApp again
                    </a>
                    <button
                      type="button"
                      onClick={() => setSubmittedWhatsAppUrl(null)}
                      className="px-4 py-2 rounded-lg border border-[#D8D8D0] dark:border-[#2E3C35] text-sm font-medium cursor-pointer"
                    >
                      Edit application
                    </button>
                  </div>
                </div>
              ) : (
                <form
                  onSubmit={handleChapterSubmit}
                  noValidate
                  className="p-6 sm:p-8 rounded-xl bg-white dark:bg-[#131B18] border border-[#E5E5DF] dark:border-[#222F2A] space-y-4"
                >
                  <div>
                    <label htmlFor="ch-name" className="block text-sm font-medium mb-1">
                      Full name
                    </label>
                    <input
                      id="ch-name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      autoComplete="name"
                      className="w-full px-3.5 py-2 rounded-lg border border-[#D8D8D0] dark:border-[#2E3C35] bg-[#FAFAF8] dark:bg-[#0D1210] text-sm"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="ch-email" className="block text-sm font-medium mb-1">
                        Email address
                      </label>
                      <input
                        id="ch-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoComplete="email"
                        className="w-full px-3.5 py-2 rounded-lg border border-[#D8D8D0] dark:border-[#2E3C35] bg-[#FAFAF8] dark:bg-[#0D1210] text-sm"
                      />
                    </div>
                    <div>
                      <label htmlFor="ch-phone" className="block text-sm font-medium mb-1">
                        Phone / WhatsApp number
                      </label>
                      <input
                        id="ch-phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        autoComplete="tel"
                        className="w-full px-3.5 py-2 rounded-lg border border-[#D8D8D0] dark:border-[#2E3C35] bg-[#FAFAF8] dark:bg-[#0D1210] text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="ch-city" className="block text-sm font-medium mb-1">
                      City and country
                    </label>
                    <input
                      id="ch-city"
                      placeholder="e.g. Nairobi, Kenya"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-lg border border-[#D8D8D0] dark:border-[#2E3C35] bg-[#FAFAF8] dark:bg-[#0D1210] text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="ch-why" className="block text-sm font-medium mb-1">
                      Why do you want to lead Twende Events in your city?
                    </label>
                    <textarea
                      id="ch-why"
                      rows={3}
                      maxLength={400}
                      value={why}
                      onChange={(e) => setWhy(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-lg border border-[#D8D8D0] dark:border-[#2E3C35] bg-[#FAFAF8] dark:bg-[#0D1210] text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="ch-exp" className="block text-sm font-medium mb-1">
                      Experience organising events or communities
                    </label>
                    <textarea
                      id="ch-exp"
                      rows={3}
                      maxLength={400}
                      value={experience}
                      onChange={(e) => setExperience(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-lg border border-[#D8D8D0] dark:border-[#2E3C35] bg-[#FAFAF8] dark:bg-[#0D1210] text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="ch-reach" className="block text-sm font-medium mb-1">
                      People you could bring in your first 3 months
                    </label>
                    <select
                      id="ch-reach"
                      value={reach}
                      onChange={(e) => setReach(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-lg border border-[#D8D8D0] dark:border-[#2E3C35] bg-[#FAFAF8] dark:bg-[#0D1210] text-sm"
                    >
                      <option>Under 20</option>
                      <option>20 to 50</option>
                      <option>50 to 100</option>
                      <option>Over 100</option>
                    </select>
                  </div>
                  <label className="flex items-start gap-2.5 text-sm text-[#4D5752] dark:text-[#A3B1AA] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={agreed}
                      onChange={(e) => setAgreed(e.target.checked)}
                      className="mt-1 rounded border-[#D8D8D0]"
                    />
                    <span>I agree to be contacted by Twende Events about this application.</span>
                  </label>

                  {chapterError && (
                    <p role="alert" className="text-sm text-[#B3341E] dark:text-[#FF8F78]">
                      {chapterError}
                    </p>
                  )}

                  <button
                    type="submit"
                    className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-[#0E5A43] hover:bg-[#0B4735] dark:bg-[#3DBE7C] text-white dark:text-[#071A11] text-sm font-semibold transition-colors cursor-pointer"
                  >
                    Send my application on WhatsApp
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
