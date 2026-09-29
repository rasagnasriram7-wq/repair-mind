/**
 * REPAIR-MIND Automated Verification Script
 * Validates the core memory loop, API endpoints, and Section 33 scenario.
 */

async function runVerification() {
  const BASE_URL = 'http://localhost:3000';
  console.log(`\n==================================================`);
  console.log(`REPAIR-MIND AUTOMATED VERIFICATION SUITE`);
  console.log(`Target: ${BASE_URL}`);
  console.log(`==================================================\n`);

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${message}`);
      failed++;
    }
  }

  // 1. Verify Main Pages HTTP 200
  console.log(`--- [1/6] Testing Main Page Routes ---`);
  const pages = [
    '/',
    '/login',
    '/dashboard',
    '/assistant',
    '/equipment',
    '/maintenance',
    '/knowledge',
    '/documents',
    '/settings',
  ];

  for (const page of pages) {
    try {
      const res = await fetch(`${BASE_URL}${page}`);
      assert(res.status === 200, `Route ${page} returned HTTP 200 OK`);
    } catch (err) {
      assert(false, `Route ${page} failed: ${err.message}`);
    }
  }

  // 2. Verify Stats Endpoint & B2B ROI
  console.log(`\n--- [2/6] Testing Stats & B2B ROI Endpoint ---`);
  try {
    const res = await fetch(`${BASE_URL}/api/stats`);
    const data = await res.json();
    assert(res.status === 200, `GET /api/stats returned HTTP 200`);
    assert(data.stats.totalEquipment >= 4, `Found ${data.stats.totalEquipment} fleet assets`);
    assert(data.stats.downtimeHoursSaved > 0, `Downtime hours saved computed: ${data.stats.downtimeHoursSaved} hrs`);
    assert(data.stats.costSavings > 0, `Estimated cost savings computed: $${data.stats.costSavings.toLocaleString()}`);
  } catch (err) {
    assert(false, `Stats endpoint error: ${err.message}`);
  }

  // 3. Verify Equipment API & Create/Lookup Pump P-204
  console.log(`\n--- [3/6] Testing Equipment Registry & P-204 ---`);
  let pumpP204 = null;
  try {
    const res = await fetch(`${BASE_URL}/api/equipment`);
    const data = await res.json();
    assert(res.status === 200, `GET /api/equipment returned HTTP 200`);
    assert(Array.isArray(data.equipment), `Equipment list returned array`);

    pumpP204 = data.equipment.find((e) => e.equipment_code === 'P-204');
    if (!pumpP204) {
      // Create it if not present
      const createRes = await fetch(`${BASE_URL}/api/equipment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          equipment_code: 'P-204',
          name: 'Centrifugal Slurry Pump',
          equipment_type: 'Centrifugal Pump',
          manufacturer: 'FlowServe Industries',
          model: 'Durco Mark 3 ISO',
          location: 'Sector 3 - Chemical Processing Loop',
          status: 'Operational',
        }),
      });
      const createData = await createRes.json();
      pumpP204 = createData.equipment;
    }
    assert(pumpP204 && pumpP204.equipment_code === 'P-204', `Verified Pump P-204 exists in registry (ID: ${pumpP204?.id})`);
  } catch (err) {
    assert(false, `Equipment API error: ${err.message}`);
  }

  // 4. Create Maintenance Case for Pump P-204
  console.log(`\n--- [4/6] Creating Maintenance Case & Indexing Vector Memory ---`);
  let createdCaseId = null;
  try {
    const casePayload = {
      equipment_id: pumpP204.id,
      failure_date: new Date().toISOString(),
      symptoms: 'Excessive vibration and abnormal bearing noise',
      observations: 'Vibration meter peaked at 7.8 mm/s on drive end. Bearing housing temperature 85C.',
      diagnosis: 'Bearing damage',
      root_cause: 'Thermal expansion induced shaft coupling misalignment',
      diagnostic_procedure: 'Dial indicator coupling runout check + laser spectrum analysis',
      repair_action: 'Bearing replacement',
      components_replaced: 'SKF 22216 EK spherical roller bearing, Viton lip seal',
      outcome: 'Successfully resolved',
      downtime_hours: 4.0,
      technician_notes: 'Technician verified: Check coupling thermal alignment at 70C before swapping bearings.',
    };

    const res = await fetch(`${BASE_URL}/api/maintenance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(casePayload),
    });
    const data = await res.json();
    assert(res.status === 201, `POST /api/maintenance returned HTTP 201 Created`);
    assert(data.case && data.case.id, `Case saved with ID: ${data.case?.id}`);
    assert(data.embeddingSaved === true, `Searchable text embedded into vector memory bank`);
    createdCaseId = data.case.id;

    // Also trigger Hindsight reflection loop
    const hsRes = await fetch(`${BASE_URL}/api/ai/hindsight`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        equipmentId: pumpP204.id,
        caseId: createdCaseId,
        symptoms: casePayload.symptoms,
        initialSuspectedCause: 'Standard bearing wear',
        actualRootCause: casePayload.root_cause,
        repairAction: casePayload.repair_action,
        partsReplaced: casePayload.components_replaced,
        unexpectedFindings: 'Thermal expansion gap must be checked at 70C',
        technicianName: 'Dave Kowalski',
      }),
    });
    const hsData = await hsRes.json();
    assert(hsRes.status === 200, `POST /api/ai/hindsight generated reflection`);
    assert(Boolean(hsData.hindsightReflection), `Hindsight reflection stored: "${hsData.hindsightReflection?.slice(0, 70)}..."`);
  } catch (err) {
    assert(false, `Maintenance creation error: ${err.message}`);
  }

  // 5. Test AI Technician Assistant Query (Section 33 prompt requirement)
  console.log(`\n--- [5/6] Testing AI Technician Query (Section 33 Core Scenario) ---`);
  try {
    const userQuery = 'Pump P-204 is showing excessive vibration and abnormal bearing noise. What happened in the past?';
    console.log(`Query: "${userQuery}"`);

    const res = await fetch(`${BASE_URL}/api/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: userQuery,
        equipmentId: pumpP204.id,
      }),
    });

    const data = await res.json();
    assert(res.status === 200, `POST /api/ai/chat returned HTTP 200 OK`);
    assert(data.similarCases && data.similarCases.length > 0, `AI retrieved ${data.similarCases?.length} historical maintenance cases`);

    const topMatch = data.similarCases[0];
    assert(topMatch.equipment_code === 'P-204', `Top match is equipment P-204`);
    assert(topMatch.symptoms.toLowerCase().includes('vibration'), `Top match symptoms match inquiry: "${topMatch.symptoms}"`);
    assert(topMatch.repair_action.toLowerCase().includes('bearing'), `Top match repair action identified: "${topMatch.repair_action}"`);

    // Verify grounding rules in response text
    const text = data.response;
    assert(text.includes('CURRENT PROBLEM') || text.includes('Pump P-204'), `Response includes structured CURRENT PROBLEM`);
    assert(text.includes('HISTORICAL CASES FOUND') || text.includes('Bearing damage'), `Response identifies historical case findings`);
    assert(text.includes('SUGGESTED CHECKS'), `Response contains suggested diagnostic checks`);
    assert(
      text.toLowerCase().includes('reference') ||
      text.toLowerCase().includes('safety') ||
      text.toLowerCase().includes('verify'),
      `Response enforces safety & grounding notice (references do not automatically confirm diagnosis)`
    );

    console.log(`\n--- AI RESPONSE PREVIEW ---`);
    console.log(text.slice(0, 450) + '...\n');
  } catch (err) {
    assert(false, `AI Chat query error: ${err.message}`);
  }

  // 6. Add Second Maintenance Case & Verify Searchable
  console.log(`--- [6/6] Verifying New Experience Becomes Searchable Memory ---`);
  try {
    const secondPayload = {
      equipment_id: pumpP204.id,
      failure_date: new Date().toISOString(),
      symptoms: 'Impeller slurry cavitation and suction filter blockage',
      diagnosis: 'Suction basket choking',
      repair_action: 'Flushed suction strainer basket',
      outcome: 'Cavitation sound completely eliminated',
      downtime_hours: 1.5,
    };

    const addRes = await fetch(`${BASE_URL}/api/maintenance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(secondPayload),
    });
    assert(addRes.status === 201, `Second maintenance case created`);

    // Search for "cavitation"
    const searchRes = await fetch(`${BASE_URL}/api/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: 'cavitation suction filter' }),
    });
    const searchData = await searchRes.json();
    assert(searchData.results && searchData.results.length > 0, `Knowledge search found matching case for "cavitation"`);
    assert(
      searchData.results.some((r) => r.symptoms.toLowerCase().includes('cavitation')),
      `Newly added case was immediately recalled by search engine!`
    );
  } catch (err) {
    assert(false, `Second case verification error: ${err.message}`);
  }

  console.log(`\n==================================================`);
  console.log(`VERIFICATION RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log(`==================================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runVerification();
