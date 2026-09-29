-- ====================================================================
-- REPAIR-MIND Seed Data (Demonstration & Verification Data)
-- ====================================================================

-- 1. Insert Equipment
INSERT INTO public.equipment (id, equipment_code, name, equipment_type, manufacturer, model, location, installation_date, status, description, recurring_fault, memory_count)
VALUES
  (
    'e1111111-1111-1111-1111-111111111111',
    'P-204',
    'Centrifugal Slurry Pump',
    'Centrifugal Pump',
    'FlowServe Industries',
    'Durco Mark 3 ISO',
    'Sector 3 - Chemical Processing Loop',
    '2022-03-15',
    'Fault Reported',
    'Heavy-duty industrial centrifugal slurry pump serving the primary reactor cooling line. High recurring thermal and mechanical load.',
    TRUE,
    4
  ),
  (
    'e2222222-2222-2222-2222-222222222222',
    'M-102',
    'Primary Drive Induction Motor',
    'Induction Motor',
    'Siemens Energy',
    '1LE1001-1DB43 75kW',
    'Line B - Milling Section',
    '2021-08-10',
    'Needs Inspection',
    'Continuous-duty 75kW 3-phase squirrel cage induction motor powering aggregate mill conveyor.',
    FALSE,
    2
  ),
  (
    'e3333333-3333-3333-3333-333333333333',
    'C-301',
    'Plant Instrument Air Compressor',
    'Rotary Screw Compressor',
    'Atlas Copco',
    'GA 90+ VSD',
    'Plant 1 - Central Utilities Building',
    '2020-11-04',
    'Operational',
    'Oil-injected rotary screw air compressor providing 8.5 bar dry instrument air across facility.',
    FALSE,
    3
  ),
  (
    'e4444444-4444-4444-4444-444444444444',
    'G-110',
    'Emergency Standby Generator',
    'Diesel Generator',
    'Caterpillar',
    'CAT C15 500kVA',
    'Powerhouse East - Standby Enclosure',
    '2019-06-20',
    'Operational',
    'Critical emergency backup generator for plant automation and safety shutdown instrumentation.',
    FALSE,
    1
  )
ON CONFLICT (equipment_code) DO NOTHING;

-- 2. Insert Historical Maintenance Cases
INSERT INTO public.maintenance_cases (
  id,
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
  technician_notes
)
VALUES
  (
    'c1111111-1111-1111-1111-111111111111',
    'e1111111-1111-1111-1111-111111111111',
    NOW() - INTERVAL '45 days',
    'Excessive vibration and abnormal high-pitched bearing noise audible from drive end.',
    'Vibration meter recorded 7.8 mm/s RMS on drive end bearing housing. Temperature exceeded 85°C. Oil seal showed slight weeping.',
    'Bearing fatigue and spalling on drive-end outer race.',
    'Thermal expansion induced shaft coupling misalignment causing radial overload on drive bearing.',
    '1. Took laser vibration spectrum. 2. Dial indicator check on drive coupling showed 0.15mm angular runout. 3. Inspected bearing grease for metallic particle contamination.',
    'Replaced drive end spherical roller bearing. Realigned coupling with dial indicator to under 0.03mm tolerance. Flushed and replenished synthetic ISO VG 220 lubricant.',
    'Drive end bearing (SKF 22216 EK), Viton lip seal, synthetic grease',
    'Vibration dropped to 1.4 mm/s RMS (normal range). Drive temperature stabilized at 54°C.',
    6.5,
    'Note for next time: Do NOT just replace bearing without checking thermal growth alignment when pump reaches 70C operating temp.'
  ),
  (
    'c1111111-1111-1111-1111-111111111112',
    'e1111111-1111-1111-1111-111111111111',
    NOW() - INTERVAL '120 days',
    'Cavitation noise, fluctuating discharge pressure, and seal flush leakage.',
    'Pump sounded like gravel running through casing. Discharge gauge swung between 4.2 bar and 1.8 bar.',
    'Impeller eye erosion and clogged suction strainer leading to low NPSH available.',
    'Upstream slurry batch residue blocked suction filter basket, inducing cavitation.',
    'Inspected suction strainer differential pressure. Removed casing cover to inspect impeller vanes.',
    'Isolated and cleaned suction strainer basket. Polished impeller vane inlet edges. Renewed mechanical seal O-rings.',
    'Mechanical seal face O-rings (Kalrez 6375), Casing gasket',
    'Discharge pressure stabilized at constant 4.8 bar. Cavitation sound completely eliminated.',
    4.0,
    'Technicians should check suction strainer differential pressure before opening casing.'
  ),
  (
    'c2222222-2222-2222-2222-222222222221',
    'e2222222-2222-2222-2222-222222222222',
    NOW() - INTERVAL '30 days',
    'Motor thermal overload trip. Outer stator casing hot to touch (>95°C).',
    'Thermal overload relay tripped twice within 15 minutes of startup. Internal airflow from cooling cowl felt weak.',
    'Severe cooling airflow obstruction caused by heavy airborne dust and fibrous buildup in cooling fins.',
    'Airborne dust and fibrous lint clogged motor fan shroud and cooling fins, preventing heat dissipation.',
    'Checked phase currents (all balanced at 118A, below 135A FLC). Measured temperature with infrared pyrometer (stator 98°C, fan cowl 35°C).',
    'De-energized and locked out. Removed fan cowl. Cleaned cooling fins with compressed dry air and industrial degreaser. Tested thermal switch.',
    'Cooling cowl plastic clip, terminal box gasket',
    'Motor restarted under full 75kW load. Operating temperature stabilized at 62°C.',
    2.5,
    'Electrical current was normal; fault was 100% aerodynamic cooling restriction. No motor rewinding needed.'
  ),
  (
    'c3333333-3333-3333-3333-333333333331',
    'e3333333-3333-3333-3333-333333333333',
    NOW() - INTERVAL '70 days',
    'Rapid pressure drops during peak plant demand; compressor unloading cycle too frequent.',
    'Compressor cycling between loaded and unloaded every 18 seconds. High pressure differential across separator.',
    'Oil separator element saturated and inlet modulation valve sticking.',
    'Air-oil separator element reached particulate saturation threshold; valve linkage had dirt contamination.',
    'Checked differential pressure gauge (read 1.4 bar drop across separator, limit is 0.8 bar). Tested modulation actuator response.',
    'Replaced air-oil separator cartridge and pre-filter elements. Cleaned and lubricated modulation valve solenoid plunger.',
    'Air/oil separator cartridge (Atlas Copco 1622087100), Inline oil filter, Intake air filter',
    'Differential pressure returned to 0.25 bar. Load/unload cycles normalized to 4-minute intervals.',
    3.5,
    'Scheduled replacement intervals should be tightened to 3,000 hrs during dusty summer season.'
  )
ON CONFLICT (id) DO NOTHING;

-- 3. Insert Persistent Hindsight Memories
INSERT INTO public.hindsight_memories (
  id,
  equipment_id,
  case_id,
  reported_symptom,
  initial_suspected_cause,
  actual_root_cause,
  repair_action,
  parts_replaced,
  hindsight_reflection,
  technician_name
)
VALUES
  (
    'h1111111-1111-1111-1111-111111111111',
    'e1111111-1111-1111-1111-111111111111',
    'c1111111-1111-1111-1111-111111111111',
    'Excessive vibration and abnormal high-pitched bearing noise on Pump P-204',
    'Standard bearing grease degradation',
    'Coupling thermal growth misalignment causing radial preload on drive bearing',
    'Replaced drive bearing (SKF 22216 EK) and laser-aligned coupling to 0.03mm',
    'SKF 22216 EK, Viton lip seal',
    'HINDSIGHT MEMORY: On Pump P-204, vibration and bearing noise is repeatedly triggered by thermal growth misalignment between pump and motor. Do NOT merely replace bearings without performing dial-indicator or laser alignment checks at operating temperature.',
    'Dave Kowalski (Sr. Mechanical Tech)'
  ),
  (
    'h1111111-1111-1111-1111-111111111112',
    'e1111111-1111-1111-1111-111111111111',
    'c1111111-1111-1111-1111-111111111112',
    'Gravel noise and suction cavitation on Pump P-204',
    'Impeller cavitation wear',
    'Slurry buildup choking suction strainer basket',
    'Flushed suction strainer basket and inspected impeller vanes',
    'Seal face O-rings',
    'HINDSIGHT MEMORY: When Pump P-204 sounds like gravel/cavitation, check the suction basket differential pressure first. In 90% of cases, cleaning the suction basket resolves it without disassembling the pump casing.',
    'Dave Kowalski (Sr. Mechanical Tech)'
  ),
  (
    'h2222222-2222-2222-2222-222222222221',
    'e2222222-2222-2222-2222-222222222222',
    'c2222222-2222-2222-2222-222222222221',
    'Overheating trip on 75kW Induction Motor M-102',
    'Winding short or internal electrical overload',
    'Cooling cowl and external fins completely clogged with airborne milling lint',
    'Removed cowl and cleared air passages with compressed degreasing dry air',
    'Terminal box gasket',
    'HINDSIGHT MEMORY: Motor M-102 trips are almost always airflow choking from Line B milling lint rather than motor electrical winding faults. Check fin air-gap before calling electrical contractors.',
    'Sarah Chen (Reliability Specialist)'
  )
ON CONFLICT (id) DO NOTHING;
