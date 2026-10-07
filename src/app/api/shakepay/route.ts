import { NextRequest, NextResponse } from 'next/server';
import { ensureDataLoaded } from '@/lib/dataStore';

export async function GET(req: NextRequest) {
  const store = ensureDataLoaded();
  const searchParams = req.nextUrl.searchParams;

  let items = store.shakepay;
  const search = (searchParams.get('search') || '').trim().toLowerCase();
  const minReferrals = parseInt(searchParams.get('min_referrals') || '0', 10);
  const newsletter = searchParams.get('newsletter');

  if (minReferrals > 0) {
    items = items.filter(i => i.referral_count >= minReferrals);
  }
  if (newsletter === 'true') {
    items = items.filter(i => i.newsletter === true);
  } else if (newsletter === 'false') {
    items = items.filter(i => i.newsletter === false);
  }
  if (search) {
    items = items.filter(i =>
      i.email.toLowerCase().includes(search) ||
      i.shaketag.toLowerCase().includes(search) ||
      i.referral_url.toLowerCase().includes(search) ||
      i.phone.toLowerCase().includes(search)
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
