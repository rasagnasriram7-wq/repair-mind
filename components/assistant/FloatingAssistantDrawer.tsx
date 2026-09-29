'use client';

import React, { useState } from 'react';
import { X, Send, Sparkles, AlertTriangle, ArrowRight, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';

interface FloatingAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  defaultEquipmentCode?: string;
}

export default function FloatingAssistantDrawer({
  isOpen,
  onClose,
  defaultEquipmentCode,
}: FloatingAssistantDrawerProps) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const [similarCases, setSimilarCases] = useState<any[]>([]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || loading) return;

    setLoading(true);
    setResponse(null);
    setSimilarCases([]);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: query }),
      });
      const data = await res.json();
      if (res.ok) {
        setResponse(data.response);
        setSimilarCases(data.similarCases || []);
      } else {
        setResponse(data.error || 'Failed to search memory.');
      }
    } catch {
      setResponse('Connection error. Could not reach AI memory service.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickPrompt = (text: string) => {
    setQuery(text);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-blue-600 rounded">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-sm">REPAIR-MIND Memory Recall</h3>
              <p className="text-[11px] text-slate-400">Quick field troubleshooting inquiry</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-sm">
          {!response && !loading && (
            <div className="space-y-3">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-900">
                <span className="font-semibold block mb-1">Field Diagnostic Tip:</span>
                Type the symptoms, sounds, vibration readings, or equipment code to retrieve identical historical failures and verified repairs.
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Common Recurring Issues:
                </p>
                <div className="space-y-1.5">
                  <button
                    type="button"
                    onClick={() => handleQuickPrompt('Pump P-204 has excessive vibration and abnormal bearing noise.')}
                    className="w-full text-left text-xs p-2 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors flex items-center justify-between"
                  >
                    <span>Pump P-204 excessive vibration & bearing noise</span>
                    <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickPrompt('Motor M-102 thermal overload trip. Stator casing over 95C.')}
                    className="w-full text-left text-xs p-2 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors flex items-center justify-between"
                  >
                    <span>Motor M-102 thermal overload trip</span>
                    <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickPrompt('Compressor C-301 pressure dropping during peak demand.')}
                    className="w-full text-left text-xs p-2 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors flex items-center justify-between"
                  >
                    <span>Compressor C-301 frequent load/unload cycles</span>
                    <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {loading && (
            <div className="p-6 text-center space-y-3">
              <div className="inline-block w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm font-medium text-slate-700">Searching maintenance memory...</p>
              <p className="text-xs text-slate-500">Matching historical symptoms and pgvector embeddings</p>
            </div>
          )}

          {response && (
            <div className="space-y-4">
              <div className="p-3 bg-slate-900 text-slate-100 rounded-lg text-xs leading-relaxed whitespace-pre-wrap font-mono">
                {response}
              </div>

              {similarCases.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Historical Cases Retrieved ({similarCases.length})
                  </h4>
                  {similarCases.map((cs) => (
                    <div key={cs.case_id} className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                      <div className="flex justify-between items-start font-semibold text-slate-900 mb-1">
                        <span>{cs.equipment_code} — {cs.diagnosis}</span>
                        <span className="bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded text-[10px]">
                          {Math.round(cs.similarity * 100)}% match
                        </span>
                      </div>
                      <p className="text-slate-600 mb-1"><span className="font-medium text-slate-700">Repair:</span> {cs.repair_action}</p>
                      <Link
                        href={`/maintenance/${cs.case_id}`}
                        onClick={onClose}
                        className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center text-[11px]"
                      >
                        View Full Case Record →
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Drawer Footer Input */}
        <form onSubmit={handleSubmit} className="p-3 bg-slate-50 border-t border-slate-200 flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Report symptoms or ask memory..."
            className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="px-3 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg text-xs font-medium flex items-center gap-1 shadow-sm"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Search</span>
          </button>
        </form>
      </div>
    </div>
  );
}
