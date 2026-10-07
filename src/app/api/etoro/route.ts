import { NextRequest, NextResponse } from 'next/server';
import { ensureDataLoaded } from '@/lib/dataStore';

export async function GET(req: NextRequest) {
  const store = ensureDataLoaded();
  const searchParams = req.nextUrl.searchParams;

  let items = store.etoro;
  const search = (searchParams.get('search') || '').trim().toLowerCase();
  const platform = (searchParams.get('platform') || '').trim();
  const country = (searchParams.get('country') || '').trim().toLowerCase();
  const minDeposit = parseFloat(searchParams.get('min_deposit') || '0');
  const maxDeposit = parseFloat(searchParams.get('max_deposit') || '0');

  if (platform && platform !== 'all') {
    items = items.filter(i => i.deposit_platform.toLowerCase() === platform.toLowerCase());
  }

  if (country && country !== 'all') {
    items = items.filter(i => i.country.toLowerCase() === country.toLowerCase());
  }

  if (minDeposit > 0) {
    items = items.filter(i => i.deposit_amount >= minDeposit);
  }

  if (maxDeposit > 0) {
    items = items.filter(i => i.deposit_amount <= maxDeposit);
  }

  if (search) {
    items = items.filter(i =>
      i.name.toLowerCase().includes(search) ||
      i.email.toLowerCase().includes(search) ||
      i.country.toLowerCase().includes(search) ||
      i.ip.toLowerCase().includes(search) ||
      i.deposit_platform.toLowerCase().includes(search)
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
      totalRecords: store.etoro.length,
      totalDepositsUsd: store.stats?.etoro.totalDepositsUsd || 0,
      avgDepositUsd: store.stats?.etoro.avgDepositUsd || 0,
      platforms: Object.keys(store.stats?.etoro.platformBreakdown || {})
    }
  });
}
