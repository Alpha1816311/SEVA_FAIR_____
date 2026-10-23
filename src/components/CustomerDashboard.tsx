/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Booking, Customer } from '../types';
import { api } from '../services/api';
import { AllocationExplainer } from './AllocationExplainer';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  AlertCircle, 
  XCircle, 
  Star, 
  Scale, 
  Phone, 
  Plus,
  ChevronRight,
  Filter
} from 'lucide-react';

interface CustomerDashboardProps {
  initialCustomerId?: string;
  onNavigateToBooking: () => void;
}

export const CustomerDashboard: React.FC<CustomerDashboardProps> = ({
  initialCustomerId = 'c-1',
  onNavigateToBooking
}) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [currentCustomerId, setCurrentCustomerId] = useState<string>(initialCustomerId);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [explainingBooking, setExplainingBooking] = useState<Booking | null>(null);

  // Rating modal state
  const [ratingBooking, setRatingBooking] = useState<Booking | null>(null);
  const [starRating, setStarRating] = useState<number>(5);
  const [feedbackText, setFeedbackText] = useState<string>('');

  // Cancellation modal state
  const [cancellingBooking, setCancellingBooking] = useState<Booking | null>(null);
  const [cancellationReason, setCancellationReason] = useState<string>('Schedule changed');

  useEffect(() => {
    if (initialCustomerId) {
      setCurrentCustomerId(initialCustomerId);
    }
  }, [initialCustomerId]);

  useEffect(() => {
    loadData();
  }, [currentCustomerId]);

  const loadData = async () => {
    const [cRes, bRes] = await Promise.all([
      api.getCustomers(),
      api.getBookings()
    ]);
    if (cRes.success) setCustomers(cRes.data);
    if (bRes.success) setBookings(bRes.data);
  };

  const currentCustomer = customers.find(c => c.id === currentCustomerId) || customers[0];

  // Filter bookings for this customer
  const customerBookings = bookings.filter(b => b.customerId === currentCustomerId);

  const filteredBookings = customerBookings.filter(b => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'active') return b.status === 'assigned' || b.status === 'in_progress';
    return b.status === statusFilter;
  });

  const totalCount = customerBookings.length;
  const activeCount = customerBookings.filter(b => b.status === 'assigned' || b.status === 'in_progress').length;
  const completedCount = customerBookings.filter(b => b.status === 'completed').length;
  const pendingCount = customerBookings.filter(b => b.status === 'pending').length;

  const handleCancel = async () => {
    if (!cancellingBooking) return;
    await api.updateBookingStatus(
      cancellingBooking.id,
      'cancelled',
      { role: 'CUSTOMER', name: currentCustomer?.name || 'Customer' },
      { cancellationReason }
    );
    setCancellingBooking(null);
    loadData();
  };

  const handleRate = async () => {
    if (!ratingBooking) return;
    await api.updateBookingStatus(
      ratingBooking.id,
      'completed',
      { role: 'CUSTOMER', name: currentCustomer?.name || 'Customer' },
      { rating: starRating, feedback: feedbackText }
    );
    setRatingBooking(null);
    setFeedbackText('');
    loadData();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header & Customer Identity Switcher */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-emerald-800 uppercase tracking-wider mb-1">
            Customer Self-Service Portal
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            {currentCustomer ? currentCustomer.name : 'Customer Dashboard'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {currentCustomer?.address} · {currentCustomer?.phone}
          </p>
        </div>

        {/* Identity switch selector (resolves P1 handoff) */}
        <div className="flex items-center gap-3">
          <label className="text-xs text-slate-500 whitespace-nowrap">Switch Customer Account:</label>
          <select
            value={currentCustomerId}
            onChange={e => setCurrentCustomerId(e.target.value)}
            className="text-xs p-2 rounded-lg border border-slate-200 bg-slate-50 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
          >
            {customers.map(c => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.area})
              </option>
            ))}
          </select>
          <button
            onClick={onNavigateToBooking}
            className="py-2 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Booking</span>
          </button>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Bookings</div>
          <div className="text-2xl font-bold text-slate-900 mt-1 font-tabular">{totalCount}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-medium text-emerald-700 uppercase tracking-wider">Active & Dispatched</div>
          <div className="text-2xl font-bold text-emerald-700 mt-1 font-tabular">{activeCount}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-medium text-amber-700 uppercase tracking-wider">Pending Queue</div>
          <div className="text-2xl font-bold text-amber-700 mt-1 font-tabular">{pendingCount}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Completed</div>
          <div className="text-2xl font-bold text-slate-900 mt-1 font-tabular">{completedCount}</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              statusFilter === 'all'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            All Bookings ({totalCount})
          </button>
          <button
            onClick={() => setStatusFilter('active')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              statusFilter === 'active'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Active ({activeCount})
          </button>
          <button
            onClick={() => setStatusFilter('pending')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              statusFilter === 'pending'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Pending ({pendingCount})
          </button>
          <button
            onClick={() => setStatusFilter('completed')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              statusFilter === 'completed'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Completed ({completedCount})
          </button>
        </div>
        <span className="text-xs text-slate-400 font-tabular">
          Showing {filteredBookings.length} records
        </span>
      </div>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-slate-200 p-12 text-center">
          <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-slate-800">No bookings in this view</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            You don't have any bookings matching this filter. Click below to book a trusted cooperative service provider.
          </p>
          <button
            onClick={onNavigateToBooking}
            className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-xs"
          >
            Book a Service Now
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map(booking => {
            const isAssigned = booking.status === 'assigned';
            const isInProgress = booking.status === 'in_progress';
            const isCompleted = booking.status === 'completed';
            const isPending = booking.status === 'pending';
            const isCancelled = booking.status === 'cancelled';

            return (
              <div
                key={booking.id}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs hover:border-slate-300 transition-all"
              >
                <div className="p-5 sm:p-6 space-y-4">
                  {/* Top row */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="font-bold text-base text-slate-900">
                        {booking.serviceType}
                      </div>
                      <span className="text-xs text-slate-500 font-tabular">
                        Ref #{booking.id}
                      </span>
                    </div>

                    {/* Status Badge */}
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-md uppercase tracking-wider ${
                        isCompleted
                          ? 'bg-slate-100 text-slate-700'
                          : isInProgress
                          ? 'bg-blue-100 text-blue-800 font-bold'
                          : isAssigned
                          ? 'bg-emerald-100 text-emerald-800'
                          : isPending
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        {booking.status}
                      </span>
                    </div>
                  </div>

                  {/* Body description & schedule */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    <div className="md:col-span-7 space-y-2">
                      <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                        {booking.description}
                      </p>
                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                        <span className="flex items-center gap-1 font-tabular">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {booking.date}
                        </span>
                        <span className="flex items-center gap-1 font-tabular">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {booking.startTime} - {booking.endTime} ({booking.estimatedHours} hrs)
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {booking.area}
                        </span>
                      </div>
                    </div>

                    {/* Assigned Worker Info Box */}
                    <div className="md:col-span-5 bg-slate-50 p-3.5 rounded-lg border border-slate-200/80 text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 font-medium">Assigned Worker:</span>
                        <span className="font-semibold text-slate-900">
                          {booking.assignedWorkerName || 'Pending Allocation'}
                        </span>
                      </div>
                      
                      {booking.assignedWorkerName ? (
                        <div className="text-[11px] text-slate-600 line-clamp-2">
                          {booking.allocationReason}
                        </div>
                      ) : (
                        <div className="text-[11px] text-amber-800">
                          {booking.allocationReason || 'In allocation queue. Organiser is supervising.'}
                        </div>
                      )}

                      {/* Transparent Allocation Explainer Trigger */}
                      <button
                        type="button"
                        onClick={() => setExplainingBooking(booking)}
                        className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 pt-1"
                      >
                        <Scale className="w-3.5 h-3.5" />
                        <span>Inspect Fair Allocation Reason</span>
                      </button>
                    </div>
                  </div>

                  {/* Customer Review if completed */}
                  {isCompleted && booking.customerRating && (
                    <div className="p-3 bg-emerald-50/50 rounded-lg border border-emerald-100 text-xs">
                      <div className="flex items-center gap-1.5 text-amber-500 mb-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${
                              i < (booking.customerRating || 0) ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                            }`}
                          />
                        ))}
                        <span className="text-slate-700 font-semibold ml-1">
                          {booking.customerRating}.0 Stars
                        </span>
                      </div>
                      {booking.customerFeedback && (
                        <p className="text-slate-600 italic">"{booking.customerFeedback}"</p>
                      )}
                    </div>
                  )}

                  {/* Bottom Action Strip */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                    <div className="font-tabular text-slate-600">
                      Total: <strong className="text-slate-900 font-semibold">₹{booking.estimatedCost}</strong>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Cancel action if not completed */}
                      {!isCompleted && !isCancelled && (
                        <button
                          type="button"
                          onClick={() => setCancellingBooking(booking)}
                          className="px-3 py-1 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                        >
                          Cancel Booking
                        </button>
                      )}

                      {/* Complete & Rate action if active and in_progress/assigned */}
                      {(isAssigned || isInProgress) && (
                        <button
                          type="button"
                          onClick={() => setRatingBooking(booking)}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-md shadow-xs transition-colors"
                        >
                          Mark Completed & Rate
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
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

      {/* Cancel Modal */}
      {cancellingBooking && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 max-w-md w-full p-6 shadow-xl space-y-4">
            <h3 className="font-bold text-base text-slate-900">Cancel Booking #{cancellingBooking.id}?</h3>
            <p className="text-xs text-slate-500">
              The assigned worker will be immediately freed and their active workload ledger updated.
            </p>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Reason for cancellation:</label>
              <input
                type="text"
                value={cancellationReason}
                onChange={e => setCancellationReason(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setCancellingBooking(null)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Keep Booking
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="px-3 py-1.5 text-xs text-white bg-rose-600 hover:bg-rose-700 font-semibold rounded-lg"
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rate & Complete Modal */}
      {ratingBooking && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 max-w-md w-full p-6 shadow-xl space-y-4">
            <h3 className="font-bold text-base text-slate-900">Mark Completed & Rate Worker</h3>
            <p className="text-xs text-slate-500">
              Technician: <strong className="text-slate-800">{ratingBooking.assignedWorkerName}</strong> for {ratingBooking.serviceType}.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">Rating</label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setStarRating(star)}
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        star <= starRating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                      }`}
                    />
                  </button>
                ))}
                <span className="text-xs font-semibold text-slate-700 ml-2 font-tabular">
                  {starRating}.0 / 5.0
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Feedback / Notes</label>
              <textarea
                rows={3}
                value={feedbackText}
                onChange={e => setFeedbackText(e.target.value)}
                placeholder="Share your experience (punctuality, clean work, transparent pricing)..."
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRatingBooking(null)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Dismiss
              </button>
              <button
                type="button"
                onClick={handleRate}
                className="px-3 py-1.5 text-xs text-white bg-emerald-600 hover:bg-emerald-700 font-semibold rounded-lg"
              >
                Submit Review & Complete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
