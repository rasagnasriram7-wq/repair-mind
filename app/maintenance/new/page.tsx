'use client';

import React, { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';
import {
  FileText,
  Save,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  ArrowLeft,
} from 'lucide-react';
import { Equipment } from '@/types';
import HindsightCaptureModal from '@/components/maintenance/HindsightCaptureModal';

function MaintenanceForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultEqId = searchParams.get('equipmentId') || '';

  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
  const [selectedEqId, setSelectedEqId] = useState(defaultEqId);
  const [failureDate, setFailureDate] = useState(
    new Date().toISOString().slice(0, 16)
  );
  const [symptoms, setSymptoms] = useState('');
  const [observations, setObservations] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [rootCause, setRootCause] = useState('');
  const [diagnosticProcedure, setDiagnosticProcedure] = useState('');
  const [repairAction, setRepairAction] = useState('');
  const [componentsReplaced, setComponentsReplaced] = useState('');
  const [outcome, setOutcome] = useState('Successfully resolved');
  const [downtimeHours, setDowntimeHours] = useState('2.5');
  const [technicianNotes, setTechnicianNotes] = useState('');

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successInfo, setSuccessInfo] = useState<string | null>(null);

  // Hindsight Learning Modal Trigger
  const [hindsightModalOpen, setHindsightModalOpen] = useState(false);
  const [savedCaseId, setSavedCaseId] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/equipment')
      .then((res) => res.json())
      .then((data) => {
        if (data.equipment) {
          setEquipmentList(data.equipment);
          if (!selectedEqId && data.equipment.length > 0) {
            setSelectedEqId(data.equipment[0].id);
          }
        }
      })
      .catch((err) => console.error('Failed to load equipment:', err));
  }, [selectedEqId]);

  const handlePreFillPumpP204Scenario = () => {
    const pump = equipmentList.find((e) => e.equipment_code === 'P-204');
    if (pump) setSelectedEqId(pump.id);
    setSymptoms('Excessive vibration and abnormal high-pitched bearing noise');
    setObservations('Vibration reached 7.8 mm/s on drive end. Bearing housing temperature 85C.');
    setDiagnosis('Bearing damage');
    setRootCause('Thermal expansion shaft coupling misalignment causing excessive radial preload');
    setDiagnosticProcedure('Laser vibration spectrum + dial indicator coupling runout check');
    setRepairAction('Bearing replacement');
    setComponentsReplaced('SKF 22216 EK spherical roller bearing, Viton lip seal');
    setOutcome('Successfully resolved');
    setDowntimeHours('4.0');
    setTechnicianNotes('Always verify dial alignment when pump warms up to 70C operating temp.');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEqId) {
      setErrorMsg('Please select an equipment.');
      return;
    }
    if (!symptoms.trim() || !diagnosis.trim() || !repairAction.trim() || !outcome.trim()) {
      setErrorMsg('Symptoms, Diagnosis, Repair Action, and Outcome are required.');
      return;
    }

    setSaving(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          equipment_id: selectedEqId,
          failure_date: failureDate,
          symptoms: symptoms.trim(),
          observations: observations.trim(),
          diagnosis: diagnosis.trim(),
          root_cause: rootCause.trim(),
          diagnostic_procedure: diagnosticProcedure.trim(),
          repair_action: repairAction.trim(),
          components_replaced: componentsReplaced.trim(),
          outcome: outcome.trim(),
          downtime_hours: parseFloat(downtimeHours) || 0,
          technician_notes: technicianNotes.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setSavedCaseId(data.case.id);
        setSuccessInfo(data.message || 'Maintenance case saved and indexed into vector memory!');
        setHindsightModalOpen(true);
      } else {
        setErrorMsg(data.error || 'Failed to save maintenance case.');
      }
    } catch {
      setErrorMsg('Network error while saving case.');
    } finally {
      setSaving(false);
    }
  };

  const selectedEquipment = equipmentList.find((e) => e.id === selectedEqId);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Navigation & Scenario Pre-filler */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Link
          href="/maintenance"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Cancel & Back to Logs</span>
        </Link>

        <button
          type="button"
          onClick={handlePreFillPumpP204Scenario}
          className="self-start sm:self-auto px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
        >
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          <span>Auto-fill Verification Scenario (Pump P-204)</span>
        </button>
      </div>

      {/* Form Container */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
        <div className="p-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base md:text-lg font-bold">Record Maintenance Case</h1>
              <p className="text-xs text-slate-400">
                Store symptoms, verified root cause, and make this fix searchable to all future technicians
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs md:text-sm">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successInfo && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successInfo}</span>
            </div>
          )}

          {/* Row 1: Equipment & Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Equipment Asset <span className="text-rose-500">*</span>
              </label>
              <select
                required
                value={selectedEqId}
                onChange={(e) => setSelectedEqId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">Select Equipment...</option>
                {equipmentList.map((eq) => (
                  <option key={eq.id} value={eq.id}>
                    {eq.equipment_code} — {eq.name} ({eq.location})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Failure Date & Time <span className="text-rose-500">*</span>
              </label>
              <input
                type="datetime-local"
                required
                value={failureDate}
                onChange={(e) => setFailureDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>
          </div>

          {/* Row 2: Symptoms */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Reported Failure Symptoms <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={2}
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder="e.g., Excessive vibration and abnormal bearing noise audible from drive end."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
            />
            <span className="text-[11px] text-slate-400 mt-0.5 block">
              Describe noises, vibration readings, abnormal gauge spikes, leaks, or trips.
            </span>
          </div>

          {/* Row 3: Observations */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Physical Observations & Measurements
            </label>
            <textarea
              rows={2}
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              placeholder="e.g., Vibration meter recorded 7.8 mm/s RMS on drive end bearing housing. Temperature exceeded 85C."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>

          {/* Row 4: Diagnosis & Root Cause */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Actual Diagnosis <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                placeholder="e.g., Bearing damage / spalling on drive-end outer race"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Root Cause Mechanism
              </label>
              <input
                type="text"
                value={rootCause}
                onChange={(e) => setRootCause(e.target.value)}
                placeholder="e.g., Thermal expansion shaft coupling misalignment causing radial overload"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>
          </div>

          {/* Row 5: Diagnostic Procedure */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Diagnostic Procedure Followed
            </label>
            <input
              type="text"
              value={diagnosticProcedure}
              onChange={(e) => setDiagnosticProcedure(e.target.value)}
              placeholder="e.g., 1. Vibration spectrum. 2. Dial indicator check on coupling. 3. Grease particle test."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>

          {/* Row 6: Repair Action & Components Replaced */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Corrective Repair Action <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                rows={2}
                value={repairAction}
                onChange={(e) => setRepairAction(e.target.value)}
                placeholder="e.g., Bearing replacement. Realigned coupling to under 0.03mm tolerance."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Components / Parts Replaced
              </label>
              <textarea
                rows={2}
                value={componentsReplaced}
                onChange={(e) => setComponentsReplaced(e.target.value)}
                placeholder="e.g., SKF 22216 EK bearing, Viton lip seal, ISO VG 220 synthetic oil"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>
          </div>

          {/* Row 7: Outcome & Downtime */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Repair Outcome <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={outcome}
                onChange={(e) => setOutcome(e.target.value)}
                placeholder="e.g., Successfully resolved. Vibration returned to normal 1.4 mm/s."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Downtime (Hours)
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                value={downtimeHours}
                onChange={(e) => setDowntimeHours(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>
          </div>

          {/* Row 8: Technician Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Technician Notes / Advice for Next Tech
            </label>
            <textarea
              rows={2}
              value={technicianNotes}
              onChange={(e) => setTechnicianNotes(e.target.value)}
              placeholder="e.g., Note for next time: Do NOT just replace bearing without checking thermal growth alignment at 70C."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <Link
              href="/maintenance"
              className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg text-xs font-semibold"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg text-xs font-bold flex items-center gap-2 shadow-sm transition-all"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Indexing Vector Memory...' : 'Save Case to Memory'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Post-Repair Hindsight Capture Learning Loop Modal */}
      {selectedEquipment && (
        <HindsightCaptureModal
          isOpen={hindsightModalOpen}
          onClose={() => {
            setHindsightModalOpen(false);
            router.push('/maintenance');
          }}
          equipment={selectedEquipment}
          symptoms={symptoms}
          onSaved={() => {
            // Memory saved!
          }}
        />
      )}
    </div>
  );
}

export default function NewMaintenanceCasePage() {
  return (
    <AppLayout>
      <Suspense fallback={
        <div className="py-20 text-center text-slate-500">
          <div className="inline-block w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-sm">Loading case form...</p>
        </div>
      }>
        <MaintenanceForm />
      </Suspense>
    </AppLayout>
  );
}
