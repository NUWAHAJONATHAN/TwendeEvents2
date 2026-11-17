import {
  CURRENCY_CONFIG,
  HOST_CITIES,
  LISTING_PLANS,
  PRICE_UNITS,
  WHATSAPP_ORGANISER,
  calculateListingFee,
  formatCurrencyValue,
  type BusinessAccount,
  type MatchdayListing,
} from '../utils/matchday';

export type HubTabKey =
  | 'matchday'
  | 'events'
  | 'rentals'
  | 'tours'
  | 'creatives'
  | 'partners'
  | 'join';

export interface ExploreCategory {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  imageAlt: string;
  imagePosition?: string;
  hubTab?: HubTabKey;
  waMessage?: string;
}

export const EXPLORE_CATEGORIES: ExploreCategory[] = [
  {
    id: 'events',
    title: 'Events',
    subtitle: 'Parties, matches, mixers',
    image: '/assets/aistudio/dimitrisvetsikas1969-stage-1712494_1920_67151466.jpg',
    imageAlt: 'Outdoor live event stage truss and speaker towers',
    hubTab: 'events',
  },
  {
    id: 'stays',
    title: 'Stays & rentals',
    subtitle: 'Apartments, guesthouses',
    image: '/assets/aistudio/artisticoperations-real-estate-3297625_1920_d3b3654c.jpg',
    imageAlt: 'Modern gated residential townhomes and apartments',
    hubTab: 'rentals',
  },
  {
    id: 'tours',
    title: 'Tours & travel',
    subtitle: 'Safaris, Jinja, city tours',
    image: '/assets/aistudio/olivier_d-elephants-6254556_1920_04370d3b.jpg',
    imageAlt: 'Two elephants locking trunks in a green savannah landscape',
    hubTab: 'tours',
  },
  {
    id: 'venues',
    title: 'Venues',
    subtitle: 'Rooftops, halls, grounds',
    image: '/assets/aistudio/drakcode-lights-6952903_1920_6d446340.jpg',
    imageAlt: 'Warm geometric pendant lamps and string lights in an indoor venue',
    imagePosition: 'object-[50%_35%]',
    waMessage: 'Hello Twende Events, I’m looking for: Venues. City and dates: ',
  },
  {
    id: 'food',
    title: 'Food & drinks',
    subtitle: 'Cafés, bars, restaurants',
    image: '/assets/aistudio/pexels-beans-1834984_1920_f0a934a8.jpg',
    imageAlt: 'Plate of fried eggs on toast with baked beans and a cup of coffee',
    waMessage: 'Hello Twende Events, I’m looking for: Food & drinks. City and dates: ',
  },
  {
    id: 'transport',
    title: 'Transport',
    subtitle: 'Rides, drivers, car hire',
    image: '/assets/aistudio/wal_172619-raining-7274548_1920_6a71580c.jpg',
    imageAlt: 'City street transit, passenger vans and cars on a rainy evening',
    waMessage: 'Hello Twende Events, I’m looking for: Transport. City and dates: ',
  },
  {
    id: 'creatives',
    title: 'Creatives',
    subtitle: 'Film, music, fashion',
    image: '/assets/aistudio/syriary91-studio-5769427_1920_70b740c5.jpg',
    imageAlt: 'DSLR camera on a tripod inside a studio with softbox lighting',
    hubTab: 'creatives',
  },
  {
    id: 'partners',
    title: 'Partners',
    subtitle: 'Perks and offers',
    image: '/assets/aistudio/mohamed_hassan-teamwork-3213924_1920_340df9dd.jpg',
    imageAlt: 'Partners fist-bumping over business plans, invoices and laptops',
    hubTab: 'partners',
  },
];

export const HUB_TAB_MEDIA: Partial<
  Record<HubTabKey, { src: string; alt: string; objectPosition?: string }>
> = {
  events: {
    src: '/assets/aistudio/dimitrisvetsikas1969-stage-1712494_1920_67151466.jpg',
    alt: 'Outdoor live event stage truss and speaker towers',
  },
  rentals: {
    src: '/assets/aistudio/artisticoperations-real-estate-3297625_1920_d3b3654c.jpg',
    alt: 'Modern gated residential townhomes and apartments',
  },
  tours: {
    src: '/assets/aistudio/olivier_d-elephants-6254556_1920_04370d3b.jpg',
    alt: 'Two elephants locking trunks in a green savannah landscape',
  },
  creatives: {
    src: '/assets/aistudio/syriary91-studio-5769427_1920_70b740c5.jpg',
    alt: 'DSLR camera on a tripod inside a studio with softbox lighting',
  },
  partners: {
    src: '/assets/aistudio/mohamed_hassan-teamwork-3213924_1920_340df9dd.jpg',
    alt: 'Partners fist-bumping over business plans, invoices and laptops',
  },
};

export const HUB_TABS: { key: HubTabKey; label: string }[] = [
  { key: 'matchday', label: 'Twende Matchday' },
  { key: 'events', label: 'Events' },
  { key: 'rentals', label: 'Rentals & apartments' },
  { key: 'tours', label: 'Tours & travel' },
  { key: 'creatives', label: 'For creatives' },
  { key: 'partners', label: 'Partner with us' },
  { key: 'join', label: 'Lead a chapter' },
];

export const SAMPLE_LISTINGS = [
  {
    title: 'Kampala rooftop sundowner',
    rating: '4.5',
    stars: 4.5,
    where: 'Kololo',
    when: 'Fri · 6:00 pm',
    price: 'Sample price',
    note: 'Golden hour, easy crowd and a view over the city.',
  },
  {
    title: 'Jinja river rafting day',
    rating: '4.8',
    stars: 5,
    where: 'Jinja',
    when: 'Sat · 8:00 am',
    price: 'Sample price',
    note: 'Big water, good guides and a relaxed riverside lunch.',
  },
  {
    title: 'Nairobi founders’ mixer',
    rating: '4.1',
    stars: 4,
    where: 'Nairobi',
    when: 'Sun · 5:00 pm',
    price: 'Free',
    note: 'Plenty of conversation. Bring business cards.',
  },
  {
    title: 'Entebbe lakeside stay',
    rating: '4.6',
    stars: 4.5,
    where: 'Entebbe',
    when: 'Any night',
    price: 'Sample price',
    note: 'Quiet rooms near the airport with a lake view.',
  },
];

export const MATCHDAY_COPY = {
  en: {
    headline: 'Plan your 2027 football trip across East Africa',
    subtitle: 'Find where to stay, eat and get around in every host city.',
    fanCta: 'I’m a fan',
    bizCta: 'I run a business',
  },
  sw: {
    headline: 'Panga safari yako ya soka 2027 Afrika Mashariki',
    subtitle: 'Pata mahali pa kulala, kula na usafiri katika kila mji mwenyeji.',
    fanCta: 'Mimi ni shabiki',
    bizCta: 'Nina biashara',
  },
  fr: {
    headline: 'Organisez votre voyage football 2027 en Afrique de l’Est',
    subtitle: 'Trouvez où dormir, manger et vous déplacer dans chaque ville hôte.',
    fanCta: 'Je suis supporter',
    bizCta: 'J’ai une entreprise',
  },
} as const;

function makeSamplePhotoSvg(label: string, bg: string): string {
  return (
    'data:image/svg+xml;utf8,' +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400"><rect width="600" height="400" fill="${bg}"/><text x="300" y="210" font-size="28" fill="#ffffff" text-anchor="middle" font-family="system-ui,sans-serif">${label}</text></svg>`,
    )
  );
}

export function createInitialMatchdayListings(): MatchdayListing[] {
  const now = Date.now();
  const seeds: Array<{
    name: string;
    city: number;
    cat: 0 | 1 | 2;
    planIdx: number;
    method: string;
    daysAgo: number;
    ref: string;
    photos?: string[];
    owner?: string;
    pv?: number;
    enq?: number;
    log?: { name: string; date: string; guests: string }[];
  }> = [
    {
      name: 'Lakeview Guesthouse',
      city: 0,
      cat: 0,
      planIdx: 0,
      method: 'MTN Mobile Money',
      daysAgo: 3,
      ref: 'KM-1001',
      photos: [
        makeSamplePhotoSvg('Sample photo: Room', '#0E5A43'),
        makeSamplePhotoSvg('Sample photo: Garden', '#7C5A22'),
      ],
      owner: 'lakeview@example.com',
      pv: 150000,
      enq: 2,
      log: [
        { name: 'Amina', date: '2027-06-19', guests: '2' },
        { name: 'Peter', date: '2027-06-24', guests: '3' },
      ],
    },
    {
      name: 'Nile Grill',
      city: 1,
      cat: 1,
      planIdx: 1,
      method: 'Airtel Money',
      daysAgo: 2,
      ref: 'KM-1002',
      photos: [makeSamplePhotoSvg('Sample photo: Dining area', '#7A2E1D')],
    },
    {
      name: 'Rift Valley Shuttles',
      city: 4,
      cat: 2,
      planIdx: 0,
      method: 'M-Pesa',
      daysAgo: 1,
      ref: 'KM-1003',
    },
    {
      name: 'Coastline Rooms',
      city: 8,
      cat: 0,
      planIdx: 1,
      method: 'M-Pesa',
      daysAgo: 0,
      ref: 'KM-1004',
    },
  ];

  return seeds.map((s) => {
    const cc = HOST_CITIES[s.city].country;
    const cfg = CURRENCY_CONFIG[cc];
    const fee = calculateListingFee(cc, s.planIdx);
    const samplePrice = Math.round(cfg.sampleBase[s.cat] / 100) * 100;
    return {
      id: `s-${s.ref}`,
      name: s.name,
      price: `${cfg.code} ${formatCurrencyValue(samplePrice)} ${PRICE_UNITS[s.cat]}`,
      phone: WHATSAPP_ORGANISER,
      sample: true,
      featured: s.planIdx === 1,
      city: s.city,
      cat: s.cat,
      plan: LISTING_PLANS[s.planIdx].shortLabel,
      amt: fee.amount,
      cur: fee.currency,
      method: s.method,
      ref: s.ref,
      t: now - s.daysAgo * 864e5,
      status: 'active',
      photos: s.photos,
      owner: s.owner,
      pv: s.pv,
      enq: s.enq,
      log: s.log,
    };
  });
}

export const INITIAL_ACCOUNTS: BusinessAccount[] = [
  {
    email: 'lakeview@example.com',
    name: 'Lakeview Guesthouse',
    pw: 'welcome2027',
    must: true,
  },
];

export const EVENTS_CALENDAR = [
  {
    title: 'The First 100: Founding Members’ Sundowner',
    description:
      'An invite-led Friday evening with speed-networking and drinks. Date and venue announced to the waitlist.',
  },
  {
    title: 'Sunday Cars & Coffee',
    description: 'A relaxed meet for car lovers, with a test-drive corner.',
  },
  {
    title: 'Weekly Coffee Chats',
    description: 'Meet members over coffee in a rotating partner café.',
  },
  {
    title: 'Celebration Nights',
    description:
      'Monthly birthday nights, anniversary parties and year-end celebrations. Companies can also host staff parties and launches with us.',
  },
  {
    title: 'Builders & Makers Mixer',
    description:
      'Manufacturers, contractors, wholesalers and suppliers meet founders and professionals.',
  },
  {
    title: 'Founders’ Table',
    description: 'A dinner for 12–20 builders, entrepreneurs and professionals.',
  },
];

export const MATCHDAY_EVENT_IDEAS = [
  {
    title: 'Watch parties',
    description: 'Big-screen viewings at partner cafés, bars and lounges.',
  },
  {
    title: 'Fan meet-ups',
    description: 'Supporter groups meeting before and after matches.',
  },
  {
    title: 'Food & music nights',
    description: 'Local food, live music and pop-ups around match days.',
  },
];

export const RENTAL_TYPES = [
  {
    title: 'Short-stay apartments',
    description: 'Furnished flats for a few nights to a few weeks. Good for groups and families.',
  },
  {
    title: 'Guesthouses & lodges',
    description: 'Smaller, often family-run places with rooms and breakfast.',
  },
  {
    title: 'Serviced apartments',
    description:
      'Apartments with cleaning, security and sometimes meals. Usually priced by the night or week.',
  },
  {
    title: 'Long-term rentals',
    description: 'Monthly or yearly lets for people moving to Uganda for work or study.',
  },
  {
    title: 'Student & shared housing',
    description: 'Hostels and shared flats near campuses, usually the cheapest per person.',
  },
];

export const KAMPALA_AREAS = [
  {
    title: 'Kololo & Nakasero',
    description: 'Central and upmarket, close to restaurants, embassies and offices.',
  },
  {
    title: 'Bugolobi & Muyenga',
    description: 'Quiet residential areas with a mix of apartments and guesthouses.',
  },
  {
    title: 'Ntinda & Naguru',
    description: 'Residential areas with shops and cafés nearby.',
  },
  {
    title: 'Entebbe',
    description: 'Near the airport and Lake Victoria, handy for early or late flights.',
  },
  {
    title: 'Jinja',
    description: 'A few hours from Kampala, popular for river and adventure stays.',
  },
];

export const RENTAL_SAFETY_TIPS = [
  'See the place first, or ask for a live video walk-through. Photos can be old or from another property.',
  'Confirm who the landlord or agent is, and ask for the name and phone number on the booking.',
  'Ask exactly what is included: water, power, internet, parking, security, cleaning.',
  'Agree the price, dates, deposit and cancellation rules in writing, such as on WhatsApp or email.',
  'Pay by a traceable method and ask for a receipt. Be careful about paying everything upfront to someone you haven’t verified.',
  'Never share your card number, PIN or passwords in chat.',
  'For long-term lets, get a written tenancy agreement and read it before you sign.',
];

export const RENTAL_MATCHWEEK_TIPS = [
  'Book early. Rooms near the main host cities are likely to fill up around the opening day on 19 June 2027.',
  'Ask about cancellation and date changes in case fixtures or travel plans move.',
  'Check how you will get to the match and back, especially late at night.',
];

export const TOURS_ACTIVITIES = [
  {
    title: 'Kampala & Entebbe',
    description: 'City tours, markets, museums, nightlife, the botanical gardens and the lakeshore.',
  },
  {
    title: 'Safaris & national parks',
    description: 'Game drives, boat trips and bird watching in Uganda’s parks.',
  },
  {
    title: 'Gorilla & chimp trekking',
    description:
      'Needs a permit booked in advance. Ask for permit rules and dates before you plan the rest of your trip.',
  },
  {
    title: 'Jinja & the Nile',
    description: 'River rafting, kayaking, quad biking and relaxed riverside stays.',
  },
  {
    title: 'Lake Victoria islands',
    description: 'Boat trips and beach stays on islands such as the Ssese Islands.',
  },
  {
    title: 'Across the border',
    description: 'Add Kenya or Tanzania to your trip if you are following your team between host countries.',
  },
];

export const TOURS_TRANSPORT_TIPS = [
  'Ride-hailing apps and licensed taxis are usually easier than flagging a vehicle on the street. Agree the fare before you start if there is no meter or app.',
  'Boda bodas (motorbike taxis) are fast in traffic but riskier. Wear a helmet if you use one.',
  'For long trips, hire a driver or join a group tour. Road travel in and out of cities can be slow on match days.',
  'Keep your passport copy and booking details on your phone.',
];

export const TOURS_CHECKLIST = [
  'Check current visa, health and entry requirements on official government sources before you travel.',
  'Choose licensed tour operators and ask for a written itinerary, what is included and the cancellation terms.',
  'Book national park permits and lodges well ahead of the tournament.',
  'Keep a few days spare in your plan in case of delays.',
  'Get travel insurance that covers medical care and cancellations.',
];

export const CREATIVES_TRACKS = [
  {
    title: 'Film & acting',
    description:
      'Meet directors, producers, crew and fellow actors. Showreel nights, screenings and casting connections as opportunities arise.',
  },
  {
    title: 'Content creators',
    description:
      'Collab meetups, shoot days and brand briefs. Members are featured across our channels and considered first for brand campaigns.',
  },
  {
    title: 'Fashion designers',
    description:
      'Pop-ups, showcase nights and styling shoots with photographers and models, in front of members and partner brands.',
  },
];

export const PARTNER_TRACKS = [
  {
    title: 'Restaurants & lounges',
    description: 'Be a partner venue for member evenings and celebrations.',
    waMessage:
      "Hello, I run a restaurant/lounge and I'd like to partner with Twende Events. Name and area: ",
  },
  {
    title: 'Photographers',
    description: 'Cover our events, get credit and a featured portfolio.',
    waMessage:
      "Hello, I'm a photographer and I'd like to partner with Twende Events. My name and portfolio link: ",
  },
  {
    title: 'Filmmakers & video creators',
    description: 'Recaps, short series and screening nights with credit.',
    waMessage:
      "Hello, I'm a filmmaker/video creator and I'd like to partner with Twende Events. My name and showreel link: ",
  },
  {
    title: 'Brands & companies',
    description: 'Sponsorship, activations, member perks and content.',
    waMessage:
      "Hello, I'd like Twende Events’ partner details. Company and contact: ",
  },
];

export const PARTNER_INDUSTRIES = [
  'Telecoms',
  'Breweries & beverages',
  'Banking & finance',
  'Manufacturing & construction',
  'Car dealerships',
  'Wholesale & merchandise',
  'Hotels & restaurants',
  'Cafés, gyms & clinics',
];

export const PRINCIPLES = [
  {
    title: 'Community first',
    description: 'Everything we build starts with the people who will use it.',
  },
  {
    title: 'Straight talk',
    description: 'Clear details and honest ratings. Samples are always labelled as samples.',
  },
  {
    title: 'Local first',
    description:
      'We back local businesses, venues and creatives so more money stays in the community.',
  },
  {
    title: 'Safe by default',
    description:
      'Clear terms, no pressure and no sharing of your details without your say.',
  },
];
