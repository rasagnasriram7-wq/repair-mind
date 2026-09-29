'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';
import {
  FileText,
  ArrowLeft,
  Calendar,
  Wrench,
  Clock,
  Sparkles,
  CheckCircle2,
  Database,
  Cpu,
  AlertTriangle,
} from 'lucide-react';
import { MaintenanceCase } from '@/types';
import FloatingAssistantDrawer from '@/components/assistant/FloatingAssistantDrawer';

export default function MaintenanceCaseDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const [caseItem, setCaseItem] = useState<MaintenanceCase | null>(null);
  const [loading, setLoading] = useState(true);
  const [reindexing, setReindexing] = useState(false);
  const [reindexMessage, setReindexMessage] = useState<string | null>(null);
  const [chatDrawerOpen, setChatDrawerOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);

    fetch(`/api/maintenance/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error('Maintenance case not found');
        return res.json();
      })
      .then((data) => setCaseItem(data.case))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  const handleReindexEmbedding = async () => {
    if (!id) return;
    setReindexing(true);
    setReindexMessage(null);

    try {
      const res = await fetch(`/api/maintenance/${id}/embedding`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setReindexMessage('pgvector 768-dim semantic embedding synchronized successfully.');
      } else {
        setReindexMessage(data.error || 'Failed to re-index embedding.');
      }
    } catch {
      setReindexMessage('Network error updating embedding.');
    } finally {
      setReindexing(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="py-20 text-center text-slate-500">
          <div className="inline-block w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-sm">Loading maintenance case record...</p>
        </div>
      </AppLayout>
    );
  }

  if (!caseItem) {
    return (
      <AppLayout>
        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center space-y-4 max-w-lg mx-auto mt-10">
          <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto" />
          <h2 className="text-base font-bold text-slate-900">Maintenance Case Not Found</h2>
          <p className="text-xs text-slate-500">The requested record does not exist in memory.</p>
          <Link
            href="/maintenance"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Maintenance Logs</span>
          </Link>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Navigation & Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <Link
            href="/maintenance"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Maintenance Logs</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setChatDrawerOpen(true)}
              className="px-3.5 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Query AI About This Case</span>
            </button>

            <button
              onClick={handleReindexEmbedding}
              disabled={reindexing}
              className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Database className="w-3.5 h-3.5 text-slate-500" />
              <span>{reindexing ? 'Indexing Vector...' : 'Refresh Vector Embedding'}</span>
            </button>
          </div>
        </div>

        {reindexMessage && (
          <div className="p-3 bg-blue-50 border border-blue-200 text-blue-900 text-xs rounded-lg flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
            <span>{reindexMessage}</span>
          </div>
        )}

        {/* Case Record Card */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
          {/* Header */}
          <div className="p-6 bg-slate-900 text-white border-b border-slate-800">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <div className="flex items-center space-x-2">
                <span className="font-mono text-xs font-bold bg-blue-600 text-white px-2.5 py-0.5 rounded">
                  {caseItem.equipment_code}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {new Date(caseItem.failure_date).toLocaleString()}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2.5 py-0.5 rounded-full text-xs font-bold">
                  {caseItem.outcome}
                </span>
                <span className="font-mono text-xs bg-slate-800 text-slate-300 px-2.5 py-0.5 rounded">
                  {caseItem.downtime_hours} hrs downtime
                </span>
              </div>
            </div>

            <h1 className="text-xl md:text-2xl font-black text-white tracking-tight">
              {caseItem.diagnosis}
            </h1>
            <p className="text-xs text-slate-300 mt-1">
              Asset: {caseItem.equipment_name || 'Industrial Equipment'}
            </p>
          </div>

          {/* Details Body */}
          <div className="p-6 space-y-6 text-xs md:text-sm">
            {/* Symptoms */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                Reported Failure Symptoms
              </span>
              <p className="text-slate-900 font-medium leading-relaxed">{caseItem.symptoms}</p>
            </div>

            {/* Observations */}
            {caseItem.observations && (
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                  Observations & Measurements
                </span>
                <p className="text-slate-700 leading-relaxed">{caseItem.observations}</p>
              </div>
            )}

            {/* Diagnosis & Root Cause Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                  Confirmed Diagnosis
                </span>
                <p className="text-slate-900 font-semibold">{caseItem.diagnosis}</p>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                  Identified Root Cause
                </span>
                <p className="text-slate-900 font-medium">
                  {caseItem.root_cause || 'Standard mechanical wear'}
                </p>
              </div>
            </div>

            {/* Diagnostic Procedure */}
            {caseItem.diagnostic_procedure && (
              <div className="space-y-1 pt-2 border-t border-slate-100">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                  Diagnostic Procedure Followed
                </span>
                <p className="text-slate-700 leading-relaxed font-mono text-xs">
                  {caseItem.diagnostic_procedure}
                </p>
              </div>
            )}

            {/* Corrective Action & Parts Replaced */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                  Corrective Repair Action
                </span>
                <p className="text-slate-900 font-medium leading-relaxed">
                  {caseItem.repair_action}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                  Replaced Components / Parts
                </span>
                <p className="text-slate-900 font-mono text-xs">
                  {caseItem.components_replaced || 'Standard consumables'}
                </p>
              </div>
            </div>

            {/* Technician Notes */}
            {caseItem.technician_notes && (
              <div className="bg-blue-50/70 border border-blue-200/80 rounded-lg p-4 text-xs text-blue-950 space-y-1">
                <span className="font-bold text-blue-800 uppercase tracking-wider block text-[10px]">
                  Technician Field Hindsight Note
                </span>
                <p className="font-mono italic leading-relaxed">{caseItem.technician_notes}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <FloatingAssistantDrawer
        isOpen={chatDrawerOpen}
        onClose={() => setChatDrawerOpen(false)}
        defaultEquipmentCode={caseItem.equipment_code}
      />
    </AppLayout>
  );
}
