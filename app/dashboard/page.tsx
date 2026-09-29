'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import AppLayout from '@/components/layout/AppLayout';
import {
  Wrench,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Sparkles,
  TrendingDown,
  DollarSign,
  PlusCircle,
  ArrowRight,
  ShieldAlert,
  BrainCircuit,
  Cpu,
  Layers,
} from 'lucide-react';
import { Equipment, MaintenanceCase, HindsightMemory, FleetStats } from '@/types';

export default function DashboardPage() {
  const [stats, setStats] = useState<FleetStats | null>(null);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [recentCases, setRecentCases] = useState<MaintenanceCase[]>([]);
  const [recentHindsight, setRecentHindsight] = useState<HindsightMemory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [statsRes, eqRes, casesRes, docsRes] = await Promise.all([
          fetch('/api/stats').then((r) => r.json()),
          fetch('/api/equipment').then((r) => r.json()),
          fetch('/api/maintenance').then((r) => r.json()),
          fetch('/api/ai/chat', { method: 'OPTIONS' }).catch(() => null), // warm up AI
        ]);

        if (statsRes.stats) setStats(statsRes.stats);
        if (eqRes.equipment) setEquipment(eqRes.equipment);
        if (casesRes.cases) {
          setRecentCases(casesRes.cases.slice(0, 5));
        }

        // Fetch recent hindsight reflections
        const hsRes = await fetch('/api/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: '' }),
        });
        const hsData = await hsRes.json();
        // Or get from equipment history
      } catch (err) {
        console.error('Error loading dashboard:', err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  const attentionEquipment = equipment.filter(
    (e) => e.status !== 'Operational' || e.recurring_fault
  );

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Welcome & Quick Action Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div>
            <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
              Industrial Fleet Maintenance & Memory Center
            </h1>
            <p className="text-xs md:text-sm text-slate-500 mt-1">
              Active operational telemetry, recurring failure patterns, and technician hindsight recall
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/maintenance/new"
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs md:text-sm font-semibold flex items-center gap-2 shadow-sm transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Report Case</span>
            </Link>
            <Link
              href="/assistant"
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs md:text-sm font-semibold flex items-center gap-2 shadow-sm transition-all"
            >
              <Cpu className="w-4 h-4 text-blue-400" />
              <span>Ask REPAIR-MIND</span>
            </Link>
          </div>
        </div>

        {/* 5 Core Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Total Fleet</span>
              <Wrench className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl md:text-3xl font-extrabold text-slate-900">
              {stats ? stats.totalEquipment : equipment.length}
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">Monitored assets</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Total Cases</span>
              <FileText className="w-4 h-4 text-slate-700" />
            </div>
            <div className="text-2xl md:text-3xl font-extrabold text-slate-900">
              {stats ? stats.totalCases : recentCases.length}
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">Recorded in memory</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-amber-200/80 bg-amber-50/20 shadow-2xs">
            <div className="flex items-center justify-between text-amber-700 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Recurring</span>
              <AlertTriangle className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl md:text-3xl font-extrabold text-amber-900">
              {stats ? stats.recurringFailures : 1}
            </div>
            <span className="text-[11px] text-amber-700 mt-1 block">Pattern flagged</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-emerald-200/80 bg-emerald-50/20 shadow-2xs">
            <div className="flex items-center justify-between text-emerald-700 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Resolved</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl md:text-3xl font-extrabold text-emerald-900">
              {stats ? stats.resolvedCases : 4}
            </div>
            <span className="text-[11px] text-emerald-700 mt-1 block">Verified fixed</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Open / Active</span>
              <Clock className="w-4 h-4 text-rose-500" />
            </div>
            <div className="text-2xl md:text-3xl font-extrabold text-slate-900">
              {stats ? stats.openActiveCases : 0}
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">Requiring action</span>
          </div>
        </div>

        {/* B2B SaaS Value & Downtime Savings Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-950 to-blue-950 text-white rounded-xl p-5 border border-slate-800 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-xs font-mono text-blue-400 uppercase tracking-wider font-bold">
                  B2B SaaS ROI Engine
                </span>
                <span className="text-[10px] bg-blue-500/20 text-blue-300 border border-blue-400/30 px-2 py-0.5 rounded">
                  8 Technician Seats ($45/mo)
                </span>
              </div>
              <h3 className="text-lg font-bold text-white">
                Downtime Avoidance & Efficiency Realization
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Prevented repeat diagnostic loops using historical pgvector hindsight recall.
              </p>
            </div>

            <div className="flex items-center gap-6 divide-x divide-slate-800">
              <div>
                <span className="text-xs text-slate-400 block">Downtime Hours Saved</span>
                <span className="text-xl md:text-2xl font-extrabold text-emerald-400 font-mono">
                  {stats?.downtimeHoursSaved || 18} hrs
                </span>
              </div>
              <div className="pl-6">
                <span className="text-xs text-slate-400 block">Estimated Cost Savings</span>
                <span className="text-xl md:text-2xl font-extrabold text-blue-400 font-mono">
                  ${(stats?.costSavings || 22500).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Recurring Failure Detection & Attention Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recurring Failure Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <ShieldAlert className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-sm text-slate-900">Recurring Failure Alert</h3>
              </div>
              <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-semibold">
                High Priority
              </span>
            </div>

            <div className="bg-amber-50/60 border border-amber-200/80 rounded-lg p-3.5 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-amber-950">Pump P-204</span>
                <span className="font-mono text-amber-800">4 Occurrences</span>
              </div>
              <p className="text-xs text-amber-900 font-medium">
                Problem: <span className="font-normal">Excessive casing vibration & drive bearing noise</span>
              </p>
              <div className="text-[11px] text-amber-900">
                <span className="font-semibold block mb-0.5">Historical Root Causes:</span>
                <ul className="list-disc list-inside space-y-0.5 text-amber-800">
                  <li>Thermal expansion coupling misalignment</li>
                  <li>Drive bearing spalling (SKF 22216 EK)</li>
                  <li>Suction strainer cavitation clogging</li>
                </ul>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 italic">
              * Note: Do not assume current failure has identical cause. Technician must verify operating temperature runout.
            </p>

            <Link
              href="/equipment/e1111111-1111-1111-1111-111111111111"
              className="w-full text-center py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold block transition-colors"
            >
              Inspect Pump P-204 Memory Timeline →
            </Link>
          </div>

          {/* Equipment Requiring Attention */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <Wrench className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-sm text-slate-900">Equipment Requiring Attention</h3>
              </div>
              <Link href="/equipment" className="text-xs text-blue-600 hover:underline font-medium">
                View all
              </Link>
            </div>

            <div className="space-y-3">
              {attentionEquipment.length === 0 ? (
                <p className="text-xs text-slate-500 py-4 text-center">
                  All equipment currently operational.
                </p>
              ) : (
                attentionEquipment.map((eq) => (
                  <Link
                    key={eq.id}
                    href={`/equipment/${eq.id}`}
                    className="p-3 rounded-lg border border-slate-200 hover:border-blue-400 bg-slate-50/50 hover:bg-blue-50/30 transition-all block"
                  >
                    <div className="flex items-start justify-between mb-1">
                      <span className="font-bold text-xs text-slate-900">
                        {eq.equipment_code} — {eq.name}
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          eq.status === 'Fault Reported'
                            ? 'bg-rose-100 text-rose-800'
                            : eq.status === 'Needs Inspection'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-200 text-slate-800'
                        }`}
                      >
                        {eq.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate">{eq.location}</p>
                    <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                      <span>Memory logs: {eq.memory_count}</span>
                      {eq.recurring_fault && (
                        <span className="text-amber-600 font-semibold">Recurring fault flagged</span>
                      )}
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* Recently Added Persistent Hindsight Memories */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <BrainCircuit className="w-5 h-5 text-purple-600" />
                <h3 className="font-bold text-sm text-slate-900">Organizational Hindsight</h3>
              </div>
              <span className="text-[10px] bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full font-semibold">
                Learned Fixes
              </span>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-purple-50/50 border border-purple-200/80 rounded-lg text-xs space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-purple-950">Pump P-204 Lesson</span>
                  <span className="text-[10px] text-purple-700 font-mono">Dave Kowalski</span>
                </div>
                <p className="text-[11px] text-purple-900 leading-relaxed font-mono">
                  "Vibration and bearing noise is repeatedly triggered by thermal growth misalignment. Do NOT merely swap bearings without laser alignment check at 70°C."
                </p>
              </div>

              <div className="p-3 bg-blue-50/50 border border-blue-200/80 rounded-lg text-xs space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-blue-950">Motor M-102 Lesson</span>
                  <span className="text-[10px] text-blue-700 font-mono">Sarah Chen</span>
                </div>
                <p className="text-[11px] text-blue-900 leading-relaxed font-mono">
                  "Motor trips are 95% caused by airborne milling lint choking the external cowl rather than electrical winding shorts. Check airflow first."
                </p>
              </div>
            </div>

            <Link
              href="/knowledge"
              className="text-center w-full block py-2 text-xs font-semibold text-blue-600 hover:text-blue-800"
            >
              Browse Full Knowledge Base →
            </Link>
          </div>
        </div>

        {/* Recent Maintenance Cases Table */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Recent Maintenance Experiences</h3>
              <p className="text-xs text-slate-500">
                Latest repair logs stored in permanent organizational memory
              </p>
            </div>
            <Link
              href="/maintenance"
              className="text-xs font-semibold text-blue-600 hover:text-blue-800"
            >
              View all cases →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Equipment</th>
                  <th className="py-2.5 px-3">Symptoms</th>
                  <th className="py-2.5 px-3">Diagnosis</th>
                  <th className="py-2.5 px-3">Corrective Repair</th>
                  <th className="py-2.5 px-3">Outcome</th>
                  <th className="py-2.5 px-3 text-right">Downtime</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentCases.map((cs) => (
                  <tr key={cs.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3 font-bold text-slate-900 whitespace-nowrap">
                      {cs.equipment_code}
                    </td>
                    <td className="py-3 px-3 text-slate-600 max-w-xs truncate" title={cs.symptoms}>
                      {cs.symptoms}
                    </td>
                    <td className="py-3 px-3 font-medium text-slate-800">{cs.diagnosis}</td>
                    <td className="py-3 px-3 text-slate-600 max-w-xs truncate" title={cs.repair_action}>
                      {cs.repair_action}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full text-[10px] font-semibold">
                        {cs.outcome.slice(0, 20)}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-slate-600">
                      {cs.downtime_hours}h
                    </td>
                    <td className="py-3 px-3 text-right">
                      <Link
                        href={`/maintenance/${cs.id}`}
                        className="text-blue-600 hover:text-blue-800 font-semibold"
                      >
                        Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
