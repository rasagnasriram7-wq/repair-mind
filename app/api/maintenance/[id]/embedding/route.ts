import { NextRequest, NextResponse } from 'next/server';
import { getMaintenanceCaseById } from '@/lib/db/store';
import { generateEmbedding } from '@/lib/ai/gemini';
import { getSupabaseServerClient } from '@/lib/supabase/server';

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const caseItem = await getMaintenanceCaseById(params.id);
    if (!caseItem) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 });
    }

    const textToEmbed = `
Equipment: ${caseItem.equipment_code}
Symptoms: ${caseItem.symptoms}
Diagnosis: ${caseItem.diagnosis}
Root Cause: ${caseItem.root_cause || ''}
Repair Action: ${caseItem.repair_action}
Components Replaced: ${caseItem.components_replaced || ''}
Outcome: ${caseItem.outcome}
`.trim();

    const embedding = await generateEmbedding(textToEmbed);

    const supabase = getSupabaseServerClient();
    if (supabase && embedding) {
      // Upsert into maintenance_embeddings
      await supabase
        .from('maintenance_embeddings')
        .upsert({
          case_id: caseItem.id,
          content: textToEmbed,
          embedding,
        });
    }

    return NextResponse.json({
      success: true,
      message: 'Embedding generated and synchronized successfully.',
      hasVector: Boolean(embedding),
    });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to generate embedding', details: error.message }, { status: 500 });
  }
}
