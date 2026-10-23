import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Plus, Calendar, CheckCircle, Clock, AlertCircle, RefreshCw,
  ShieldCheck, XCircle, ChevronRight, UserCheck, AlertTriangle
} from 'lucide-react';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import api from '../services/api';

export default function CustomerDashboard() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  const [filter, setFilter] = useState('ALL');
  const [notice, setNotice] = useState(null);
  const navigate = useNavigate();

  const loadBookings = async () => {
    setLoading(true);
    try {
      const response = await api.getBookings();
      const rows = Array.isArray(response)
        ? response
        : Array.isArray(response?.data)
          ? response.data
          : [];
      setBookings(rows);
    } catch (err) {
      console.error('Failed to load bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const handleCancel = async (bookingId) => {
    if (!window.confirm(`Are you sure you want to cancel Booking #${bookingId}?`)) return;
    setCancellingId(bookingId);
    try {
      await api.cancelBooking(bookingId);
      setNotice(`Booking #${bookingId} was successfully cancelled.`);
      setTimeout(() => setNotice(null), 4000);
      await loadBookings();
    } catch (err) {
      console.error('Failed to cancel:', err);
    } finally {
      setCancellingId(null);
    }
  };

  const stats = {
    total: bookings.length,
    upcoming: bookings.filter((b) => ['Pending', 'Assigned', 'In Progress'].includes(b.status)).length,
    completed: bookings.filter((b) => b.status === 'Completed').length,
    cancelled: bookings.filter((b) => b.status === 'Cancelled').length
  };

  const filteredBookings = bookings.filter((b) => {
    if (filter === 'UPCOMING') return ['Pending', 'Assigned', 'In Progress'].includes(b.status);
    if (filter === 'COMPLETED') return b.status === 'Completed';
    if (filter === 'CANCELLED') return b.status === 'Cancelled';
    return true;
  });

  const getWorkerName = (booking) =>
    booking.worker_name ||
    booking.assigned_worker_name ||
    booking.worker?.name ||
    (booking.assigned_worker_id ? `Worker #${booking.assigned_worker_id}` : 'Unassigned (Evaluating)');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Customer Portal</h1>
          <p className="text-sm text-slate-500">
            Book local household services with fair worker allocation and transparent scheduling.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadBookings}
            className="p-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
          <Link
            to="/customer/bookings/new"
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shadow-sm shadow-emerald-500/20"
          >
            <Plus className="w-4 h-4" /> Book a Service
          </Link>
        </div>
      </div>

      {notice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center justify-between animate-in fade-in">
          <span className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" /> {notice}
          </span>
          <button onClick={() => setNotice(null)} className="text-emerald-700 hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Bookings" value={stats.total} icon={Calendar} />
        <StatCard title="Active & Upcoming" value={stats.upcoming} icon={Clock} />
        <StatCard title="Completed Jobs" value={stats.completed} icon={CheckCircle} />
        <StatCard title="Cancelled" value={stats.cancelled} icon={AlertCircle} />
      </div>

      {/* Bookings Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900">Your Booking Ledger</h3>
            <span className="text-xs bg-slate-100 text-slate-600 font-semibold px-2 py-0.5 rounded-full">
              {filteredBookings.length}
            </span>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs">
            {['ALL', 'UPCOMING', 'COMPLETED', 'CANCELLED'].map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  filter === tab
                    ? 'bg-white text-emerald-700 font-semibold shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {tab.charAt(0) + tab.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm">Loading your bookings...</div>
        ) : filteredBookings.length === 0 ? (
          <div className="p-12 text-center">
            <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-700">No bookings found</p>
            <p className="text-xs text-slate-400 mt-1 mb-4">
              Schedule your first household service in under 30 seconds.
            </p>
            <Link
              to="/customer/bookings/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-xl hover:bg-emerald-700 shadow-sm"
            >
              <Plus className="w-4 h-4" /> Book a Service Now
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-50/70 border-b border-slate-100">
                <tr>
                  <th className="px-4 py-3">Booking ID</th>
                  <th className="px-4 py-3">Service & Address</th>
                  <th className="px-4 py-3">Scheduled Slot</th>
                  <th className="px-4 py-3">Assigned Worker</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3 font-mono font-semibold text-slate-900">
                      #{b.id}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-900">
                        {b.service_type || b.service || 'Service Request'}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate max-w-xs">
                        {b.service_address || 'Address provided'}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-600">
                      <div>{b.date || (b.start_time ? String(b.start_time).split('T')[0] : 'Today')}</div>
                      <div className="text-[10px] text-slate-400">
                        {b.slot || (b.start_time ? `${String(b.start_time).split('T')[1]?.slice(0,5)} - ${String(b.end_time || '').split('T')[1]?.slice(0,5)}` : 'Standard Window')}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 font-medium text-slate-800">
                        <UserCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{getWorkerName(b)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={b.status || 'Pending'} />
                    </td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <Link
                        to={`/allocation?id=${b.id}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 rounded-lg text-[11px] font-semibold transition-colors border border-slate-200"
                        title="View mathematical allocation explanation"
                      >
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                        Audit
                      </Link>

                      {['Pending', 'Assigned', 'In Progress'].includes(b.status) && (
                        <button
                          onClick={() => handleCancel(b.id)}
                          disabled={cancellingId === b.id}
                          className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-[11px] font-semibold transition-colors border border-rose-200"
                        >
                          {cancellingId === b.id ? 'Cancelling...' : 'Cancel'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
