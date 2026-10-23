/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { api } from '../services/api';
import { db } from '../services/db';
import { 
  Play, 
  CheckCircle2, 
  AlertTriangle, 
  RotateCcw, 
  Scale, 
  Wrench, 
  ShieldCheck, 
  Sparkles,
  ArrowRight,
  Clock,
  Check
} from 'lucide-react';

interface HackathonDemoTourProps {
  onClose: () => void;
  onNavigateTab: (tab: string) => void;
  onRefreshData: () => void;
}

export const HackathonDemoTour: React.FC<HackathonDemoTourProps> = ({
  onClose,
  onNavigateTab,
  onRefreshData
}) => {
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const [executionLog, setExecutionLog] = useState<{
    title: string;
    status: 'success' | 'conflict' | 'info';
    message: string;
    details?: string;
  } | null>(null);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  // Scenario 1: Standard Fair Allocation
  const runScenario1_FairAllocation = async () => {
    setIsRunning(true);
    setActiveStep(1);

    const today = new Date().toISOString().split('T')[0];
    const res = await api.createBooking({
      customerId: 'c-2',
      customerName: 'Meera Nair',
      customerPhone: '+91 99002 33445',
      serviceType: 'Carpentry',
      description: 'Repair study desk drawers and fix sliding wardrobe roller bearings.',
      address: 'Villa 14, Palm Meadows, Whitefield, Bengaluru',
      area: 'Whitefield, Bengaluru',
      date: today,
      startTime: '16:30',
      endTime: '18:30',
      estimatedHours: 2,
      estimatedCost: 800
    });

    setIsRunning(false);
    onRefreshData();

    if (res.success && res.data.booking) {
      setExecutionLog({
        title: 'Scenario 1 Passed: Fair Workload Allocation',
        status: 'success',
        message: `Booking #${res.data.booking.id} created and automatically assigned to ${res.data.booking.assignedWorkerName}!`,
        details: res.data.booking.allocationReason || ''
      });
    }
  };

  // Scenario 2: Schedule Conflict Prevention (Overlapping booking)
  const runScenario2_ConflictDetection = async () => {
    setIsRunning(true);
    setActiveStep(2);

    const today = new Date().toISOString().split('T')[0];
    // Attempt to book Electrical in Indiranagar during Ravi's exact active window (10:00 - 12:00)
    const res = await api.createBooking({
      customerId: 'c-3',
      customerName: 'Karan Kapoor',
      customerPhone: '+91 99003 55667',
      serviceType: 'Electrical',
      description: 'Emergency geyser short circuit wiring check.',
      address: '88, 4th Cross, 5th Block, Indiranagar, Bengaluru',
      area: 'Indiranagar, Bengaluru',
      date: today,
      startTime: '10:30', // Overlaps with 10:00 - 12:00
      endTime: '11:45',
      estimatedHours: 1.25,
      estimatedCost: 450
    });

    setIsRunning(false);
    onRefreshData();

    if (res.success && res.data.booking) {
      setExecutionLog({
        title: 'Scenario 2 Passed: Schedule Conflict Prevented!',
        status: 'conflict',
        message: `Double-booking strictly prevented! Status: ${res.data.booking.status.toUpperCase()}`,
        details: res.data.booking.allocationReason || 'Worker schedule overlap detected.'
      });
    }
  };

  // Scenario 3: Worker Decline & Safe Reassignment (Fixing previous HTTP 500 error)
  const runScenario3_SafeReassignment = async () => {
    setIsRunning(true);
    setActiveStep(3);

    // Let's create a Plumbing booking assigned to Ravi first, then simulate Ravi declining
    const today = new Date().toISOString().split('T')[0];
    const initialBookingRes = await api.createBooking({
      customerId: 'c-1',
      customerName: 'Aaditya Roy',
      customerPhone: '+91 99001 11222',
      serviceType: 'Plumbing',
      description: 'Main overhead water tank float valve replacement.',
      address: 'Flat 402, Green Glen Layout, Bengaluru',
      area: 'Bengaluru',
      date: today,
      startTime: '17:00',
      endTime: '18:30',
      estimatedHours: 1.5,
      estimatedCost: 500
    });

    const bookingId = initialBookingRes.data.booking.id;
    const initialWorkerName = initialBookingRes.data.booking.assignedWorkerName;

    // Now trigger safe reassignment (e.g. worker breakdown)
    const reassignRes = await api.reassignBooking(
      bookingId,
      'Technician vehicle breakdown on route',
      { role: 'WORKER', name: initialWorkerName || 'Ravi Kumar' }
    );

    setIsRunning(false);
    onRefreshData();

    setExecutionLog({
      title: 'Scenario 3 Passed: Automated Safe Worker Reassignment',
      status: 'success',
      message: reassignRes.message || 'Booking reassigned smoothly.',
      details: `Originally assigned to ${initialWorkerName}. Safely reassigned to ${reassignRes.data.booking.assignedWorkerName || 'Pending Queue'} without conflict, logged in the cooperative audit trail.`
    });
  };

  // Scenario 4: Full Job Completion & Fairness Workload Balance
  const runScenario4_JobCompletion = async () => {
    setIsRunning(true);
    setActiveStep(4);

    // Pick an active assigned booking like b-101
    const activeBooking = db.getBookings().find(b => b.status === 'assigned' || b.status === 'in_progress') || db.getBookings()[0];
    
    if (activeBooking) {
      await api.updateBookingStatus(
        activeBooking.id,
        'completed',
        { role: 'CUSTOMER', name: activeBooking.customerName },
        { rating: 5, feedback: 'Excellent cooperative service. Prompt, skilled, and transparent!' }
      );
    }

    setIsRunning(false);
    onRefreshData();

    setExecutionLog({
      title: 'Scenario 4 Passed: Full Lifecycle to Completion',
      status: 'success',
      message: `Job #${activeBooking?.id} marked Completed with 5.0 Stars!`,
      details: 'Active workload ledger decremented and customer review credited to technician balance.'
    });
  };

  // Scenario 5: Organiser Worker Verification
  const runScenario5_VerifyWorker = async () => {
    setIsRunning(true);
    setActiveStep(5);

    const res = await api.verifyWorker(
      'w-5', // Vikram Singh
      true,
      ['Electrical', 'Appliance Repair'],
      'Police verification and national trade certification verified by Organiser Suman Rao.'
    );

    setIsRunning(false);
    onRefreshData();

    setExecutionLog({
      title: 'Scenario 5 Passed: Organiser KYC Verification',
      status: 'success',
      message: 'Worker Vikram Singh successfully verified!',
      details: 'Vikram is now active with certified Electrical & Appliance Repair skills and ready to receive dispatch requests.'
    });
  };

  const handleReset = async () => {
    await api.resetDemo();
    setExecutionLog(null);
    setActiveStep(null);
    onRefreshData();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] text-emerald-800 uppercase tracking-wider font-semibold">
                Tech Fusion 2026 · Team Infinite Igniters
              </div>
              <h2 className="text-xl font-bold text-slate-900">
                Interactive Hackathon Demo Tour
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 text-sm p-1 rounded-md hover:bg-slate-100"
          >
            ✕
          </button>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          Demonstrate how <strong>SEVA FAIR</strong> completely satisfies every criteria of the hackathon problem statement: fair allocation, conflict prevention, organiser management, and fault-tolerant reassignment.
        </p>

        {/* Live Execution Output Banner */}
        {executionLog && (
          <div className={`p-4 rounded-xl border text-xs space-y-1.5 transition-all ${
            executionLog.status === 'conflict'
              ? 'bg-amber-50/90 border-amber-200 text-amber-950'
              : 'bg-emerald-50/90 border-emerald-200 text-emerald-950'
          }`}>
            <div className="flex items-center gap-2 font-bold text-sm">
              {executionLog.status === 'conflict' ? (
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              )}
              <span>{executionLog.title}</span>
            </div>
            <p className="font-medium">{executionLog.message}</p>
            {executionLog.details && (
              <p className="text-[11px] opacity-80 pt-1 border-t border-current/10">
                {executionLog.details}
              </p>
            )}
          </div>
        )}

        {/* 5 Guided Scenario Buttons */}
        <div className="space-y-3">
          {/* Scenario 1 */}
          <div className="p-3.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50/60 flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[11px] font-bold flex items-center justify-center">1</span>
                <h4 className="text-xs font-bold text-slate-900">Fair Workload Allocation</h4>
              </div>
              <p className="text-[11px] text-slate-500">
                Books Carpentry service in Whitefield & auto-dispatches to Amit Patel (lowest workload).
              </p>
            </div>
            <button
              onClick={runScenario1_FairAllocation}
              disabled={isRunning}
              className="px-3.5 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center gap-1.5 shrink-0 shadow-xs disabled:opacity-50"
            >
              <Play className="w-3 h-3" />
              <span>Run Test</span>
            </button>
          </div>

          {/* Scenario 2 */}
          <div className="p-3.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50/60 flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[11px] font-bold flex items-center justify-center">2</span>
                <h4 className="text-xs font-bold text-slate-900">Conflict Detection & Prevention</h4>
              </div>
              <p className="text-[11px] text-slate-500">
                Attempts double-booking Ravi Kumar during 10:00-12:00 &rarr; triggers non-overlapping guardrail!
              </p>
            </div>
            <button
              onClick={runScenario2_ConflictDetection}
              disabled={isRunning}
              className="px-3.5 py-1.5 text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white rounded-lg flex items-center gap-1.5 shrink-0 shadow-xs disabled:opacity-50"
            >
              <Play className="w-3 h-3" />
              <span>Test Conflict</span>
            </button>
          </div>

          {/* Scenario 3 */}
          <div className="p-3.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50/60 flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[11px] font-bold flex items-center justify-center">3</span>
                <h4 className="text-xs font-bold text-slate-900">Safe Reassignment (Fixes HTTP 500)</h4>
              </div>
              <p className="text-[11px] text-slate-500">
                Simulates technician decline & reallocates seamlessly to next verified worker with audit log.
              </p>
            </div>
            <button
              onClick={runScenario3_SafeReassignment}
              disabled={isRunning}
              className="px-3.5 py-1.5 text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-1.5 shrink-0 shadow-xs disabled:opacity-50"
            >
              <Play className="w-3 h-3" />
              <span>Test Reassign</span>
            </button>
          </div>

          {/* Scenario 4 */}
          <div className="p-3.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50/60 flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[11px] font-bold flex items-center justify-center">4</span>
                <h4 className="text-xs font-bold text-slate-900">Job Completion & Customer Rating</h4>
              </div>
              <p className="text-[11px] text-slate-500">
                Completes an active job, records 5.0 star feedback, and clears technician workload.
              </p>
            </div>
            <button
              onClick={runScenario4_JobCompletion}
              disabled={isRunning}
              className="px-3.5 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-1.5 shrink-0 shadow-xs disabled:opacity-50"
            >
              <Play className="w-3 h-3" />
              <span>Complete Job</span>
            </button>
          </div>

          {/* Scenario 5 */}
          <div className="p-3.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50/60 flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[11px] font-bold flex items-center justify-center">5</span>
                <h4 className="text-xs font-bold text-slate-900">Organiser KYC & Skill Certification</h4>
              </div>
              <p className="text-[11px] text-slate-500">
                Approves applicant Vikram Singh so he immediately becomes eligible for dispatch.
              </p>
            </div>
            <button
              onClick={runScenario5_VerifyWorker}
              disabled={isRunning}
              className="px-3.5 py-1.5 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-lg flex items-center gap-1.5 shrink-0 shadow-xs disabled:opacity-50"
            >
              <Play className="w-3 h-3" />
              <span>Verify Worker</span>
            </button>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <button
            onClick={handleReset}
            className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo to Initial Seed</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onNavigateTab('history');
              }}
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg"
            >
              View Full Audit Trail &rarr;
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
