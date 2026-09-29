'use client';

import React, { useEffect, useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import {
  Settings,
  Database,
  Cpu,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  HardHat,
  ShieldCheck,
  Zap,
  DollarSign,
  HelpCircle,
  Copy,
  Check,
} from 'lucide-react';
import { useAuth } from '@/lib/auth/auth-context';

export default function SettingsPage() {
  const { user, switchRole, logout } = useAuth();

  const [healthStatus, setHealthStatus] = useState<any>(null);
  const [loadingHealth, setLoadingHealth] = useState(true);
  const [seedLoading, setSeedLoading] = useState(false);
  const [seedMessage, setSeedMessage] = useState<string | null>(null);

  // Gemini test state
  const [testPrompt, setTestPrompt] = useState('Why does thermal expansion cause pump coupling misalignment?');
  const [testResult, setTestResult] = useState<string | null>(null);
  const [testingGemini, setTestingGemini] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  useEffect(() => {
    checkHealth();
  }, []);

  const checkHealth = async () => {
    setLoadingHealth(true);
    try {
      const res = await fetch('/api/seed');
      const data = await res.json();
      setHealthStatus(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingHealth(false);
    }
  };

  const handleResetSeed = async () => {
    setSeedLoading(true);
    setSeedMessage(null);
    try {
      const res = await fetch('/api/seed', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setSeedMessage('Database re-seeded with demonstration equipment (P-204, M-102, C-301, G-110) & verified repair memories.');
      } else {
        setSeedMessage('Failed to seed database.');
      }
    } catch {
      setSeedMessage('Error connecting to seed API.');
    } finally {
      setSeedLoading(false);
    }
  };

  const handleTestGemini = async () => {
    setTestingGemini(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: testPrompt }),
      });
      const data = await res.json();
      setTestResult(data.response || data.error);
    } catch (err: any) {
      setTestResult(`Error: ${err.message}`);
    } finally {
      setTestingGemini(false);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-600 rounded-lg text-white">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
                System Diagnostics & Configuration
              </h1>
              <p className="text-xs md:text-sm text-slate-500">
                Supabase database connection, Gemini AI telemetry, B2B SaaS seat tier, and seed data
              </p>
            </div>
          </div>
        </div>

        {/* Integration Status Badges */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Supabase Status */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Database className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-sm text-slate-900">Supabase & pgvector</h3>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  healthStatus?.supabaseConfigured
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-blue-100 text-blue-800'
                }`}
              >
                {healthStatus?.supabaseConfigured ? 'Connected (Live SQL)' : 'In-Memory / Local Sync'}
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {healthStatus?.supabaseConfigured
                ? 'Connected to live Supabase PostgreSQL database. pgvector vector similarity and RLS policies active.'
                : 'Operating in self-contained resilient mode. All CRUD, memory indexing, and search operations work immediately out-of-the-box. Add NEXT_PUBLIC_SUPABASE_URL in .env.local to link cloud database.'}
            </p>

            <div className="text-[11px] font-mono bg-slate-50 p-2.5 rounded border border-slate-200 text-slate-700">
              Tables: equipment, maintenance_cases, documents, maintenance_embeddings, hindsight_memories
            </div>
          </div>

          {/* Gemini AI Status */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Cpu className="w-5 h-5 text-purple-600" />
                <h3 className="font-bold text-sm text-slate-900">Google Gemini API</h3>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  healthStatus?.geminiConfigured
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {healthStatus?.geminiConfigured ? 'Connected' : 'Key Config Required'}
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Model: <span className="font-mono font-bold text-slate-800">{healthStatus?.geminiModel || 'gemini-1.5-flash'}</span>
              <br />
              {healthStatus?.geminiConfigured
                ? 'Gemini API is active for conversational diagnostics, vision analysis, and hindsight reflection synthesis.'
                : 'Set GEMINI_API_KEY in .env.local to activate live multimodal vision and generative grounding.'}
            </p>

            <button
              onClick={handleTestGemini}
              disabled={testingGemini}
              className="w-full py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Zap className="w-3.5 h-3.5 text-blue-400" />
              <span>{testingGemini ? 'Testing Gemini API...' : 'Test AI Model Endpoint'}</span>
            </button>
          </div>
        </div>

        {/* Gemini Live Test Response if triggered */}
        {testResult && (
          <div className="bg-slate-900 text-white p-5 rounded-xl border border-slate-800 space-y-2 text-xs font-mono">
            <div className="flex justify-between items-center text-slate-400">
              <span>Gemini Model Test Output:</span>
              <span className="text-emerald-400">Received Response</span>
            </div>
            <p className="text-slate-200 whitespace-pre-wrap leading-relaxed">{testResult}</p>
          </div>
        )}

        {/* Demo Data Management */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Demonstration Seed Data</h3>
              <p className="text-xs text-slate-500">
                Reset database memory to the standard demonstration industrial machines and cases
              </p>
            </div>
            <button
              onClick={handleResetSeed}
              disabled={seedLoading}
              className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${seedLoading ? 'animate-spin' : ''}`} />
              <span>{seedLoading ? 'Seeding...' : 'Load Standard Seed Data'}</span>
            </button>
          </div>

          {seedMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{seedMessage}</span>
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
              <span className="font-mono font-bold text-slate-900 block">P-204</span>
              <span className="text-[11px] text-slate-500">Centrifugal Slurry Pump</span>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
              <span className="font-mono font-bold text-slate-900 block">M-102</span>
              <span className="text-[11px] text-slate-500">75kW Induction Motor</span>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
              <span className="font-mono font-bold text-slate-900 block">C-301</span>
              <span className="text-[11px] text-slate-500">Rotary Screw Compressor</span>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
              <span className="font-mono font-bold text-slate-900 block">G-110</span>
              <span className="text-[11px] text-slate-500">500kVA Diesel Generator</span>
            </div>
          </div>
        </div>

        {/* User Session & Role */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
          <h3 className="font-bold text-sm text-slate-900">Current Field Session</h3>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <p className="font-bold text-sm text-slate-900">{user?.full_name}</p>
              <p className="text-xs text-slate-500">{user?.email}</p>
              <span className="inline-block mt-1 text-[11px] bg-blue-100 text-blue-800 font-semibold px-2 py-0.5 rounded capitalize">
                Role: {user?.role}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => switchRole(user?.role === 'manager' ? 'technician' : 'manager')}
                className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg shadow-2xs"
              >
                Switch to {user?.role === 'manager' ? 'Field Technician' : 'Manager'}
              </button>
              <button
                onClick={logout}
                className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold rounded-lg border border-rose-200"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>

        {/* B2B SaaS Subscription Metrics */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
          <div className="flex items-center space-x-2">
            <DollarSign className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-sm text-slate-900">B2B SaaS License & Billing Details</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-slate-500 block">Subscription Tier</span>
              <span className="font-bold text-slate-900 text-sm">Industrial Seat License</span>
              <span className="text-slate-500 block text-[11px] mt-0.5">$45 / technician / mo</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-slate-500 block">Active Team Seats</span>
              <span className="font-bold text-slate-900 text-sm">8 Field Technicians</span>
              <span className="text-emerald-600 block text-[11px] mt-0.5">All seats active</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-slate-500 block">Average Value Multiple</span>
              <span className="font-bold text-slate-900 text-sm">8.4x ROI Realized</span>
              <span className="text-slate-500 block text-[11px] mt-0.5">Based on $1,250/hr downtime</span>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
