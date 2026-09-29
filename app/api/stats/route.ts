import { NextResponse } from 'next/server';
import { getFleetStats } from '@/lib/db/store';

export async function GET() {
  try {
    const stats = await getFleetStats();
    return NextResponse.json({ stats });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to compute fleet statistics' }, { status: 500 });
  }
}
