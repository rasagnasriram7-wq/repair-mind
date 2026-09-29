'use client';

import React, { useState } from 'react';
import { X, Sparkles, CheckCircle2, AlertTriangle, ArrowRight, BrainCircuit } from 'lucide-react';
import { Equipment } from '@/types';

interface HindsightCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  equipment: Equipment;
  symptoms: string;
  onSaved?: (reflection: string) => void;
}

export default function HindsightCaptureModal({
  isOpen,
  onClose,
  equipment,
  symptoms,
  onSaved,
}: HindsightCaptureModalProps) {
  const [initialSuspectedCause, setInitialSuspectedCause] = useState('Component wear / fatigue');
  const [actualRootCause, setActualRootCause] = useState('');
  const [repairAction, setRepairAction] = useState('');
  const [partsReplaced, setPartsReplaced] = useState('');
  const [unexpectedFindings, setUnexpectedFindings] = useState('');
  const [technicianName, setTechnicianName] = useState('Dave Kowalski');

  const [loading, setLoading] = useState(false);
  const [generatedReflection, setGeneratedReflection] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleGenerateAndSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actualRootCause.trim() || !repairAction.trim()) {
      setErrorMsg('Please specify the actual verified root cause and corrective repair action.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/ai/hindsight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          equipmentId: equipment.id,
          symptoms,
          initialSuspectedCause,
          actualRootCause,
          repairAction,
          partsReplaced,
          unexpectedFindings,
          technicianName,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setGeneratedReflection(data.hindsightReflection);
        setSavedSuccess(true);
        if (onSaved) onSaved(data.hindsightReflection);
      } else {
        setErrorMsg(data.error || 'Failed to generate hindsight reflection');
      }
    } catch {
      setErrorMsg('Network error while saving hindsight memory.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-slate-900 to-blue-950 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <BrainCircuit className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base">Hindsight Learning Loop</h3>
              <p className="text-xs text-blue-200">
                Transform this repair into permanent organizational memory
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {savedSuccess && generatedReflection ? (
            <div className="space-y-4 text-center py-4">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-lg">Memory Stored Successfully!</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                  Future technician chats and troubleshooting searches for {equipment.equipment_code} will immediately recall this experience.
                </p>
              </div>

              <div className="text-left bg-blue-50 border border-blue-200 rounded-lg p-3.5 text-xs text-blue-950">
                <span className="font-semibold text-blue-700 block uppercase tracking-wider text-[10px] mb-1">
                  Generated Hindsight Reflection Record:
                </span>
                <p className="font-mono leading-relaxed">{generatedReflection}</p>
              </div>

              <button
                onClick={onClose}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-2 px-4 rounded-lg text-sm shadow transition-all"
              >
                Close & Return to Logs
              </button>
            </div>
          ) : (
            <form onSubmit={handleGenerateAndSave} className="space-y-3.5">
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-slate-800">
                    {equipment.equipment_code} — {equipment.name}
                  </span>
                  <span className="text-slate-500 font-mono text-[11px]">{equipment.location}</span>
                </div>
                <p className="text-slate-600 truncate">
                  <span className="font-medium">Initial Symptoms:</span> {symptoms || 'High vibration & heat'}
                </p>
              </div>

              {errorMsg && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Initial Suspected Cause (What did you think it was first?)
                </label>
                <input
                  type="text"
                  value={initialSuspectedCause}
                  onChange={(e) => setInitialSuspectedCause(e.target.value)}
                  placeholder="e.g., Bearing wear / standard degradation"
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Actual Verified Root Cause <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={actualRootCause}
                  onChange={(e) => setActualRootCause(e.target.value)}
                  placeholder="e.g., Coupling thermal growth misalignment causing radial preload"
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Corrective Repair Action Taken <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={2}
                  value={repairAction}
                  onChange={(e) => setRepairAction(e.target.value)}
                  placeholder="e.g., Replaced drive bearing and laser-aligned coupling to under 0.03mm tolerance."
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Parts Replaced
                  </label>
                  <input
                    type="text"
                    value={partsReplaced}
                    onChange={(e) => setPartsReplaced(e.target.value)}
                    placeholder="e.g., SKF 22216 EK, Viton Seal"
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Technician
                  </label>
                  <input
                    type="text"
                    value={technicianName}
                    onChange={(e) => setTechnicianName(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Unexpected Findings / Advice for Next Technician
                </label>
                <input
                  type="text"
                  value={unexpectedFindings}
                  onChange={(e) => setUnexpectedFindings(e.target.value)}
                  placeholder="e.g., Do not swap bearings without running alignment check at 70C operating temp."
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-sm"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{loading ? 'Synthesizing Reflection...' : 'Store Hindsight Memory'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
