import { NextRequest, NextResponse } from 'next/server';
import { ensureDataLoaded } from '@/lib/dataStore';

export async function GET(req: NextRequest) {
  const store = ensureDataLoaded();
  const searchParams = req.nextUrl.searchParams;
  const q = (searchParams.get('q') || '').trim().toLowerCase();

  if (!q || q.length < 2) {
    return NextResponse.json({
      query: q,
      results: {
        coincustody: [],
        sample: [],
        shakepay: [],
        blockfi: [],
        cmsCrypto: [],
        cryptoLeads: [],
        etoro: []
      },
      count: 0
    });
  }

  const results = {
    coincustody: store.coincustody.filter(i =>
      (i.email || '').toLowerCase().includes(q) ||
      (i.order_number || '').toLowerCase().includes(q) ||
      (i.numero_identificacion || '').toLowerCase().includes(q) ||
      (i.payment_method || '').toLowerCase().includes(q)
    ).slice(0, 15),

    sample: store.sample.filter(i =>
      i.name.toLowerCase().includes(q) ||
      i.email.toLowerCase().includes(q) ||
      i.address.toLowerCase().includes(q) ||
      i.phones.some(p => p.toLowerCase().includes(q))
    ).slice(0, 15),

    shakepay: store.shakepay.filter(i =>
      i.email.toLowerCase().includes(q) ||
      i.shaketag.toLowerCase().includes(q) ||
      i.referral_url.toLowerCase().includes(q)
    ).slice(0, 15),

    cmsCrypto: store.cmsCrypto.filter(i =>
      i.email.toLowerCase().includes(q) ||
      i.name.toLowerCase().includes(q) ||
      i.phone.toLowerCase().includes(q) ||
      i.ip.toLowerCase().includes(q) ||
      i.city.toLowerCase().includes(q)
    ).slice(0, 15),

    cryptoLeads: store.cryptoLeads.filter(i =>
      i.email.toLowerCase().includes(q) ||
      i.name.toLowerCase().includes(q) ||
      i.phone.toLowerCase().includes(q) ||
      i.ip.toLowerCase().includes(q) ||
      i.city.toLowerCase().includes(q)
    ).slice(0, 15),

    etoro: store.etoro.filter(i =>
      i.name.toLowerCase().includes(q) ||
      i.email.toLowerCase().includes(q) ||
      i.country.toLowerCase().includes(q) ||
      i.ip.toLowerCase().includes(q) ||
      i.deposit_platform.toLowerCase().includes(q)
    ).slice(0, 15),

    blockfi: [] as Array<{ id: number; email: string }>
  };

  let bfCount = 0;
  for (let i = 0; i < store.blockfi.length; i++) {
    if (store.blockfi[i].toLowerCase().includes(q)) {
      results.blockfi.push({ id: i + 1, email: store.blockfi[i] });
      bfCount++;
      if (bfCount >= 15) break;
    }
  }

  const count =
    results.coincustody.length +
    results.sample.length +
    results.shakepay.length +
    results.cmsCrypto.length +
    results.cryptoLeads.length +
    results.etoro.length +
    results.blockfi.length;

  return NextResponse.json({ query: q, results, count });
}

