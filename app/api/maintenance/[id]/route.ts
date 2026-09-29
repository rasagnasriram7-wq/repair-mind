import { NextRequest, NextResponse } from 'next/server';
import { getMaintenanceCaseById } from '@/lib/db/store';

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const caseItem = await getMaintenanceCaseById(params.id);
    if (!caseItem) {
      return NextResponse.json({ error: 'Maintenance case not found' }, { status: 404 });
    }
    return NextResponse.json({ case: caseItem });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch maintenance case' }, { status: 500 });
  }
}
