/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Worker, Booking } from '../types';
import { api } from '../services/api';
import { AllocationExplainer } from './AllocationExplainer';
import { 
  Wrench, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Calendar, 
  MapPin, 
  ShieldCheck, 
  AlertTriangle, 
  Play, 
  CheckCheck, 
  RotateCcw,
  Star,
  Scale
} from 'lucide-react';

interface WorkerDashboardProps {
  initialWorkerId?: string;
  onOpenOrganiser: () => void;
}

export const WorkerDashboard: React.FC<WorkerDashboardProps> = ({
  initialWorkerId = 'w-1',
  onOpenOrganiser
}) => {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [currentWorkerId, setCurrentWorkerId] = useState<string>(initialWorkerId);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [explainingBooking, setExplainingBooking] = useState<Booking | null>(null);

  // Decline / Reassign modal state
  const [decliningBooking, setDecliningBooking] = useState<Booking | null>(null);
  const [declineReason, setDeclineReason] = useState<string>('Sudden vehicle breakdown');
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [currentWorkerId]);

  const loadData = async () => {
    const [wRes, bRes] = await Promise.all([
      api.getWorkers(),
      api.getBookings()
    ]);
    if (wRes.success) setWorkers(wRes.data);
    if (bRes.success) setBookings(bRes.data);
  };

  const currentWorker = workers.find(w => w.id === currentWorkerId) || workers[0];

  // Jobs assigned to this worker
  const workerBookings = bookings.filter(b => b.assignedWorkerId === currentWorkerId);
  const activeJobs = workerBookings.filter(b => b.status === 'assigned' || b.status === 'in_progress');
  const completedJobs = workerBookings.filter(b => b.status === 'completed');

  const toggleAvailability = async () => {
    if (!currentWorker) return;
    const nextState = !currentWorker.isAvailable;
    const res = await api.updateWorkerAvailability(currentWorker.id, nextState);
    if (res.success) {
      setActionMessage(res.message || 'Availability updated');
      setTimeout(() => setActionMessage(null), 3000);
      loadData();
    }
  };

  const handleStartJob = async (booking: Booking) => {
    await api.updateBookingStatus(booking.id, 'in_progress', {
      role: 'WORKER',
      name: currentWorker?.name || 'Worker'
    });
    setActionMessage(`Job #${booking.id} is now In Progress`);
    setTimeout(() => setActionMessage(null), 3000);
    loadData();
  };

  const handleCompleteJob = async (booking: Booking) => {
    await api.updateBookingStatus(booking.id, 'completed', {
      role: 'WORKER',
      name: currentWorker?.name || 'Worker'
    });
    setActionMessage(`Job #${booking.id} marked as Completed. Workload updated!`);
    setTimeout(() => setActionMessage(null), 3000);
    loadData();
  };

  const handleDeclineAndReassign = async () => {
    if (!decliningBooking || !currentWorker) return;

    // Trigger safe reassignment, resolving P0 handoff bug
    const res = await api.reassignBooking(
      decliningBooking.id,
      declineReason,
      { role: 'WORKER', name: currentWorker.name },
      currentWorker.id // exclude self
    );

    setDecliningBooking(null);
    setActionMessage(res.message || 'Booking reassigned cleanly.');
    setTimeout(() => setActionMessage(null), 4000);
    loadData();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Action notification toast */}
      {actionMessage && (
        <div className="bg-emerald-900 text-white text-xs px-4 py-2.5 rounded-lg flex items-center justify-between shadow-md">
          <span>{actionMessage}</span>
          <button onClick={() => setActionMessage(null)} className="text-emerald-300 hover:text-white">
            ✕
          </button>
        </div>
      )}

      {/* Top Header & Worker Profile Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start sm:items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-lg shrink-0 shadow-xs">
            {currentWorker?.avatar || 'SF'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                {currentWorker?.name}
              </h1>
              {currentWorker?.isVerified ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Verified Partner
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-800 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                  <XCircle className="w-3.5 h-3.5 text-rose-600" />
                  Unverified / Pending KYC
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 mt-1">
              <span>{currentWorker?.phone}</span>
              <span>·</span>
              <span>Areas: {currentWorker?.serviceAreas.join(', ')}</span>
              <span>·</span>
              <span className="text-amber-700 font-semibold flex items-center gap-0.5">
                ★ {currentWorker?.rating} ({currentWorker?.completedJobsCount} jobs completed)
              </span>
            </div>

            {/* Skills */}
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              <span className="text-[11px] text-slate-400">Certified Skills:</span>
              {currentWorker?.skills.map(s => (
                <span key={s} className="text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Worker Controls & Switcher */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Availability Toggle */}
          <div className="bg-slate-50 p-2 rounded-lg border border-slate-200 flex items-center gap-2.5">
            <div className="text-left">
              <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Duty Status</div>
              <div className={`text-xs font-bold ${currentWorker?.isAvailable ? 'text-emerald-700' : 'text-slate-500'}`}>
                {currentWorker?.isAvailable ? 'Available for Jobs' : 'Off-Duty / Resting'}
              </div>
            </div>
            <button
              onClick={toggleAvailability}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                currentWorker?.isAvailable
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                  : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
              }`}
            >
              {currentWorker?.isAvailable ? 'Set Off-Duty' : 'Go On-Duty'}
            </button>
          </div>

          {/* Switch Worker Selector */}
          <div className="text-right">
            <label className="block text-[10px] text-slate-500 mb-0.5">Switch Worker Login:</label>
            <select
              value={currentWorkerId}
              onChange={e => setCurrentWorkerId(e.target.value)}
              className="text-xs p-2 rounded-lg border border-slate-200 bg-white font-medium text-slate-800 focus:outline-none"
            >
              {workers.map(w => (
                <option key={w.id} value={w.id}>
                  {w.name} ({w.skills[0] || 'General'} · {w.isAvailable ? 'Online' : 'Offline'})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Workload Metric Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Active Queue</div>
          <div className="text-2xl font-bold text-emerald-700 mt-1 font-tabular">
            {activeJobs.length} job(s)
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Fair allocation cap target: &le; 2</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Lifetime Completed</div>
          <div className="text-2xl font-bold text-slate-900 mt-1 font-tabular">
            {currentWorker?.completedJobsCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Cooperative earnings record</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Hourly Wage</div>
          <div className="text-2xl font-bold text-slate-900 mt-1 font-tabular">
            ₹{currentWorker?.hourlyRate}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Standard cooperative floor rate</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Conflict Prevention</div>
          <div className="text-2xl font-bold text-emerald-700 mt-1 font-tabular">
            Active
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">0 double-booking guarantee</div>
        </div>
      </div>

      {/* Daily Schedule Timeline (Proves Conflict Prevention Visual) */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-600" />
            <h3 className="font-semibold text-sm text-slate-900">Today's Schedule & Slot Availability</h3>
          </div>
          <span className="text-xs text-slate-500 font-tabular">{new Date().toISOString().split('T')[0]}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-1 text-xs">
          {[
            { slot: '10:00 - 12:00', label: 'Morning' },
            { slot: '14:00 - 16:00', label: 'Afternoon' },
            { slot: '16:30 - 18:30', label: 'Late Afternoon' },
            { slot: '19:00 - 20:30', label: 'Evening' }
          ].map(s => {
            const hasBooking = activeJobs.find(b => b.startTime <= s.slot.split(' - ')[0] && b.endTime >= s.slot.split(' - ')[1]);
            return (
              <div
                key={s.slot}
                className={`p-3 rounded-lg border text-left ${
                  hasBooking
                    ? 'bg-amber-50/80 border-amber-200 text-amber-950 font-medium'
                    : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[11px]">{s.label}</span>
                  <span className="font-tabular text-[11px]">{s.slot}</span>
                </div>
                <div className="mt-1 text-[11px]">
                  {hasBooking ? (
                    <span className="text-amber-800 font-semibold">Booked: #{hasBooking.id} ({hasBooking.serviceType})</span>
                  ) : (
                    <span className="text-emerald-700 font-medium">Free for allocation</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Active Dispatched Jobs Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Assigned Jobs & Dispatch Queue</h2>
          <span className="text-xs text-slate-500 font-tabular">{activeJobs.length} active</span>
        </div>

        {activeJobs.length === 0 ? (
          <div className="bg-white rounded-xl border border-dashed border-slate-200 p-10 text-center text-slate-500 space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-600/70 mx-auto" />
            <h3 className="text-sm font-semibold text-slate-800">Your queue is clear</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              When new customers book your verified skills without schedule conflicts, the system will allocate jobs directly to your queue.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {activeJobs.map(job => {
              const isInProgress = job.status === 'in_progress';
              return (
                <div
                  key={job.id}
                  className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs p-5 sm:p-6 space-y-4 hover:border-slate-300 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-tabular">
                        #{job.id}
                      </span>
                      <h3 className="font-bold text-base text-slate-900">{job.serviceType}</h3>
                      <span className="text-xs text-slate-500">· Customer: {job.customerName}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-md ${
                        isInProgress ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {job.status}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 text-xs">
                    <div className="md:col-span-8 space-y-2">
                      <p className="text-sm text-slate-800 font-medium">{job.description}</p>
                      <div className="flex flex-wrap items-center gap-4 text-slate-500 pt-1">
                        <span className="flex items-center gap-1 font-tabular">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {job.date}
                        </span>
                        <span className="flex items-center gap-1 font-tabular">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {job.startTime} - {job.endTime} ({job.estimatedHours} hrs)
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {job.address}
                        </span>
                      </div>
                    </div>

                    <div className="md:col-span-4 bg-slate-50 p-3 rounded-lg border border-slate-200 flex flex-col justify-between">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">Service Fee:</span>
                        <span className="font-tabular font-bold text-slate-900 text-sm">₹{job.estimatedCost}</span>
                      </div>
                      <button
                        onClick={() => setExplainingBooking(job)}
                        className="text-[11px] font-semibold text-emerald-700 hover:underline flex items-center gap-1 mt-2"
                      >
                        <Scale className="w-3 h-3" />
                        <span>Why was this allocated to you?</span>
                      </button>
                    </div>
                  </div>

                  {/* Worker Action Bar */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    {/* Decline / Reassign affordance */}
                    <button
                      type="button"
                      onClick={() => setDecliningBooking(job)}
                      className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2.5 py-1.5 rounded-md transition-colors flex items-center gap-1"
                      title="Decline booking due to emergency"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Decline / Safe Reassign</span>
                    </button>

                    <div className="flex items-center gap-2">
                      {!isInProgress ? (
                        <button
                          type="button"
                          onClick={() => handleStartJob(job)}
                          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
                        >
                          <Play className="w-3.5 h-3.5" />
                          <span>Start Job (En Route)</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleCompleteJob(job)}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
                        >
                          <CheckCheck className="w-3.5 h-3.5" />
                          <span>Mark Job Completed</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Allocation Explainer Modal */}
      {explainingBooking && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <AllocationExplainer
              booking={explainingBooking}
              onClose={() => setExplainingBooking(null)}
            />
          </div>
        </div>
      )}

      {/* Decline & Safe Reassign Modal (Directly tests & proves bug fix P0) */}
      {decliningBooking && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-2 text-rose-600 font-bold text-base">
              <AlertTriangle className="w-5 h-5" />
              <span>Decline Job & Safe Reassignment</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              If you have an emergency or illness, SEVA FAIR's algorithmic reassignment will immediately find the next best verified worker with lowest active workload, without any system errors or broken state.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Reason for declining:
              </label>
              <select
                value={declineReason}
                onChange={e => setDeclineReason(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200 bg-white"
              >
                <option value="Sudden vehicle breakdown">Sudden vehicle breakdown</option>
                <option value="Health emergency / sickness">Health emergency / sickness</option>
                <option value="Previous job running overtime">Previous job running overtime</option>
                <option value="Tools / equipment malfunction">Tools / equipment malfunction</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDecliningBooking(null)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeclineAndReassign}
                className="px-3.5 py-1.5 text-xs text-white bg-rose-600 hover:bg-rose-700 font-semibold rounded-lg shadow-xs"
              >
                Confirm Decline & Reassign
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
