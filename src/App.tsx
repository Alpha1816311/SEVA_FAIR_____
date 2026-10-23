/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ActiveRole, Booking, UserSession } from './types';
import { db } from './services/db';
import { api } from './services/api';
import { authService } from './services/authService';
import { Navbar } from './components/Navbar';
import { LandingAndBooking } from './components/LandingAndBooking';
import { CustomerDashboard } from './components/CustomerDashboard';
import { WorkerDashboard } from './components/WorkerDashboard';
import { OrganiserDashboard } from './components/OrganiserDashboard';
import { AuditLedgerView } from './components/AuditLedgerView';
import { HackathonDemoTour } from './components/HackathonDemoTour';
import { AuthModal } from './components/AuthModal';
import { 
  ShieldCheck, 
  Lock, 
  Sparkles, 
  Scale, 
  Shield, 
  CheckCircle2, 
  ArrowRight,
  UserCheck,
  Cpu
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('book');
  const [session, setSession] = useState<UserSession | null>(authService.getCurrentSession());
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [showSimulationModal, setShowSimulationModal] = useState<boolean>(false);
  const [refreshKey, setRefreshKey] = useState<number>(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Synchronize session and reactive DB updates
  useEffect(() => {
    const unsubAuth = authService.subscribe(newSession => {
      setSession(newSession);
      setRefreshKey(prev => prev + 1);
    });

    const unsubDb = db.subscribe(() => {
      setRefreshKey(prev => prev + 1);
    });

    return () => {
      unsubAuth();
      unsubDb();
    };
  }, []);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleBookingCreated = (booking: Booking) => {
    triggerToast(`Booking #${booking.id} dispatched via fair allocation protocol.`);
  };

  const handleNavigateToCustomer = (customerId: string) => {
    setActiveTab('customer');
  };

  const handleResetDemo = async () => {
    await api.resetDemo();
    triggerToast('Cooperative database reset to initial verified state.');
    setRefreshKey(prev => prev + 1);
  };

  const activeRole: ActiveRole = session?.role || 'customer';
  const activeWorkerId = session?.workerId || 'w-1';
  const activeCustomerId = session?.customerId || 'c-1';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 font-sans selection:bg-emerald-500/20 selection:text-emerald-900">
      {/* Top Navigation Bar with Authentication Profile */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeRole={activeRole}
        setActiveRole={role => {
          if (role === 'customer') setActiveTab('customer');
          else if (role === 'worker') setActiveTab('worker');
          else if (role === 'organiser') setActiveTab('organiser');
        }}
        onOpenAuthModal={() => setShowAuthModal(true)}
        onResetDemo={handleResetDemo}
      />

      {/* Floating System Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
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
              setActiveTab('organiser');
            }}
          />
        )}

        {/* Protected Organiser Console with RBAC Guard */}
        {activeTab === 'organiser' && (
          session?.role === 'organiser' ? (
            <div className="space-y-4">
              {/* Executive Sub-Header with Engine Diagnostics trigger */}
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span>Cooperative Governance System Active · Administrator: {session.name}</span>
                </div>
                <button
                  onClick={() => setShowSimulationModal(true)}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs rounded-lg shadow-xs flex items-center gap-1.5 transition-colors"
                >
                  <Cpu className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Dispatch Engine Diagnostics</span>
                </button>
              </div>

              <OrganiserDashboard
                onRefreshAll={() => setRefreshKey(prev => prev + 1)}
              />
            </div>
          ) : (
            /* Security RBAC Authorization Gate */
            <div className="max-w-xl mx-auto my-16 px-4">
              <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm text-center space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 mx-auto flex items-center justify-center">
                  <Lock className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider bg-purple-50 text-purple-700 px-2 py-0.5 rounded font-bold">
                    RBAC Restricted Route
                  </span>
                  <h2 className="text-xl font-bold text-slate-900">Administrator Access Required</h2>
                </div>
                <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                  Worker KYC background checks, government ID verification, and algorithmic dispatch policies are restricted to cooperative organisers.
                </p>
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    onClick={() => setShowAuthModal(true)}
                    className="w-full sm:w-auto px-4 py-2.5 bg-purple-700 hover:bg-purple-800 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>Authenticate as Organiser (Suman Rao)</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('book')}
                    className="w-full sm:w-auto px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors"
                  >
                    Return to Booking
                  </button>
                </div>
              </div>
            </div>
          )
        )}

        {activeTab === 'history' && (
          <div className="space-y-4">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 flex items-center justify-end">
              <button
                onClick={() => setShowSimulationModal(true)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs rounded-lg flex items-center gap-1.5 transition-colors"
              >
                <Cpu className="w-3.5 h-3.5 text-slate-600" />
                <span>Verify Invariants in Simulator</span>
              </button>
            </div>
            <AuditLedgerView />
          </div>
        )}
      </main>

      {/* Role-Based Authentication & Session Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onLoginSuccess={newSession => {
          setSession(newSession);
          if (newSession.role === 'customer') setActiveTab('customer');
          else if (newSession.role === 'worker') setActiveTab('worker');
          else if (newSession.role === 'organiser') setActiveTab('organiser');
        }}
      />

      {/* Professional Dispatch Engine Simulation Modal */}
      {showSimulationModal && (
        <HackathonDemoTour
          onClose={() => setShowSimulationModal(false)}
          onNavigateTab={tab => {
            setActiveTab(tab);
          }}
          onRefreshData={() => setRefreshKey(prev => prev + 1)}
        />
      )}

      {/* Clean Enterprise Footer */}
      <footer className="bg-white border-t border-slate-200 py-8 px-4 sm:px-6 lg:px-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-emerald-700 text-white font-bold flex items-center justify-center text-[10px]">
              SF
            </div>
            <span className="font-semibold text-slate-800">SEVA FAIR</span>
            <span>·</span>
            <span>Cooperative Household Services & Workload Balancing Network</span>
          </div>

          <div className="flex items-center gap-6 text-slate-600">
            <button
              onClick={() => setActiveTab('book')}
              className="hover:text-slate-900 transition-colors"
            >
              Book Service
            </button>
            <button
              onClick={() => setActiveTab('customer')}
              className="hover:text-slate-900 transition-colors"
            >
              Resident Portal
            </button>
            <button
              onClick={() => setActiveTab('worker')}
              className="hover:text-slate-900 transition-colors"
            >
              Technician Portal
            </button>
            <button
              onClick={() => setActiveTab('organiser')}
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
              onClick={() => setShowSimulationModal(true)}
              className="text-slate-700 font-semibold hover:text-emerald-700 transition-colors"
            >
              Engine Diagnostics
            </button>
          </div>

          <div className="text-[11px] text-slate-400">
            Cooperative Governance Protocol · Fair Work Standards
          </div>
        </div>
      </footer>
    </div>
  );
}
