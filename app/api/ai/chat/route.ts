import { NextRequest, NextResponse } from 'next/server';
import { searchHistoricalCases, getEquipmentById, getHindsightMemories } from '@/lib/db/store';
import { generateDiagnosticAssistance } from '@/lib/ai/gemini';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, equipmentId, imageBase64, imageMimeType } = body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json(
        { error: 'Technician problem statement or symptoms query is required.' },
        { status: 400 }
      );
    }

    const trimmedQuery = message.trim();

    // 1. Retrieve equipment if explicitly passed or detected
    let equipment = equipmentId ? await getEquipmentById(equipmentId) : null;

    // 2. Search persistent maintenance memory using hybrid semantic + structured matching
    const retrievedCases = await searchHistoricalCases({
      query: trimmedQuery,
      equipmentId: equipment?.id,
      limit: 4,
    });

    // If query mentioned an equipment code that matched a case, use that equipment
    if (!equipment && retrievedCases.length > 0) {
      equipment = await getEquipmentById(retrievedCases[0].equipment_code);
    }

    // 3. Retrieve relevant hindsight reflections
    const hindsightMemories = await getHindsightMemories(equipment?.id);

    // 4. Send problem + retrieved historical memory to Gemini with strict grounding
    const aiResponseText = await generateDiagnosticAssistance({
      userPrompt: trimmedQuery,
      equipment,
      historicalCases: retrievedCases,
      hindsightMemories: hindsightMemories.slice(0, 3),
      imageBase64,
      imageMimeType,
    });

    return NextResponse.json({
      response: aiResponseText,
      similarCases: retrievedCases,
      equipment,
      groundedCaseCount: retrievedCases.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error in /api/ai/chat:', error);
    return NextResponse.json(
      {
        error: 'Unable to retrieve maintenance memory. Please try again.',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
