import { NextResponse } from 'next/server';
import { ensureDataLoaded } from '@/lib/dataStore';

export async function GET() {
  const store = ensureDataLoaded();
  return NextResponse.json(store.stats);
}
