/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Booking, AllocationCandidateEvaluation } from '../types';
import { CheckCircle2, XCircle, Clock, ShieldCheck, Scale, AlertTriangle, ArrowRight } from 'lucide-react';

interface AllocationExplainerProps {
  booking: Booking;
  onClose?: () => void;
}

export const AllocationExplainer: React.FC<AllocationExplainerProps> = ({ booking, onClose }) => {
  const evaluations = booking.allocationEvaluations || [];

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
      <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-emerald-600" />
            <h3 className="font-semibold text-slate-900 text-base">Transparent Fair Allocation Audit</h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Booking <span className="font-tabular font-medium text-slate-700">#{booking.id}</span> · {booking.serviceType} in {booking.area}
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-xs text-slate-500 hover:text-slate-800 px-2.5 py-1 rounded-md hover:bg-slate-200/60 transition-colors"
          >
            Close
          </button>
        )}
      </div>

      <div className="p-4 sm:p-5 space-y-4">
        {/* Core Outcome Explanation */}
        <div className={`p-3.5 rounded-lg border text-sm ${
          booking.status === 'pending'
            ? 'bg-amber-50/70 border-amber-200 text-amber-900'
            : 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
        }`}>
          <div className="flex items-start gap-2.5">
            {booking.status === 'pending' ? (
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            )}
            <div>
              <div className="font-medium text-xs uppercase tracking-wider mb-1 opacity-90">
                {booking.status === 'pending' ? 'Pending Allocation Reason' : 'Cooperative Allocation Decision'}
              </div>
              <p className="text-sm leading-relaxed">
                {booking.allocationReason || 'Evaluated across registered workers for workload balance and schedule availability.'}
              </p>
            </div>
          </div>
        </div>

        {/* Selected Worker Highlights */}
        {booking.assignedWorkerName && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div>
              <span className="text-slate-500 block">Assigned Technician:</span>
              <span className="font-semibold text-slate-900 text-sm">{booking.assignedWorkerName}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Scheduled Window:</span>
              <span className="font-tabular text-slate-900 text-sm">{booking.date} · {booking.startTime} - {booking.endTime}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Dispatch Mode:</span>
              <span className="text-emerald-700 font-medium">Fair Workload Priority</span>
            </div>
          </div>
        )}

        {/* Candidate Evaluation Matrix */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Candidate Evaluation Ledger ({evaluations.length} Workers Analyzed)
            </h4>
            <span className="text-xs text-slate-500">Automated algorithmic verification</span>
          </div>

          {evaluations.length === 0 ? (
            <div className="text-center py-6 text-xs text-slate-500 border border-dashed border-slate-200 rounded-lg">
              Historical evaluations recorded in general audit trail.
            </div>
          ) : (
            <div className="border border-slate-200 rounded-lg overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-medium">
                  <tr>
                    <th className="py-2.5 px-3">Candidate</th>
                    <th className="py-2.5 px-2 text-center">Verified</th>
                    <th className="py-2.5 px-2 text-center">Available</th>
                    <th className="py-2.5 px-2 text-center">Skill</th>
                    <th className="py-2.5 px-2 text-center">Area</th>
                    <th className="py-2.5 px-2 text-center">No Conflict</th>
                    <th className="py-2.5 px-3 text-right">Active Workload</th>
                    <th className="py-2.5 px-3">Status / Reason</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {evaluations.map((evalItem: AllocationCandidateEvaluation) => {
                    const isSelected = booking.assignedWorkerId === evalItem.workerId;
                    return (
                      <tr
                        key={evalItem.workerId}
                        className={`transition-colors ${
                          isSelected
                            ? 'bg-emerald-50/50 font-medium'
                            : evalItem.isEligible
                            ? 'bg-white hover:bg-slate-50'
                            : 'bg-slate-50/40 text-slate-500'
                        }`}
                      >
                        <td className="py-2 px-3 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            {isSelected && <ArrowRight className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                            <span className={isSelected ? 'text-emerald-950 font-semibold' : 'text-slate-900'}>
                              {evalItem.workerName}
                            </span>
                          </div>
                        </td>

                        {/* Verified */}
                        <td className="py-2 px-2 text-center">
                          {evalItem.isVerified ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 inline" />
                          ) : (
                            <XCircle className="w-3.5 h-3.5 text-rose-500 inline" />
                          )}
                        </td>

                        {/* Available */}
                        <td className="py-2 px-2 text-center">
                          {evalItem.isAvailable ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 inline" />
                          ) : (
                            <XCircle className="w-3.5 h-3.5 text-slate-400 inline" />
                          )}
                        </td>

                        {/* Skill */}
                        <td className="py-2 px-2 text-center">
                          {evalItem.hasSkill ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 inline" />
                          ) : (
                            <XCircle className="w-3.5 h-3.5 text-slate-400 inline" />
                          )}
                        </td>

                        {/* Area */}
                        <td className="py-2 px-2 text-center">
                          {evalItem.servesArea ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 inline" />
                          ) : (
                            <XCircle className="w-3.5 h-3.5 text-slate-400 inline" />
                          )}
                        </td>

                        {/* Schedule Conflict */}
                        <td className="py-2 px-2 text-center">
                          {!evalItem.hasScheduleConflict ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 inline" />
                          ) : (
                            <span className="text-rose-600 font-semibold" title="Overlapping booking">
                              Overlap
                            </span>
                          )}
                        </td>

                        {/* Active Workload */}
                        <td className="py-2 px-3 text-right font-tabular">
                          {evalItem.activeWorkload} ongoing
                        </td>

                        {/* Status / Reason */}
                        <td className="py-2 px-3">
                          {isSelected ? (
                            <span className="text-emerald-700 font-medium">Selected (Lowest Workload)</span>
                          ) : evalItem.isEligible ? (
                            <span className="text-slate-600">Eligible (Reserve queue)</span>
                          ) : (
                            <span className="text-rose-600 text-[11px]">{evalItem.rejectionReason}</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Cooperative Fairness Principle Callout */}
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs text-slate-600 space-y-1">
          <div className="font-semibold text-slate-900 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Cooperative Allocation Invariant</span>
          </div>
          <p>
            Jobs are allocated strictly using non-overlapping availability, verified skills, and fair active workload distribution. No worker is monopolized or starved; earnings and opportunities remain balanced.
          </p>
        </div>
      </div>
    </div>
  );
};
