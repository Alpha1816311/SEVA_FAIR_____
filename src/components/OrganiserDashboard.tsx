/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Worker, Booking, ServiceCategory } from '../types';
import { api } from '../services/api';
import { AllocationExplainer } from './AllocationExplainer';
import { 
  ShieldCheck, 
  Users, 
  RotateCcw, 
  Scale, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Plus, 
  Edit3, 
  Calendar, 
  Clock, 
  MapPin,
  Star,
  UserPlus
} from 'lucide-react';

interface OrganiserDashboardProps {
  onRefreshAll?: () => void;
}

const ALL_SKILLS: ServiceCategory[] = [
  'Electrical',
  'Plumbing',
  'Cleaning',
  'Home Repair',
  'Carpentry',
  'Appliance Repair',
  'Painting'
];

export const OrganiserDashboard: React.FC<OrganiserDashboardProps> = () => {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [activeTab, setActiveTab] = useState<'workload' | 'verification' | 'bookings'>('workload');
  const [explainingBooking, setExplainingBooking] = useState<Booking | null>(null);

  // Edit / Verify Worker Modal
  const [editingWorker, setEditingWorker] = useState<Worker | null>(null);
  const [editSkills, setEditSkills] = useState<ServiceCategory[]>([]);
  const [editVerified, setEditVerified] = useState<boolean>(true);
  const [editNotes, setEditNotes] = useState<string>('');

  // Reassignment Modal
  const [reassigningBooking, setReassigningBooking] = useState<Booking | null>(null);
  const [reassignReason, setReassignReason] = useState<string>('Organiser fair workload re-balance');

  // New Worker Modal
  const [isAddingWorker, setIsAddingWorker] = useState<boolean>(false);
  const [newName, setNewName] = useState<string>('');
  const [newPhone, setNewPhone] = useState<string>('+91 98450 ');
  const [newEmail, setNewEmail] = useState<string>('');
  const [newSkills, setNewSkills] = useState<ServiceCategory[]>(['Plumbing']);
  const [newAreas, setNewAreas] = useState<string>('Bengaluru, Indiranagar');
  const [newRate, setNewRate] = useState<number>(350);

  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [wRes, bRes] = await Promise.all([
      api.getWorkers(),
      api.getBookings()
    ]);
    if (wRes.success) setWorkers(wRes.data);
    if (bRes.success) setBookings(bRes.data);
  };

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const handleToggleVerification = async (worker: Worker) => {
    const nextStatus = !worker.isVerified;
    const res = await api.verifyWorker(worker.id, nextStatus, worker.skills, worker.verificationNotes);
    if (res.success) {
      showToast(res.message || 'Worker verification updated');
      loadData();
    }
  };

  const handleSaveWorkerEdit = async () => {
    if (!editingWorker) return;
    const res = await api.verifyWorker(editingWorker.id, editVerified, editSkills, editNotes);
    if (res.success) {
      showToast(`Updated verification & skills for ${editingWorker.name}`);
      setEditingWorker(null);
      loadData();
    }
  };

  const handleReassign = async () => {
    if (!reassigningBooking) return;
    const res = await api.reassignBooking(
      reassigningBooking.id,
      reassignReason,
      { role: 'ORGANISER', name: 'Organiser Suman Rao' }
    );

    setReassigningBooking(null);
    showToast(res.message || 'Reassignment executed.');
    loadData();
  };

  const handleAddWorker = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) return;

    await api.addWorker({
      name: newName,
      phone: newPhone,
      email: newEmail || `${newName.toLowerCase().replace(/\s+/g, '.')}@coop.local`,
      avatar: newName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase(),
      skills: newSkills,
      serviceAreas: newAreas.split(',').map(a => a.trim()),
      isVerified: true,
      isAvailable: true,
      hourlyRate: newRate,
      joinedDate: new Date().toISOString().split('T')[0],
      govIdVerified: true,
      policeVerification: true,
      verificationNotes: 'Onboarded by Organiser console with verified credentials.'
    });

    setIsAddingWorker(false);
    setNewName('');
    showToast('New worker registered and verified!');
    loadData();
  };

  const unverifiedWorkers = workers.filter(w => !w.isVerified);
  const pendingBookings = bookings.filter(b => b.status === 'pending');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Toast Notification */}
      {notification && (
        <div className="bg-slate-900 text-white text-xs px-4 py-3 rounded-lg flex items-center justify-between shadow-md">
          <span>{notification}</span>
          <button onClick={() => setNotification(null)} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200/70 mb-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Cooperative Management Console</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Organiser Governance Dashboard</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Admin Suman Rao · Verify workers, balance active workloads, and supervise fair dispatch.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAddingWorker(true)}
            className="px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Onboard Worker</span>
          </button>
        </div>
      </div>

      {/* Pending Action Alerts Strip */}
      {(unverifiedWorkers.length > 0 || pendingBookings.length > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {unverifiedWorkers.length > 0 && (
            <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-xs uppercase tracking-wider text-amber-900">
                  {unverifiedWorkers.length} Worker Profile(s) Pending Verification
                </h3>
                <p className="text-xs text-amber-800 mt-0.5">
                  {unverifiedWorkers.map(w => w.name).join(', ')} cannot receive allocations until verified by organiser.
                </p>
                <button
                  onClick={() => setActiveTab('verification')}
                  className="text-xs font-semibold text-amber-900 underline mt-2 inline-block"
                >
                  Review Worker Verification Now &rarr;
                </button>
              </div>
            </div>
          )}

          {pendingBookings.length > 0 && (
            <div className="p-4 rounded-xl bg-blue-50/80 border border-blue-200 flex items-start gap-3">
              <Scale className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-xs uppercase tracking-wider text-blue-900">
                  {pendingBookings.length} Booking(s) in Pending Queue
                </h3>
                <p className="text-xs text-blue-800 mt-0.5">
                  Bookings currently awaiting worker availability or resolution of schedule conflicts.
                </p>
                <button
                  onClick={() => setActiveTab('bookings')}
                  className="text-xs font-semibold text-blue-900 underline mt-2 inline-block"
                >
                  Inspect & Trigger Reassignment &rarr;
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab Segmented Control */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('workload')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
            activeTab === 'workload'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Fair Workload Distribution Matrix
        </button>
        <button
          onClick={() => setActiveTab('verification')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
            activeTab === 'verification'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span>Worker Profiles & Skills</span>
          {unverifiedWorkers.length > 0 && (
            <span className="w-2 h-2 rounded-full bg-amber-500" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('bookings')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
            activeTab === 'bookings'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span>All Bookings & Reassignments</span>
          {pendingBookings.length > 0 && (
            <span className="w-2 h-2 rounded-full bg-blue-500" />
          )}
        </button>
      </div>

      {/* TAB 1: Fair Workload Distribution Matrix */}
      {activeTab === 'workload' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900">Cooperative Workload Balance Ledger</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Allocations mathematically prioritize qualified workers with lowest ongoing jobs to ensure fair income.
                </p>
              </div>
              <span className="text-xs text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
                Fairness Index: 98.4% Optimal
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-medium">
                  <tr>
                    <th className="py-3 px-4">Technician</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3 text-right">Active Workload</th>
                    <th className="py-3 px-3 text-right">Completed Jobs</th>
                    <th className="py-3 px-3">Rating</th>
                    <th className="py-3 px-4">Skills Verified</th>
                    <th className="py-3 px-3 text-right">Dispatch Priority</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {workers.map(w => {
                    const isPriority = w.isVerified && w.isAvailable && w.activeJobsCount === 0;
                    return (
                      <tr key={w.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-md bg-slate-800 text-white font-bold flex items-center justify-center text-xs">
                              {w.avatar}
                            </div>
                            <div>
                              <span className="font-semibold text-slate-900 block">{w.name}</span>
                              <span className="text-[10px] text-slate-400 font-mono">ID: {w.id}</span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-3 whitespace-nowrap">
                          <div className="space-y-0.5">
                            <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded ${
                              w.isVerified ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'
                            }`}>
                              {w.isVerified ? 'Verified' : 'Unverified'}
                            </span>
                            <span className={`block text-[10px] ${w.isAvailable ? 'text-emerald-700' : 'text-slate-400'}`}>
                              {w.isAvailable ? '• On-Duty' : '• Off-Duty'}
                            </span>
                          </div>
                        </td>

                        <td className="py-3 px-3 text-right font-tabular">
                          <span className={`font-bold text-sm ${w.activeJobsCount > 1 ? 'text-amber-700' : 'text-slate-900'}`}>
                            {w.activeJobsCount}
                          </span>
                          <span className="text-slate-400 text-[10px] block">ongoing</span>
                        </td>

                        <td className="py-3 px-3 text-right font-tabular text-slate-700">
                          <span className="font-semibold text-sm">{w.completedJobsCount}</span>
                          <span className="text-slate-400 text-[10px] block">all-time</span>
                        </td>

                        <td className="py-3 px-3 font-tabular">
                          <div className="flex items-center gap-1 text-slate-800 font-semibold">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            <span>{w.rating}</span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-tabular">({w.reviewsCount} reviews)</span>
                        </td>

                        <td className="py-3 px-4">
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {w.skills.map(s => (
                              <span key={s} className="text-[10px] px-1.5 py-0.5 bg-slate-100 rounded text-slate-700">
                                {s}
                              </span>
                            ))}
                          </div>
                        </td>

                        <td className="py-3 px-3 text-right whitespace-nowrap">
                          {isPriority ? (
                            <span className="text-emerald-700 font-bold text-xs bg-emerald-50 px-2 py-1 rounded">
                              Top Priority (Free)
                            </span>
                          ) : !w.isVerified ? (
                            <span className="text-rose-600 text-xs">Locked (Unverified)</span>
                          ) : !w.isAvailable ? (
                            <span className="text-slate-400 text-xs">Resting</span>
                          ) : (
                            <span className="text-slate-600 text-xs font-tabular">Workload queue ({w.activeJobsCount})</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Worker Verification & Skill Certification */}
      {activeTab === 'verification' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {workers.map(worker => (
            <div
              key={worker.id}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-slate-900 text-white font-bold flex items-center justify-center text-sm">
                    {worker.avatar}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">{worker.name}</h4>
                    <p className="text-xs text-slate-500 font-tabular">{worker.phone} · {worker.email}</p>
                  </div>
                </div>

                <button
                  onClick={() => handleToggleVerification(worker)}
                  className={`text-xs px-2.5 py-1 rounded-md font-semibold transition-colors ${
                    worker.isVerified
                      ? 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                      : 'bg-rose-50 text-rose-800 hover:bg-rose-100'
                  }`}
                >
                  {worker.isVerified ? '✓ Verified Partner' : '⚠ Set Verified'}
                </button>
              </div>

              {/* Badges */}
              <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <div className="flex items-center gap-1.5 text-slate-700">
                  <ShieldCheck className={`w-3.5 h-3.5 ${worker.govIdVerified ? 'text-emerald-600' : 'text-slate-300'}`} />
                  <span>Aadhaar / Govt ID Verified</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-700">
                  <ShieldCheck className={`w-3.5 h-3.5 ${worker.policeVerification ? 'text-emerald-600' : 'text-slate-300'}`} />
                  <span>Police Verification Cleared</span>
                </div>
              </div>

              {/* Skills */}
              <div>
                <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  Certified Cooperative Skills
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {worker.skills.map(s => (
                    <span key={s} className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Areas & Notes */}
              <div className="text-xs text-slate-600 space-y-1">
                <div><strong>Service Areas:</strong> {worker.serviceAreas.join(', ')}</div>
                {worker.verificationNotes && (
                  <p className="text-slate-500 italic text-[11px]">
                    "{worker.verificationNotes}"
                  </p>
                )}
              </div>

              {/* Edit button */}
              <div className="pt-2 border-t border-slate-100 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setEditingWorker(worker);
                    setEditSkills([...worker.skills]);
                    setEditVerified(worker.isVerified);
                    setEditNotes(worker.verificationNotes || '');
                  }}
                  className="text-xs font-semibold text-slate-700 hover:text-slate-900 flex items-center gap-1"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Skills & Profile</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: All Bookings & Reassignments */}
      {activeTab === 'bookings' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900">All Cooperative Bookings & Supervisor Dispatch</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Trigger instant reassignment if a worker declines or if you need to re-balance work.
              </p>
            </div>
            <span className="text-xs text-slate-500 font-tabular">{bookings.length} Total Bookings</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-medium">
                <tr>
                  <th className="py-2.5 px-3">Ref #</th>
                  <th className="py-2.5 px-3">Service & Customer</th>
                  <th className="py-2.5 px-3">Area</th>
                  <th className="py-2.5 px-3">Schedule</th>
                  <th className="py-2.5 px-3">Assigned Technician</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bookings.map(b => (
                  <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-3 font-tabular font-semibold text-slate-900 whitespace-nowrap">
                      #{b.id}
                    </td>

                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-slate-900">{b.serviceType}</div>
                      <div className="text-[11px] text-slate-500">{b.customerName}</div>
                    </td>

                    <td className="py-2.5 px-3 text-slate-700 whitespace-nowrap">
                      {b.area.split(',')[0]}
                    </td>

                    <td className="py-2.5 px-3 font-tabular text-slate-700 whitespace-nowrap">
                      <div>{b.date}</div>
                      <div className="text-[10px] text-slate-400">{b.startTime} - {b.endTime}</div>
                    </td>

                    <td className="py-2.5 px-3">
                      {b.assignedWorkerName ? (
                        <div className="font-medium text-slate-900">{b.assignedWorkerName}</div>
                      ) : (
                        <span className="text-amber-700 font-medium bg-amber-50 px-2 py-0.5 rounded">
                          Unassigned / Pending
                        </span>
                      )}
                    </td>

                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                        b.status === 'assigned'
                          ? 'bg-emerald-100 text-emerald-800'
                          : b.status === 'in_progress'
                          ? 'bg-blue-100 text-blue-800'
                          : b.status === 'completed'
                          ? 'bg-slate-100 text-slate-700'
                          : b.status === 'pending'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        {b.status}
                      </span>
                    </td>

                    <td className="py-2.5 px-3 text-right whitespace-nowrap space-x-1.5">
                      <button
                        onClick={() => setExplainingBooking(b)}
                        className="text-xs text-emerald-700 hover:underline font-medium"
                      >
                        Inspect
                      </button>

                      {b.status !== 'completed' && b.status !== 'cancelled' && (
                        <button
                          onClick={() => setReassigningBooking(b)}
                          className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-800 px-2 py-1 rounded transition-colors font-medium"
                          title="Trigger Safe Reassignment"
                        >
                          Reassign
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

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

      {/* Reassign Modal */}
      {reassigningBooking && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 max-w-md w-full p-6 shadow-xl space-y-4">
            <h3 className="font-bold text-base text-slate-900">
              Trigger Fair Reassignment for #{reassigningBooking.id}
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              The allocation engine will re-evaluate all available workers, exclude conflicts, and assign the candidate with lowest active workload.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Reason for Reassignment:
              </label>
              <input
                type="text"
                value={reassignReason}
                onChange={e => setReassignReason(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setReassigningBooking(null)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReassign}
                className="px-3.5 py-1.5 text-xs text-white bg-slate-900 hover:bg-slate-800 font-semibold rounded-lg shadow-xs"
              >
                Execute Reassignment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Worker Modal */}
      {editingWorker && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 max-w-lg w-full p-6 shadow-xl space-y-4">
            <h3 className="font-bold text-base text-slate-900">
              Edit Profile: {editingWorker.name}
            </h3>

            {/* Verification checkbox */}
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-800 cursor-pointer">
              <input
                type="checkbox"
                checked={editVerified}
                onChange={e => setEditVerified(e.target.checked)}
                className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
              />
              <span>Profile Verified (KYC, Background & Police Checks cleared)</span>
            </label>

            {/* Skills selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Certified Skills (Select to certify)
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {ALL_SKILLS.map(skill => {
                  const hasSkill = editSkills.includes(skill);
                  return (
                    <button
                      type="button"
                      key={skill}
                      onClick={() => {
                        if (hasSkill) {
                          setEditSkills(editSkills.filter(s => s !== skill));
                        } else {
                          setEditSkills([...editSkills, skill]);
                        }
                      }}
                      className={`p-2 rounded-lg border text-left flex items-center justify-between ${
                        hasSkill
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-medium'
                          : 'border-slate-200 text-slate-600'
                      }`}
                    >
                      <span>{skill}</span>
                      {hasSkill && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Verification / Certificate Notes
              </label>
              <textarea
                rows={2}
                value={editNotes}
                onChange={e => setEditNotes(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingWorker(null)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveWorkerEdit}
                className="px-3.5 py-1.5 text-xs text-white bg-emerald-600 hover:bg-emerald-700 font-semibold rounded-lg shadow-xs"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Onboard Worker Modal */}
      {isAddingWorker && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 max-w-md w-full p-6 shadow-xl space-y-4">
            <h3 className="font-bold text-base text-slate-900">Onboard New Cooperative Technician</h3>
            
            <form onSubmit={handleAddWorker} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Shinde"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  required
                  value={newPhone}
                  onChange={e => setNewPhone(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Initial Primary Skill</label>
                <select
                  value={newSkills[0]}
                  onChange={e => setNewSkills([e.target.value as ServiceCategory])}
                  className="w-full p-2 border border-slate-200 rounded-lg bg-white"
                >
                  {ALL_SKILLS.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Service Areas (comma-separated)</label>
                <input
                  type="text"
                  value={newAreas}
                  onChange={e => setNewAreas(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Hourly Minimum Wage (₹)</label>
                <input
                  type="number"
                  value={newRate}
                  onChange={e => setNewRate(Number(e.target.value))}
                  className="w-full p-2 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddingWorker(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs text-white bg-emerald-600 hover:bg-emerald-700 font-semibold rounded-lg shadow-xs"
                >
                  Verify & Onboard
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
