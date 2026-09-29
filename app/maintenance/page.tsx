'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import AppLayout from '@/components/layout/AppLayout';
import {
  FileText,
  Search,
  PlusCircle,
  Filter,
  ExternalLink,
  History,
  Clock,
  Sparkles,
  ArrowRight,
  Database,
} from 'lucide-react';
import { MaintenanceCase, Equipment } from '@/types';

export default function MaintenanceListPage() {
  const [cases, setCases] = useState<MaintenanceCase[]>([]);
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
  const [selectedEqId, setSelectedEqId] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [casesRes, eqRes] = await Promise.all([
        fetch('/api/maintenance').then((r) => r.json()),
        fetch('/api/equipment').then((r) => r.json()),
      ]);

      if (casesRes.cases) setCases(casesRes.cases);
      if (eqRes.equipment) setEquipmentList(eqRes.equipment);
    } catch (err) {
      console.error('Error loading cases:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredCases = cases.filter((c) => {
    const matchesEq = selectedEqId === 'all' || c.equipment_id === selectedEqId;
    const searchLower = search.toLowerCase();
    const matchesSearch =
      (c.equipment_code && c.equipment_code.toLowerCase().includes(searchLower)) ||
      c.symptoms.toLowerCase().includes(searchLower) ||
      c.diagnosis.toLowerCase().includes(searchLower) ||
      (c.root_cause && c.root_cause.toLowerCase().includes(searchLower)) ||
      c.repair_action.toLowerCase().includes(searchLower) ||
      (c.components_replaced && c.components_replaced.toLowerCase().includes(searchLower));

    return matchesEq && matchesSearch;
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div>
            <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
              Maintenance Experience Memory Logs
            </h1>
            <p className="text-xs md:text-sm text-slate-500 mt-1">
              Historical failure symptoms, diagnoses, verified repairs, and organizational hindsight
            </p>
          </div>

          <Link
            href="/maintenance/new"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs md:text-sm font-semibold flex items-center gap-2 shadow-sm transition-all self-start sm:self-auto"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Report Maintenance Case</span>
          </Link>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search symptoms (e.g. vibration, overheating), diagnosis, repair..."
              className="w-full pl-9 pr-3 py-2 text-xs md:text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="w-full md:w-64">
            <select
              value={selectedEqId}
              onChange={(e) => setSelectedEqId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Equipment</option>
              {equipmentList.map((eq) => (
                <option key={eq.id} value={eq.id}>
                  {eq.equipment_code} — {eq.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Maintenance Cases List */}
        {loading ? (
          <div className="py-12 text-center text-slate-500 text-sm">
            <div className="inline-block w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mb-2" />
            <p>Loading maintenance cases...</p>
          </div>
        ) : filteredCases.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-10 text-center space-y-3">
            <FileText className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="font-bold text-slate-800 text-base">
              No maintenance experiences recorded yet.
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Record failure symptoms and repair solutions to build persistent organizational memory.
            </p>
            <Link
              href="/maintenance/new"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 shadow"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Report First Maintenance Case</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredCases.map((cs) => (
              <div
                key={cs.id}
                className="bg-white border border-slate-200 rounded-xl p-5 hover:border-blue-400 hover:shadow-2xs transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold bg-slate-900 text-white px-2 py-0.5 rounded">
                      {cs.equipment_code}
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      {new Date(cs.failure_date).toLocaleDateString()}
                    </span>
                    <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full text-[10px] font-semibold">
                      {cs.outcome.slice(0, 24)}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-base text-slate-900">
                    {cs.diagnosis}
                  </h3>

                  <p className="text-xs text-slate-600">
                    <strong className="text-slate-700">Symptoms:</strong> {cs.symptoms}
                  </p>

                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 pt-1">
                    {cs.root_cause && (
                      <p>
                        <span className="font-semibold text-slate-700">Root Cause:</span> {cs.root_cause}
                      </p>
                    )}
                    <p>
                      <span className="font-semibold text-slate-700">Repair:</span> {cs.repair_action}
                    </p>
                    {cs.components_replaced && (
                      <p>
                        <span className="font-semibold text-slate-700">Parts:</span> {cs.components_replaced}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex md:flex-col items-center md:items-end justify-between gap-2 shrink-0 border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                  <span className="font-mono text-xs text-slate-500">
                    {cs.downtime_hours} hrs downtime
                  </span>

                  <Link
                    href={`/maintenance/${cs.id}`}
                    className="px-3.5 py-1.5 bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                  >
                    <span>View Case</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
