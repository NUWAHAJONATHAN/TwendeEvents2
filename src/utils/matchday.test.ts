import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildBookingMessage,
  buildListingsCsv,
  calculateListingFee,
  filterAdminListings,
  getCountdownParts,
  getPublicListings,
  normalizePhone,
  validateChapterApplication,
  type MatchdayListing,
} from './matchday';

test('normalizePhone handles Uganda, Kenya, and Tanzania local and international formats', () => {
  assert.equal(normalizePhone('0772 123 456', 'UG'), '256772123456');
  assert.equal(normalizePhone('+256 772 123 456', 'UG'), '256772123456');
  assert.equal(normalizePhone('0712 345 678', 'KE'), '254712345678');
  assert.equal(normalizePhone('255 754 000 111', 'TZ'), '255754000111');
  assert.equal(normalizePhone('12345', 'UG'), null);
  assert.equal(normalizePhone('', 'KE'), null);
});

test('calculateListingFee computes standard and featured prices rounded to nearest 100', () => {
  assert.deepEqual(calculateListingFee('UG', 0), { currency: 'UGX', amount: 30000 });
  assert.deepEqual(calculateListingFee('UG', 1), { currency: 'UGX', amount: 81000 });
  assert.deepEqual(calculateListingFee('KE', 0), { currency: 'KES', amount: 1200 });
  assert.deepEqual(calculateListingFee('KE', 1), { currency: 'KES', amount: 3200 });
  assert.deepEqual(calculateListingFee('TZ', 1), { currency: 'TZS', amount: 54000 });
});

test('getPublicListings places featured active listings ahead of standard and sample listings', () => {
  const seed: MatchdayListing[] = [
    {
      id: '1',
      name: 'Standard Spot',
      price: 'UGX 100,000 per night',
      phone: '256772123456',
      sample: false,
      featured: false,
      city: 0,
      cat: 0,
      plan: 'Standard listing',
      amt: 30000,
      cur: 'UGX',
      method: 'MTN Mobile Money',
      ref: 'KM-1001',
      t: 1,
      status: 'active',
    },
    {
      id: '2',
      name: 'Featured Spot',
      price: 'UGX 200,000 per night',
      phone: '256772123457',
      sample: false,
      featured: true,
      city: 0,
      cat: 0,
      plan: 'Featured listing',
      amt: 81000,
      cur: 'UGX',
      method: 'MTN Mobile Money',
      ref: 'KM-1002',
      t: 2,
      status: 'active',
    },
    {
      id: '3',
      name: 'Suspended Spot',
      price: 'UGX 90,000 per night',
      phone: '256772123458',
      sample: false,
      featured: true,
      city: 0,
      cat: 0,
      plan: 'Featured listing',
      amt: 81000,
      cur: 'UGX',
      method: 'MTN Mobile Money',
      ref: 'KM-1003',
      t: 3,
      status: 'suspended',
    },
  ];

  const result = getPublicListings(seed, 0, 0);
  assert.equal(result[0].name, 'Featured Spot');
  assert.equal(result[1].name, 'Standard Spot');
  assert.equal(result.some((x) => x.name === 'Suspended Spot'), false);
  assert.equal(result.filter((x) => x.sample).length, 3);
});

test('filterAdminListings filters by search query, city, and status', () => {
  const rows: MatchdayListing[] = [
    {
      id: 'a',
      name: 'Lakeview Guesthouse',
      price: 'UGX 150,000 per night',
      phone: '256768561755',
      sample: true,
      featured: false,
      city: 0,
      cat: 0,
      plan: 'Standard listing',
      amt: 30000,
      cur: 'UGX',
      method: 'MTN Mobile Money',
      ref: 'KM-1001',
      t: Date.now(),
      status: 'active',
    },
    {
      id: 'b',
      name: 'Coastline Rooms',
      price: 'TZS 110,000 per night',
      phone: '256768561755',
      sample: true,
      featured: true,
      city: 8,
      cat: 0,
      plan: 'Featured listing',
      amt: 54000,
      cur: 'TZS',
      method: 'M-Pesa',
      ref: 'KM-1004',
      t: Date.now(),
      status: 'suspended',
    },
  ];

  assert.equal(filterAdminListings(rows, 'km-1004', 'all', 'all').length, 1);
  assert.equal(filterAdminListings(rows, '', '0', 'active').length, 1);
  assert.equal(filterAdminListings(rows, '', '0', 'suspended').length, 0);
});

test('buildBookingMessage formats natural WhatsApp message', () => {
  const msg = buildBookingMessage({
    guestName: 'Amina',
    listingName: 'Lakeview Guesthouse',
    cityName: 'Kampala',
    category: 0,
    dateISO: '2027-06-19',
    guests: '2',
  });
  assert.match(msg, /Amina/);
  assert.match(msg, /book a room at Lakeview Guesthouse in Kampala/);
  assert.match(msg, /19 Jun 2027/);
  assert.match(msg, /2 people/);
});

test('buildListingsCsv escapes quotes cleanly', () => {
  const csv = buildListingsCsv([
    {
      id: 'a',
      name: 'Nile "Best" Grill',
      price: 'UGX 30,000 per meal',
      phone: '256768561755',
      sample: false,
      featured: false,
      city: 1,
      cat: 1,
      plan: 'Standard listing',
      amt: 30000,
      cur: 'UGX',
      method: 'Airtel Money',
      ref: 'KM-1002',
      t: Date.UTC(2026, 10, 16),
      status: 'active',
    },
  ]);
  assert.match(csv, /"Nile ""Best"" Grill"/);
  assert.match(csv, /"Hoima"/);
  assert.match(csv, /"2026-11-16"/);
});

test('validateChapterApplication validates all required fields and consent', () => {
  assert.ok(
    validateChapterApplication({
      name: '',
      email: 'a@b.com',
      phone: '0772123456',
      city: 'Kampala',
      why: 'Community',
      experience: 'Events',
      agreed: true,
    }),
  );
  assert.ok(
    validateChapterApplication({
      name: 'Grace',
      email: 'grace@example.com',
      phone: '0772123456',
      city: 'Kampala',
      why: 'Community',
      experience: 'Events',
      agreed: false,
    }),
  );
  assert.equal(
    validateChapterApplication({
      name: 'Grace',
      email: 'grace@example.com',
      phone: '0772123456',
      city: 'Kampala',
      why: 'Community',
      experience: 'Events',
      agreed: true,
    }),
    null,
  );
});

test('getCountdownParts formats days, hours, minutes, seconds cleanly', () => {
  const target = 1000 * (86400 * 5 + 3600 * 3 + 60 * 7 + 9);
  assert.deepEqual(getCountdownParts(target, 0), {
    days: '005',
    hours: '03',
    minutes: '07',
    seconds: '09',
  });
  assert.deepEqual(getCountdownParts(0, 5000), {
    days: '000',
    hours: '00',
    minutes: '00',
    seconds: '00',
  });
});
