/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ActiveRole, Booking } from './types';
import { db } from './services/db';
import { api } from './services/api';
import { Navbar } from './components/Navbar';
import { LandingAndBooking } from './components/LandingAndBooking';
import { CustomerDashboard } from './components/CustomerDashboard';
import { WorkerDashboard } from './components/WorkerDashboard';
import { OrganiserDashboard } from './components/OrganiserDashboard';
import { AuditLedgerView } from './components/AuditLedgerView';
import { HackathonDemoTour } from './components/HackathonDemoTour';
import { VercelDeployGuideModal } from './components/VercelDeployGuideModal';
import { ShieldCheck, Heart, Sparkles, Scale, RefreshCw, Zap, RotateCcw, CheckCircle2, Rocket } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('book');
  const [activeRole, setActiveRole] = useState<ActiveRole>('customer');
  const [activeCustomerId, setActiveCustomerId] = useState<string>('c-1');
  const [activeWorkerId, setActiveWorkerId] = useState<string>('w-1');
  const [showDemoTour, setShowDemoTour] = useState<boolean>(false);
  const [showDeployGuide, setShowDeployGuide] = useState<boolean>(false);
  const [refreshKey, setRefreshKey] = useState<number>(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Subscribe to reactive database changes
  useEffect(() => {
    const unsubscribe = db.subscribe(() => {
      setRefreshKey(prev => prev + 1);
    });
    return unsubscribe;
  }, []);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleBookingCreated = (booking: Booking) => {
    triggerToast(`Booking #${booking.id} created! Dispatched via fair allocation.`);
  };

  const handleNavigateToCustomer = (customerId: string) => {
    setActiveCustomerId(customerId);
    setActiveRole('customer');
    setActiveTab('customer');
  };

  const handleResetDemo = async () => {
    await api.resetDemo();
    triggerToast('Database reset to clean demo seed state!');
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 font-sans">
      {/* Top Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeRole={activeRole}
        setActiveRole={role => {
          setActiveRole(role);
          if (role === 'customer') setActiveTab('customer');
          else if (role === 'worker') setActiveTab('worker');
          else if (role === 'organiser') setActiveTab('organiser');
        }}
        onOpenDemoTour={() => setShowDemoTour(true)}
        onOpenDeployGuide={() => setShowDeployGuide(true)}
        onResetDemo={handleResetDemo}
      />

      {/* Hackathon Evaluator Quick-Bar for Non-Tech Judges */}
      <div className="bg-slate-900 text-white border-b border-slate-800 py-2.5 px-4 sm:px-6 lg:px-8 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-semibold text-slate-200">Hackathon Prototype:</span>
            <span className="text-slate-400 hidden sm:inline">Cooperative Booking & Fair Allocation Engine</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowDemoTour(true)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-3 py-1 rounded-md flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
              <span>1-Click Hackathon Demo Tour</span>
            </button>

            <button
              onClick={() => {
                setActiveRole('organiser');
                setActiveTab('organiser');
              }}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1 rounded-md flex items-center gap-1 transition-colors border border-slate-700"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Organiser Verification</span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1 rounded-md flex items-center gap-1 transition-colors border border-slate-700"
            >
              <Scale className="w-3.5 h-3.5 text-blue-400" />
              <span>Allocation Audit Trail</span>
            </button>

            <button
              onClick={() => setShowDeployGuide(true)}
              className="bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-700/60 px-2.5 py-1 rounded-md flex items-center gap-1 transition-colors"
            >
              <Rocket className="w-3.5 h-3.5" />
              <span>Deploy to Vercel</span>
            </button>
          </div>
        </div>
      </div>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white ml-2 text-sm"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Viewport Content */}
      <main className="flex-1 pb-16" key={refreshKey}>
        {activeTab === 'book' && (
          <LandingAndBooking
            onBookingCreated={handleBookingCreated}
            onNavigateToCustomer={handleNavigateToCustomer}
            onOpenDemoTour={() => setShowDemoTour(true)}
          />
        )}

        {activeTab === 'customer' && (
          <CustomerDashboard
            initialCustomerId={activeCustomerId}
            onNavigateToBooking={() => setActiveTab('book')}
          />
        )}

        {activeTab === 'worker' && (
          <WorkerDashboard
            initialWorkerId={activeWorkerId}
            onOpenOrganiser={() => {
              setActiveRole('organiser');
              setActiveTab('organiser');
            }}
          />
        )}

        {activeTab === 'organiser' && (
          <OrganiserDashboard
            onRefreshAll={() => setRefreshKey(prev => prev + 1)}
          />
        )}

        {activeTab === 'history' && (
          <AuditLedgerView />
        )}
      </main>

      {/* Interactive Hackathon Demo Tour Modal */}
      {showDemoTour && (
        <HackathonDemoTour
          onClose={() => setShowDemoTour(false)}
          onNavigateTab={tab => {
            setActiveTab(tab);
            if (tab === 'customer') setActiveRole('customer');
            else if (tab === 'worker') setActiveRole('worker');
            else if (tab === 'organiser') setActiveRole('organiser');
          }}
          onRefreshData={() => setRefreshKey(prev => prev + 1)}
        />
      )}

      {/* Vercel & VS Code Deployment Guide Modal */}
      {showDeployGuide && (
        <VercelDeployGuideModal
          onClose={() => setShowDeployGuide(false)}
        />
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-8 px-4 sm:px-6 lg:px-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-emerald-600 text-white font-bold flex items-center justify-center text-[10px]">
              SF
            </div>
            <span className="font-semibold text-slate-800">SEVA FAIR</span>
            <span>·</span>
            <span>Cooperative Local Service Booking & Workload Distribution</span>
          </div>

          <div className="flex items-center gap-6 text-slate-600">
            <button
              onClick={() => setActiveTab('book')}
              className="hover:text-slate-900 transition-colors"
            >
              Book Service
            </button>
            <button
              onClick={() => {
                setActiveRole('worker');
                setActiveTab('worker');
              }}
              className="hover:text-slate-900 transition-colors"
            >
              Worker Portal
            </button>
            <button
              onClick={() => {
                setActiveRole('organiser');
                setActiveTab('organiser');
              }}
              className="hover:text-slate-900 transition-colors"
            >
              Organiser Console
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className="hover:text-slate-900 transition-colors"
            >
              Audit Trail
            </button>
            <button
              onClick={() => setShowDemoTour(true)}
              className="text-emerald-700 font-semibold hover:underline"
            >
              Demo Tour
            </button>
            <button
              onClick={() => setShowDeployGuide(true)}
              className="text-slate-700 font-medium hover:text-emerald-700 transition-colors flex items-center gap-1"
            >
              <span>🚀 Deploy to Vercel</span>
            </button>
          </div>

          <div className="text-[11px] text-slate-400">
            Tech Fusion 2026 · Team Infinite Igniters
          </div>
        </div>
      </footer>
    </div>
  );
}
