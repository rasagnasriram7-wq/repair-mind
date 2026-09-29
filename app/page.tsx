import React from 'react';
import Link from 'next/link';
import {
  Cpu,
  ArrowRight,
  Database,
  History,
  ShieldCheck,
  Wrench,
  Sparkles,
  TrendingDown,
  DollarSign,
  CheckCircle2,
  HardHat,
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Top Bar */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center font-black text-white text-lg shadow-lg shadow-blue-600/30">
              RM
            </div>
            <div>
              <span className="font-extrabold text-lg text-white tracking-tight">REPAIR-MIND</span>
              <span className="text-[10px] text-blue-400 block tracking-widest uppercase font-mono">
                Field Memory Agent
              </span>
            </div>
          </Link>

          <nav className="flex items-center space-x-4">
            <Link
              href="/login"
              className="text-xs sm:text-sm font-semibold text-slate-300 hover:text-white transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/assistant"
              className="bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-semibold px-4 py-2 rounded-lg shadow-md transition-all flex items-center space-x-1.5"
            >
              <Sparkles className="w-4 h-4" />
              <span>Launch Agent</span>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 md:pt-24 md:pb-28 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/30 via-slate-900/0 to-slate-900 pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-blue-950/80 border border-blue-500/30 text-blue-300 text-xs font-mono uppercase tracking-wider mb-6">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
            <span>Industrial Field Technician Organizational Memory</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-tight max-w-4xl mx-auto">
            Your Organization’s Memory for{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-300">
              Recurring Equipment Failures
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg md:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Recall previous failures, learn from successful repairs, and provide field technicians with
            context-aware troubleshooting assistance backed by pgvector and Gemini.
          </p>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/assistant"
              className="w-full sm:w-auto px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-sm md:text-base shadow-lg shadow-blue-600/30 flex items-center justify-center space-x-2 transition-all"
            >
              <Cpu className="w-5 h-5" />
              <span>Open AI Technician</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>

            <Link
              href="/equipment"
              className="w-full sm:w-auto px-6 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-sm md:text-base border border-slate-700 flex items-center justify-center space-x-2 transition-all"
            >
              <Wrench className="w-5 h-5 text-blue-400" />
              <span>Explore Equipment Fleet</span>
            </Link>

            <Link
              href="/dashboard"
              className="w-full sm:w-auto px-6 py-3.5 bg-slate-800/80 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-sm md:text-base border border-slate-700 transition-all"
            >
              View Dashboard & ROI
            </Link>
          </div>

          {/* Live Quick Verification Scenario Banner */}
          <div className="mt-12 bg-slate-800/60 border border-slate-700/80 rounded-2xl p-4 sm:p-6 text-left max-w-3xl mx-auto shadow-2xl backdrop-blur">
            <div className="flex items-center justify-between mb-3 border-b border-slate-700 pb-2">
              <span className="text-xs font-mono text-blue-400 uppercase tracking-wider font-bold flex items-center gap-1.5">
                <HardHat className="w-4 h-4" />
                Live Technician Test Scenario
              </span>
              <span className="text-[11px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded font-mono">
                Memory Loop Active
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 mb-3">
              Ask: <span className="font-mono text-blue-300">"Pump P-204 is showing excessive vibration and abnormal bearing noise. What happened in the past?"</span>
            </p>
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-700/60 text-xs text-slate-400">
              <span>Searches historical case & recall hindsight: <strong className="text-white">SKF 22216 EK + Thermal growth misalignment</strong></span>
              <Link href="/assistant" className="text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1">
                Test in Assistant →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* The Core Persistent Memory Loop Visual */}
      <section className="py-14 bg-slate-950 border-y border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              The Persistent Memory Loop
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Every completed repair transforms into persistent organizational memory for the next technician.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {[
              {
                step: '01',
                title: 'New Problem',
                desc: 'Technician reports symptoms or takes photo of failing machine.',
                color: 'text-amber-400',
              },
              {
                step: '02',
                title: 'Recall Memory',
                desc: 'Vector & structured search retrieves identical historical failures.',
                color: 'text-blue-400',
              },
              {
                step: '03',
                title: 'Guided Inspection',
                desc: 'AI generates suggested checks based on verified past root causes.',
                color: 'text-sky-400',
              },
              {
                step: '04',
                title: 'Perform Repair',
                desc: 'Technician executes fix, verifies outcome, and replaces components.',
                color: 'text-emerald-400',
              },
              {
                step: '05',
                title: 'Hindsight Stored',
                desc: 'Gemini synthesizes lesson learned directly into pgvector memory.',
                color: 'text-purple-400',
              },
            ].map((item, idx) => (
              <div
                key={item.step}
                className="bg-slate-900 border border-slate-800 rounded-xl p-4 relative flex flex-col justify-between"
              >
                <div>
                  <span className={`font-mono text-xs font-bold ${item.color}`}>
                    STEP {item.step}
                  </span>
                  <h3 className="font-bold text-sm text-white mt-1 mb-1.5">{item.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
                </div>
                {idx < 4 && (
                  <div className="hidden lg:block absolute -right-2 top-1/2 -translate-y-1/2 z-10 text-slate-600">
                    →
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Engineered for Industrial Reliability Teams
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            Eliminate repeated diagnostic guesswork and preserve institutional maintenance knowledge.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-slate-800/40 border border-slate-700 rounded-xl p-6">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center mb-4">
              <Database className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-white mb-2">Persistent Memory Bank</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every maintenance log, replaced part, and symptom is embedded with pgvector, creating permanent organizational recall.
            </p>
          </div>

          <div className="bg-slate-800/40 border border-slate-700 rounded-xl p-6">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-white mb-2">Grounded AI Diagnostic</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Strictly grounded on actual database evidence. The AI never hallucinates historical cases or invents unverified claims.
            </p>
          </div>

          <div className="bg-slate-800/40 border border-slate-700 rounded-xl p-6">
            <div className="w-10 h-10 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center mb-4">
              <History className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-white mb-2">Recurring Failure Flags</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Automatically clusters repeated failure symptoms on high-duty pumps, motors, and compressors across plant sectors.
            </p>
          </div>

          <div className="bg-slate-800/40 border border-slate-700 rounded-xl p-6">
            <div className="w-10 h-10 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center mb-4">
              <TrendingDown className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-white mb-2">Proven B2B ROI</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Reduce mean time to repair (MTTR) by 72% and eliminate $1,250/hr downtime expenses through fast hindsight recall.
            </p>
          </div>
        </div>
      </section>

      {/* B2B Pricing & SaaS Model */}
      <section className="py-16 bg-slate-950 border-t border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <span className="text-xs font-mono text-blue-400 uppercase tracking-widest font-bold">
            B2B SaaS Business Model
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mt-1 mb-4">
            Seat-Based Industrial Plant Licensing
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto mb-10">
            Predictable seat licensing designed for field maintenance crews and plant reliability departments.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white">Technician Seat</h3>
              <div className="mt-3 flex items-baseline">
                <span className="text-3xl font-extrabold text-white">$45</span>
                <span className="text-xs text-slate-400 ml-1.5">/ technician / month</span>
              </div>
              <p className="text-xs text-slate-400 mt-2">
                Ideal for field crews, mechanics, and instrumentation specialists.
              </p>
              <ul className="mt-5 space-y-2.5 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Unlimited mobile & tablet AI Memory chat</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Multimodal component photo diagnosis</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Automated post-repair Hindsight reflection</span>
                </li>
              </ul>
              <Link
                href="/login"
                className="mt-6 block text-center w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-colors"
              >
                Sign In as Technician
              </Link>
            </div>

            <div className="bg-slate-900 border border-blue-500/40 rounded-2xl p-6 relative">
              <div className="absolute top-4 right-4 bg-blue-500 text-white text-[10px] uppercase font-mono px-2 py-0.5 rounded font-bold">
                Manager Tier
              </div>
              <h3 className="text-lg font-bold text-white">Plant Reliability Suite</h3>
              <div className="mt-3 flex items-baseline">
                <span className="text-3xl font-extrabold text-white">$240</span>
                <span className="text-xs text-slate-400 ml-1.5">/ facility / month</span>
              </div>
              <p className="text-xs text-slate-400 mt-2">
                Fleet analytics, ROI calculation, recurring failure clusters, and team telemetry.
              </p>
              <ul className="mt-5 space-y-2.5 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Everything in Technician seat plan</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Recurring failure clustering & fleet metrics</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Downtime cost savings tracking ($1,250/hr)</span>
                </li>
              </ul>
              <Link
                href="/dashboard"
                className="mt-6 block text-center w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 rounded-xl text-xs font-bold transition-colors"
              >
                View Manager Analytics
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8 bg-slate-950 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} REPAIR-MIND. Industrial Field Technician Organizational Memory Agent.</p>
          <div className="flex items-center space-x-4">
            <Link href="/settings" className="hover:text-slate-300">
              System Health & Config
            </Link>
            <Link href="/assistant" className="hover:text-slate-300">
              Field Agent
            </Link>
            <Link href="/equipment" className="hover:text-slate-300">
              Fleet
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
