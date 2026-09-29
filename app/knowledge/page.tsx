'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import AppLayout from '@/components/layout/AppLayout';
import {
  BookOpen,
  Search,
  Filter,
  Sparkles,
  ExternalLink,
  History,
  CheckCircle2,
  Tag,
  ArrowRight,
  BrainCircuit,
} from 'lucide-react';
import { AISimilarCase, Equipment } from '@/types';

export default function KnowledgePage() {
  const [query, setQuery] = useState('');
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
  const [selectedEqId, setSelectedEqId] = useState('');
  const [rootCauseFilter, setRootCauseFilter] = useState('');
  const [componentFilter, setComponentFilter] = useState('');
  const [results, setResults] = useState<AISimilarCase[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/equipment')
      .then((r) => r.json())
      .then((d) => {
        if (d.equipment) setEquipmentList(d.equipment);
      });

    // Initial search with empty query to load recent memories
    handleSearch('');
  }, []);

  const handleSearch = async (searchTerm?: string) => {
    const q = searchTerm !== undefined ? searchTerm : query;
    setLoading(true);

    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: q,
          equipmentId: selectedEqId || undefined,
          rootCause: rootCauseFilter || undefined,
          component: componentFilter || undefined,
          limit: 15,
        }),
      });
      const data = await res.json();
      if (data.results) {
        setResults(data.results);
      }
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickKeyword = (kw: string) => {
    setQuery(kw);
    handleSearch(kw);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center space-x-3 mb-1">
            <div className="p-2 bg-blue-600 rounded-lg text-white">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
                Historical Maintenance Knowledge Base
              </h1>
              <p className="text-xs md:text-sm text-slate-500">
                Instant semantic & structured retrieval across all plant failure patterns and verified solutions
              </p>
            </div>
          </div>
        </div>

        {/* Search & Filters Card */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          {/* Search bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch();
            }}
            className="flex gap-2"
          >
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search maintenance memory (e.g., 'bearing failure', 'pump vibration', 'motor overheating')..."
                className="w-full pl-9 pr-4 py-2.5 text-xs md:text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg text-xs md:text-sm font-semibold flex items-center gap-1.5 shadow-sm transition-all shrink-0"
            >
              <Search className="w-4 h-4" />
              <span>{loading ? 'Searching...' : 'Search Memory'}</span>
            </button>
          </form>

          {/* Quick Example Search Pills */}
          <div className="flex items-center gap-2 flex-wrap text-xs">
            <span className="text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
              Quick Queries:
            </span>
            {[
              'bearing failure',
              'pump vibration',
              'motor overheating',
              'compressor pressure',
              'seal leakage',
            ].map((kw) => (
              <button
                key={kw}
                type="button"
                onClick={() => handleQuickKeyword(kw)}
                className="bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 border border-slate-200 rounded-full px-2.5 py-0.5 text-xs transition-colors"
              >
                "{kw}"
              </button>
            ))}
          </div>

          {/* Structured Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100 text-xs">
            <div>
              <label className="block text-slate-600 font-medium mb-1">Filter by Equipment</label>
              <select
                value={selectedEqId}
                onChange={(e) => setSelectedEqId(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
              >
                <option value="">All Equipment</option>
                {equipmentList.map((eq) => (
                  <option key={eq.id} value={eq.id}>
                    {eq.equipment_code} — {eq.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-600 font-medium mb-1">Filter by Root Cause</label>
              <input
                type="text"
                value={rootCauseFilter}
                onChange={(e) => setRootCauseFilter(e.target.value)}
                placeholder="e.g., misalignment, obstruction..."
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-slate-600 font-medium mb-1">Filter by Component</label>
              <input
                type="text"
                value={componentFilter}
                onChange={(e) => setComponentFilter(e.target.value)}
                placeholder="e.g., bearing, seal, cowl..."
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Results Feed */}
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span>Showing {results.length} historical maintenance records</span>
            <span className="font-mono">Ranked by hybrid semantic + keyword relevance</span>
          </div>

          {loading ? (
            <div className="py-12 text-center text-slate-500 text-sm">
              <div className="inline-block w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mb-2" />
              <p>Searching maintenance memory...</p>
            </div>
          ) : results.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-10 text-center space-y-2">
              <p className="text-slate-800 font-bold text-sm">
                No closely matching historical case was found.
              </p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Try broadening your query keywords or clearing filters.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {results.map((r, idx) => (
                <div
                  key={r.case_id || idx}
                  className="bg-white border border-slate-200 rounded-xl p-5 hover:border-blue-400 hover:shadow-2xs transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <span className="font-mono text-xs font-bold bg-slate-900 text-white px-2 py-0.5 rounded">
                          {r.equipment_code}
                        </span>
                        <h3 className="font-bold text-sm text-slate-900 mt-1">{r.diagnosis}</h3>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                        {Math.round((r.similarity || 0.85) * 100)}% match
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-600 mb-3">
                      <p>
                        <strong className="text-slate-800">Symptom:</strong> {r.symptoms}
                      </p>
                      {r.root_cause && (
                        <p>
                          <strong className="text-slate-800">Root Cause:</strong> {r.root_cause}
                        </p>
                      )}
                      <p>
                        <strong className="text-slate-800">Verified Repair:</strong> {r.repair_action}
                      </p>
                      {r.components_replaced && (
                        <p>
                          <strong className="text-slate-800">Parts Replaced:</strong> {r.components_replaced}
                        </p>
                      )}
                      <p>
                        <strong className="text-slate-800">Outcome:</strong>{' '}
                        <span className="text-emerald-700 font-medium">{r.outcome}</span>
                      </p>
                    </div>

                    {r.hindsight_reflection && (
                      <div className="bg-purple-50/70 border border-purple-200 rounded-lg p-2.5 text-xs text-purple-950 mb-3">
                        <span className="font-bold text-purple-800 block text-[10px] uppercase mb-0.5">
                          Hindsight Reflection:
                        </span>
                        <p className="font-mono text-[11px] leading-relaxed">{r.hindsight_reflection}</p>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 font-mono">
                      {new Date(r.failure_date).toLocaleDateString()}
                    </span>
                    <Link
                      href={`/maintenance/${r.case_id}`}
                      className="text-blue-600 hover:text-blue-800 text-xs font-semibold inline-flex items-center gap-1"
                    >
                      <span>Inspect Case</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
