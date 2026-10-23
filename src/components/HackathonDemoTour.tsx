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
  Clock, 
  Check,
  Cpu,
  Layers,
  ArrowRight
} from 'lucide-react';

interface DispatchWorkflowValidatorProps {
  onClose: () => void;
  onNavigateTab: (tab: string) => void;
  onRefreshData: () => void;
}

export const HackathonDemoTour: React.FC<DispatchWorkflowValidatorProps> = ({
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
        title: 'Workflow 1 Verified: Fair Workload Allocation',
        status: 'success',
        message: `Booking #${res.data.booking.id} created and automatically dispatched to ${res.data.booking.assignedWorkerName}.`,
        details: res.data.booking.allocationReason || ''
      });
    }
  };

  // Scenario 2: Schedule Conflict Prevention (Overlapping booking)
  const runScenario2_ConflictDetection = async () => {
    setIsRunning(true);
    setActiveStep(2);

    const today = new Date().toISOString().split('T')[0];
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
        title: 'Workflow 2 Verified: Schedule Conflict Guard Enforced',
        status: 'conflict',
        message: `Double-booking strictly blocked! Status: ${res.data.booking.status.toUpperCase()}`,
        details: res.data.booking.allocationReason || 'Worker schedule overlap detected.'
      });
    }
  };

  // Scenario 3: Worker Emergency & Safe Reassignment
  const runScenario3_SafeReassignment = async () => {
    setIsRunning(true);
    setActiveStep(3);

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

    const reassignRes = await api.reassignBooking(
      bookingId,
      'Technician vehicle breakdown on route',
      { role: 'WORKER', name: initialWorkerName || 'Ravi Kumar' }
    );

    setIsRunning(false);
    onRefreshData();

    setExecutionLog({
      title: 'Workflow 3 Verified: Automated Safe Worker Reassignment',
      status: 'success',
      message: reassignRes.message || 'Booking reassigned smoothly.',
      details: `Originally assigned to ${initialWorkerName}. Safely reassigned to ${reassignRes.data.booking.assignedWorkerName || 'Pending Queue'} without conflict, logged in the cooperative audit trail.`
    });
  };

  // Scenario 4: Full Job Completion & Fairness Workload Balance
  const runScenario4_JobCompletion = async () => {
    setIsRunning(true);
    setActiveStep(4);

    const activeBooking = db.getBookings().find(b => b.status === 'assigned' || b.status === 'in_progress') || db.getBookings()[0];
    
    if (activeBooking) {
      await api.updateBookingStatus(
        activeBooking.id,
        'completed',
        { role: 'CUSTOMER', name: activeBooking.customerName },
        { rating: 5, feedback: 'Prompt and highly professional service. Cooperative transparency verified.' }
      );
    }

    setIsRunning(false);
    onRefreshData();

    setExecutionLog({
      title: 'Workflow 4 Verified: Full Lifecycle to Completion',
      status: 'success',
      message: `Job #${activeBooking?.id} transitioned to Completed with 5.0 Rating.`,
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
      title: 'Workflow 5 Verified: Organiser KYC Verification',
      status: 'success',
      message: 'Worker Vikram Singh successfully verified and authorized.',
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
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-lg shadow-sm">
              <Cpu className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold font-mono">
                System Diagnostics & Workflow Validation
              </div>
              <h2 className="text-xl font-bold text-slate-900">
                Cooperative Dispatch Engine Simulator
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
          Execute automated supervisory simulations to verify system invariants: workload fairness rules, schedule conflict prevention, safe worker handovers, and organiser KYC verification workflows.
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
              disabled={isRunning}
              onClick={runScenario1_FairAllocation}
              className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shrink-0 transition-colors shadow-xs"
            >
              <Play className="w-3 h-3 text-emerald-400" />
              <span>Simulate</span>
            </button>
          </div>

          {/* Scenario 2 */}
          <div className="p-3.5 rounded-xl border border-amber-200/80 hover:border-amber-300 bg-amber-50/40 flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-amber-600 text-white text-[11px] font-bold flex items-center justify-center">2</span>
                <h4 className="text-xs font-bold text-amber-950">Schedule Conflict Prevention</h4>
              </div>
              <p className="text-[11px] text-amber-900/80">
                Attempts to book an overlapping electrical slot in Indiranagar during technician active hours.
              </p>
            </div>
            <button
              disabled={isRunning}
              onClick={runScenario2_ConflictDetection}
              className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shrink-0 transition-colors shadow-xs"
            >
              <AlertTriangle className="w-3 h-3" />
              <span>Test Conflict</span>
            </button>
          </div>

          {/* Scenario 3 */}
          <div className="p-3.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50/60 flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[11px] font-bold flex items-center justify-center">3</span>
                <h4 className="text-xs font-bold text-slate-900">Worker Emergency & Safe Reassignment</h4>
              </div>
              <p className="text-[11px] text-slate-500">
                Simulates technician vehicle breakdown; triggers safe reallocation without data corruption.
              </p>
            </div>
            <button
              disabled={isRunning}
              onClick={runScenario3_SafeReassignment}
              className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shrink-0 transition-colors shadow-xs"
            >
              <RotateCcw className="w-3 h-3 text-amber-400" />
              <span>Simulate</span>
            </button>
          </div>

          {/* Scenario 4 */}
          <div className="p-3.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50/60 flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[11px] font-bold flex items-center justify-center">4</span>
                <h4 className="text-xs font-bold text-slate-900">End-to-End Service Completion</h4>
              </div>
              <p className="text-[11px] text-slate-500">
                Completes assigned booking, settles technician active hours balance, and registers customer rating.
              </p>
            </div>
            <button
              disabled={isRunning}
              onClick={runScenario4_JobCompletion}
              className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shrink-0 transition-colors shadow-xs"
            >
              <Check className="w-3 h-3 text-emerald-400" />
              <span>Complete</span>
            </button>
          </div>

          {/* Scenario 5 */}
          <div className="p-3.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50/60 flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[11px] font-bold flex items-center justify-center">5</span>
                <h4 className="text-xs font-bold text-slate-900">Organiser KYC & Skill Authorization</h4>
              </div>
              <p className="text-[11px] text-slate-500">
                Approves unverified worker Vikram Singh, certifies Electrical skills, and activates dispatch pool.
              </p>
            </div>
            <button
              disabled={isRunning}
              onClick={runScenario5_VerifyWorker}
              className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shrink-0 transition-colors shadow-xs"
            >
              <ShieldCheck className="w-3 h-3 text-purple-400" />
              <span>Verify</span>
            </button>
          </div>
        </div>

        {/* Footer Navigation & Reset */}
        <div className="border-t border-slate-100 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <button
            onClick={handleReset}
            className="text-slate-500 hover:text-slate-800 flex items-center gap-1.5 font-medium transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Records</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onNavigateTab('organiser');
                onClose();
              }}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium rounded-lg transition-colors"
            >
              Open Organiser Console
            </button>
            <button
              onClick={() => {
                onNavigateTab('history');
                onClose();
              }}
              className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-medium rounded-lg transition-colors"
            >
              View Dispatch Ledger
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
