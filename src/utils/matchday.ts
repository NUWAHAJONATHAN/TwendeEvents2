export type CountryCode = 'UG' | 'KE' | 'TZ';

export type ListingCategory = 0 | 1 | 2; // 0: Stay, 1: Eat, 2: Transport

export interface HostCity {
  name: string;
  country: CountryCode;
}

export interface EnquiryLog {
  name: string;
  date: string;
  guests: string;
}

export interface MatchdayListing {
  id: string;
  name: string;
  price: string;
  phone: string;
  sample: boolean;
  featured: boolean;
  city: number;
  cat: ListingCategory;
  plan: string;
  amt: number;
  cur: string;
  method: string;
  ref: string;
  t: number;
  status: 'active' | 'suspended';
  photos?: string[];
  pv?: number;
  owner?: string;
  enq?: number;
  log?: EnquiryLog[];
}

export interface BusinessAccount {
  email: string;
  name: string;
  pw: string;
  must: boolean;
}

export const WHATSAPP_ORGANISER = '256768561755';

export const HOST_CITIES: HostCity[] = [
  { name: 'Kampala', country: 'UG' },
  { name: 'Hoima', country: 'UG' },
  { name: 'Nairobi', country: 'KE' },
  { name: 'Eldoret', country: 'KE' },
  { name: 'Kakamega', country: 'KE' },
  { name: 'Dar es Salaam', country: 'TZ' },
  { name: 'Arusha', country: 'TZ' },
  { name: 'Dodoma', country: 'TZ' },
  { name: 'Zanzibar', country: 'TZ' },
];

export const COUNTRY_NAMES: Record<CountryCode, string> = {
  UG: 'Uganda',
  KE: 'Kenya',
  TZ: 'Tanzania',
};

export const COUNTRY_DIALING: Record<CountryCode, string> = {
  UG: '256',
  KE: '254',
  TZ: '255',
};

export const CURRENCY_CONFIG: Record<CountryCode, { code: string; sampleBase: [number, number, number]; feeBase: number }> = {
  UG: { code: 'UGX', sampleBase: [150000, 30000, 15000], feeBase: 30000 },
  KE: { code: 'KES', sampleBase: [6500, 1200, 500], feeBase: 1200 },
  TZ: { code: 'TZS', sampleBase: [110000, 20000, 8000], feeBase: 20000 },
};

export const CATEGORY_LABELS = ['Where to stay', 'Where to eat', 'Getting around'] as const;
export const LISTING_TYPES = ['Hotel or guesthouse', 'Restaurant or bar', 'Transport'] as const;
export const PRICE_UNITS = ['per night', 'per meal', 'per trip'] as const;
export const BOOKING_VERBS = ['book a room', 'reserve a table', 'book a ride'] as const;
export const DATE_LABELS = ['Check-in date', 'Date', 'Pickup date'] as const;

export const SAMPLE_NAMES: [string[], string[], string[]] = [
  ['Guesthouse near the stadium', 'Budget rooms in town centre', 'Family-run lodge'],
  ['Local kitchen', 'Grill and drinks spot', 'Street-food market'],
  ['Airport pickup', 'Stadium shuttle', 'Boda or tuk-tuk ride'],
];

export const LISTING_PLANS = [
  { label: 'Standard listing', shortLabel: 'Standard listing', multiplier: 1 },
  { label: 'Featured listing (shown first)', shortLabel: 'Featured listing', multiplier: 2.7 },
] as const;

export const PAYMENT_METHODS: Record<CountryCode, { id: string; label: string }[]> = {
  UG: [
    { id: 'mtn', label: 'MTN Mobile Money' },
    { id: 'airtel', label: 'Airtel Money' },
    { id: 'card', label: 'Card' },
    { id: 'manual', label: 'Cash or bank transfer (already received)' },
  ],
  KE: [
    { id: 'mpesa', label: 'M-Pesa' },
    { id: 'airtel', label: 'Airtel Money' },
    { id: 'card', label: 'Card' },
    { id: 'manual', label: 'Cash or bank transfer (already received)' },
  ],
  TZ: [
    { id: 'mpesa', label: 'M-Pesa' },
    { id: 'airtel', label: 'Airtel Money' },
    { id: 'card', label: 'Card' },
    { id: 'manual', label: 'Cash or bank transfer (already received)' },
  ],
};

export function formatCurrencyValue(value: number): string {
  return Math.round(value).toLocaleString('en-US');
}

export function buildWhatsAppLink(text: string, phone: string = WHATSAPP_ORGANISER): string {
  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}

export function normalizePhone(rawPhone: string, country: CountryCode): string | null {
  let digits = rawPhone.replace(/[\s+\-()]/g, '');
  const code = COUNTRY_DIALING[country];
  if (!digits) return null;
  if (digits.startsWith('0')) {
    digits = code + digits.slice(1);
  } else if (!digits.startsWith(code)) {
    digits = code + digits;
  }
  return /^(256|254|255)\d{9}$/.test(digits) ? digits : null;
}

export function calculateListingFee(country: CountryCode, planIndex: number): { currency: string; amount: number } {
  const cfg = CURRENCY_CONFIG[country];
  const plan = LISTING_PLANS[planIndex] ?? LISTING_PLANS[0];
  return {
    currency: cfg.code,
    amount: Math.round((cfg.feeBase * plan.multiplier) / 100) * 100,
  };
}

export function getPublicListings(
  listings: MatchdayListing[],
  cityIndex: number,
  category: ListingCategory,
): MatchdayListing[] {
  const city = HOST_CITIES[cityIndex];
  const cfg = CURRENCY_CONFIG[city.country];

  const liveOrSeeded = listings
    .filter((item) => item.city === cityIndex && item.cat === category && item.status !== 'suspended')
    .sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));

  const samples: MatchdayListing[] = SAMPLE_NAMES[category].map((name, idx) => {
    const samplePrice = Math.round((cfg.sampleBase[category] * (1 + idx * 0.3)) / 100) * 100;
    return {
      id: `${city.name}|${category}|${idx}`,
      name,
      price: `${cfg.code} ${formatCurrencyValue(samplePrice)} ${PRICE_UNITS[category]}`,
      phone: WHATSAPP_ORGANISER,
      sample: true,
      featured: false,
      city: cityIndex,
      cat: category,
      plan: 'Sample',
      amt: 0,
      cur: cfg.code,
      method: 'Sample',
      ref: 'SAMPLE',
      t: 0,
      status: 'active',
    };
  });

  return [...liveOrSeeded, ...samples];
}

export function filterAdminListings(
  listings: MatchdayListing[],
  query: string,
  cityFilter: string,
  statusFilter: string,
): MatchdayListing[] {
  const q = query.trim().toLowerCase();
  return listings.filter((item) => {
    const matchesQuery =
      !q || item.name.toLowerCase().includes(q) || item.ref.toLowerCase().includes(q);
    const matchesCity = cityFilter === 'all' || Number(cityFilter) === item.city;
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    return matchesQuery && matchesCity && matchesStatus;
  });
}

export function buildBookingMessage(params: {
  guestName: string;
  listingName: string;
  cityName: string;
  category: ListingCategory;
  dateISO: string;
  guests: string;
}): string {
  const name = params.guestName.trim() || 'a fan';
  const guestsNum = Math.max(1, Number(params.guests) || 1);
  const dateDisplay = params.dateISO
    ? new Date(`${params.dateISO}T00:00:00`).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : 'my dates';
  return `Hello, my name is ${name}. I found you on Twende Matchday and would like to ${BOOKING_VERBS[params.category]} at ${params.listingName} in ${params.cityName} on ${dateDisplay} for ${guestsNum} ${guestsNum === 1 ? 'person' : 'people'}. Is it available?`;
}

export function buildListingsCsv(listings: MatchdayListing[]): string {
  const headers = ['Business', 'Type', 'City', 'Plan', 'Amount', 'Currency', 'Method', 'Reference', 'Date', 'Status'];
  const rows = listings.map((e) => [
    e.name,
    LISTING_TYPES[e.cat],
    HOST_CITIES[e.city]?.name ?? '',
    e.plan,
    e.amt,
    e.cur,
    e.method,
    e.ref,
    new Date(e.t).toISOString().slice(0, 10),
    e.status,
  ]);

  return [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n');
}

export function generateTempPassword(length = 8): string {
  const alphabet = 'abcdefghjkmnpqrstuvwxyz23456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    const rand =
      typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function'
        ? crypto.getRandomValues(new Uint8Array(1))[0]
        : Math.floor(Math.random() * 256);
    result += alphabet[rand % alphabet.length];
  }
  return result;
}

export function validateChapterApplication(input: {
  name: string;
  email: string;
  phone: string;
  city: string;
  why: string;
  experience: string;
  agreed: boolean;
}): string | null {
  if (
    !input.name.trim() ||
    !input.city.trim() ||
    !input.why.trim() ||
    !input.experience.trim() ||
    !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(input.email.trim()) ||
    input.phone.replace(/\D/g, '').length < 9
  ) {
    return 'Please complete every field with a valid email address and phone number.';
  }
  if (!input.agreed) {
    return 'Please tick the box to agree to be contacted.';
  }
  return null;
}

export function getCountdownParts(targetTimestampMs: number, nowMs: number = Date.now()) {
  const remainingSec = Math.floor(Math.max(0, targetTimestampMs - nowMs) / 1000);
  return {
    days: String(Math.floor(remainingSec / 86400)).padStart(3, '0'),
    hours: String(Math.floor((remainingSec % 86400) / 3600)).padStart(2, '0'),
    minutes: String(Math.floor((remainingSec % 3600) / 60)).padStart(2, '0'),
    seconds: String(remainingSec % 60).padStart(2, '0'),
  };
}
