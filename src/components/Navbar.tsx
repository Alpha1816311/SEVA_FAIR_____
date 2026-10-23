/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ActiveRole } from '../types';
import { PlayCircle, RefreshCw, Users, Shield, Wrench, User } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  activeRole: ActiveRole;
  setActiveRole: (role: ActiveRole) => void;
  onOpenDemoTour: () => void;
  onOpenDeployGuide: () => void;
  onResetDemo: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  activeRole,
  setActiveRole,
  onOpenDemoTour,
  onOpenDeployGuide,
  onResetDemo
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setActiveTab('book')}
              className="text-left group flex items-center gap-2.5"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-base shadow-sm group-hover:bg-emerald-700 transition-colors">
                SF
              </div>
              <div>
                <span className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap block leading-tight">
                  SEVA FAIR
                </span>
                <span className="text-[10px] text-slate-500 font-medium tracking-wider uppercase block">
                  Fair Local Service Booking
                </span>
              </div>
            </button>
          </div>

          {/* Zone 2: 4-5 clean single-line text navigation links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <button
              onClick={() => setActiveTab('book')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
                activeTab === 'book' ? 'text-emerald-700 border-emerald-600 font-semibold' : 'border-transparent'
              }`}
            >
              Book Service
            </button>
            <button
              onClick={() => {
                setActiveRole('customer');
                setActiveTab('customer');
              }}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
                activeTab === 'customer' ? 'text-emerald-700 border-emerald-600 font-semibold' : 'border-transparent'
              }`}
            >
              Customer Portal
            </button>
            <button
              onClick={() => {
                setActiveRole('worker');
                setActiveTab('worker');
              }}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
                activeTab === 'worker' ? 'text-emerald-700 border-emerald-600 font-semibold' : 'border-transparent'
              }`}
            >
              Worker Portal
            </button>
            <button
              onClick={() => {
                setActiveRole('organiser');
                setActiveTab('organiser');
              }}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
                activeTab === 'organiser' ? 'text-emerald-700 border-emerald-600 font-semibold' : 'border-transparent'
              }`}
            >
              Organiser Console
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
                activeTab === 'history' ? 'text-emerald-700 border-emerald-600 font-semibold' : 'border-transparent'
              }`}
            >
              Audit Trail
            </button>
          </nav>

          {/* Zone 3: 1 primary action and quick controls */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Role indicator dropdown */}
            <div className="hidden sm:flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
              <button
                onClick={() => {
                  setActiveRole('customer');
                  setActiveTab('customer');
                }}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors flex items-center gap-1 ${
                  activeRole === 'customer'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="View as Customer"
              >
                <User className="w-3.5 h-3.5 text-slate-500" />
                <span>Customer</span>
              </button>
              <button
                onClick={() => {
                  setActiveRole('worker');
                  setActiveTab('worker');
                }}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors flex items-center gap-1 ${
                  activeRole === 'worker'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="View as Worker"
              >
                <Wrench className="w-3.5 h-3.5 text-slate-500" />
                <span>Worker</span>
              </button>
              <button
                onClick={() => {
                  setActiveRole('organiser');
                  setActiveTab('organiser');
                }}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors flex items-center gap-1 ${
                  activeRole === 'organiser'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="View as Organiser"
              >
                <Shield className="w-3.5 h-3.5 text-slate-500" />
                <span>Organiser</span>
              </button>
            </div>

            {/* Deploy to Vercel Button */}
            <button
              onClick={onOpenDeployGuide}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 active:scale-95 transition-all rounded-lg border border-slate-200"
              title="Step-by-step guide to publish to Vercel or run in VS Code"
            >
              <span className="text-[11px]">🚀</span>
              <span>Deploy to Vercel</span>
            </button>

            {/* Guided Demo Button - Hackathon Winning Presentation Flow */}
            <button
              onClick={onOpenDemoTour}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 transition-all rounded-lg shadow-xs flex items-center gap-1.5 whitespace-nowrap"
            >
              <PlayCircle className="w-3.5 h-3.5" />
              <span>Demo Tour</span>
            </button>

            {/* Quick Reset Demo DB */}
            <button
              onClick={onResetDemo}
              title="Reset Demo Data to Initial Seed"
              className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile nav subbar */}
      <div className="md:hidden flex items-center justify-between px-4 py-2 border-t border-slate-100 bg-slate-50 text-xs overflow-x-auto gap-4">
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
          Customer
        </button>
        <button
          onClick={() => {
            setActiveRole('worker');
            setActiveTab('worker');
          }}
          className={`whitespace-nowrap ${activeTab === 'worker' ? 'text-emerald-700 font-bold' : 'text-slate-600'}`}
        >
          Worker
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
          Audit
        </button>
        <button
          onClick={onOpenDeployGuide}
          className="whitespace-nowrap text-emerald-700 font-semibold flex items-center gap-1"
        >
          <span>🚀 Deploy</span>
        </button>
      </div>
    </header>
  );
};
