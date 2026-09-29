'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import {
  LayoutDashboard,
  Cpu,
  Wrench,
  FileText,
  BookOpen,
  Settings,
  LogOut,
  Menu,
  X,
  HardHat,
  ShieldCheck,
  PlusCircle,
  Database,
  Search,
  Sparkles,
} from 'lucide-react';
import FloatingAssistantDrawer from '@/components/assistant/FloatingAssistantDrawer';

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, switchRole } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [assistantDrawerOpen, setAssistantDrawerOpen] = useState(false);

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'AI Technician', href: '/assistant', icon: Cpu, highlight: true },
    { name: 'Equipment Fleet', href: '/equipment', icon: Wrench },
    { name: 'Maintenance Logs', href: '/maintenance', icon: FileText },
    { name: 'Knowledge Base', href: '/knowledge', icon: BookOpen },
    { name: 'Documents', href: '/documents', icon: Database },
    { name: 'Settings & Setup', href: '/settings', icon: Settings },
  ];

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row text-slate-800">
      {/* Mobile Top Navigation */}
      <div className="md:hidden bg-slate-900 text-white flex items-center justify-between px-4 py-3 border-b border-slate-800 sticky top-0 z-40">
        <Link href="/dashboard" className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center font-bold text-white shadow">
            RM
          </div>
          <div>
            <span className="font-bold tracking-tight text-white block text-sm">REPAIR-MIND</span>
            <span className="text-[10px] text-blue-400 block tracking-wider uppercase">Memory Agent</span>
          </div>
        </Link>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setAssistantDrawerOpen(true)}
            className="p-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs flex items-center gap-1 font-medium px-2.5"
            title="Ask AI Assistant"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Ask</span>
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-300 hover:text-white rounded-md"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <aside
        className={`fixed md:sticky top-0 h-screen w-64 bg-slate-900 text-slate-200 border-r border-slate-800 flex flex-col z-30 transition-transform duration-200 ease-in-out ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800/80">
          <Link href="/dashboard" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-lg bg-blue-600 group-hover:bg-blue-500 transition-colors flex items-center justify-center shadow-lg shadow-blue-500/20 text-white font-extrabold text-base tracking-wider">
              RM
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-lg tracking-tight text-white">REPAIR-MIND</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="System Online" />
              </div>
              <p className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                Industrial Memory AI
              </p>
            </div>
          </Link>
        </div>

        {/* Quick Action Button */}
        <div className="px-4 pt-4 pb-2">
          <Link
            href="/maintenance/new"
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-2 px-3 rounded-lg text-sm flex items-center justify-center space-x-2 shadow-sm transition-all"
            onClick={() => setMobileMenuOpen(false)}
          >
            <PlusCircle className="w-4 h-4" />
            <span>Record Repair Case</span>
          </Link>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname?.startsWith(item.href));
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                } ${item.highlight && !isActive ? 'border border-blue-500/30 text-blue-300 bg-blue-950/20' : ''}`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : item.highlight ? 'text-blue-400' : 'text-slate-400'}`} />
                <span>{item.name}</span>
                {item.highlight && (
                  <span className="ml-auto text-[10px] bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded font-mono uppercase">
                    Agent
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Profile & Role Switcher */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/50">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 font-bold text-xs uppercase">
              {user?.full_name ? user.full_name.slice(0, 2) : 'TK'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">
                {user?.full_name || 'Dave Kowalski'}
              </p>
              <div className="flex items-center space-x-1">
                {user?.role === 'manager' ? (
                  <ShieldCheck className="w-3 h-3 text-amber-400" />
                ) : (
                  <HardHat className="w-3 h-3 text-blue-400" />
                )}
                <span className="text-[11px] text-slate-400 capitalize">
                  {user?.role || 'Technician'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Role Toggle for Testing Personas */}
          <div className="flex items-center justify-between text-xs bg-slate-900 border border-slate-800 rounded-md p-1 mb-2">
            <button
              onClick={() => switchRole('technician')}
              className={`flex-1 py-1 text-center rounded text-[11px] transition-all font-medium ${
                user?.role === 'technician' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Field Tech
            </button>
            <button
              onClick={() => switchRole('manager')}
              className={`flex-1 py-1 text-center rounded text-[11px] transition-all font-medium ${
                user?.role === 'manager' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Manager
            </button>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 text-xs text-slate-400 hover:text-rose-400 py-1.5 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top telemetry bar */}
        <header className="hidden md:flex h-14 bg-white border-b border-slate-200 items-center justify-between px-6 sticky top-0 z-20">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-xs text-slate-600 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>PERSISTENT MEMORY ENGINE: ACTIVE</span>
              <span className="text-slate-300">|</span>
              <span className="text-slate-500">SECTOR 3 CHEMICAL & MILLING</span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setAssistantDrawerOpen(true)}
              className="flex items-center space-x-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs px-3 py-1.5 rounded-lg font-medium transition-colors shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Quick AI Recall</span>
            </button>

            <Link
              href="/knowledge"
              className="p-2 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100"
              title="Search Knowledge"
            >
              <Search className="w-4 h-4" />
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </div>
      </main>

      {/* Floating Assistant Drawer for immediate recall on any page */}
      <FloatingAssistantDrawer
        isOpen={assistantDrawerOpen}
        onClose={() => setAssistantDrawerOpen(false)}
      />
    </div>
  );
}
