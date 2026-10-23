/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AllocationHistoryEvent } from '../types';
import { api } from '../services/api';
import { 
  FileText, 
  Search, 
  Filter, 
  RotateCcw, 
  CheckCircle2, 
  AlertTriangle, 
  User, 
  Wrench, 
  Shield, 
  Cpu, 
  Clock,
  ArrowRight
} from 'lucide-react';

export const AuditLedgerView: React.FC = () => {
  const [history, setHistory] = useState<AllocationHistoryEvent[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [selectedEvent, setSelectedEvent] = useState<AllocationHistoryEvent | null>(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    const res = await api.getHistory();
    if (res.success) {
      setHistory(res.data);
    }
  };

  const filteredHistory = history.filter(item => {
    const matchesSearch = 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.bookingId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.actorName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = roleFilter === 'all' || item.actorRole === roleFilter;

    return matchesSearch && matchesRole;
  });

  const getActorIcon = (role: AllocationHistoryEvent['actorRole']) => {
    switch (role) {
      case 'CUSTOMER':
        return <User className="w-3.5 h-3.5 text-blue-600" />;
      case 'WORKER':
        return <Wrench className="w-3.5 h-3.5 text-amber-600" />;
      case 'ORGANISER':
        return <Shield className="w-3.5 h-3.5 text-purple-600" />;
      case 'SYSTEM':
      default:
        return <Cpu className="w-3.5 h-3.5 text-emerald-600" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200/70 mb-1">
            <FileText className="w-3.5 h-3.5 text-emerald-600" />
            <span>Immutable Allocation History & Audit Trail</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Cooperative Allocation Ledger</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Every booking request, algorithmic workload score, assignment, decline, and reassignment event is chronologically logged.
          </p>
        </div>

        <button
          onClick={loadHistory}
          className="self-start sm:self-auto px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1.5 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Refresh Ledger</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search booking ref, technician, or explanation..."
            className="w-full text-xs pl-9 pr-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-600/30 text-slate-900"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs text-slate-500">Actor Role:</span>
          <select
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
            className="text-xs p-2 rounded-lg border border-slate-200 bg-white font-medium text-slate-800"
          >
            <option value="all">All Roles</option>
            <option value="SYSTEM">System Allocator</option>
            <option value="CUSTOMER">Customer</option>
            <option value="WORKER">Technician</option>
            <option value="ORGANISER">Organiser</option>
          </select>
        </div>
      </div>

      {/* Audit Events List */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Chronological Events ({filteredHistory.length})
          </span>
          <span className="text-xs text-slate-400 font-tabular">Real-time audit log</span>
        </div>

        {filteredHistory.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">
            No events match the search filter.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredHistory.map(event => {
              const dateObj = new Date(event.timestamp);
              const formattedTime = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
              const formattedDate = dateObj.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });

              return (
                <div
                  key={event.id}
                  onClick={() => setSelectedEvent(event)}
                  className="p-4 sm:p-5 hover:bg-slate-50/80 transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-start justify-between gap-4"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="mt-1 p-2 rounded-lg bg-slate-100 shrink-0">
                      {getActorIcon(event.actorRole)}
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-sm text-slate-900">{event.title}</span>
                        <span className="font-tabular text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded font-medium">
                          Ref #{event.bookingId}
                        </span>
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                          event.eventType.includes('ASSIGNED')
                            ? 'bg-emerald-50 text-emerald-800'
                            : event.eventType.includes('COMPLETED')
                            ? 'bg-blue-50 text-blue-800'
                            : event.eventType.includes('REASSIGN')
                            ? 'bg-purple-50 text-purple-800'
                            : event.eventType.includes('FAILED') || event.eventType.includes('CANCEL')
                            ? 'bg-rose-50 text-rose-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {event.eventType}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
                        {event.description}
                      </p>

                      <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-1">
                        <span>Actor: <strong className="text-slate-600 font-medium">{event.actorName}</strong> ({event.actorRole})</span>
                        {event.details?.reason && (
                          <span>· Reason: {event.details.reason}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0 text-xs font-tabular text-slate-400">
                    <div>{formattedTime}</div>
                    <div className="text-[10px] text-slate-400">{formattedDate}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Selected Event Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-base text-slate-900">{selectedEvent.title}</h3>
                <span className="text-xs text-slate-500 font-tabular">Event ID: {selectedEvent.id}</span>
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                className="text-slate-400 hover:text-slate-600 text-sm"
              >
                ✕
              </button>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Booking Reference:</span>
                <span className="font-tabular font-semibold text-slate-900">#{selectedEvent.bookingId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Actor:</span>
                <span className="font-semibold text-slate-900">{selectedEvent.actorName} ({selectedEvent.actorRole})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Timestamp:</span>
                <span className="font-tabular text-slate-900">{selectedEvent.timestamp}</span>
              </div>
              <div className="pt-2 border-t border-slate-200 text-slate-700">
                <strong>Audit Details:</strong>
                <p className="mt-1 leading-relaxed">{selectedEvent.description}</p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedEvent(null)}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
