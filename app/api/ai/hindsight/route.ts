import { NextRequest, NextResponse } from 'next/server';
import { generateHindsightReflection } from '@/lib/ai/gemini';
import { createHindsightMemory, getEquipmentById } from '@/lib/db/store';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      equipmentId,
      caseId,
      symptoms,
      initialSuspectedCause,
      actualRootCause,
      repairAction,
      partsReplaced,
      unexpectedFindings,
      technicianName,
    } = body;

    if (!equipmentId || !actualRootCause || !repairAction) {
      return NextResponse.json(
        { error: 'Equipment ID, actual root cause, and repair action are required.' },
        { status: 400 }
      );
    }

    const equipment = await getEquipmentById(equipmentId);
    const eqCode = equipment ? equipment.equipment_code : 'EQUIPMENT';
    const eqName = equipment ? equipment.name : 'Asset';

    // Generate concise hindsight reflection using Gemini
    const hindsightReflection = await generateHindsightReflection({
      equipmentCode: eqCode,
      equipmentName: eqName,
      symptoms: symptoms || 'Recurring failure symptoms',
      initialSuspectedCause,
      actualRootCause,
      repairAction,
      partsReplaced,
      unexpectedFindings,
    });

    // Store hindsight reflection into persistent database
    const memoryRecord = await createHindsightMemory({
      equipment_id: equipmentId,
      case_id: caseId || null,
      reported_symptom: symptoms || 'Equipment failure',
      initial_suspected_cause: initialSuspectedCause,
      actual_root_cause: actualRootCause,
      repair_action: repairAction,
      parts_replaced: partsReplaced,
      hindsight_reflection: hindsightReflection,
      technician_name: technicianName || 'Field Technician',
    });

    return NextResponse.json({
      success: true,
      hindsightReflection,
      memoryRecord,
    });
  } catch (error: any) {
    console.error('Error in /api/ai/hindsight:', error);
    return NextResponse.json(
      { error: 'Failed to generate hindsight reflection', details: error.message },
      { status: 500 }
    );
  }
}
