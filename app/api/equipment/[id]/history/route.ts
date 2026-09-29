import { NextRequest, NextResponse } from 'next/server';
import { getEquipmentById, getMaintenanceCases, getHindsightMemories } from '@/lib/db/store';

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const equipment = await getEquipmentById(params.id);
    if (!equipment) {
      return NextResponse.json({ error: 'Equipment not found' }, { status: 404 });
    }

    const cases = await getMaintenanceCases(equipment.id);
    const hindsight = await getHindsightMemories(equipment.id);

    // Group recurring failure patterns
    const symptomsFrequency: Record<string, { count: number; rootCauses: Set<string> }> = {};
    for (const c of cases) {
      const key = c.symptoms.slice(0, 45).toLowerCase();
      if (!symptomsFrequency[key]) {
        symptomsFrequency[key] = { count: 0, rootCauses: new Set() };
      }
      symptomsFrequency[key].count += 1;
      if (c.root_cause) symptomsFrequency[key].rootCauses.add(c.root_cause);
      if (c.diagnosis) symptomsFrequency[key].rootCauses.add(c.diagnosis);
    }

    const recurringFailures = Object.entries(symptomsFrequency)
      .map(([symptom, data]) => ({
        symptom,
        occurrences: data.count,
        previousRootCauses: Array.from(data.rootCauses),
      }))
      .filter((r) => r.occurrences > 1 || cases.length >= 2);

    return NextResponse.json({
      equipment,
      cases,
      hindsight,
      recurringFailures,
      totalCases: cases.length,
      totalDowntimeHours: cases.reduce((acc, c) => acc + (Number(c.downtime_hours) || 0), 0),
    });
  } catch (error: any) {
    console.error('Error fetching equipment history:', error);
    return NextResponse.json({ error: 'Failed to fetch equipment history' }, { status: 500 });
  }
}
