import { NextRequest, NextResponse } from 'next/server';
import { ensureDataLoaded } from '@/lib/dataStore';

export async function GET(req: NextRequest) {
  const store = ensureDataLoaded();
  const searchParams = req.nextUrl.searchParams;

  let items = store.cmsCrypto;
  const search = (searchParams.get('search') || '').trim().toLowerCase();
  const batch = (searchParams.get('batch') || '').trim();
  const state = (searchParams.get('state') || '').trim().toUpperCase();
  const gender = (searchParams.get('gender') || '').trim().toLowerCase();
  const source = (searchParams.get('source') || '').trim().toLowerCase();

  if (batch && batch !== 'all') {
    items = items.filter(i => i.batch === batch);
  }

  if (state && state !== 'ALL') {
    items = items.filter(i => i.state === state);
  }

  if (gender && gender !== 'all') {
    items = items.filter(i => i.gender === gender);
  }

  if (source && source !== 'all') {
    items = items.filter(i => i.source.toLowerCase().includes(source));
  }

  if (search) {
    items = items.filter(i =>
      i.email.toLowerCase().includes(search) ||
      i.name.toLowerCase().includes(search) ||
      i.phone.toLowerCase().includes(search) ||
      i.city.toLowerCase().includes(search) ||
      i.state.toLowerCase().includes(search) ||
      i.zip.toLowerCase().includes(search) ||
      i.ip.toLowerCase().includes(search) ||
      i.source.toLowerCase().includes(search)
    );
  }

  const total = items.length;
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const limit = Math.max(1, Math.min(500, parseInt(searchParams.get('limit') || '25', 10)));
  const start = (page - 1) * limit;
  const paginated = items.slice(start, start + limit);

  return NextResponse.json({
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    items: paginated,
    meta: {
      totalAcrossAllBatches: store.cmsCrypto.length,
      count2026: store.stats?.counts.cmsCrypto2026 || 0,
      count2025: store.stats?.counts.cmsCrypto2025 || 0
    }
  });
}
