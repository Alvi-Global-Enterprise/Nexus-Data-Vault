import { NextRequest, NextResponse } from 'next/server';
import { ensureDataLoaded } from '@/lib/dataStore';

export async function GET(req: NextRequest) {
  const store = ensureDataLoaded();
  const searchParams = req.nextUrl.searchParams;

  let items = store.coincustody;
  const search = (searchParams.get('search') || '').trim().toLowerCase();
  const payment = (searchParams.get('payment') || '').trim().toLowerCase();
  const status = (searchParams.get('status') || '').trim().toLowerCase();

  if (payment && payment !== 'all') {
    items = items.filter(i => (i.payment_method_norm || '').toLowerCase().includes(payment));
  }
  if (status && status !== 'all') {
    items = items.filter(i => (i.financial_status || '').toLowerCase() === status);
  }
  if (search) {
    items = items.filter(i =>
      (i.email || '').toLowerCase().includes(search) ||
      (i.order_number || '').toLowerCase().includes(search) ||
      (i.numero_identificacion || '').toLowerCase().includes(search) ||
      (i.payment_method || '').toLowerCase().includes(search) ||
      (i.payment_id || '').toLowerCase().includes(search) ||
      (i.shipment_tracking_url || '').toLowerCase().includes(search)
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
