import { GoogleGenerativeAI } from '@google/generative-ai';
import { AISimilarCase, HindsightMemory, Equipment } from '@/types';

const apiKey = process.env.GEMINI_API_KEY || '';
const modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';

export function isGeminiConfigured(): boolean {
  return Boolean(apiKey && apiKey.length > 5 && !apiKey.includes('your-gemini'));
}

export function getGeminiClient(): GoogleGenerativeAI | null {
  if (!isGeminiConfigured()) {
    return null;
  }
  return new GoogleGenerativeAI(apiKey);
}

/**
 * Diagnostic Chat Assistance with strict grounding on historical memory
 */
export async function generateDiagnosticAssistance({
  userPrompt,
  equipment,
  historicalCases,
  hindsightMemories,
  imageBase64,
  imageMimeType,
}: {
  userPrompt: string;
  equipment?: Equipment | null;
  historicalCases: AISimilarCase[];
  hindsightMemories: HindsightMemory[];
  imageBase64?: string;
  imageMimeType?: string;
}): Promise<string> {
  const client = getGeminiClient();

  // If Gemini API is not yet configured, provide a clear, helpful fallback response
  if (!client) {
    let mockContext = '';
    if (historicalCases.length > 0) {
      const top = historicalCases[0];
      mockContext = `
[REPAIR-MIND LOCAL MEMORY AGENT - GEMINI API KEY PENDING CONFIGURATION]

CURRENT PROBLEM
Equipment: ${equipment ? `${equipment.equipment_code} - ${equipment.name}` : 'Industrial Equipment'}
Reported Symptoms: ${userPrompt}

HISTORICAL CASES FOUND
Case #1 (Historical Reference):
Previous symptom: ${top.symptoms}
Previous diagnosis: ${top.diagnosis}
Repair: ${top.repair_action}
Components replaced: ${top.components_replaced || 'Standard consumables'}
Outcome: ${top.outcome}
SIMILARITY: ${top.similarity > 0.8 ? 'High' : 'Moderate'} (${Math.round(top.similarity * 100)}%)

${hindsightMemories.length > 0 ? `PERSISTENT HINDSIGHT LESSON:
${hindsightMemories[0].hindsight_reflection}` : ''}

SUGGESTED CHECKS
1. Inspect the equipment according to documented lockout/tagout (LOTO) protocols.
2. Verify symptoms against historical case #${top.case_id.slice(0, 8)} (${top.diagnosis}).
3. Perform physical vibration/temperature/pressure check before dismantling components.
4. Record actual findings in the Maintenance Log to reinforce organizational memory.

IMPORTANT:
Historical cases are references and do not automatically establish the current root cause. The technician must verify the current equipment condition and follow applicable safety procedures.

(Tip: Add your GEMINI_API_KEY in Settings or .env.local to activate real-time Gemini reasoning and multimodal image analysis.)
`;
    } else {
      mockContext = `
[REPAIR-MIND LOCAL MEMORY AGENT - GEMINI API KEY PENDING CONFIGURATION]

CURRENT PROBLEM
Reported Symptoms: ${userPrompt}

No closely matching historical maintenance case was found in REPAIR-MIND memory.

GENERAL TROUBLESHOOTING GUIDANCE (General Engineering Principles):
1. Verify operating parameters (temperature, pressure, vibration, electrical supply).
2. Check for loose mechanical mountings, foreign debris, or lubrication deficiency.
3. Review equipment operational logs for abrupt load changes prior to the failure.
4. Document the confirmed root cause and repair in REPAIR-MIND to establish historical memory.

IMPORTANT:
Historical cases are references and do not automatically establish the current root cause. Always follow plant safety rules.
`;
    }
    return mockContext.trim();
  }

  // Construct grounded system prompt
  const hasHistoricalCases = historicalCases.length > 0;
  
  const historicalSummary = hasHistoricalCases
    ? historicalCases.map((c, idx) => `
--- HISTORICAL CASE #${idx + 1} ---
Case ID: ${c.case_id}
Equipment: ${c.equipment_code} (${c.equipment_name})
Date: ${new Date(c.failure_date).toLocaleDateString()}
Reported Symptoms: ${c.symptoms}
Actual Diagnosis: ${c.diagnosis}
Identified Root Cause: ${c.root_cause || 'Not specified'}
Repair Action Taken: ${c.repair_action}
Components Replaced: ${c.components_replaced || 'None listed'}
Outcome: ${c.outcome}
Similarity Match: ${Math.round(c.similarity * 100)}%
${c.hindsight_reflection ? `Hindsight Reflection: ${c.hindsight_reflection}` : ''}
`).join('\n')
    : 'NO MATCHING HISTORICAL CASES FOUND IN DATABASE.';

  const hindsightSummary = hindsightMemories.length > 0
    ? hindsightMemories.map((h, i) => `Hindsight Lesson #${i + 1}: ${h.hindsight_reflection}`).join('\n')
    : '';

  const systemPrompt = `
You are REPAIR-MIND, an expert AI Field Technician Memory Agent for recurring industrial equipment failures.
Your goal is to assist field technicians by recalling historical maintenance memories, analyzing symptoms, and suggesting safe, systematic diagnostic checks.

STRICT GROUNDING & ACCURACY RULES:
1. You must NEVER invent, assume, or hallucinate historical maintenance cases.
2. If NO historical cases are found in the provided memory context, you MUST explicitly say:
"No closely matching historical maintenance case was found in REPAIR-MIND memory."
Then, provide general troubleshooting guidance, clearly labeled as:
"GENERAL TROUBLESHOOTING GUIDANCE (General Engineering Principles)".
3. Never claim "The previous technician found X" unless that exact finding exists in the provided historical cases.
4. Clearly separate:
   - HISTORICAL EVIDENCE (what actually happened in previous repairs)
   - SUGGESTED CHECKS (logical steps to test current condition)
   - CURRENT DIAGNOSIS (to be determined by the technician)
5. Never declare that the current fault is confirmed. It is only an inquiry until the technician inspects it.
6. Always end with the safety disclaimer:
"IMPORTANT: Historical cases are references and do not automatically establish the current root cause. The technician must verify the current equipment condition and follow applicable safety procedures."

FORMAT YOUR RESPONSE IN THIS STRUCTURE:
CURRENT PROBLEM
Equipment: [Equipment code and name, if identified]
Reported Symptoms: [Extracted list of reported symptoms]

HISTORICAL CASES FOUND
[If cases exist, list Case #1, Case #2 with Previous symptom, Previous diagnosis, Repair, Components replaced, Outcome, SIMILARITY rating.
If no cases exist, write: "No closely matching historical maintenance case was found in REPAIR-MIND memory."]

${hindsightSummary ? `PERSISTENT HINDSIGHT LESSONS:\n${hindsightSummary}\n` : ''}

SUGGESTED CHECKS
[Step-by-step numbered diagnostic checklist prioritizing safe non-destructive inspection and checking recurring failure causes]

IMPORTANT:
Historical cases are references and do not automatically establish the current root cause. The technician must verify the current equipment condition and follow applicable safety procedures.
`;

  const userContent = `
TECHNICIAN INQUIRY:
"${userPrompt}"

EQUIPMENT IN QUESTION:
${equipment ? `${equipment.equipment_code} - ${equipment.name} (${equipment.equipment_type}, Location: ${equipment.location})` : 'Not explicitly specified by technician'}

RETRIEVED HISTORICAL MAINTENANCE CASES FROM PERSISTENT DATABASE:
${historicalSummary}

${hindsightSummary ? `PERSISTENT ORGANIZATIONAL MEMORIES:\n${hindsightSummary}` : ''}
`;

  try {
    const model = client.getGenerativeModel({ model: modelName });

    if (imageBase64 && imageMimeType) {
      const result = await model.generateContent([
        { text: systemPrompt },
        { text: userContent },
        {
          inlineData: {
            data: imageBase64.replace(/^data:image\/\w+;base64,/, ''),
            mimeType: imageMimeType,
          },
        },
        { text: 'Also examine this field component photograph for visible signs of wear, spalling, discoloration, misalignment, or leakage, and integrate your visual observations into Suggested Checks.' }
      ]);
      return result.response.text();
    }

    const result = await model.generateContent([
      { text: systemPrompt },
      { text: userContent }
    ]);
    return result.response.text();
  } catch (error: any) {
    console.error('Gemini API Error in generateDiagnosticAssistance:', error);
    // Graceful fallback with clear explanation
    return `
CURRENT PROBLEM
Equipment: ${equipment ? `${equipment.equipment_code} - ${equipment.name}` : 'Equipment Under Inspection'}
Reported Symptoms: ${userPrompt}

HISTORICAL CASES FOUND
${hasHistoricalCases ? `Found ${historicalCases.length} relevant historical case(s) in local memory bank.` : 'No closely matching historical maintenance case was found in REPAIR-MIND memory.'}

${hasHistoricalCases ? `Top Match (${historicalCases[0].equipment_code}):
Previous diagnosis: ${historicalCases[0].diagnosis}
Previous repair: ${historicalCases[0].repair_action}
Outcome: ${historicalCases[0].outcome}` : ''}

SUGGESTED CHECKS
1. Inspect drive train, bearings, and alignment using standard vibration analysis.
2. Verify electrical load and mechanical clearance before restarting.
3. Consult the equipment operation manual.

IMPORTANT:
Historical cases are references and do not automatically establish the current root cause. The technician must verify the current equipment condition and follow applicable safety procedures.

(Note: Live Gemini model encountered an issue: ${error.message || 'API service unavailable'}. Historical records were served from persistent database.)
`.trim();
  }
}

/**
 * Automated Hindsight Reflection Generator:
 * Takes the repair delta (initial symptoms & suspected cause vs actual root cause & repair)
 * and generates a high-density, concise lesson learned for organizational memory.
 */
export async function generateHindsightReflection({
  equipmentCode,
  equipmentName,
  symptoms,
  initialSuspectedCause,
  actualRootCause,
  repairAction,
  partsReplaced,
  unexpectedFindings,
}: {
  equipmentCode: string;
  equipmentName: string;
  symptoms: string;
  initialSuspectedCause?: string;
  actualRootCause: string;
  repairAction: string;
  partsReplaced?: string;
  unexpectedFindings?: string;
}): Promise<string> {
  const client = getGeminiClient();

  const prompt = `
You are the REPAIR-MIND Hindsight Learning Engine.
An industrial field technician has just completed a repair on equipment ${equipmentCode} (${equipmentName}).

Repair Delta Information:
- Reported Symptoms: "${symptoms}"
- Initial Suspected Cause: "${initialSuspectedCause || 'Not specified'}"
- Actual Verified Root Cause: "${actualRootCause}"
- Corrective Repair Action: "${repairAction}"
- Parts Replaced: "${partsReplaced || 'None'}"
- Unexpected Findings / What Went Wrong: "${unexpectedFindings || 'None'}"

Generate a single, dense, high-impact "Hindsight Reflection Record" (1-2 sentences maximum).
It must be actionable for the NEXT technician who encounters similar symptoms on this machine.
Example:
"HINDSIGHT REFLECTION: On Pump P-204, vibration is repeatedly triggered by thermal expansion coupling misalignment rather than bearing fatigue. Always check dial-indicator alignment at 70°C before replacing bearings."

Output ONLY the reflection text. No conversational preamble.
`;

  if (!client) {
    // Deterministic fallback generator
    return `HINDSIGHT REFLECTION: On ${equipmentCode} (${equipmentName}), symptoms of "${symptoms.slice(0, 50)}" were verified as ${actualRootCause}. Fixed via ${repairAction.slice(0, 60)}. Always check ${actualRootCause} before replacing components.`;
  }

  try {
    const model = client.getGenerativeModel({ model: modelName });
    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (error) {
    console.error('Error generating hindsight reflection via Gemini:', error);
    return `HINDSIGHT REFLECTION: On ${equipmentCode} (${equipmentName}), symptoms of "${symptoms.slice(0, 50)}" were resolved by addressing ${actualRootCause} via ${repairAction.slice(0, 60)}.`;
  }
}

/**
 * Generate 768-dimensional embedding for pgvector
 */
export async function generateEmbedding(text: string): Promise<number[] | null> {
  const client = getGeminiClient();
  if (!client) {
    return generateFallbackEmbedding(text);
  }

  try {
    const embeddingModel = client.getGenerativeModel({ model: 'text-embedding-004' });
    const result = await embeddingModel.embedContent(text);
    return result.embedding.values;
  } catch (error) {
    console.warn('Gemini embedding generation failed, using fallback vector:', error);
    return generateFallbackEmbedding(text);
  }
}

/**
 * Fallback 768-dim deterministic vector generator based on token hashing & TF-IDF
 * ensures pgvector column constraints are always satisfied even without active API key
 */
function generateFallbackEmbedding(text: string): number[] {
  const vector = new Array(768).fill(0);
  const words = text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(Boolean);
  
  if (words.length === 0) return vector;

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    let hash = 0;
    for (let j = 0; j < word.length; j++) {
      hash = (hash << 5) - hash + word.charCodeAt(j);
      hash |= 0;
    }
    const index = Math.abs(hash) % 768;
    vector[index] += 1.0;
  }

  // Normalize
  const norm = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
  if (norm > 0) {
    for (let i = 0; i < 768; i++) {
      vector[i] = vector[i] / norm;
    }
  }

  return vector;
}
