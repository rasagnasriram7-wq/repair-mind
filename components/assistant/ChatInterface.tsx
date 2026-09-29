'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  Send,
  Sparkles,
  Cpu,
  Image as ImageIcon,
  X,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  History,
  ShieldAlert,
  ArrowRight,
  HelpCircle,
} from 'lucide-react';
import { Equipment, AIChatMessage, AISimilarCase } from '@/types';

interface ChatInterfaceProps {
  initialEquipment?: Equipment | null;
}

export default function ChatInterface({ initialEquipment }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<AIChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Welcome to **REPAIR-MIND Field Technician Memory Agent**.

I search our plant's persistent maintenance history, recurring failure patterns, and technician hindsight memories to help you troubleshoot safely and accurately.

**How to query:**
- Report equipment code and symptoms: *"Pump P-204 has excessive vibration and abnormal bearing noise."*
- Ask about recurring faults: *"Has Induction Motor M-102 tripped on thermal overload before?"*
- Attach a photo of a damaged component (bearing race, impeller, seal) for multimodal visual inspection.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [input, setInput] = useState('');
  const [selectedEquipmentId, setSelectedEquipmentId] = useState<string>(initialEquipment?.id || '');
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch('/api/equipment')
      .then((res) => res.json())
      .then((data) => {
        if (data.equipment) setEquipmentList(data.equipment);
      })
      .catch((err) => console.error('Failed to load equipment list:', err));
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading, loadingStep]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageMimeType(file.type);
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    setImageMimeType(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSendMessage = async (queryText?: string) => {
    const messageToSend = queryText || input;
    if (!messageToSend.trim() || loading) return;

    const userMsg: AIChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: messageToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      imageAttachment: imagePreview || undefined,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    const sentImage = imagePreview;
    const sentMime = imageMimeType;
    removeImage();

    setLoading(true);
    setLoadingStep('Searching maintenance memory...');

    // Progress timer to show multi-stage recall as requested
    const stepTimer = setTimeout(() => {
      setLoadingStep('Analyzing historical cases & hindsight memories...');
    }, 900);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageToSend.trim(),
          equipmentId: selectedEquipmentId || undefined,
          imageBase64: sentImage || undefined,
          imageMimeType: sentMime || undefined,
        }),
      });

      clearTimeout(stepTimer);
      const data = await res.json();

      if (res.ok) {
        const assistantMsg: AIChatMessage = {
          id: `ast-${Date.now()}`,
          role: 'assistant',
          content: data.response,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          similarCases: data.similarCases || [],
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: `err-${Date.now()}`,
            role: 'assistant',
            content: `Unable to retrieve maintenance memory: ${data.error || 'Server error'}. Please verify connection or try again.`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      }
    } catch {
      clearTimeout(stepTimer);
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: 'Network error: AI service is temporarily unavailable. Check connectivity.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
      setLoadingStep('');
    }
  };

  const handleQuickPreset = (text: string, eqCode?: string) => {
    if (eqCode) {
      const eq = equipmentList.find((e) => e.equipment_code === eqCode);
      if (eq) setSelectedEquipmentId(eq.id);
    }
    handleSendMessage(text);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8.5rem)] max-w-5xl mx-auto bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Agent Header */}
      <div className="bg-slate-900 text-white p-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center shadow-inner">
            <Cpu className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="font-extrabold text-base tracking-tight">REPAIR-MIND</h2>
              <span className="text-xs font-mono bg-blue-500/20 text-blue-300 border border-blue-400/30 px-2 py-0.5 rounded">
                FIELD AGENT
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Field Technician Memory Agent for Recurring Equipment Failures
            </p>
          </div>
        </div>

        {/* Equipment Scope Filter */}
        <div className="flex items-center space-x-2 text-xs">
          <span className="text-slate-400 font-medium">Machine Context:</span>
          <select
            value={selectedEquipmentId}
            onChange={(e) => setSelectedEquipmentId(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 text-xs"
          >
            <option value="">Auto-Detect from Query</option>
            {equipmentList.map((eq) => (
              <option key={eq.id} value={eq.id}>
                {eq.equipment_code} — {eq.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Suggested Quick Prompts Bar */}
      <div className="bg-slate-100/80 px-4 py-2 border-b border-slate-200 flex items-center gap-2 overflow-x-auto text-xs scrollbar-none">
        <span className="text-slate-500 font-semibold uppercase tracking-wider text-[10px] shrink-0">
          Field Scenarios:
        </span>
        <button
          onClick={() =>
            handleQuickPreset(
              'Pump P-204 is showing excessive vibration and abnormal bearing noise. What happened in the past?',
              'P-204'
            )
          }
          className="shrink-0 bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-300 hover:border-blue-300 px-2.5 py-1 rounded-full transition-colors flex items-center gap-1 shadow-2xs"
        >
          <Sparkles className="w-3 h-3 text-blue-600" />
          <span>Pump P-204 vibration & noise</span>
        </button>
        <button
          onClick={() =>
            handleQuickPreset(
              'Motor M-102 tripped on thermal overload. Outer stator temperature is over 95C. What was previous root cause?',
              'M-102'
            )
          }
          className="shrink-0 bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-300 hover:border-blue-300 px-2.5 py-1 rounded-full transition-colors flex items-center gap-1 shadow-2xs"
        >
          <Sparkles className="w-3 h-3 text-amber-600" />
          <span>Motor M-102 thermal trip</span>
        </button>
        <button
          onClick={() =>
            handleQuickPreset(
              'Compressor C-301 is unloading too frequently and plant pressure drops rapidly during shifts.',
              'C-301'
            )
          }
          className="shrink-0 bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-300 hover:border-blue-300 px-2.5 py-1 rounded-full transition-colors flex items-center gap-1 shadow-2xs"
        >
          <Sparkles className="w-3 h-3 text-slate-600" />
          <span>Compressor C-301 pressure drop</span>
        </button>
      </div>

      {/* Message History Feed */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div className="flex items-center space-x-2 mb-1 px-1">
              <span className="text-xs font-bold text-slate-600">
                {msg.role === 'user' ? 'Field Technician' : 'REPAIR-MIND Agent'}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">{msg.timestamp}</span>
            </div>

            <div
              className={`max-w-3xl rounded-xl p-4 shadow-2xs ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white rounded-tr-none'
                  : 'bg-slate-50 border border-slate-200/90 text-slate-900 rounded-tl-none'
              }`}
            >
              {/* If user uploaded an image */}
              {msg.imageAttachment && (
                <div className="mb-3 rounded-lg overflow-hidden border border-white/20 max-w-xs">
                  <img
                    src={msg.imageAttachment}
                    alt="Component inspection photo"
                    className="w-full h-auto object-cover"
                  />
                  <div className="bg-black/40 text-[10px] px-2 py-0.5 text-white">
                    Inspected Component Photo
                  </div>
                </div>
              )}

              {/* Message Content */}
              <div className="text-xs md:text-sm leading-relaxed whitespace-pre-wrap font-sans">
                {msg.content}
              </div>

              {/* Grounded Similar Cases Cards */}
              {msg.similarCases && msg.similarCases.length > 0 && (
                <div className="mt-5 pt-4 border-t border-slate-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                      <History className="w-3.5 h-3.5 text-blue-600" />
                      Retrieved Historical Cases from Memory ({msg.similarCases.length})
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      pgvector cosine similarity
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {msg.similarCases.map((cs, idx) => (
                      <div
                        key={cs.case_id || idx}
                        className="bg-white border border-slate-200 rounded-lg p-3 hover:border-blue-400 transition-all shadow-2xs flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-start justify-between mb-2">
                            <span className="font-bold text-xs text-slate-900">
                              {cs.equipment_code} — {cs.diagnosis}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                cs.similarity >= 0.75
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {Math.round(cs.similarity * 100)}% match
                            </span>
                          </div>

                          <div className="space-y-1 text-[11px] text-slate-600 mb-3">
                            <p>
                              <span className="font-semibold text-slate-800">Symptom:</span>{' '}
                              {cs.symptoms}
                            </p>
                            {cs.root_cause && (
                              <p>
                                <span className="font-semibold text-slate-800">Root Cause:</span>{' '}
                                {cs.root_cause}
                              </p>
                            )}
                            <p>
                              <span className="font-semibold text-slate-800">Repair:</span>{' '}
                              {cs.repair_action}
                            </p>
                            {cs.components_replaced && (
                              <p>
                                <span className="font-semibold text-slate-800">Parts:</span>{' '}
                                {cs.components_replaced}
                              </p>
                            )}
                            <p>
                              <span className="font-semibold text-slate-800">Outcome:</span>{' '}
                              <span className="text-emerald-700 font-medium">{cs.outcome}</span>
                            </p>
                          </div>

                          {cs.hindsight_reflection && (
                            <div className="bg-blue-50 border border-blue-200/80 rounded p-2 text-[11px] text-blue-950 mb-3">
                              <span className="font-bold text-blue-700 block text-[10px] uppercase">
                                Hindsight Lesson:
                              </span>
                              {cs.hindsight_reflection}
                            </div>
                          )}
                        </div>

                        <Link
                          href={`/maintenance/${cs.case_id}`}
                          className="w-full text-center bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-700 py-1.5 rounded text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                        >
                          <span>View Full Case Record</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Loading Indicator */}
        {loading && (
          <div className="flex flex-col items-start space-y-1">
            <span className="text-xs font-bold text-slate-500">REPAIR-MIND Memory Search</span>
            <div className="bg-slate-50 border border-slate-200 rounded-xl rounded-tl-none p-4 max-w-md shadow-2xs space-y-2">
              <div className="flex items-center space-x-2 text-xs font-semibold text-blue-700">
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <span>{loadingStep || 'Searching maintenance memory...'}</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Cross-referencing symptoms, previous diagnoses, and pgvector embeddings...
              </p>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Tray & Photo Preview */}
      <div className="p-3 md:p-4 bg-slate-50 border-t border-slate-200">
        {imagePreview && (
          <div className="mb-2 flex items-center gap-2 bg-white border border-slate-200 p-1.5 rounded-lg max-w-xs shadow-2xs">
            <img
              src={imagePreview}
              alt="Component preview"
              className="w-10 h-10 object-cover rounded"
            />
            <div className="flex-1 min-w-0">
              <span className="text-xs font-medium text-slate-700 block truncate">
                Component Image Attached
              </span>
              <span className="text-[10px] text-emerald-600">Ready for visual diagnosis</span>
            </div>
            <button
              onClick={removeImage}
              className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-rose-500"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          {/* Multimodal Photo Upload Button */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2.5 text-slate-500 hover:text-blue-600 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors"
            title="Attach component photo for visual diagnosis"
          >
            <ImageIcon className="w-5 h-5" />
          </button>

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type symptoms (e.g. Pump P-204 excessive vibration and abnormal bearing noise)..."
            disabled={loading}
            className="flex-1 px-4 py-2.5 text-xs md:text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900"
          />

          <button
            type="submit"
            disabled={loading || (!input.trim() && !imagePreview)}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg text-xs md:text-sm font-semibold flex items-center gap-2 shadow-sm transition-all"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Ask Agent</span>
          </button>
        </form>

        <p className="text-[10px] text-slate-400 text-center mt-2">
          Strictly grounded on historical maintenance records. Historical cases are references and
          require technician field verification.
        </p>
      </div>
    </div>
  );
}
