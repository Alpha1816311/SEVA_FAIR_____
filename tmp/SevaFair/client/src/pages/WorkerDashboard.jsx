import React, { useState, useEffect } from 'react';
import {
  CheckCircle, XCircle, Briefcase, Clock, ShieldCheck,
  AlertTriangle, Phone, MapPin, Sparkles, RefreshCw, Play, CheckCircle2
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import api from '../services/api';

export default function WorkerDashboard() {
  const [workers, setWorkers] = useState([]);
  const [selectedWorkerId, setSelectedWorkerId] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [toast, setToast] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [workersRes, bookingsRes] = await Promise.all([
        api.getWorkers(),
        api.getBookings()
      ]);

      const workerList = Array.isArray(workersRes)
        ? workersRes
        : Array.isArray(workersRes?.data)
          ? workersRes.data
          : [];

      const bookingList = Array.isArray(bookingsRes)
        ? bookingsRes
        : Array.isArray(bookingsRes?.data)
          ? bookingsRes.data
          : [];

      setWorkers(workerList);

      const activeId = selectedWorkerId || (workerList[0]?.id ?? 1);
      if (!selectedWorkerId && workerList[0]?.id) {
        setSelectedWorkerId(workerList[0].id);
      }

      const activeWorker = workerList.find((w) => String(w.id) === String(activeId)) || workerList[0];
      const workerJobs = bookingList.filter((b) => {
        const wid = b.assigned_worker_id || b.worker_id;
        if (wid && String(wid) === String(activeId)) return true;
        if (activeWorker && (b.worker_name === activeWorker.name || b.worker === activeWorker.name)) return true;
        return false;
      });

      setJobs(workerJobs);
    } catch (err) {
      console.error('Failed to load worker data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedWorkerId]);

  const activeWorker = workers.find((w) => String(w.id) === String(selectedWorkerId)) || workers[0];

  const handleToggleAvailability = async () => {
    if (!activeWorker) return;
    const newAvail = !activeWorker.available;
    setActionLoading('avail');
    try {
      await api.updateWorkerAvailability(activeWorker.id, newAvail);
      setToast(`Availability updated to ${newAvail ? 'Available' : 'Off-Duty'}.`);
      setTimeout(() => setToast(null), 3500);
      await loadData();
    } catch (err) {
      console.error('Failed to toggle availability:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpdateStatus = async (jobId, newStatus) => {
    setActionLoading(jobId);
    try {
      await api.updateBookingStatus(jobId, newStatus);
      setToast(`Job #${jobId} status marked as ${newStatus}!`);
      setTimeout(() => setToast(null), 3500);
      await loadData();
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReportUnavailable = async (jobId) => {
    if (!window.confirm('Report unavailable for this job? The system will safely reassign it to the next fairest worker.')) return;
    setActionLoading(jobId);
    try {
      const res = await api.reassignBooking(jobId, 'Worker reported unexpected unavailability');
      setToast(`Job #${jobId} reassigned safely: ${res.message || 'Worker updated'}`);
      setTimeout(() => setToast(null), 4000);
      await loadData();
    } catch (err) {
      console.error('Failed to reassign:', err);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading && workers.length === 0) {
    return <div className="p-12 text-center text-slate-400 text-sm">Loading Worker Portal...</div>;
  }

  if (!activeWorker) {
    return <div className="p-12 text-center text-slate-500">No worker profile found.</div>;
  }

  const activeJobsCount = jobs.filter((j) => ['Pending', 'Assigned', 'In Progress'].includes(j.status)).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Worker Portal</h1>
          <p className="text-sm text-slate-500">
            Handle job dispatches, manage on-duty availability, and prevent scheduling conflicts.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white border border-slate-200 p-1.5 rounded-xl shadow-xs">
          <span className="text-xs font-semibold text-slate-500 pl-2">Select Worker:</span>
          <select
            value={selectedWorkerId || ''}
            onChange={(e) => setSelectedWorkerId(Number(e.target.value))}
            className="text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            {workers.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name} ({Array.isArray(w.skills) ? w.skills.join(', ') : w.skills})
              </option>
            ))}
          </select>
        </div>
      </div>

      {toast && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center justify-between animate-in fade-in">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> {toast}
          </span>
          <button onClick={() => setToast(null)} className="text-emerald-700 hover:underline">
            ✕
          </button>
        </div>
      )}

      {/* Profile & Workload Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-600/10 text-emerald-700 flex items-center justify-center text-xl font-bold border border-emerald-200/50">
              {activeWorker.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">{activeWorker.name}</h2>
                {activeWorker.verified ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" /> Verified Worker
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                    <AlertTriangle className="w-3 h-3 text-amber-600" /> Pending Verification
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Skills: <span className="font-medium text-slate-700">{Array.isArray(activeWorker.skills) ? activeWorker.skills.join(', ') : activeWorker.skills}</span>
                {' • '}
                <span className="text-slate-500">Area: {activeWorker.service_area || 'Bengaluru'}</span>
              </p>
            </div>
          </div>

          {/* Availability Toggle */}
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-xs font-semibold text-slate-900">
                {activeWorker.available ? 'On Duty (Accepting)' : 'Off-Duty (Paused)'}
              </div>
              <div className="text-[11px] text-slate-400">
                {activeWorker.available ? 'Eligible for fair allocation' : 'Skipped by allocation engine'}
              </div>
            </div>
            <button
              onClick={handleToggleAvailability}
              disabled={actionLoading === 'avail'}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
                activeWorker.available
                  ? 'bg-emerald-600 text-white border-emerald-700 hover:bg-emerald-700'
                  : 'bg-slate-200 text-slate-700 border-slate-300 hover:bg-slate-300'
              }`}
            >
              {actionLoading === 'avail' ? 'Updating...' : activeWorker.available ? 'Set Off-Duty' : 'Set Available'}
            </button>
          </div>
        </div>

        {/* Workload Progress Bar */}
        <div className="mt-5 pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-semibold text-slate-700 flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-emerald-600" /> Cooperative Workload Load Factor
            </span>
            <span className="font-mono text-slate-500">
              {activeJobsCount} / 5 Max Jobs ({Math.min(100, (activeJobsCount / 5) * 100)}%)
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
            <div
              className={`h-2.5 rounded-full transition-all duration-500 ${
                activeJobsCount >= 4 ? 'bg-amber-500' : 'bg-emerald-600'
              }`}
              style={{ width: `${Math.min(100, Math.max(8, (activeJobsCount / 5) * 100))}%` }}
            />
          </div>
        </div>
      </div>

      {/* Assigned Jobs Ledger */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900">Your Assigned Jobs</h3>
            <span className="text-xs bg-slate-100 text-slate-600 font-semibold px-2 py-0.5 rounded-full">
              {jobs.length} total
            </span>
          </div>
          <button onClick={loadData} className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>

        {jobs.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            <Clock className="w-9 h-9 text-slate-300 mx-auto mb-2" />
            <p className="font-semibold text-slate-700">No jobs currently dispatched to {activeWorker.name}</p>
            <p className="text-xs text-slate-400 mt-1">
              New bookings matching your verified skills ({Array.isArray(activeWorker.skills) ? activeWorker.skills[0] : 'Trade'}) will appear here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {jobs.map((job) => (
              <div key={job.id} className="p-4 sm:p-5 hover:bg-slate-50/50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-900">#{job.id}</span>
                    <span className="text-sm font-bold text-slate-900">{job.service_type || job.service}</span>
                    <StatusBadge status={job.status} />
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {job.date || (job.start_time ? String(job.start_time).split('T')[0] : 'Today')} ({job.slot || 'Scheduled'})
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {job.service_address || 'Customer Location'}
                    </span>
                  </div>
                </div>

                {/* Job Action Buttons */}
                <div className="flex items-center gap-2">
                  {job.status === 'Pending' && (
                    <button
                      onClick={() => handleUpdateStatus(job.id, 'Assigned')}
                      disabled={actionLoading === job.id}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-all shadow-xs"
                    >
                      Accept Job
                    </button>
                  )}

                  {['Pending', 'Assigned'].includes(job.status) && (
                    <button
                      onClick={() => handleUpdateStatus(job.id, 'In Progress')}
                      disabled={actionLoading === job.id}
                      className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-semibold transition-all shadow-xs flex items-center gap-1"
                    >
                      <Play className="w-3 h-3" /> Start Job
                    </button>
                  )}

                  {job.status === 'In Progress' && (
                    <button
                      onClick={() => handleUpdateStatus(job.id, 'Completed')}
                      disabled={actionLoading === job.id}
                      className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold transition-all shadow-xs flex items-center gap-1"
                    >
                      <CheckCircle className="w-3.5 h-3.5" /> Mark Completed
                    </button>
                  )}

                  {['Pending', 'Assigned'].includes(job.status) && (
                    <button
                      onClick={() => handleReportUnavailable(job.id)}
                      disabled={actionLoading === job.id}
                      className="px-2.5 py-1.5 bg-slate-100 hover:bg-amber-50 text-slate-700 hover:text-amber-700 rounded-lg text-xs font-semibold transition-colors border border-slate-200"
                      title="Report unexpected conflict or sickness; system triggers fair reassignment"
                    >
                      Report Unavailable
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
