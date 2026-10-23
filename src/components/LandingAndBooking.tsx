/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ServiceCategory, Customer, Worker, Booking } from '../types';
import { api } from '../services/api';
import { evaluateAllocation } from '../services/allocationService';
import { 
  Wrench, 
  Zap, 
  Sparkles, 
  Hammer, 
  Paintbrush, 
  Tv, 
  Home, 
  Calendar, 
  Clock, 
  MapPin, 
  ShieldCheck, 
  Scale, 
  CheckCircle2, 
  AlertCircle,
  ArrowRight,
  UserCheck
} from 'lucide-react';

interface LandingAndBookingProps {
  onBookingCreated: (booking: Booking) => void;
  onNavigateToCustomer: (customerId: string) => void;
  onOpenDemoTour?: () => void;
}

const SERVICE_ITEMS: { 
  type: ServiceCategory; 
  icon: React.ComponentType<{ className?: string }>; 
  baseRate: number; 
  desc: string;
}[] = [
  { type: 'Electrical', icon: Zap, baseRate: 350, desc: 'Wiring, MCB switches, fans & fixture repairs' },
  { type: 'Plumbing', icon: Wrench, baseRate: 320, desc: 'Pipes, faucets, leakages & bathroom fittings' },
  { type: 'Cleaning', icon: Sparkles, baseRate: 300, desc: 'Deep home cleaning, sanitation & kitchen care' },
  { type: 'Home Repair', icon: Home, baseRate: 330, desc: 'General handyman repairs, locks & hardware' },
  { type: 'Carpentry', icon: Hammer, baseRate: 400, desc: 'Furniture assembly, woodwork & door repairs' },
  { type: 'Appliance Repair', icon: Tv, baseRate: 380, desc: 'AC service, washing machine, geyser troubleshooting' },
  { type: 'Painting', icon: Paintbrush, baseRate: 350, desc: 'Touch-ups, wall moisture barrier & fresh coat' },
];

const LOCALITIES = [
  'Indiranagar, Bengaluru',
  'Koramangala, Bengaluru',
  'Whitefield, Bengaluru',
  'HSR Layout, Bengaluru',
  'Jayanagar, Bengaluru'
];

const TIME_SLOTS = [
  { label: 'Morning Slot', start: '10:00', end: '12:00', duration: 2 },
  { label: 'Afternoon Slot', start: '14:00', end: '16:00', duration: 2 },
  { label: 'Late Afternoon', start: '16:30', end: '18:30', duration: 2 },
  { label: 'Evening Slot', start: '19:00', end: '20:30', duration: 1.5 },
];

export const LandingAndBooking: React.FC<LandingAndBookingProps> = ({
  onBookingCreated,
  onNavigateToCustomer,
  onOpenDemoTour
}) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);

  // Form states
  const [selectedCustomer, setSelectedCustomer] = useState<string>('c-1');
  const [serviceType, setServiceType] = useState<ServiceCategory>('Electrical');
  const [description, setDescription] = useState<string>('Main switchboard spark and repair living room ceiling fan.');
  const [address, setAddress] = useState<string>('Flat 402, Green Glen Layout, Indiranagar, Bengaluru');
  const [area, setArea] = useState<string>('Indiranagar, Bengaluru');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number>(1); // 14:00 - 16:00
  const [customStartTime, setCustomStartTime] = useState<string>('14:00');
  const [customEndTime, setCustomEndTime] = useState<string>('16:00');
  const [useCustomSlot, setUseCustomSlot] = useState<boolean>(false);

  // Submission & Preview states
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [createdBooking, setCreatedBooking] = useState<Booking | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [cRes, wRes, bRes] = await Promise.all([
      api.getCustomers(),
      api.getWorkers(),
      api.getBookings()
    ]);
    if (cRes.success) setCustomers(cRes.data);
    if (wRes.success) setWorkers(wRes.data);
    if (bRes.success) setBookings(bRes.data);
  };

  const calcDuration = (start: string, end: string) => {
    const [sh, sm] = start.split(':').map(Number);
    const [eh, em] = end.split(':').map(Number);
    const diff = (eh * 60 + (em || 0)) - (sh * 60 + (sm || 0));
    return diff > 0 ? Math.max(0.5, Number((diff / 60).toFixed(1))) : 2;
  };

  const currentStartTime = useCustomSlot ? customStartTime : TIME_SLOTS[selectedSlotIndex].start;
  const currentEndTime = useCustomSlot ? customEndTime : TIME_SLOTS[selectedSlotIndex].end;
  const currentDuration = useCustomSlot ? calcDuration(customStartTime, customEndTime) : TIME_SLOTS[selectedSlotIndex].duration;

  // Real-time Allocation Preview Calculation
  const activeCustomer = customers.find(c => c.id === selectedCustomer);
  const serviceInfo = SERVICE_ITEMS.find(s => s.type === serviceType) || SERVICE_ITEMS[0];
  const estimatedTotalCost = Math.round(serviceInfo.baseRate * currentDuration);

  // Compute live prospective allocation using allocation engine
  const livePreview = evaluateAllocation(
    {
      id: 'preview',
      serviceType,
      address,
      area,
      date,
      startTime: currentStartTime,
      endTime: currentEndTime
    },
    workers,
    bookings
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    if (!activeCustomer) return;

    if (useCustomSlot && customStartTime >= customEndTime) {
      setSubmitError('Booking end time must be later than start time.');
      return;
    }

    setIsSubmitting(true);
    const res = await api.createBooking({
      customerId: activeCustomer.id,
      customerName: activeCustomer.name,
      customerPhone: activeCustomer.phone,
      serviceType,
      description,
      address,
      area,
      date,
      startTime: currentStartTime,
      endTime: currentEndTime,
      estimatedHours: currentDuration,
      estimatedCost: estimatedTotalCost
    });

    setIsSubmitting(false);

    if (res.success && res.data.booking) {
      setCreatedBooking(res.data.booking);
      onBookingCreated(res.data.booking);
      loadData();
    }
  };

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white border-b border-slate-200 pt-10 pb-12 sm:pt-14 sm:pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-md border border-emerald-200/60 mb-4">
              <Scale className="w-3.5 h-3.5 text-emerald-600" />
              <span>Cooperative Workload Governance · Zero Worker Exploitation</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 leading-[1.15]" style={{ textWrap: 'balance' }}>
              Fair local service booking with guaranteed transparent allocation.
            </h1>

            <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
              SEVA FAIR connects certified household technicians with customers using a strict non-overlapping schedule invariant and fair workload balancing. No algorithm lock-outs; clear reasons for every dispatch.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <a
                href="#booking-engine"
                className="px-5 py-2.5 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors"
              >
                Request Service
              </a>
              <a
                href="#allocation-rules"
                className="px-5 py-2.5 text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <span>How Fair Allocation Works</span>
              </a>
            </div>
          </div>

          {/* Adjacency Proof Strip (4-column KPIs) */}
          <div className="mt-12 pt-8 border-t border-slate-200/70 grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <div className="font-tabular text-2xl sm:text-3xl font-bold text-slate-900">100%</div>
              <div className="text-xs text-slate-500 mt-1">Verified & Police Checked</div>
            </div>
            <div>
              <div className="font-tabular text-2xl sm:text-3xl font-bold text-emerald-700">0</div>
              <div className="text-xs text-slate-500 mt-1">Double-Booking Conflicts</div>
            </div>
            <div>
              <div className="font-tabular text-2xl sm:text-3xl font-bold text-slate-900">Equal</div>
              <div className="text-xs text-slate-500 mt-1">Workload Distribution</div>
            </div>
            <div>
              <div className="font-tabular text-2xl sm:text-3xl font-bold text-slate-900">Full</div>
              <div className="text-xs text-slate-500 mt-1">Audit Ledger Transparency</div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Booking Engine Grid */}
      <section id="booking-engine" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Booking Form (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-xs">
            <div className="border-b border-slate-100 pb-4 mb-6">
              <h2 className="text-xl font-bold text-slate-900">Book Household Service</h2>
              <p className="text-xs text-slate-500 mt-1">
                Enter your service requirement. Our cooperative allocator assigns the best qualified worker with lowest active workload.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Customer Account Selector */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
                  Customer Profile
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {customers.map(c => (
                    <button
                      type="button"
                      key={c.id}
                      onClick={() => {
                        setSelectedCustomer(c.id);
                        setAddress(c.address);
                        setArea(c.area);
                      }}
                      className={`text-left p-2.5 rounded-lg border text-xs transition-colors ${
                        selectedCustomer === c.id
                          ? 'border-emerald-600 bg-emerald-50/50 text-emerald-950 font-medium'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <div className="font-semibold truncate">{c.name}</div>
                      <div className="text-[11px] text-slate-500 truncate mt-0.5">{c.area}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Service Category */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
                  Service Category
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {SERVICE_ITEMS.map(item => {
                    const Icon = item.icon;
                    const isSelected = serviceType === item.type;
                    return (
                      <button
                        type="button"
                        key={item.type}
                        onClick={() => {
                          setServiceType(item.type);
                          if (item.type === 'Electrical') setDescription('Main switchboard spark and repair living room ceiling fan.');
                          else if (item.type === 'Plumbing') setDescription('Fix high-pressure kitchen tap leak and check washer.');
                          else if (item.type === 'Cleaning') setDescription('Deep bathroom sanitation and kitchen counter grease removal.');
                          else if (item.type === 'Carpentry') setDescription('Door hinge alignment and study table drawer fix.');
                          else if (item.type === 'Appliance Repair') setDescription('Washing machine drainage pump inspection.');
                          else setDescription(`Standard certified ${item.type} maintenance.`);
                        }}
                        className={`p-3 rounded-lg border text-left flex flex-col justify-between transition-all ${
                          isSelected
                            ? 'border-emerald-600 bg-emerald-50/60 ring-1 ring-emerald-600 text-emerald-950 font-medium'
                            : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <Icon className={`w-4 h-4 ${isSelected ? 'text-emerald-700' : 'text-slate-500'}`} />
                          <span className="font-tabular text-[11px] text-slate-500">₹{item.baseRate}/hr</span>
                        </div>
                        <div className="mt-2 font-semibold text-xs">{item.type}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Problem Description
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Describe the specific repair or maintenance required..."
                  required
                  className="w-full text-xs sm:text-sm p-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 transition-all text-slate-900 bg-white"
                />
              </div>

              {/* Address & Locality */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Service Address & Locality
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  placeholder="Street address, building name, flat number..."
                  required
                  className="w-full text-xs sm:text-sm p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 text-slate-900"
                />
                
                {/* Locality Quick Select */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[11px] text-slate-500 mr-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    Quick Area:
                  </span>
                  {LOCALITIES.map(loc => (
                    <button
                      type="button"
                      key={loc}
                      onClick={() => {
                        setArea(loc);
                        if (!address.includes(loc.split(',')[0])) {
                          setAddress(prev => `${prev.split(',')[0]}, ${loc}`);
                        }
                      }}
                      className={`text-[11px] px-2 py-0.5 rounded-md border transition-colors ${
                        area === loc
                          ? 'bg-slate-900 text-white border-slate-900 font-medium'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                      }`}
                    >
                      {loc.split(',')[0]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date & Time Scheduling */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    Date
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    required
                    className="w-full text-xs sm:text-sm p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 text-slate-900 font-tabular"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    Time Window
                  </label>
                  
                  {!useCustomSlot ? (
                    <div className="space-y-1.5">
                      <select
                        value={selectedSlotIndex}
                        onChange={e => setSelectedSlotIndex(Number(e.target.value))}
                        className="w-full text-xs sm:text-sm p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 text-slate-900 font-tabular"
                      >
                        {TIME_SLOTS.map((slot, idx) => (
                          <option key={idx} value={idx}>
                            {slot.label} ({slot.start} - {slot.end})
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => setUseCustomSlot(true)}
                        className="text-[11px] text-emerald-700 hover:underline"
                      >
                        Specify custom start/end time
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <input
                          type="time"
                          value={customStartTime}
                          onChange={e => setCustomStartTime(e.target.value)}
                          className="w-1/2 p-2 border border-slate-200 rounded-md text-xs font-tabular"
                        />
                        <span className="text-slate-400 text-xs">to</span>
                        <input
                          type="time"
                          value={customEndTime}
                          onChange={e => setCustomEndTime(e.target.value)}
                          className="w-1/2 p-2 border border-slate-200 rounded-md text-xs font-tabular"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => setUseCustomSlot(false)}
                        className="text-[11px] text-slate-500 hover:underline"
                      >
                        Back to preset slots
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Submit CTA Button */}
              {submitError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{submitError}</span>
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-semibold text-sm transition-all shadow-xs flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>Evaluating Fair Allocation...</span>
                  ) : (
                    <>
                      <span>Confirm & Dispatched via Fair Allocation</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
                <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 px-1">
                  <span>Estimated Total: <strong className="font-tabular text-slate-800">₹{estimatedTotalCost}</strong> ({currentDuration} hrs @ ₹{serviceInfo.baseRate}/hr)</span>
                  <span>Cooperative guaranteed rate</span>
                </div>
              </div>
            </form>
          </div>

          {/* Real-time Allocation Live Preview Sidebar (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <Scale className="w-4 h-4 text-emerald-600" />
                  <h3 className="font-semibold text-sm text-slate-900">Live Allocation Inspector</h3>
                </div>
                <span className="text-[11px] text-slate-500 uppercase tracking-wider font-mono">Realtime</span>
              </div>

              {/* Simulation Result */}
              {livePreview.success && livePreview.assignedWorker ? (
                <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-lg text-emerald-950 space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800">
                      Eligible Worker Found
                    </span>
                  </div>
                  <div className="text-base font-bold text-slate-900">
                    {livePreview.assignedWorker.name}
                  </div>
                  <div className="text-xs text-slate-600 leading-relaxed">
                    {livePreview.reason}
                  </div>
                  <div className="pt-2 border-t border-emerald-200/60 grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <span className="text-slate-500 block">Current Workload:</span>
                      <span className="font-tabular font-semibold text-slate-800">
                        {livePreview.assignedWorker.activeJobsCount} active job(s)
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Rating:</span>
                      <span className="font-tabular font-semibold text-slate-800">
                        ★ {livePreview.assignedWorker.rating} ({livePreview.assignedWorker.completedJobsCount} jobs)
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-lg text-amber-950 space-y-2">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-amber-800">
                      {livePreview.isConflict ? 'Schedule Conflict' : 'Pending Queue'}
                    </span>
                  </div>
                  <div className="text-xs text-slate-700 leading-relaxed">
                    {livePreview.reason}
                  </div>
                  <div className="text-[11px] text-amber-800 pt-1">
                    Booking will be stored as <strong className="font-semibold">Pending</strong> and automatically surfaced in the Organiser Reassignment console.
                  </div>
                </div>
              )}

              {/* Breakdown List */}
              <div className="mt-4 pt-3 border-t border-slate-100">
                <h4 className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Candidate Evaluation Breakdown ({livePreview.evaluations.length} total)
                </h4>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {livePreview.evaluations.map(ev => (
                    <div
                      key={ev.workerId}
                      className="text-xs p-2 rounded-md bg-slate-50 border border-slate-100 flex items-center justify-between"
                    >
                      <div>
                        <span className="font-medium text-slate-900">{ev.workerName}</span>
                        <div className="text-[10px] text-slate-500">
                          {ev.isEligible ? (
                            <span className="text-emerald-700 font-medium">Eligible · {ev.activeWorkload} ongoing</span>
                          ) : (
                            <span className="text-rose-600">{ev.rejectionReason}</span>
                          )}
                        </div>
                      </div>
                      <div className="text-right font-tabular text-[11px]">
                        {ev.hasScheduleConflict && (
                          <span className="text-[10px] text-rose-600 font-semibold block">Overlap</span>
                        )}
                        <span className="text-slate-400">ID: {ev.workerId}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Demo Scenario Trigger Card */}
            <div className="bg-slate-900 text-white rounded-xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
                <Sparkles className="w-4 h-4" />
                <span>Hackathon Testing Mode</span>
              </div>
              <h4 className="font-bold text-sm text-white">Need to demonstrate conflicts or reassignments?</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Use our built-in interactive simulator to reproduce the double-booking conflict prevention, worker cancellation, and safe auto-reassignment with 1 click.
              </p>
              <button
                type="button"
                onClick={onOpenDemoTour}
                className="w-full py-2 px-3 text-xs font-semibold text-slate-900 bg-white hover:bg-slate-100 rounded-lg transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Open Guided Walkthrough Simulator</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Booking Created Success Modal */}
      {createdBooking && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 max-w-lg w-full p-6 shadow-xl space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-900">Booking Confirmed!</h3>
                <p className="text-xs text-slate-500 font-tabular">Reference #{createdBooking.id}</p>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Service:</span>
                <span className="font-semibold text-slate-900">{createdBooking.serviceType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Status:</span>
                <span className={`font-semibold uppercase tracking-wider ${
                  createdBooking.status === 'assigned' ? 'text-emerald-700' : 'text-amber-700'
                }`}>
                  {createdBooking.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Allocated Worker:</span>
                <span className="font-semibold text-slate-900">
                  {createdBooking.assignedWorkerName || 'Queued for pending dispatch'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Scheduled Time:</span>
                <span className="font-tabular text-slate-900">{createdBooking.date} · {createdBooking.startTime} - {createdBooking.endTime}</span>
              </div>
              <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-600">
                <strong>Allocation Reason:</strong> {createdBooking.allocationReason}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCreatedBooking(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  const custId = createdBooking.customerId;
                  setCreatedBooking(null);
                  onNavigateToCustomer(custId);
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors"
              >
                View in Customer Portal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
