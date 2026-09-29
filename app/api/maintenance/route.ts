import { NextRequest, NextResponse } from 'next/server';
import { getMaintenanceCases, createMaintenanceCase } from '@/lib/db/store';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const equipmentId = searchParams.get('equipmentId') || undefined;

    const cases = await getMaintenanceCases(equipmentId);
    return NextResponse.json({ cases });
  } catch (error: any) {
    console.error('Error fetching maintenance cases:', error);
    return NextResponse.json({ error: 'Failed to fetch maintenance cases' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      equipment_id,
      failure_date,
      symptoms,
      observations,
      diagnosis,
      root_cause,
      diagnostic_procedure,
      repair_action,
      components_replaced,
      outcome,
      downtime_hours,
      technician_notes,
    } = body;

    // Validation
    if (!equipment_id) {
      return NextResponse.json({ error: 'Equipment selection is required.' }, { status: 400 });
    }
    if (!symptoms || !symptoms.trim()) {
      return NextResponse.json({ error: 'Failure symptoms are required.' }, { status: 400 });
    }
    if (!diagnosis || !diagnosis.trim()) {
      return NextResponse.json({ error: 'Diagnosis or observations are required.' }, { status: 400 });
    }
    if (!repair_action || !repair_action.trim()) {
      return NextResponse.json({ error: 'Repair action taken is required.' }, { status: 400 });
    }
    if (!outcome || !outcome.trim()) {
      return NextResponse.json({ error: 'Repair outcome is required (e.g., Resolved, Normal vibration).' }, { status: 400 });
    }

    const { caseItem, embeddingSaved } = await createMaintenanceCase({
      equipment_id,
      failure_date: failure_date || new Date().toISOString(),
      symptoms: symptoms.trim(),
      observations: observations?.trim() || '',
      diagnosis: diagnosis.trim(),
      root_cause: root_cause?.trim() || '',
      diagnostic_procedure: diagnostic_procedure?.trim() || '',
      repair_action: repair_action.trim(),
      components_replaced: components_replaced?.trim() || '',
      outcome: outcome.trim(),
      downtime_hours: Number(downtime_hours) || 1.0,
      technician_notes: technician_notes?.trim() || '',
    });

    return NextResponse.json(
      {
        case: caseItem,
        embeddingSaved,
        message: embeddingSaved
          ? 'Maintenance case saved and indexed into vector memory successfully.'
          : 'Maintenance case was saved, but vector memory indexing was completed using fallback.',
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating maintenance case:', error);
    return NextResponse.json(
      { error: 'Failed to create maintenance case', details: error.message },
      { status: 500 }
    );
  }
}
