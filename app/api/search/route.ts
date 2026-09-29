import { NextRequest, NextResponse } from 'next/server';
import { searchHistoricalCases, getMaintenanceCases } from '@/lib/db/store';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { query, equipmentId, rootCause, component, limit = 10 } = body;

    if (!query || typeof query !== 'string') {
      const all = await getMaintenanceCases(equipmentId);
      return NextResponse.json({ results: all });
    }

    let results = await searchHistoricalCases({
      query: query.trim(),
      equipmentId: equipmentId || undefined,
      limit: limit || 10,
    });

    if (rootCause && rootCause !== 'all') {
      results = results.filter((r) =>
        r.root_cause.toLowerCase().includes(rootCause.toLowerCase())
      );
    }

    if (component && component !== 'all') {
      results = results.filter((r) =>
        r.components_replaced.toLowerCase().includes(component.toLowerCase())
      );
    }

    return NextResponse.json({
      results,
      query,
      count: results.length,
    });
  } catch (error: any) {
    console.error('Search API error:', error);
    return NextResponse.json({ error: 'Search failed', details: error.message }, { status: 500 });
  }
}
