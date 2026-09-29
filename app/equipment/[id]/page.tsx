'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';
import {
  Wrench,
  History,
  AlertTriangle,
  Clock,
  PlusCircle,
  Cpu,
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  ShieldAlert,
  BrainCircuit,
  Sparkles,
  Calendar,
  MapPin,
  Tag,
} from 'lucide-react';
import { Equipment, MaintenanceCase, HindsightMemory } from '@/types';
import FloatingAssistantDrawer from '@/components/assistant/FloatingAssistantDrawer';

export default function EquipmentDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const [equipment, setEquipment] = useState<Equipment | null>(null);
  const [cases, setCases] = useState<MaintenanceCase[]>([]);
  const [hindsight, setHindsight] = useState<HindsightMemory[]>([]);
  const [recurringFailures, setRecurringFailures] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [chatDrawerOpen, setChatDrawerOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);

    fetch(`/api/equipment/${id}/history`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load equipment history');
        return res.json();
      })
      .then((data) => {
        setEquipment(data.equipment);
        setCases(data.cases || []);
        setHindsight(data.hindsight || []);
        setRecurringFailures(data.recurringFailures || []);
      })
      .catch((err) => {
        setErrorMsg(err.message || 'Error loading equipment history');
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <AppLayout>
        <div className="py-20 text-center text-slate-500">
          <div className="inline-block w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-sm font-medium">Loading equipment history & memory bank...</p>
        </div>
      </AppLayout>
    );
  }

  if (errorMsg || !equipment) {
    return (
      <AppLayout>
        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center space-y-4 max-w-lg mx-auto mt-10">
          <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto" />
          <h2 className="text-base font-bold text-slate-900">Equipment Record Not Found</h2>
          <p className="text-xs text-slate-500">The requested equipment ID could not be loaded.</p>
          <Link
            href="/equipment"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Fleet</span>
          </Link>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/equipment"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Equipment Fleet</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setChatDrawerOpen(true)}
              className="px-3.5 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Ask AI About {equipment.equipment_code}</span>
            </button>

            <Link
              href={`/maintenance/new?equipmentId=${equipment.id}`}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Record New Repair</span>
            </Link>
          </div>
        </div>

        {/* Equipment Header Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <div className="flex items-center space-x-2.5 mb-1.5">
                <span className="font-mono text-sm font-extrabold bg-slate-900 text-white px-2.5 py-0.5 rounded shadow-sm">
                  {equipment.equipment_code}
                </span>
                <span
                  className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                    equipment.status === 'Operational'
                      ? 'bg-emerald-100 text-emerald-800'
                      : equipment.status === 'Fault Reported'
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {equipment.status}
                </span>
                {equipment.recurring_fault && (
                  <span className="text-xs bg-amber-50 text-amber-900 border border-amber-300 px-2 py-0.5 rounded font-semibold flex items-center gap-1">
                    <ShieldAlert className="w-3 h-3 text-amber-600" />
                    Recurring Fault Flagged
                  </span>
                )}
              </div>

              <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
                {equipment.name}
              </h1>
              <p className="text-xs md:text-sm text-slate-500 mt-1 max-w-2xl">
                {equipment.description || `${equipment.equipment_type} manufactured by ${equipment.manufacturer}.`}
              </p>
            </div>

            {/* Top Quick Stats */}
            <div className="flex items-center gap-4 bg-slate-50 border border-slate-200 p-3 rounded-xl font-mono text-xs">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Recorded Cases</span>
                <span className="text-base font-extrabold text-blue-700">{cases.length}</span>
              </div>
              <div className="border-l border-slate-200 pl-4">
                <span className="text-slate-500 block text-[10px] uppercase">Hindsight Memories</span>
                <span className="text-base font-extrabold text-purple-700">{hindsight.length}</span>
              </div>
            </div>
          </div>

          {/* Machine Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 text-xs">
            <div>
              <span className="text-slate-400 block text-[11px]">Equipment Type</span>
              <span className="font-semibold text-slate-800">{equipment.equipment_type}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Manufacturer & Model</span>
              <span className="font-semibold text-slate-800">
                {equipment.manufacturer} {equipment.model}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Plant Location</span>
              <span className="font-semibold text-slate-800">{equipment.location}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Installation Date</span>
              <span className="font-semibold text-slate-800">
                {equipment.installation_date || 'Standard Commissioning'}
              </span>
            </div>
          </div>
        </div>

        {/* Recurring Problems Analysis */}
        {recurringFailures.length > 0 && (
          <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ShieldAlert className="w-5 h-5 text-amber-700" />
                <h3 className="font-bold text-sm text-amber-950">
                  Recurring Failure Pattern Detected
                </h3>
              </div>
              <span className="text-[10px] font-bold bg-amber-200 text-amber-900 px-2 py-0.5 rounded">
                Statistical Alert
              </span>
            </div>

            {recurringFailures.map((rf, idx) => (
              <div key={idx} className="bg-white/90 border border-amber-200 rounded-lg p-3.5 text-xs space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-900">
                    Symptom: <span className="font-normal text-slate-700 capitalize">{rf.symptom}</span>
                  </span>
                  <span className="bg-amber-100 text-amber-900 font-mono font-bold px-2 py-0.5 rounded text-[10px]">
                    {rf.occurrences} historical occurrences
                  </span>
                </div>
                {rf.previousRootCauses && rf.previousRootCauses.length > 0 && (
                  <div className="text-[11px] text-slate-600">
                    <span className="font-semibold text-slate-800">Previous Verified Root Causes: </span>
                    {rf.previousRootCauses.join('; ')}
                  </div>
                )}
              </div>
            ))}

            <p className="text-[11px] text-amber-800 italic">
              * Note: Do not assume that the current failure has the same root cause. Always test operating conditions safely.
            </p>
          </div>
        )}

        {/* Persistent Hindsight Reflections */}
        {hindsight.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-3">
            <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
              <BrainCircuit className="w-5 h-5 text-purple-600" />
              <h3 className="font-bold text-sm text-slate-900">
                Persistent Organizational Hindsight Reflections ({hindsight.length})
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {hindsight.map((h) => (
                <div
                  key={h.id}
                  className="bg-purple-50/50 border border-purple-200/80 rounded-lg p-3.5 text-xs space-y-2"
                >
                  <div className="flex justify-between items-center text-[10px] text-purple-800">
                    <span className="font-bold uppercase tracking-wider">Technician Lesson</span>
                    <span className="font-mono">{new Date(h.created_at).toLocaleDateString()}</span>
                  </div>
                  <p className="font-mono text-slate-800 text-[11px] leading-relaxed">
                    {h.hindsight_reflection}
                  </p>
                  <div className="pt-1.5 border-t border-purple-200/50 flex justify-between text-[10px] text-slate-500">
                    <span>Fix: {h.repair_action.slice(0, 40)}...</span>
                    <span className="font-medium text-slate-700">{h.technician_name}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Chronological Maintenance History Timeline */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-base text-slate-900">Chronological Maintenance History</h3>
              <p className="text-xs text-slate-500">
                Full chronological failure timeline and repair outcomes for {equipment.equipment_code}
              </p>
            </div>
            <span className="text-xs font-mono text-slate-400">{cases.length} records</span>
          </div>

          {cases.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500 space-y-2">
              <p>No maintenance experiences recorded yet for this equipment.</p>
              <Link
                href={`/maintenance/new?equipmentId=${equipment.id}`}
                className="text-blue-600 hover:underline font-semibold"
              >
                Log the first repair case →
              </Link>
            </div>
          ) : (
            <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {cases.map((cs, idx) => (
                <div key={cs.id} className="relative group">
                  {/* Timeline circle icon */}
                  <div className="absolute -left-[27px] top-1.5 w-3.5 h-3.5 rounded-full bg-blue-600 border-2 border-white shadow-sm" />

                  <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-4 hover:bg-slate-50 hover:border-blue-400 transition-all">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                      <div>
                        <span className="text-[10px] font-mono text-slate-500 block">
                          Failure Date: {new Date(cs.failure_date).toLocaleDateString()}
                        </span>
                        <h4 className="font-extrabold text-sm text-slate-900 mt-0.5">
                          {cs.diagnosis}
                        </h4>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          {cs.outcome.slice(0, 24)}
                        </span>
                        <span className="font-mono text-[10px] text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                          {cs.downtime_hours}h downtime
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-600 mb-3">
                      <p>
                        <strong className="text-slate-800">Reported Symptoms:</strong> {cs.symptoms}
                      </p>
                      {cs.root_cause && (
                        <p>
                          <strong className="text-slate-800">Root Cause:</strong> {cs.root_cause}
                        </p>
                      )}
                      <p>
                        <strong className="text-slate-800">Repair Action:</strong> {cs.repair_action}
                      </p>
                      {cs.components_replaced && (
                        <p>
                          <strong className="text-slate-800">Parts Replaced:</strong> {cs.components_replaced}
                        </p>
                      )}
                      {cs.technician_notes && (
                        <p className="italic text-slate-500 font-mono text-[11px]">
                          Note: "{cs.technician_notes}"
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-end">
                      <Link
                        href={`/maintenance/${cs.id}`}
                        className="text-blue-600 hover:text-blue-800 text-xs font-semibold inline-flex items-center gap-1"
                      >
                        <span>View Complete Case Record</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Floating AI chat drawer pre-scoped to this machine */}
      <FloatingAssistantDrawer
        isOpen={chatDrawerOpen}
        onClose={() => setChatDrawerOpen(false)}
        defaultEquipmentCode={equipment.equipment_code}
      />
    </AppLayout>
  );
}
