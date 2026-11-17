import {
  Bookmark,
  Check,
  ChevronLeft,
  ChevronRight,
  Download,
  ExternalLink,
  ImagePlus,
  LogOut,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import {
  INITIAL_ACCOUNTS,
  MATCHDAY_COPY,
  createInitialMatchdayListings,
} from '../data/twendeData';
import {
  CATEGORY_LABELS,
  COUNTRY_NAMES,
  CURRENCY_CONFIG,
  DATE_LABELS,
  HOST_CITIES,
  LISTING_PLANS,
  LISTING_TYPES,
  PAYMENT_METHODS,
  PRICE_UNITS,
  buildBookingMessage,
  buildListingsCsv,
  buildWhatsAppLink,
  calculateListingFee,
  filterAdminListings,
  formatCurrencyValue,
  generateTempPassword,
  getCountdownParts,
  getPublicListings,
  normalizePhone,
  type BusinessAccount,
  type ListingCategory,
  type MatchdayListing,
} from '../utils/matchday';

type MatchdayView = 'fans' | 'biz' | 'adm';
type MatchdayLang = 'en' | 'sw' | 'fr';

interface SimulatedEmail {
  to: string;
  sub: string;
  body: string;
}

const TARGET_OPENING_DAY_MS = new Date('2027-06-19T00:00:00+03:00').getTime();
const DEMO_ADMIN_PIN = '2027';

async function resizePhotoFile(file: File): Promise<string | null> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, 900 / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(null);
          return;
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.78));
      };
      img.onerror = () => resolve(null);
      img.src = String(reader.result);
    };
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
  });
}

export function MatchdayWorkspace() {
  const [view, setView] = useState<MatchdayView>('fans');
  const [lang, setLang] = useState<MatchdayLang>('en');
  const [countdown, setCountdown] = useState(() => getCountdownParts(TARGET_OPENING_DAY_MS));

  // Shared listings & business accounts state
  const [listings, setListings] = useState<MatchdayListing[]>(() => createInitialMatchdayListings());
  const [accounts, setAccounts] = useState<BusinessAccount[]>(() => INITIAL_ACCOUNTS);
  const [outbox, setOutbox] = useState<SimulatedEmail[]>([]);
  const seqRef = useRef(1004);

  // Fan state
  const [cityIndex, setCityIndex] = useState(0);
  const [category, setCategory] = useState<ListingCategory>(0);
  const [savedTrip, setSavedTrip] = useState<Record<string, string>>({});

  // Booking dialog state
  const [bookingItem, setBookingItem] = useState<MatchdayListing | null>(null);
  const [guestName, setGuestName] = useState('');
  const [bookingDate, setBookingDate] = useState('2027-06-19');
  const [guestCount, setGuestCount] = useState('2');
  const [bookingError, setBookingError] = useState('');

  // Lightbox state
  const [lightboxItem, setLightboxItem] = useState<MatchdayListing | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Business auth & dashboard state
  const [bizUserEmail, setBizUserEmail] = useState<string | null>(null);
  const [bizLoginEmail, setBizLoginEmail] = useState('');
  const [bizLoginPassword, setBizLoginPassword] = useState('');
  const [bizLoginError, setBizLoginError] = useState('');
  const [bizFails, setBizFails] = useState(0);
  const [bizLockUntil, setBizLockUntil] = useState(0);
  const [newPassword, setNewPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [newPasswordError, setNewPasswordError] = useState('');
  const [bizDrafts, setBizDrafts] = useState<Record<string, { price: string; phone: string; err: string; msg: string }>>({});

  // Admin auth & dashboard state
  const [adminUnlocked, setAdminUnlocked] = useState(false);
  const [adminPinInput, setAdminPinInput] = useState('');
  const [adminPinError, setAdminPinError] = useState('');
  const [adminSearch, setAdminSearch] = useState('');
  const [adminCityFilter, setAdminCityFilter] = useState('all');
  const [adminStatusFilter, setAdminStatusFilter] = useState('all');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [csvText, setCsvText] = useState('');
  const [csvNotice, setCsvNotice] = useState('');

  // Admin new listing form state
  const [formName, setFormName] = useState('');
  const [formType, setFormType] = useState<ListingCategory>(0);
  const [formCity, setFormCity] = useState(0);
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formPhotos, setFormPhotos] = useState<string[]>([]);
  const [formPhotoError, setFormPhotoError] = useState('');
  const [formPlan, setFormPlan] = useState(0);
  const [formMethod, setFormMethod] = useState('mtn');
  const [formMobileMoney, setFormMobileMoney] = useState('');
  const [formErrors, setFormErrors] = useState<{
    name?: string;
    phone?: string;
    email?: string;
    momo?: string;
  }>({});
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formSuccess, setFormSuccess] = useState('');

  const fansSectionRef = useRef<HTMLDivElement>(null);
  const adminSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCountdown(getCountdownParts(TARGET_OPENING_DAY_MS));
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  // Keep payment method valid when city changes
  const currentFormCountry = HOST_CITIES[formCity].country;
  const availableMethods = PAYMENT_METHODS[currentFormCountry];
  useEffect(() => {
    if (!availableMethods.some((m) => m.id === formMethod)) {
      setFormMethod(availableMethods[0].id);
    }
  }, [availableMethods, formMethod]);

  const activeBizAccount = useMemo(
    () => accounts.find((a) => a.email === bizUserEmail) ?? null,
    [accounts, bizUserEmail],
  );

  const publicListings = useMemo(
    () => getPublicListings(listings, cityIndex, category),
    [listings, cityIndex, category],
  );

  const savedKeys = Object.keys(savedTrip);

  const adminFilteredListings = useMemo(
    () => filterAdminListings(listings, adminSearch, adminCityFilter, adminStatusFilter),
    [listings, adminSearch, adminCityFilter, adminStatusFilter],
  );

  const adminStats = useMemo(() => {
    const revenue: Record<string, number> = {};
    let active = 0;
    let featured = 0;
    listings.forEach((l) => {
      revenue[l.cur] = (revenue[l.cur] ?? 0) + l.amt;
      if (l.status === 'active') active += 1;
      if (l.featured) featured += 1;
    });
    return { total: listings.length, active, featured, revenue };
  }, [listings]);

  const copy = MATCHDAY_COPY[lang];
  const currentFee = calculateListingFee(currentFormCountry, formPlan);

  const toggleSaveListing = (item: MatchdayListing) => {
    setSavedTrip((prev) => {
      const next = { ...prev };
      if (next[item.id]) {
        delete next[item.id];
      } else {
        next[item.id] = `${HOST_CITIES[item.city].name}: ${item.name}`;
      }
      return next;
    });
  };

  const handleOpenBooking = (item: MatchdayListing) => {
    setBookingItem(item);
    setBookingError('');
  };

  const handleBookingConfirm = (e: FormEvent) => {
    e.preventDefault();
    if (!bookingItem) return;
    if (!guestName.trim() || !bookingDate) {
      setBookingError('Enter your name and a date so the business knows who is asking.');
      return;
    }
    setBookingError('');

    const message = buildBookingMessage({
      guestName,
      listingName: bookingItem.name,
      cityName: HOST_CITIES[bookingItem.city].name,
      category: bookingItem.cat,
      dateISO: bookingDate,
      guests: guestCount,
    });

    // Record enquiry on matching listing
    setListings((prev) =>
      prev.map((item) =>
        item.id === bookingItem.id
          ? {
              ...item,
              enq: (item.enq ?? 0) + 1,
              log: [
                ...(item.log ?? []),
                { name: guestName.trim(), date: bookingDate, guests: guestCount || '1' },
              ],
            }
          : item,
      ),
    );

    window.open(buildWhatsAppLink(message, bookingItem.phone), '_blank', 'noopener,noreferrer');
    setBookingItem(null);
  };

  const handleBusinessSignIn = (e: FormEvent) => {
    e.preventDefault();
    setBizLoginError('');
    if (Date.now() < bizLockUntil) {
      setBizLoginError('Too many tries. Wait a moment and try again.');
      return;
    }
    const email = bizLoginEmail.trim().toLowerCase();
    const matched = accounts.find((a) => a.email === email && a.pw === bizLoginPassword);
    if (!matched) {
      const nextFails = bizFails + 1;
      if (nextFails >= 5) {
        setBizLockUntil(Date.now() + 30000);
        setBizFails(0);
        setBizLoginError('Too many tries. Wait 30 seconds and try again.');
      } else {
        setBizFails(nextFails);
        setBizLoginError('Email or password is not correct.');
      }
      return;
    }
    setBizFails(0);
    setBizUserEmail(matched.email);
    setBizLoginEmail('');
    setBizLoginPassword('');
  };

  const handleBusinessPasswordChange = (e: FormEvent) => {
    e.preventDefault();
    if (!activeBizAccount) return;
    setNewPasswordError('');
    if (newPassword.length < 8) {
      setNewPasswordError('Use at least 8 characters.');
      return;
    }
    if (newPassword === activeBizAccount.pw) {
      setNewPasswordError('Choose a password different from the temporary one.');
      return;
    }
    if (newPassword !== repeatPassword) {
      setNewPasswordError('The two passwords do not match.');
      return;
    }
    setAccounts((prev) =>
      prev.map((a) =>
        a.email === activeBizAccount.email ? { ...a, pw: newPassword, must: false } : a,
      ),
    );
    setNewPassword('');
    setRepeatPassword('');
  };

  const handleBizPhotoAdd = async (listingId: string, e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const target = listings.find((l) => l.id === listingId);
    if (!target) return;
    if ((target.photos ?? []).length >= 3) {
      setBizDrafts((prev) => ({
        ...prev,
        [listingId]: {
          ...(prev[listingId] ?? { price: String(target.pv || ''), phone: target.sample ? '' : `0${target.phone.slice(3)}`, err: '', msg: '' }),
          err: 'You can have up to 3 photos.',
        },
      }));
      return;
    }
    if (!file.type.startsWith('image/') || file.size > 10 * 1024 * 1024) {
      setBizDrafts((prev) => ({
        ...prev,
        [listingId]: {
          ...(prev[listingId] ?? { price: String(target.pv || ''), phone: target.sample ? '' : `0${target.phone.slice(3)}`, err: '', msg: '' }),
          err: 'Use an image file under 10 MB.',
        },
      }));
      return;
    }
    const dataUrl = await resizePhotoFile(file);
    if (!dataUrl) return;
    setListings((prev) =>
      prev.map((l) =>
        l.id === listingId ? { ...l, photos: [...(l.photos ?? []), dataUrl] } : l,
      ),
    );
  };

  const handleSaveBizListing = (listing: MatchdayListing) => {
    const cc = HOST_CITIES[listing.city].country;
    const draft = bizDrafts[listing.id] ?? {
      price: listing.pv ? String(listing.pv) : '',
      phone: listing.sample ? '' : `0${listing.phone.slice(3)}`,
      err: '',
      msg: '',
    };
    const normalized = normalizePhone(draft.phone, cc);
    if (!normalized) {
      setBizDrafts((prev) => ({
        ...prev,
        [listing.id]: { ...draft, err: 'Enter a number like 0772 123 456.', msg: '' },
      }));
      return;
    }
    const priceNum = Number(draft.price);
    const cfg = CURRENCY_CONFIG[cc];
    setListings((prev) =>
      prev.map((l) =>
        l.id === listing.id
          ? {
              ...l,
              pv: priceNum > 0 ? priceNum : 0,
              price:
                priceNum > 0
                  ? `${cfg.code} ${formatCurrencyValue(priceNum)} ${PRICE_UNITS[l.cat]}`
                  : 'Ask on WhatsApp',
              phone: normalized,
              sample: false,
            }
          : l,
      ),
    );
    setBizDrafts((prev) => ({
      ...prev,
      [listing.id]: { ...draft, err: '', msg: 'Saved. Fans see your changes now.' },
    }));
  };

  const handleAdminUnlock = (e: FormEvent) => {
    e.preventDefault();
    if (adminPinInput === DEMO_ADMIN_PIN) {
      setAdminUnlocked(true);
      setAdminPinInput('');
      setAdminPinError('');
    } else {
      setAdminPinError('Wrong PIN. In this demo it is 2027.');
    }
  };

  const handleAdminPhotoUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = '';
    setFormPhotoError('');
    const room = 3 - formPhotos.length;
    if (files.length > room) {
      setFormPhotoError('You can add up to 3 photos.');
    }
    for (const file of files.slice(0, Math.max(room, 0))) {
      if (!file.type.startsWith('image/')) {
        setFormPhotoError('Only image files are allowed.');
        continue;
      }
      if (file.size > 10 * 1024 * 1024) {
        setFormPhotoError('Each photo must be under 10 MB.');
        continue;
      }
      const dataUrl = await resizePhotoFile(file);
      if (dataUrl) {
        setFormPhotos((prev) => (prev.length < 3 ? [...prev, dataUrl] : prev));
      } else {
        setFormPhotoError('One photo could not be read.');
      }
    }
  };

  const handleAddListingSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!adminUnlocked) return;
    setFormSuccess('');
    const nextErrors: typeof formErrors = {};
    if (!formName.trim()) nextErrors.name = 'Enter your business name.';
    const normalizedPhone = normalizePhone(formPhone, currentFormCountry);
    if (!normalizedPhone) nextErrors.phone = 'Enter a number like 0772 123 456.';
    const cleanEmail = formEmail.trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(cleanEmail)) {
      nextErrors.email = 'Enter the business’s email address for their login.';
    }
    if (formMethod !== 'card' && formMethod !== 'manual') {
      if (!normalizePhone(formMobileMoney, currentFormCountry)) {
        nextErrors.momo = 'Enter the mobile money number to charge, like 0772 123 456.';
      }
    }
    setFormErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0 || !normalizedPhone) return;

    setFormSubmitting(true);
    const delay = formMethod === 'manual' ? 200 : 1100;
    const fee = calculateListingFee(currentFormCountry, formPlan);
    const methodLabel =
      availableMethods.find((m) => m.id === formMethod)?.label ?? 'Mobile Money';
    const priceNum = Number(formPrice);
    const cfg = CURRENCY_CONFIG[currentFormCountry];

    window.setTimeout(() => {
      seqRef.current += 1;
      const refCode = `KM-${seqRef.current}`;
      const newListing: MatchdayListing = {
        id: `x-${Date.now()}`,
        name: formName.trim(),
        price:
          priceNum > 0
            ? `${cfg.code} ${formatCurrencyValue(priceNum)} ${PRICE_UNITS[formType]}`
            : 'Ask on WhatsApp',
        phone: normalizedPhone,
        sample: false,
        featured: formPlan === 1,
        city: formCity,
        cat: formType,
        plan: LISTING_PLANS[formPlan].shortLabel,
        amt: fee.amount,
        cur: fee.currency,
        method: methodLabel,
        ref: refCode,
        t: Date.now(),
        status: 'active',
        photos: formPhotos.slice(),
        pv: priceNum > 0 ? priceNum : 0,
        owner: cleanEmail,
        enq: 0,
        log: [],
      };

      setListings((prev) => [newListing, ...prev]);

      setAccounts((prev) => {
        if (prev.some((a) => a.email === cleanEmail)) return prev;
        const pw = generateTempPassword();
        const acct: BusinessAccount = {
          email: cleanEmail,
          name: formName.trim(),
          pw,
          must: true,
        };
        setOutbox((o) => [
          {
            to: cleanEmail,
            sub: 'Your Twende Matchday business login',
            body: `Hello ${formName.trim()}, your business is listed on Twende Matchday. Open the Business area and sign in with your email address and this temporary password: ${pw}. You will choose your own password the first time you sign in.`,
          },
          ...o,
        ]);
        return [...prev, acct];
      });

      setCityIndex(formCity);
      setCategory(formType);
      setFormName('');
      setFormPhone('');
      setFormEmail('');
      setFormPrice('');
      setFormMobileMoney('');
      setFormPhotos([]);
      setFormSubmitting(false);
      setFormSuccess(
        `Listing published in ${HOST_CITIES[formCity].name}. Fee of ${fee.currency} ${formatCurrencyValue(fee.amount)} recorded (simulated). Fans can now book this business on WhatsApp.`,
      );
    }, delay);
  };

  const handleResetBusinessPassword = (email: string) => {
    const newPw = generateTempPassword();
    setAccounts((prev) =>
      prev.map((a) => (a.email === email ? { ...a, pw: newPw, must: true } : a)),
    );
    if (bizUserEmail === email) setBizUserEmail(null);
    const acct = accounts.find((a) => a.email === email);
    setOutbox((prev) => [
      {
        to: email,
        sub: 'Your Twende Matchday business login',
        body: `Hello${acct?.name ? ` ${acct.name}` : ''}, your password was reset. Sign in with temporary password: ${newPw}.`,
      },
      ...prev,
    ]);
  };

  const handleExportCsv = () => {
    const csv = buildListingsCsv(listings);
    setCsvText(csv);
    setCsvNotice('CSV is ready below. Copy it and paste it into a spreadsheet.');
    try {
      navigator.clipboard?.writeText(csv).catch(() => {});
    } catch {
      // Clipboard optional in headless/restricted iframes
    }
  };

  return (
    <div className="space-y-8">
      {/* Matchday toolbar: Mode switch + Language switch */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-[#E5E5DF] dark:border-[#222F2A]">
        <div>
          <p className="text-xs font-medium text-[#0E5A43] dark:text-[#4AD192]">
            A Twende Events project
          </p>
          <h3 className="mt-1 font-display text-xl sm:text-2xl font-bold text-[#111714] dark:text-[#EEF3F0]">
            Twende Matchday
          </h3>
          <p className="mt-1 text-sm text-[#5C6660] dark:text-[#9AA8A0]">
            Guide for fans visiting East Africa for the 2027 tournament, and direct WhatsApp bookings for local businesses.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Mode selector */}
          <div
            role="group"
            aria-label="Matchday workspace mode"
            className="inline-flex items-center p-1 rounded-lg bg-[#EFEFEA] dark:bg-[#19231E]"
          >
            {(
              [
                { id: 'fans', label: 'Fans' },
                { id: 'biz', label: 'Business' },
                { id: 'adm', label: 'Admin' },
              ] as const
            ).map((m) => (
              <button
                key={m.id}
                type="button"
                aria-pressed={view === m.id}
                onClick={() => setView(m.id)}
                className={`px-3.5 py-1.5 rounded-md text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  view === m.id
                    ? 'bg-white dark:bg-[#0D1210] text-[#111714] dark:text-[#EEF3F0] shadow-xs'
                    : 'text-[#5C6660] dark:text-[#9AA8A0] hover:text-[#111714] dark:hover:text-[#EEF3F0]'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* Language selector */}
          <div
            role="group"
            aria-label="Language"
            className="inline-flex items-center p-1 rounded-lg bg-[#EFEFEA] dark:bg-[#19231E]"
          >
            {(['en', 'sw', 'fr'] as const).map((code) => (
              <button
                key={code}
                type="button"
                aria-pressed={lang === code}
                onClick={() => setLang(code)}
                className={`px-2.5 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                  lang === code
                    ? 'bg-white dark:bg-[#0D1210] text-[#111714] dark:text-[#EEF3F0] shadow-xs'
                    : 'text-[#5C6660] dark:text-[#9AA8A0] hover:text-[#111714] dark:hover:text-[#EEF3F0]'
                }`}
              >
                {code.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* FANS VIEW */}
      {view === 'fans' && (
        <div className="space-y-10">
          {/* Split Hero + Countdown */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            <div className="lg:col-span-7 flex flex-col justify-between p-6 sm:p-8 rounded-xl bg-white dark:bg-[#131B18] border border-[#E5E5DF] dark:border-[#222F2A]">
              <div>
                <h4 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#111714] dark:text-[#EEF3F0] leading-tight text-balance">
                  {copy.headline}
                </h4>
                <p className="mt-3 text-sm sm:text-base text-[#4D5752] dark:text-[#A3B1AA] max-w-lg">
                  {copy.subtitle}
                </p>
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => fansSectionRef.current?.scrollIntoView({ behavior: 'smooth' })}
                  className="px-4 py-2.5 rounded-lg bg-[#0E5A43] hover:bg-[#0B4735] dark:bg-[#3DBE7C] dark:hover:bg-[#34A86D] text-white dark:text-[#071A11] text-sm font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  {copy.fanCta}
                </button>
                <button
                  type="button"
                  onClick={() => setView('biz')}
                  className="px-4 py-2.5 rounded-lg border border-[#D8D8D0] dark:border-[#2E3C35] text-sm font-semibold text-[#111714] dark:text-[#EEF3F0] hover:bg-[#F3F3EF] dark:hover:bg-[#1C2622] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  {copy.bizCta}
                </button>
              </div>
            </div>

            <div
              role="timer"
              aria-label="Countdown to opening day, 19 June 2027"
              className="lg:col-span-5 relative overflow-hidden flex flex-col justify-between p-6 sm:p-8 rounded-xl bg-[#0E5A43] dark:bg-[#10382B] text-white border border-[#0E5A43]/20 dark:border-[#222F2A]"
            >
              <img
                src="/assets/aistudio/pexels-bleachers-1867992_1920_451fe40c.jpg"
                alt="Football stadium pitch and tiered stands"
                referrerPolicy="no-referrer"
                className="absolute inset-0 h-full w-full object-cover object-center"
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-[#072118]/95 via-[#0A3123]/80 to-[#0C3D2C]/60"
              />
              <p className="relative z-10 text-xs font-semibold text-white/95 drop-shadow-xs">
                Opening day · 19 June 2027
              </p>
              <div className="relative z-10 mt-6 grid grid-cols-4 gap-2 sm:gap-3 text-center">
                {[
                  { val: countdown.days, label: 'Days' },
                  { val: countdown.hours, label: 'Hours' },
                  { val: countdown.minutes, label: 'Mins' },
                  { val: countdown.seconds, label: 'Secs' },
                ].map((unit) => (
                  <div
                    key={unit.label}
                    className="rounded-lg bg-black/45 backdrop-blur-xs border border-white/10 px-2 py-3"
                  >
                    <span className="block font-mono-num text-2xl sm:text-3xl font-bold text-[#FFD23F]">
                      {unit.val}
                    </span>
                    <span className="mt-1 block text-[11px] text-white/90">{unit.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* City & Category Directory */}
          <div ref={fansSectionRef} className="space-y-6">
            <div>
              <h4 className="font-display text-lg sm:text-xl font-bold text-[#111714] dark:text-[#EEF3F0]">
                Pick a host city and book directly
              </h4>
              <p className="mt-1 text-sm text-[#5C6660] dark:text-[#9AA8A0]">
                Choose a city, then tap Book on WhatsApp to message the business with your dates filled in. Sample listings use a placeholder number.
              </p>
            </div>

            {/* Host city selector */}
            <div className="flex flex-wrap gap-2" role="group" aria-label="Host cities">
              {HOST_CITIES.map((c, idx) => (
                <button
                  key={c.name}
                  type="button"
                  aria-pressed={cityIndex === idx}
                  onClick={() => setCityIndex(idx)}
                  className={`px-3.5 py-2 rounded-lg text-sm font-medium border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    cityIndex === idx
                      ? 'bg-[#0E5A43] border-[#0E5A43] text-white dark:bg-[#3DBE7C] dark:border-[#3DBE7C] dark:text-[#071A11]'
                      : 'bg-white dark:bg-[#131B18] border-[#E5E5DF] dark:border-[#222F2A] text-[#3C4641] dark:text-[#C4D0C9] hover:border-[#0E5A43]/50'
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>

            {/* City heading + category segmented bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
              <h5 className="font-display text-lg font-semibold text-[#111714] dark:text-[#EEF3F0]">
                {HOST_CITIES[cityIndex].name}, {COUNTRY_NAMES[HOST_CITIES[cityIndex].country]}
              </h5>
              <div
                role="group"
                aria-label="Listing categories"
                className="inline-flex items-center p-1 rounded-lg bg-[#EFEFEA] dark:bg-[#19231E] self-start sm:self-auto"
              >
                {CATEGORY_LABELS.map((label, idx) => (
                  <button
                    key={label}
                    type="button"
                    aria-pressed={category === idx}
                    onClick={() => setCategory(idx as ListingCategory)}
                    className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      category === idx
                        ? 'bg-white dark:bg-[#0D1210] text-[#111714] dark:text-[#EEF3F0] shadow-xs'
                        : 'text-[#5C6660] dark:text-[#9AA8A0] hover:text-[#111714] dark:hover:text-[#EEF3F0]'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Listings grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
              {publicListings.map((item) => {
                const isSaved = Boolean(savedTrip[item.id]);
                const photos = item.photos ?? [];
                return (
                  <article
                    key={item.id}
                    className="flex flex-col justify-between p-5 rounded-xl bg-white dark:bg-[#131B18] border border-[#E5E5DF] dark:border-[#222F2A]"
                  >
                    <div>
                      {photos.length > 0 && (
                        <div className="mb-4 flex gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setLightboxItem(item);
                              setLightboxIndex(0);
                            }}
                            className="flex-1 overflow-hidden rounded-lg border border-[#E5E5DF] dark:border-[#222F2A] cursor-zoom-in"
                          >
                            <img
                              src={photos[0]}
                              alt={`${item.name}, photo 1 of ${photos.length}`}
                              className="w-full h-36 object-cover"
                            />
                          </button>
                          {photos.length > 1 && (
                            <div className="w-24 flex flex-col gap-2 shrink-0">
                              {photos.slice(1).map((src, k) => (
                                <button
                                  key={src}
                                  type="button"
                                  onClick={() => {
                                    setLightboxItem(item);
                                    setLightboxIndex(k + 1);
                                  }}
                                  className="flex-1 overflow-hidden rounded-md border border-[#E5E5DF] dark:border-[#222F2A] cursor-pointer"
                                >
                                  <img
                                    src={src}
                                    alt={`${item.name}, photo ${k + 2} of ${photos.length}`}
                                    className="w-full h-full object-cover"
                                  />
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      <p className="text-xs font-medium text-[#5C6660] dark:text-[#9AA8A0]">
                        {item.sample
                          ? `Sample listing · ${HOST_CITIES[cityIndex].name}`
                          : item.featured
                            ? `Featured listing · ${HOST_CITIES[cityIndex].name}`
                            : `Listed by business · ${HOST_CITIES[cityIndex].name}`}
                      </p>
                      <h6 className="mt-1.5 font-display text-base font-semibold text-[#111714] dark:text-[#EEF3F0]">
                        {item.name}
                      </h6>
                      <p className="mt-1 font-mono-num text-sm font-semibold text-[#0E5A43] dark:text-[#4AD192]">
                        {item.price}
                      </p>
                    </div>

                    <div className="mt-5 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenBooking(item)}
                        className="flex-1 px-3.5 py-2 rounded-lg bg-[#0E5A43] hover:bg-[#0B4735] dark:bg-[#3DBE7C] dark:hover:bg-[#34A86D] text-white dark:text-[#071A11] text-sm font-semibold transition-colors whitespace-nowrap cursor-pointer"
                      >
                        Book on WhatsApp
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleSaveListing(item)}
                        aria-label={`${isSaved ? 'Remove' : 'Save'} ${item.name}`}
                        className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border text-sm font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                          isSaved
                            ? 'bg-[#0E5A43]/10 border-[#0E5A43] text-[#0E5A43] dark:bg-[#3DBE7C]/15 dark:border-[#4AD192] dark:text-[#4AD192]'
                            : 'border-[#D8D8D0] dark:border-[#2E3C35] text-[#3C4641] dark:text-[#C4D0C9] hover:bg-[#F3F3EF] dark:hover:bg-[#1C2622]'
                        }`}
                      >
                        <Bookmark className="w-3.5 h-3.5" aria-hidden="true" />
                        {isSaved ? 'Saved' : 'Save'}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>

            {/* Trip planner summary bar */}
            {savedKeys.length > 0 && (
              <div className="p-4 rounded-xl bg-white dark:bg-[#131B18] border border-[#0E5A43]/40 dark:border-[#4AD192]/40 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-[#111714] dark:text-[#EEF3F0]">
                  <Check className="w-4 h-4 text-[#0E5A43] dark:text-[#4AD192]" aria-hidden="true" />
                  <span>
                    {savedKeys.length} {savedKeys.length === 1 ? 'place saved' : 'places saved'}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(
                      `My 2027 football trip plan: ${savedKeys.map((k) => savedTrip[k]).join('; ')}`,
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#0E5A43] hover:bg-[#0B4735] dark:bg-[#3DBE7C] text-white dark:text-[#071A11] text-sm font-semibold transition-colors whitespace-nowrap"
                  >
                    Share my trip on WhatsApp
                    <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                  </a>
                  <button
                    type="button"
                    onClick={() => setSavedTrip({})}
                    className="px-3.5 py-2 rounded-lg border border-[#D8D8D0] dark:border-[#2E3C35] text-sm font-medium text-[#4D5752] dark:text-[#A3B1AA] hover:text-[#111714] dark:hover:text-[#EEF3F0] cursor-pointer"
                  >
                    Clear trip
                  </button>
                </div>
              </div>
            )}

            {/* How businesses get listed */}
            <div className="pt-6 border-t border-[#E5E5DF] dark:border-[#222F2A] grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 rounded-xl bg-white dark:bg-[#131B18] border border-[#E5E5DF] dark:border-[#222F2A] flex flex-col justify-between">
                <div>
                  <h5 className="font-display text-base font-semibold text-[#111714] dark:text-[#EEF3F0]">
                    For hotels, restaurants &amp; transport
                  </h5>
                  <ol className="mt-3 space-y-2 text-sm text-[#4D5752] dark:text-[#A3B1AA] list-decimal pl-4">
                    <li>Message the organisers with your business name, city, type, booking WhatsApp number and up to 3 photos.</li>
                    <li>We verify the details and confirm your listing plan and fee.</li>
                    <li>You pay the fee and we publish your listing.</li>
                    <li>Fans message you directly on WhatsApp to book.</li>
                  </ol>
                </div>
                <a
                  href={buildWhatsAppLink(
                    'Hello, I would like to list my business on Twende Matchday.\nBusiness name: \nCity: \nType (stay, eat or transport): \nWhatsApp number for bookings: ',
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex items-center justify-center px-4 py-2.5 rounded-lg bg-[#111714] hover:bg-[#242E29] dark:bg-[#EEF3F0] dark:text-[#111714] text-white text-sm font-semibold transition-colors"
                >
                  Message organisers on WhatsApp
                </a>
              </div>

              <div className="p-6 rounded-xl bg-white dark:bg-[#131B18] border border-[#E5E5DF] dark:border-[#222F2A]">
                <h5 className="font-display text-base font-semibold text-[#111714] dark:text-[#EEF3F0]">
                  What fans send you
                </h5>
                <p className="mt-2 text-sm text-[#5C6660] dark:text-[#9AA8A0]">
                  Your listing displays your business name, city, price, photos and a direct WhatsApp message template:
                </p>
                <blockquote className="mt-4 p-4 rounded-lg bg-[#FAFAF8] dark:bg-[#0D1210] border border-[#E5E5DF] dark:border-[#222F2A] text-sm text-[#3C4641] dark:text-[#C4D0C9]">
                  “Hello, my name is Amina. I found you on Twende Matchday and would like to book a room at Family-run lodge in Kampala on 19 Jun 2027 for 2 people. Is it available?”
                </blockquote>
                <p className="mt-4 text-xs text-[#6B756F] dark:text-[#8E9B94]">
                  Host cities are as reported so far and the final list may change. Check the tournament’s official channels for fixtures and tickets.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* BUSINESS VIEW */}
      {view === 'biz' && (
        <div className="space-y-6">
          {!activeBizAccount && (
            <div className="max-w-md p-6 sm:p-8 rounded-xl bg-white dark:bg-[#131B18] border border-[#E5E5DF] dark:border-[#222F2A]">
              <h4 className="font-display text-xl font-bold text-[#111714] dark:text-[#EEF3F0]">
                Business sign in
              </h4>
              <p className="mt-1.5 text-sm text-[#5C6660] dark:text-[#9AA8A0]">
                Use the email address and temporary password sent by the organisers.
              </p>
              <form onSubmit={handleBusinessSignIn} noValidate className="mt-5 space-y-4">
                <div>
                  <label htmlFor="biz-email" className="block text-sm font-medium text-[#111714] dark:text-[#EEF3F0] mb-1">
                    Email
                  </label>
                  <input
                    id="biz-email"
                    type="email"
                    value={bizLoginEmail}
                    onChange={(e) => setBizLoginEmail(e.target.value)}
                    autoComplete="username"
                    className="w-full px-3.5 py-2 rounded-lg border border-[#D8D8D0] dark:border-[#2E3C35] bg-[#FAFAF8] dark:bg-[#0D1210] text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="biz-pw" className="block text-sm font-medium text-[#111714] dark:text-[#EEF3F0] mb-1">
                    Password
                  </label>
                  <input
                    id="biz-pw"
                    type="password"
                    value={bizLoginPassword}
                    onChange={(e) => setBizLoginPassword(e.target.value)}
                    autoComplete="current-password"
                    className="w-full px-3.5 py-2 rounded-lg border border-[#D8D8D0] dark:border-[#2E3C35] bg-[#FAFAF8] dark:bg-[#0D1210] text-sm"
                  />
                </div>
                {bizLoginError && (
                  <p role="alert" className="text-sm text-[#B3341E] dark:text-[#FF8F78]">
                    {bizLoginError}
                  </p>
                )}
                <button
                  type="submit"
                  className="w-full px-4 py-2.5 rounded-lg bg-[#0E5A43] hover:bg-[#0B4735] dark:bg-[#3DBE7C] text-white dark:text-[#071A11] text-sm font-semibold transition-colors cursor-pointer"
                >
                  Sign in
                </button>
              </form>
              {accounts.some((a) => a.email === 'lakeview@example.com' && a.must) && (
                <p className="mt-4 pt-4 border-t border-[#E5E5DF] dark:border-[#222F2A] text-xs text-[#5C6660] dark:text-[#9AA8A0]">
                  Demo account: <span className="font-mono-num">lakeview@example.com</span> / password{' '}
                  <span className="font-mono-num">welcome2027</span>
                </p>
              )}
            </div>
          )}

          {activeBizAccount && activeBizAccount.must && (
            <div className="max-w-md p-6 sm:p-8 rounded-xl bg-white dark:bg-[#131B18] border border-[#E5E5DF] dark:border-[#222F2A]">
              <h4 className="font-display text-xl font-bold text-[#111714] dark:text-[#EEF3F0]">
                Choose your own password
              </h4>
              <p className="mt-1.5 text-sm text-[#5C6660] dark:text-[#9AA8A0]">
                This is your first sign-in as {activeBizAccount.email}. Use at least 8 characters.
              </p>
              <form onSubmit={handleBusinessPasswordChange} noValidate className="mt-5 space-y-4">
                <div>
                  <label htmlFor="new-pw" className="block text-sm font-medium mb-1">
                    New password
                  </label>
                  <input
                    id="new-pw"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    autoComplete="new-password"
                    className="w-full px-3.5 py-2 rounded-lg border border-[#D8D8D0] dark:border-[#2E3C35] bg-[#FAFAF8] dark:bg-[#0D1210] text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="repeat-pw" className="block text-sm font-medium mb-1">
                    Repeat new password
                  </label>
                  <input
                    id="repeat-pw"
                    type="password"
                    value={repeatPassword}
                    onChange={(e) => setRepeatPassword(e.target.value)}
                    autoComplete="new-password"
                    className="w-full px-3.5 py-2 rounded-lg border border-[#D8D8D0] dark:border-[#2E3C35] bg-[#FAFAF8] dark:bg-[#0D1210] text-sm"
                  />
                </div>
                {newPasswordError && (
                  <p role="alert" className="text-sm text-[#B3341E] dark:text-[#FF8F78]">
                    {newPasswordError}
                  </p>
                )}
                <button
                  type="submit"
                  className="w-full px-4 py-2.5 rounded-lg bg-[#0E5A43] hover:bg-[#0B4735] dark:bg-[#3DBE7C] text-white dark:text-[#071A11] text-sm font-semibold transition-colors cursor-pointer"
                >
                  Save password and continue
                </button>
              </form>
            </div>
          )}

          {activeBizAccount && !activeBizAccount.must && (
            <div className="space-y-6">
              {(() => {
                const mine = listings.filter((l) => l.owner === activeBizAccount.email);
                const liveCount = mine.filter((l) => l.status === 'active').length;
                const enquiryTotal = mine.reduce((sum, l) => sum + (l.enq ?? 0), 0);

                return (
                  <>
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <p className="text-sm font-semibold text-[#111714] dark:text-[#EEF3F0]">
                        Signed in as {activeBizAccount.email}
                      </p>
                      <button
                        type="button"
                        onClick={() => setBizUserEmail(null)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-[#D8D8D0] dark:border-[#2E3C35] text-sm font-medium hover:bg-[#F3F3EF] dark:hover:bg-[#1C2622] cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
                        Sign out
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="p-4 rounded-xl bg-white dark:bg-[#131B18] border border-[#E5E5DF] dark:border-[#222F2A]">
                        <span className="text-xs text-[#5C6660] dark:text-[#9AA8A0]">Listings</span>
                        <p className="mt-1 font-mono-num text-2xl font-bold">{mine.length}</p>
                      </div>
                      <div className="p-4 rounded-xl bg-white dark:bg-[#131B18] border border-[#E5E5DF] dark:border-[#222F2A]">
                        <span className="text-xs text-[#5C6660] dark:text-[#9AA8A0]">Live</span>
                        <p className="mt-1 font-mono-num text-2xl font-bold">{liveCount}</p>
                      </div>
                      <div className="p-4 rounded-xl bg-white dark:bg-[#131B18] border border-[#E5E5DF] dark:border-[#222F2A]">
                        <span className="text-xs text-[#5C6660] dark:text-[#9AA8A0]">Enquiries</span>
                        <p className="mt-1 font-mono-num text-2xl font-bold">{enquiryTotal}</p>
                      </div>
                    </div>

                    {mine.length === 0 ? (
                      <p className="text-sm text-[#5C6660] dark:text-[#9AA8A0]">
                        No listings are linked to this login yet.
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {mine.map((item) => {
                          const cc = HOST_CITIES[item.city].country;
                          const draft = bizDrafts[item.id] ?? {
                            price: item.pv ? String(item.pv) : '',
                            phone: item.sample ? '' : `0${item.phone.slice(3)}`,
                            err: '',
                            msg: '',
                          };

                          return (
                            <div
                              key={item.id}
                              className="p-6 rounded-xl bg-white dark:bg-[#131B18] border border-[#E5E5DF] dark:border-[#222F2A] space-y-4"
                            >
                              <div>
                                <p className="text-xs font-medium text-[#0E5A43] dark:text-[#4AD192]">
                                  {item.status === 'active' ? 'Live' : 'Suspended by organisers'} · {item.plan} · {HOST_CITIES[item.city].name}
                                </p>
                                <h5 className="mt-1 font-display text-lg font-bold">{item.name}</h5>
                                <p className="text-xs text-[#5C6660] dark:text-[#9AA8A0] font-mono-num">
                                  Fee {item.cur} {formatCurrencyValue(item.amt)} · Ref {item.ref}
                                </p>
                              </div>

                              {/* Photos */}
                              <div>
                                <div className="flex flex-wrap gap-2">
                                  {(item.photos ?? []).map((src, pIdx) => (
                                    <div key={src} className="relative">
                                      <img
                                        src={src}
                                        alt={`${item.name} photo ${pIdx + 1}`}
                                        className="w-20 h-16 object-cover rounded-lg border border-[#E5E5DF] dark:border-[#222F2A]"
                                      />
                                      <button
                                        type="button"
                                        aria-label={`Remove photo ${pIdx + 1} from ${item.name}`}
                                        onClick={() =>
                                          setListings((prev) =>
                                            prev.map((l) =>
                                              l.id === item.id
                                                ? {
                                                    ...l,
                                                    photos: (l.photos ?? []).filter((_, i) => i !== pIdx),
                                                  }
                                                : l,
                                            ),
                                          )
                                        }
                                        className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[#111714] text-white text-xs flex items-center justify-center cursor-pointer"
                                      >
                                        <X className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                                <label
                                  htmlFor={`biz-photo-${item.id}`}
                                  className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-[#0E5A43] dark:text-[#4AD192] cursor-pointer hover:underline"
                                >
                                  <ImagePlus className="w-4 h-4" aria-hidden="true" />
                                  Add a photo (up to 3)
                                </label>
                                <input
                                  id={`biz-photo-${item.id}`}
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => handleBizPhotoAdd(item.id, e)}
                                  className="sr-only"
                                />
                              </div>

                              {/* Price & WhatsApp edit */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                  <label htmlFor={`biz-price-${item.id}`} className="block text-xs font-medium mb-1">
                                    Price ({CURRENCY_CONFIG[cc].code} {PRICE_UNITS[item.cat]})
                                  </label>
                                  <input
                                    id={`biz-price-${item.id}`}
                                    type="number"
                                    min="0"
                                    value={draft.price}
                                    onChange={(e) =>
                                      setBizDrafts((prev) => ({
                                        ...prev,
                                        [item.id]: { ...draft, price: e.target.value, msg: '' },
                                      }))
                                    }
                                    className="w-full px-3 py-2 rounded-lg border border-[#D8D8D0] dark:border-[#2E3C35] bg-[#FAFAF8] dark:bg-[#0D1210] text-sm font-mono-num"
                                  />
                                </div>
                                <div>
                                  <label htmlFor={`biz-wa-${item.id}`} className="block text-xs font-medium mb-1">
                                    WhatsApp for bookings
                                  </label>
                                  <input
                                    id={`biz-wa-${item.id}`}
                                    inputMode="tel"
                                    placeholder="0772 123 456"
                                    value={draft.phone}
                                    onChange={(e) =>
                                      setBizDrafts((prev) => ({
                                        ...prev,
                                        [item.id]: { ...draft, phone: e.target.value, msg: '' },
                                      }))
                                    }
                                    className="w-full px-3 py-2 rounded-lg border border-[#D8D8D0] dark:border-[#2E3C35] bg-[#FAFAF8] dark:bg-[#0D1210] text-sm font-mono-num"
                                  />
                                </div>
                              </div>

                              {draft.err && (
                                <p role="alert" className="text-xs text-[#B3341E] dark:text-[#FF8F78]">
                                  {draft.err}
                                </p>
                              )}
                              {draft.msg && (
                                <p role="status" className="text-xs font-medium text-[#0E5A43] dark:text-[#4AD192]">
                                  {draft.msg}
                                </p>
                              )}

                              <button
                                type="button"
                                onClick={() => handleSaveBizListing(item)}
                                className="px-4 py-2 rounded-lg bg-[#0E5A43] hover:bg-[#0B4735] dark:bg-[#3DBE7C] text-white dark:text-[#071A11] text-sm font-semibold transition-colors cursor-pointer"
                              >
                                Save changes
                              </button>

                              {/* Recent enquiries */}
                              <div className="pt-3 border-t border-[#E5E5DF] dark:border-[#222F2A]">
                                <p className="text-xs font-semibold text-[#111714] dark:text-[#EEF3F0]">
                                  Recent enquiries ({item.enq ?? 0})
                                </p>
                                {(item.log ?? []).length === 0 ? (
                                  <p className="mt-1 text-xs text-[#5C6660] dark:text-[#9AA8A0]">
                                    None yet. They appear when a fan taps Book on WhatsApp.
                                  </p>
                                ) : (
                                  <ul className="mt-1.5 space-y-1 text-xs text-[#5C6660] dark:text-[#9AA8A0]">
                                    {(item.log ?? [])
                                      .slice(-5)
                                      .reverse()
                                      .map((entry, idx) => (
                                        <li key={idx}>
                                          {entry.name} · {entry.date} · {entry.guests}{' '}
                                          {entry.guests === '1' ? 'person' : 'people'}
                                        </li>
                                      ))}
                                  </ul>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          )}
        </div>
      )}

      {/* ADMIN VIEW */}
      {view === 'adm' && (
        <div ref={adminSectionRef} className="space-y-8">
          {!adminUnlocked ? (
            <div className="max-w-sm p-6 sm:p-8 rounded-xl bg-white dark:bg-[#131B18] border border-[#E5E5DF] dark:border-[#222F2A]">
              <h4 className="font-display text-xl font-bold text-[#111714] dark:text-[#EEF3F0]">
                Organiser admin
              </h4>
              <p className="mt-1 text-sm text-[#5C6660] dark:text-[#9AA8A0]">
                Demo PIN: <span className="font-mono-num font-semibold">2027</span>. A live site uses real server-side login.
              </p>
              <form onSubmit={handleAdminUnlock} noValidate className="mt-5 space-y-4">
                <div>
                  <label htmlFor="admin-pin" className="block text-sm font-medium mb-1">
                    PIN
                  </label>
                  <input
                    id="admin-pin"
                    type="password"
                    inputMode="numeric"
                    value={adminPinInput}
                    onChange={(e) => setAdminPinInput(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-lg border border-[#D8D8D0] dark:border-[#2E3C35] bg-[#FAFAF8] dark:bg-[#0D1210] text-sm font-mono-num"
                  />
                </div>
                {adminPinError && (
                  <p role="alert" className="text-sm text-[#B3341E] dark:text-[#FF8F78]">
                    {adminPinError}
                  </p>
                )}
                <button
                  type="submit"
                  className="w-full px-4 py-2.5 rounded-lg bg-[#0E5A43] hover:bg-[#0B4735] dark:bg-[#3DBE7C] text-white dark:text-[#071A11] text-sm font-semibold transition-colors cursor-pointer"
                >
                  Open admin
                </button>
              </form>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Top admin bar */}
              <div className="flex flex-wrap items-center justify-between gap-4">
                <h4 className="font-display text-xl font-bold">Organiser console</h4>
                <button
                  type="button"
                  onClick={() => {
                    setAdminUnlocked(false);
                    setView('fans');
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-[#D8D8D0] dark:border-[#2E3C35] text-sm font-medium hover:bg-[#F3F3EF] dark:hover:bg-[#1C2622] cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
                  Sign out
                </button>
              </div>

              {/* 4-column KPI strip */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-white dark:bg-[#131B18] border border-[#E5E5DF] dark:border-[#222F2A]">
                  <span className="text-xs text-[#5C6660] dark:text-[#9AA8A0]">Listings</span>
                  <p className="mt-1 font-mono-num text-2xl font-bold">{adminStats.total}</p>
                </div>
                <div className="p-4 rounded-xl bg-white dark:bg-[#131B18] border border-[#E5E5DF] dark:border-[#222F2A]">
                  <span className="text-xs text-[#5C6660] dark:text-[#9AA8A0]">Active</span>
                  <p className="mt-1 font-mono-num text-2xl font-bold">{adminStats.active}</p>
                </div>
                <div className="p-4 rounded-xl bg-white dark:bg-[#131B18] border border-[#E5E5DF] dark:border-[#222F2A]">
                  <span className="text-xs text-[#5C6660] dark:text-[#9AA8A0]">Featured</span>
                  <p className="mt-1 font-mono-num text-2xl font-bold">{adminStats.featured}</p>
                </div>
                <div className="p-4 rounded-xl bg-white dark:bg-[#131B18] border border-[#E5E5DF] dark:border-[#222F2A]">
                  <span className="text-xs text-[#5C6660] dark:text-[#9AA8A0]">Revenue</span>
                  <div className="mt-1 space-y-0.5 font-mono-num text-sm font-bold">
                    {Object.entries(adminStats.revenue).map(([cur, amt]) => (
                      <div key={cur}>
                        {cur} {formatCurrencyValue(amt)}
                      </div>
                    ))}
                    {Object.keys(adminStats.revenue).length === 0 && <div>0</div>}
                  </div>
                </div>
              </div>

              {/* Add business listing + Business Logins */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                <div className="lg:col-span-7 p-6 rounded-xl bg-white dark:bg-[#131B18] border border-[#E5E5DF] dark:border-[#222F2A]">
                  <h5 className="font-display text-lg font-bold">Add a business listing</h5>
                  <p className="mt-1 text-sm text-[#5C6660] dark:text-[#9AA8A0]">
                    Enter the details sent by the business, record how the fee was paid, and publish.
                  </p>
                  <form onSubmit={handleAddListingSubmit} noValidate className="mt-5 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="adm-bn" className="block text-xs font-medium mb-1">
                          Business name
                        </label>
                        <input
                          id="adm-bn"
                          value={formName}
                          onChange={(e) => setFormName(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-[#D8D8D0] dark:border-[#2E3C35] bg-[#FAFAF8] dark:bg-[#0D1210] text-sm"
                        />
                        {formErrors.name && (
                          <p className="mt-1 text-xs text-[#B3341E] dark:text-[#FF8F78]">{formErrors.name}</p>
                        )}
                      </div>
                      <div>
                        <label htmlFor="adm-bt" className="block text-xs font-medium mb-1">
                          Type
                        </label>
                        <select
                          id="adm-bt"
                          value={formType}
                          onChange={(e) => setFormType(Number(e.target.value) as ListingCategory)}
                          className="w-full px-3 py-2 rounded-lg border border-[#D8D8D0] dark:border-[#2E3C35] bg-[#FAFAF8] dark:bg-[#0D1210] text-sm"
                        >
                          {LISTING_TYPES.map((t, i) => (
                            <option key={t} value={i}>
                              {t}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label htmlFor="adm-bc" className="block text-xs font-medium mb-1">
                          City
                        </label>
                        <select
                          id="adm-bc"
                          value={formCity}
                          onChange={(e) => setFormCity(Number(e.target.value))}
                          className="w-full px-3 py-2 rounded-lg border border-[#D8D8D0] dark:border-[#2E3C35] bg-[#FAFAF8] dark:bg-[#0D1210] text-sm"
                        >
                          {HOST_CITIES.map((c, i) => (
                            <option key={c.name} value={i}>
                              {c.name}, {COUNTRY_NAMES[c.country]}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label htmlFor="adm-bp" className="block text-xs font-medium mb-1">
                          WhatsApp for bookings
                        </label>
                        <input
                          id="adm-bp"
                          inputMode="tel"
                          placeholder="0772 123 456"
                          value={formPhone}
                          onChange={(e) => setFormPhone(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-[#D8D8D0] dark:border-[#2E3C35] bg-[#FAFAF8] dark:bg-[#0D1210] text-sm"
                        />
                        {formErrors.phone && (
                          <p className="mt-1 text-xs text-[#B3341E] dark:text-[#FF8F78]">{formErrors.phone}</p>
                        )}
                      </div>
                      <div>
                        <label htmlFor="adm-bem" className="block text-xs font-medium mb-1">
                          Business email (for their login)
                        </label>
                        <input
                          id="adm-bem"
                          type="email"
                          value={formEmail}
                          onChange={(e) => setFormEmail(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-[#D8D8D0] dark:border-[#2E3C35] bg-[#FAFAF8] dark:bg-[#0D1210] text-sm"
                        />
                        {formErrors.email && (
                          <p className="mt-1 text-xs text-[#B3341E] dark:text-[#FF8F78]">{formErrors.email}</p>
                        )}
                      </div>
                      <div>
                        <label htmlFor="adm-bpr" className="block text-xs font-medium mb-1">
                          Price (optional, local currency)
                        </label>
                        <input
                          id="adm-bpr"
                          type="number"
                          min="0"
                          placeholder="e.g. 120000"
                          value={formPrice}
                          onChange={(e) => setFormPrice(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-[#D8D8D0] dark:border-[#2E3C35] bg-[#FAFAF8] dark:bg-[#0D1210] text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="adm-photos" className="block text-xs font-medium mb-1">
                        Photos (up to 3)
                      </label>
                      <input
                        id="adm-photos"
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleAdminPhotoUpload}
                        className="block w-full text-xs text-[#5C6660] file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border file:border-[#D8D8D0] file:text-xs file:font-semibold file:bg-[#FAFAF8] hover:file:bg-[#EFEFEA]"
                      />
                      {formPhotoError && (
                        <p className="mt-1 text-xs text-[#B3341E] dark:text-[#FF8F78]">{formPhotoError}</p>
                      )}
                      {formPhotos.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {formPhotos.map((src, i) => (
                            <div key={src} className="relative">
                              <img src={src} alt={`Upload preview ${i + 1}`} className="w-20 h-14 object-cover rounded-lg border border-[#E5E5DF]" />
                              <button
                                type="button"
                                aria-label={`Remove upload ${i + 1}`}
                                onClick={() => setFormPhotos((prev) => prev.filter((_, idx) => idx !== i))}
                                className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-[#111714] text-white flex items-center justify-center cursor-pointer"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="adm-pl" className="block text-xs font-medium mb-1">
                          Listing plan
                        </label>
                        <select
                          id="adm-pl"
                          value={formPlan}
                          onChange={(e) => setFormPlan(Number(e.target.value))}
                          className="w-full px-3 py-2 rounded-lg border border-[#D8D8D0] dark:border-[#2E3C35] bg-[#FAFAF8] dark:bg-[#0D1210] text-sm"
                        >
                          {LISTING_PLANS.map((p, i) => {
                            const f = calculateListingFee(currentFormCountry, i);
                            return (
                              <option key={p.label} value={i}>
                                {p.label}: {f.currency} {formatCurrencyValue(f.amount)}
                              </option>
                            );
                          })}
                        </select>
                      </div>
                      <div>
                        <label htmlFor="adm-pm" className="block text-xs font-medium mb-1">
                          Payment method
                        </label>
                        <select
                          id="adm-pm"
                          value={formMethod}
                          onChange={(e) => setFormMethod(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-[#D8D8D0] dark:border-[#2E3C35] bg-[#FAFAF8] dark:bg-[#0D1210] text-sm"
                        >
                          {availableMethods.map((m) => (
                            <option key={m.id} value={m.id}>
                              {m.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {formMethod !== 'card' && formMethod !== 'manual' && (
                      <div>
                        <label htmlFor="adm-momo" className="block text-xs font-medium mb-1">
                          Business’s mobile money number (to request fee)
                        </label>
                        <input
                          id="adm-momo"
                          inputMode="tel"
                          placeholder="0772 123 456"
                          value={formMobileMoney}
                          onChange={(e) => setFormMobileMoney(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-[#D8D8D0] dark:border-[#2E3C35] bg-[#FAFAF8] dark:bg-[#0D1210] text-sm"
                        />
                        {formErrors.momo && (
                          <p className="mt-1 text-xs text-[#B3341E] dark:text-[#FF8F78]">{formErrors.momo}</p>
                        )}
                      </div>
                    )}

                    {formMethod === 'card' && (
                      <p className="p-3 rounded-lg bg-[#FAFAF8] dark:bg-[#0D1210] border border-[#E5E5DF] dark:border-[#222F2A] text-xs text-[#5C6660] dark:text-[#9AA8A0]">
                        You would be taken to a secure card page. No card details are typed on this form.
                      </p>
                    )}

                    <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                      <div>
                        <p className="font-mono-num text-base font-bold text-[#111714] dark:text-[#EEF3F0]">
                          Fee: {currentFee.currency} {formatCurrencyValue(currentFee.amount)}
                        </p>
                        <p className="text-xs text-[#5C6660] dark:text-[#9AA8A0]">
                          Payments are simulated in this demo.
                        </p>
                      </div>
                      <button
                        type="submit"
                        disabled={formSubmitting}
                        className="px-5 py-2.5 rounded-lg bg-[#0E5A43] hover:bg-[#0B4735] disabled:opacity-60 dark:bg-[#3DBE7C] text-white dark:text-[#071A11] text-sm font-semibold transition-colors cursor-pointer"
                      >
                        {formSubmitting
                          ? 'Publishing…'
                          : `${formMethod === 'manual' ? 'Record' : 'Request'} ${currentFee.currency} ${formatCurrencyValue(currentFee.amount)} & publish`}
                      </button>
                    </div>

                    {formSuccess && (
                      <p role="status" className="text-sm font-medium text-[#0E5A43] dark:text-[#4AD192]">
                        {formSuccess}
                      </p>
                    )}
                  </form>
                </div>

                {/* Business logins & simulated email outbox */}
                <div className="lg:col-span-5 space-y-4">
                  <div className="p-6 rounded-xl bg-white dark:bg-[#131B18] border border-[#E5E5DF] dark:border-[#222F2A]">
                    <h5 className="font-display text-base font-bold">Business logins</h5>
                    <p className="mt-1 text-xs text-[#5C6660] dark:text-[#9AA8A0]">
                      Created automatically when a business’s first listing is published.
                    </p>
                    <div className="mt-4 space-y-2">
                      {accounts.map((acct) => (
                        <div
                          key={acct.email}
                          className="flex items-center justify-between gap-2 p-2.5 rounded-lg border border-[#E5E5DF] dark:border-[#222F2A] text-xs"
                        >
                          <span className="truncate">
                            {acct.email} · {acct.must ? 'first sign-in pending' : 'active'}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleResetBusinessPassword(acct.email)}
                            className="px-2.5 py-1 rounded-md border border-[#D8D8D0] dark:border-[#2E3C35] font-medium whitespace-nowrap shrink-0 hover:bg-[#F3F3EF] dark:hover:bg-[#1C2622] cursor-pointer"
                          >
                            Reset password
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {outbox.length > 0 && (
                    <div className="p-5 rounded-xl bg-white dark:bg-[#131B18] border border-[#E5E5DF] dark:border-[#222F2A] space-y-3">
                      <p className="text-xs font-semibold uppercase tracking-wider text-[#0E5A43] dark:text-[#4AD192]">
                        Simulated email outbox
                      </p>
                      {outbox.slice(0, 2).map((mail, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-lg bg-[#FAFAF8] dark:bg-[#0D1210] border border-dashed border-[#D8D8D0] dark:border-[#2E3C35] text-xs space-y-1"
                        >
                          <p className="font-semibold">
                            To: {mail.to} · {mail.sub}
                          </p>
                          <p className="text-[#5C6660] dark:text-[#9AA8A0]">{mail.body}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Filter & Manage Table */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div className="md:col-span-2 relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#6B756F]" aria-hidden="true" />
                    <input
                      aria-label="Search listings"
                      placeholder="Search by business or payment reference"
                      value={adminSearch}
                      onChange={(e) => setAdminSearch(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-lg border border-[#D8D8D0] dark:border-[#2E3C35] bg-white dark:bg-[#131B18] text-sm"
                    />
                  </div>
                  <select
                    aria-label="Filter by city"
                    value={adminCityFilter}
                    onChange={(e) => setAdminCityFilter(e.target.value)}
                    className="px-3 py-2 rounded-lg border border-[#D8D8D0] dark:border-[#2E3C35] bg-white dark:bg-[#131B18] text-sm"
                  >
                    <option value="all">All cities</option>
                    {HOST_CITIES.map((c, i) => (
                      <option key={c.name} value={String(i)}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <select
                    aria-label="Filter by status"
                    value={adminStatusFilter}
                    onChange={(e) => setAdminStatusFilter(e.target.value)}
                    className="px-3 py-2 rounded-lg border border-[#D8D8D0] dark:border-[#2E3C35] bg-white dark:bg-[#131B18] text-sm"
                  >
                    <option value="all">All statuses</option>
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>

                <div className="overflow-x-auto rounded-xl border border-[#E5E5DF] dark:border-[#222F2A] bg-white dark:bg-[#131B18]">
                  <table className="w-full text-left border-collapse text-sm min-w-[820px]">
                    <thead>
                      <tr className="border-b border-[#E5E5DF] dark:border-[#222F2A] text-xs font-medium text-[#5C6660] dark:text-[#9AA8A0]">
                        <th className="py-3 px-4">Business</th>
                        <th className="py-3 px-4">Type</th>
                        <th className="py-3 px-4">City</th>
                        <th className="py-3 px-4">Plan</th>
                        <th className="py-3 px-4">Paid</th>
                        <th className="py-3 px-4">Method</th>
                        <th className="py-3 px-4">Reference</th>
                        <th className="py-3 px-4">Photos</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5E5DF] dark:divide-[#222F2A]">
                      {adminFilteredListings.map((row) => {
                        const photoCount = (row.photos ?? []).length;
                        return (
                          <tr key={row.id} className="hover:bg-[#FAFAF8] dark:hover:bg-[#17211D]">
                            <td className="py-3 px-4 font-medium">{row.name}</td>
                            <td className="py-3 px-4 text-[#5C6660] dark:text-[#9AA8A0]">
                              {LISTING_TYPES[row.cat]}
                            </td>
                            <td className="py-3 px-4">{HOST_CITIES[row.city]?.name}</td>
                            <td className="py-3 px-4 text-[#5C6660] dark:text-[#9AA8A0]">
                              {row.plan}
                              {row.sample ? ' (sample)' : ''}
                            </td>
                            <td className="py-3 px-4 font-mono-num">
                              {row.cur} {formatCurrencyValue(row.amt)}
                            </td>
                            <td className="py-3 px-4 text-[#5C6660] dark:text-[#9AA8A0]">{row.method}</td>
                            <td className="py-3 px-4 font-mono-num text-xs">{row.ref}</td>
                            <td className="py-3 px-4">
                              <span className="font-mono-num mr-2">{photoCount}</span>
                              {photoCount > 0 && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setLightboxItem(row);
                                    setLightboxIndex(0);
                                  }}
                                  className="text-xs font-semibold text-[#0E5A43] dark:text-[#4AD192] hover:underline mr-2 cursor-pointer"
                                >
                                  View
                                </button>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              <span
                                className={`text-xs font-semibold ${
                                  row.status === 'active'
                                    ? 'text-[#0E5A43] dark:text-[#4AD192]'
                                    : 'text-[#B3341E] dark:text-[#FF8F78]'
                                }`}
                              >
                                {row.status === 'active' ? 'Active' : 'Suspended'}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setDeleteConfirmId(null);
                                    setListings((prev) =>
                                      prev.map((l) =>
                                        l.id === row.id
                                          ? {
                                              ...l,
                                              status: l.status === 'active' ? 'suspended' : 'active',
                                            }
                                          : l,
                                      ),
                                    );
                                  }}
                                  className="px-2.5 py-1 rounded-md border border-[#D8D8D0] dark:border-[#2E3C35] text-xs font-medium hover:bg-[#F3F3EF] dark:hover:bg-[#1C2622] cursor-pointer"
                                >
                                  {row.status === 'active' ? 'Suspend' : 'Reactivate'}
                                </button>
                                <button
                                  type="button"
                                  aria-label={
                                    deleteConfirmId === row.id
                                      ? `Confirm delete ${row.name}`
                                      : `Delete ${row.name}`
                                  }
                                  onClick={() => {
                                    if (deleteConfirmId === row.id) {
                                      setListings((prev) => prev.filter((l) => l.id !== row.id));
                                      setDeleteConfirmId(null);
                                    } else {
                                      setDeleteConfirmId(row.id);
                                    }
                                  }}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-[#D8D8D0] dark:border-[#2E3C35] text-xs font-medium text-[#B3341E] dark:text-[#FF8F78] hover:bg-[#B3341E]/10 cursor-pointer"
                                >
                                  <Trash2 className="w-3 h-3" aria-hidden="true" />
                                  {deleteConfirmId === row.id ? 'Confirm delete' : 'Delete'}
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {adminFilteredListings.length === 0 && (
                    <p className="p-6 text-center text-sm text-[#5C6660] dark:text-[#9AA8A0]">
                      No listings match your filters.
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  <button
                    type="button"
                    onClick={handleExportCsv}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#111714] hover:bg-[#242E29] dark:bg-[#EEF3F0] dark:text-[#111714] text-white text-sm font-semibold transition-colors cursor-pointer"
                  >
                    <Download className="w-4 h-4" aria-hidden="true" />
                    Export CSV
                  </button>
                  {csvNotice && (
                    <span className="text-xs text-[#5C6660] dark:text-[#9AA8A0]">{csvNotice}</span>
                  )}
                </div>

                {csvText && (
                  <textarea
                    aria-label="CSV export"
                    readOnly
                    value={csvText}
                    rows={5}
                    className="w-full p-3 rounded-lg border border-[#D8D8D0] dark:border-[#2E3C35] bg-white dark:bg-[#131B18] font-mono-num text-xs"
                  />
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* BOOKING MODAL */}
      {bookingItem && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="booking-dialog-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs"
        >
          <div className="w-full max-w-md rounded-xl bg-white dark:bg-[#131B18] border border-[#E5E5DF] dark:border-[#222F2A] p-6 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h4 id="booking-dialog-title" className="font-display text-lg font-bold">
                  Book with {bookingItem.name}
                </h4>
                <p className="mt-1 text-xs text-[#5C6660] dark:text-[#9AA8A0]">
                  {bookingItem.sample
                    ? 'Sample listing: the WhatsApp number is a placeholder. Real businesses add their own number.'
                    : 'Your details go straight to the business on WhatsApp.'}
                </p>
              </div>
              <button
                type="button"
                aria-label="Close booking dialog"
                onClick={() => setBookingItem(null)}
                className="p-1.5 rounded-lg text-[#5C6660] hover:bg-[#EFEFEA] dark:hover:bg-[#1C2622] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleBookingConfirm} noValidate className="space-y-4">
              <div>
                <label htmlFor="bk-name" className="block text-xs font-medium mb-1">
                  Your name
                </label>
                <input
                  id="bk-name"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  autoComplete="name"
                  className="w-full px-3 py-2 rounded-lg border border-[#D8D8D0] dark:border-[#2E3C35] bg-[#FAFAF8] dark:bg-[#0D1210] text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="bk-date" className="block text-xs font-medium mb-1">
                    {DATE_LABELS[bookingItem.cat]}
                  </label>
                  <input
                    id="bk-date"
                    type="date"
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-[#D8D8D0] dark:border-[#2E3C35] bg-[#FAFAF8] dark:bg-[#0D1210] text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="bk-guests" className="block text-xs font-medium mb-1">
                    Number of people
                  </label>
                  <input
                    id="bk-guests"
                    type="number"
                    min="1"
                    value={guestCount}
                    onChange={(e) => setGuestCount(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-[#D8D8D0] dark:border-[#2E3C35] bg-[#FAFAF8] dark:bg-[#0D1210] text-sm"
                  />
                </div>
              </div>

              {bookingError && (
                <p role="alert" className="text-xs text-[#B3341E] dark:text-[#FF8F78]">
                  {bookingError}
                </p>
              )}

              <div className="flex items-center gap-3 pt-1">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 rounded-lg bg-[#0E5A43] hover:bg-[#0B4735] dark:bg-[#3DBE7C] text-white dark:text-[#071A11] text-sm font-semibold transition-colors cursor-pointer"
                >
                  Open WhatsApp
                </button>
                <button
                  type="button"
                  onClick={() => setBookingItem(null)}
                  className="px-4 py-2.5 rounded-lg border border-[#D8D8D0] dark:border-[#2E3C35] text-sm font-medium cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LIGHTBOX MODAL */}
      {lightboxItem && (lightboxItem.photos ?? []).length > 0 && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Listing photos"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs"
        >
          <div className="w-full max-w-xl rounded-xl bg-white dark:bg-[#131B18] border border-[#E5E5DF] dark:border-[#222F2A] p-4 sm:p-5 space-y-4">
            <img
              src={(lightboxItem.photos ?? [])[lightboxIndex]}
              alt={`${lightboxItem.name}, photo ${lightboxIndex + 1}`}
              className="w-full aspect-[3/2] object-cover rounded-lg"
            />
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-[#4D5752] dark:text-[#A3B1AA]">
                {lightboxItem.name} ({lightboxIndex + 1} of {(lightboxItem.photos ?? []).length})
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  aria-label="Previous photo"
                  onClick={() =>
                    setLightboxIndex(
                      (prev) =>
                        (prev + (lightboxItem.photos ?? []).length - 1) %
                        (lightboxItem.photos ?? []).length,
                    )
                  }
                  className="p-2 rounded-lg border border-[#D8D8D0] dark:border-[#2E3C35] cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  aria-label="Next photo"
                  onClick={() =>
                    setLightboxIndex((prev) => (prev + 1) % (lightboxItem.photos ?? []).length)
                  }
                  className="p-2 rounded-lg border border-[#D8D8D0] dark:border-[#2E3C35] cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setLightboxItem(null)}
                  className="px-3.5 py-2 rounded-lg bg-[#111714] dark:bg-[#EEF3F0] text-white dark:text-[#111714] text-sm font-semibold cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
