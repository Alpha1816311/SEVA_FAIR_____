/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ActiveRole, UserSession } from '../types';
import { authService } from '../services/authService';
import { 
  Shield, 
  Wrench, 
  User, 
  Lock, 
  ChevronDown, 
  RotateCcw,
  Sparkles,
  CheckCircle2,
  LogOut
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  activeRole: ActiveRole;
  setActiveRole: (role: ActiveRole) => void;
  onOpenAuthModal: () => void;
  onResetDemo: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  activeRole,
  setActiveRole,
  onOpenAuthModal,
  onResetDemo
}) => {
  const session = authService.getCurrentSession();

  const getRoleBadge = (role: ActiveRole) => {
    switch (role) {
      case 'organiser':
        return { label: 'Administrator', bg: 'bg-purple-100 text-purple-800 border-purple-200' };
      case 'worker':
        return { label: 'Verified Technician', bg: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
      default:
        return { label: 'Resident', bg: 'bg-blue-100 text-blue-800 border-blue-200' };
    }
  };

  const badge = session ? getRoleBadge(session.role) : { label: 'Guest', bg: 'bg-slate-100 text-slate-700 border-slate-200' };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 h-16">
          {/* Brand Wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setActiveTab('book')}
              className="text-left group flex items-center gap-2.5"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-700 flex items-center justify-center text-white font-bold text-base shadow-xs group-hover:bg-emerald-800 transition-colors">
                SF
              </div>
              <div>
                <span className="text-lg font-extrabold tracking-tight text-slate-900 whitespace-nowrap block leading-tight">
                  SEVA FAIR
                </span>
                <span className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase block">
                  Cooperative Service Network
                </span>
              </div>
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600">
            <button
              onClick={() => setActiveTab('book')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap py-1 border-b-2 ${
                activeTab === 'book' ? 'text-emerald-700 border-emerald-700 font-bold' : 'border-transparent'
              }`}
            >
              Book Service
            </button>
            <button
              onClick={() => {
                setActiveRole('customer');
                setActiveTab('customer');
              }}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap py-1 border-b-2 ${
                activeTab === 'customer' ? 'text-emerald-700 border-emerald-700 font-bold' : 'border-transparent'
              }`}
            >
              Resident Portal
            </button>
            <button
              onClick={() => {
                setActiveRole('worker');
                setActiveTab('worker');
              }}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap py-1 border-b-2 ${
                activeTab === 'worker' ? 'text-emerald-700 border-emerald-700 font-bold' : 'border-transparent'
              }`}
            >
              Technician Portal
            </button>
            <button
              onClick={() => {
                setActiveRole('organiser');
                setActiveTab('organiser');
              }}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap py-1 border-b-2 ${
                activeTab === 'organiser' ? 'text-emerald-700 border-emerald-700 font-bold' : 'border-transparent'
              }`}
            >
              Organiser Console
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap py-1 border-b-2 ${
                activeTab === 'history' ? 'text-emerald-700 border-emerald-700 font-bold' : 'border-transparent'
              }`}
            >
              Dispatch Audit Ledger
            </button>
          </nav>

          {/* Right Section: User Session & Security Profile */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Authenticated user profile badge */}
            <button
              onClick={onOpenAuthModal}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all text-left"
              title="Click to switch account or manage credentials"
            >
              <div className="w-7 h-7 rounded-full bg-emerald-700 text-white font-bold flex items-center justify-center text-xs shadow-xs">
                {session?.avatar || 'U'}
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-xs font-bold text-slate-900 leading-tight">
                  {session?.name || 'Guest User'}
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className={`text-[9px] px-1.5 py-0.2 rounded font-medium border ${badge.bg}`}>
                    {badge.label}
                  </span>
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Subtle reset seed data control */}
            <button
              onClick={onResetDemo}
              title="Reset records to default clean state"
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile navigation bar */}
      <div className="md:hidden flex items-center justify-between px-4 py-2 border-t border-slate-100 bg-slate-50 text-xs overflow-x-auto gap-3">
        <button
          onClick={() => setActiveTab('book')}
          className={`whitespace-nowrap ${activeTab === 'book' ? 'text-emerald-700 font-bold' : 'text-slate-600'}`}
        >
          Book
        </button>
        <button
          onClick={() => {
            setActiveRole('customer');
            setActiveTab('customer');
          }}
          className={`whitespace-nowrap ${activeTab === 'customer' ? 'text-emerald-700 font-bold' : 'text-slate-600'}`}
        >
          Resident
        </button>
        <button
          onClick={() => {
            setActiveRole('worker');
            setActiveTab('worker');
          }}
          className={`whitespace-nowrap ${activeTab === 'worker' ? 'text-emerald-700 font-bold' : 'text-slate-600'}`}
        >
          Technician
        </button>
        <button
          onClick={() => {
            setActiveRole('organiser');
            setActiveTab('organiser');
          }}
          className={`whitespace-nowrap ${activeTab === 'organiser' ? 'text-emerald-700 font-bold' : 'text-slate-600'}`}
        >
          Organiser
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`whitespace-nowrap ${activeTab === 'history' ? 'text-emerald-700 font-bold' : 'text-slate-600'}`}
        >
          Audit Ledger
        </button>
      </div>
    </header>
  );
};
