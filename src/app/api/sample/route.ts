import { NextRequest, NextResponse } from 'next/server';
import { ensureDataLoaded } from '@/lib/dataStore';

export async function GET(req: NextRequest) {
  const store = ensureDataLoaded();
  const searchParams = req.nextUrl.searchParams;

  let items = store.sample;
  const search = (searchParams.get('search') || '').trim().toLowerCase();
  const state = (searchParams.get('state') || '').trim().toUpperCase();
  const minAge = parseInt(searchParams.get('min_age') || '', 10);
  const maxAge = parseInt(searchParams.get('max_age') || '', 10);

  if (state && state !== 'ALL') {
    items = items.filter(i => i.state === state);
  }
  if (!isNaN(minAge)) {
    items = items.filter(i => i.age !== null && i.age >= minAge);
  }
  if (!isNaN(maxAge)) {
    items = items.filter(i => i.age !== null && i.age <= maxAge);
  }
  if (search) {
    items = items.filter(i =>
      i.name.toLowerCase().includes(search) ||
      i.email.toLowerCase().includes(search) ||
      i.address.toLowerCase().includes(search) ||
      i.phones.some(p => p.toLowerCase().includes(search))
    );
  }

  const total = items.length;
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const limit = Math.max(1, Math.min(250, parseInt(searchParams.get('limit') || '25', 10)));
  const start = (page - 1) * limit;
  const paginated = items.slice(start, start + limit);

  return NextResponse.json({
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    items: paginated
  });
}
