import { NextRequest, NextResponse } from 'next/server';
import { ensureDataLoaded } from '@/lib/dataStore';

export async function GET(req: NextRequest) {
  const store = ensureDataLoaded();
  const searchParams = req.nextUrl.searchParams;

  const search = (searchParams.get('search') || '').trim().toLowerCase();
  const domain = (searchParams.get('domain') || '').trim().toLowerCase();
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const limit = Math.max(1, Math.min(250, parseInt(searchParams.get('limit') || '25', 10)));

  if (!search && (!domain || domain === 'all')) {
    const total = store.blockfi.length;
    const start = (page - 1) * limit;
    const paginated = store.blockfi.slice(start, start + limit).map((email, idx) => ({ id: start + idx + 1, email }));
    return NextResponse.json({
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      items: paginated
    });
  }

  const matches: Array<{ id: number; email: string }> = [];
  const maxMatches = 10000;

  for (let i = 0; i < store.blockfi.length; i++) {
    const email = store.blockfi[i];
    const lower = email.toLowerCase();
    if (domain && domain !== 'all' && !lower.endsWith('@' + domain)) {
      continue;
    }
    if (search && !lower.includes(search)) {
      continue;
    }
    matches.push({ id: i + 1, email });
    if (matches.length >= maxMatches) break;
  }

  const total = matches.length;
  const start = (page - 1) * limit;
  const paginated = matches.slice(start, start + limit);

  return NextResponse.json({
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    items: paginated
  });
}
