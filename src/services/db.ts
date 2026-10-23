/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  Worker,
  Customer,
  Booking,
  AllocationHistoryEvent,
  ServiceCategory
} from '../types';
import { evaluateAllocation } from './allocationService';

const STORAGE_KEY_WORKERS = 'seva_fair_workers_v1';
const STORAGE_KEY_CUSTOMERS = 'seva_fair_customers_v1';
const STORAGE_KEY_BOOKINGS = 'seva_fair_bookings_v1';
const STORAGE_KEY_HISTORY = 'seva_fair_history_v1';

// Initial Seed Data aligned with handoff document
const SEED_WORKERS: Worker[] = [
  {
    id: 'w-1',
    name: 'Ravi Kumar',
    phone: '+91 98450 12345',
    email: 'ravi.kumar@coop.local',
    avatar: 'RK',
    skills: ['Electrical', 'Plumbing', 'Home Repair'],
    serviceAreas: ['Bengaluru', 'Indiranagar', 'Domlur', 'Koramangala'],
    isVerified: true,
    isAvailable: true,
    activeJobsCount: 1,
    completedJobsCount: 18,
    rating: 4.9,
    reviewsCount: 24,
    hourlyRate: 350,
    joinedDate: '2025-08-10',
    govIdVerified: true,
    policeVerification: true,
    verificationNotes: 'Licensed electrical wireman certificate #BLR-8829; background checked.',
    lastActiveTime: 'Just now'
  },
  {
    id: 'w-2',
    name: 'Priya Sharma',
    phone: '+91 98450 54321',
    email: 'priya.sharma@coop.local',
    avatar: 'PS',
    skills: ['Cleaning', 'Plumbing', 'Home Repair'],
    serviceAreas: ['Bengaluru', 'Koramangala', 'HSR Layout', 'BTM Layout'],
    isVerified: true,
    isAvailable: true,
    activeJobsCount: 1,
    completedJobsCount: 22,
    rating: 4.85,
    reviewsCount: 31,
    hourlyRate: 300,
    joinedDate: '2025-06-15',
    govIdVerified: true,
    policeVerification: true,
    verificationNotes: 'NSDC Certified sanitation & plumbing technician. Top customer rating.',
    lastActiveTime: '5 mins ago'
  },
  {
    id: 'w-3',
    name: 'Amit Patel',
    phone: '+91 98450 67890',
    email: 'amit.patel@coop.local',
    avatar: 'AP',
    skills: ['Carpentry', 'Home Repair', 'Painting'],
    serviceAreas: ['Bengaluru', 'Whitefield', 'Marathahalli', 'Indiranagar'],
    isVerified: true,
    isAvailable: true,
    activeJobsCount: 0,
    completedJobsCount: 14,
    rating: 4.8,
    reviewsCount: 19,
    hourlyRate: 400,
    joinedDate: '2025-09-01',
    govIdVerified: true,
    policeVerification: true,
    verificationNotes: 'Master woodworker & modular fittings specialist. Police verified.',
    lastActiveTime: '12 mins ago'
  },
  {
    id: 'w-4',
    name: 'Sunita Devi',
    phone: '+91 98450 99887',
    email: 'sunita.devi@coop.local',
    avatar: 'SD',
    skills: ['Cleaning', 'Appliance Repair', 'Home Repair'],
    serviceAreas: ['Bengaluru', 'Jayanagar', 'JP Nagar', 'Koramangala'],
    isVerified: true,
    isAvailable: false, // temporarily on break to demonstrate availability toggle
    activeJobsCount: 0,
    completedJobsCount: 29,
    rating: 4.95,
    reviewsCount: 42,
    hourlyRate: 320,
    joinedDate: '2025-04-12',
    govIdVerified: true,
    policeVerification: true,
    verificationNotes: 'Senior cooperative lead; appliance repair certified by LG/Samsung.',
    lastActiveTime: '1 hour ago'
  },
  {
    id: 'w-5',
    name: 'Vikram Singh',
    phone: '+91 98450 33445',
    email: 'vikram.singh@coop.local',
    avatar: 'VS',
    skills: ['Electrical', 'Appliance Repair'],
    serviceAreas: ['Bengaluru', 'HSR Layout', 'Bellandur'],
    isVerified: false, // Unverified - demonstrates Organiser verification workflow!
    isAvailable: true,
    activeJobsCount: 0,
    completedJobsCount: 0,
    rating: 0,
    reviewsCount: 0,
    hourlyRate: 350,
    joinedDate: '2026-10-20',
    govIdVerified: false,
    policeVerification: false,
    verificationNotes: 'Application submitted yesterday. Pending Aadhaar & safety certificate verification.',
    lastActiveTime: '30 mins ago'
  }
];

const SEED_CUSTOMERS: Customer[] = [
  {
    id: 'c-1',
    name: 'Aaditya Roy',
    phone: '+91 99001 11222',
    email: 'aaditya.roy@example.com',
    address: 'Flat 402, Green Glen Layout, Indiranagar, Bengaluru',
    area: 'Indiranagar, Bengaluru'
  },
  {
    id: 'c-2',
    name: 'Meera Nair',
    phone: '+91 99002 33445',
    email: 'meera.nair@example.com',
    address: 'Villa 14, Palm Meadows, Whitefield, Bengaluru',
    area: 'Whitefield, Bengaluru'
  },
  {
    id: 'c-3',
    name: 'Karan Kapoor',
    phone: '+91 99003 55667',
    email: 'karan.kapoor@example.com',
    address: '88, 4th Cross, 5th Block, Koramangala, Bengaluru',
    area: 'Koramangala, Bengaluru'
  }
];

// Helper to get today's date in YYYY-MM-DD format
const getTodayDate = (offsetDays = 0): string => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
};

const SEED_BOOKINGS: Booking[] = [
  {
    id: 'b-101',
    customerId: 'c-1',
    customerName: 'Aaditya Roy (Demo Customer)',
    customerPhone: '+91 99001 11222',
    serviceType: 'Electrical',
    description: 'Main MCB switch trip troubleshooting and ceiling fan installation in living room.',
    address: 'Flat 402, Green Glen Layout, Indiranagar, Bengaluru',
    area: 'Indiranagar, Bengaluru',
    date: getTodayDate(0),
    startTime: '10:00',
    endTime: '12:00',
    estimatedHours: 2,
    estimatedCost: 700,
    status: 'assigned',
    assignedWorkerId: 'w-1',
    assignedWorkerName: 'Ravi Kumar',
    allocationReason: 'Fair Workload Allocation: Ravi Kumar selected with lowest active workload (0 ongoing jobs at time of allocation), verified skills (Electrical), and zero time-slot conflicts on today (10:00-12:00).',
    allocationEvaluations: [
      {
        workerId: 'w-1',
        workerName: 'Ravi Kumar',
        isVerified: true,
        isAvailable: true,
        hasSkill: true,
        servesArea: true,
        hasScheduleConflict: false,
        activeWorkload: 0,
        completedJobs: 18,
        isEligible: true,
        selectionScore: 18
      },
      {
        workerId: 'w-2',
        workerName: 'Priya Sharma',
        isVerified: true,
        isAvailable: true,
        hasSkill: false,
        servesArea: true,
        hasScheduleConflict: false,
        activeWorkload: 0,
        completedJobs: 22,
        isEligible: false,
        rejectionReason: 'Lacks verified skill in Electrical',
        selectionScore: 22
      },
      {
        workerId: 'w-5',
        workerName: 'Vikram Singh',
        isVerified: false,
        isAvailable: true,
        hasSkill: true,
        servesArea: false,
        hasScheduleConflict: false,
        activeWorkload: 0,
        completedJobs: 0,
        isEligible: false,
        rejectionReason: 'Pending organiser profile verification & KYC',
        selectionScore: 0
      }
    ],
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString()
  },
  {
    id: 'b-102',
    customerId: 'c-3',
    customerName: 'Karan Kapoor',
    customerPhone: '+91 99003 55667',
    serviceType: 'Cleaning',
    description: 'Deep bathroom disinfection and kitchen sink de-clogging.',
    address: '88, 4th Cross, 5th Block, Koramangala, Bengaluru',
    area: 'Koramangala, Bengaluru',
    date: getTodayDate(0),
    startTime: '14:00',
    endTime: '16:30',
    estimatedHours: 2.5,
    estimatedCost: 750,
    status: 'assigned',
    assignedWorkerId: 'w-2',
    assignedWorkerName: 'Priya Sharma',
    allocationReason: 'Fair Workload Allocation: Priya Sharma selected with lowest active workload (0 ongoing jobs), certified skills (Cleaning), and verified coverage for Koramangala.',
    allocationEvaluations: [
      {
        workerId: 'w-2',
        workerName: 'Priya Sharma',
        isVerified: true,
        isAvailable: true,
        hasSkill: true,
        servesArea: true,
        hasScheduleConflict: false,
        activeWorkload: 0,
        completedJobs: 22,
        isEligible: true,
        selectionScore: 22
      },
      {
        workerId: 'w-4',
        workerName: 'Sunita Devi',
        isVerified: true,
        isAvailable: false,
        hasSkill: true,
        servesArea: true,
        hasScheduleConflict: false,
        activeWorkload: 0,
        completedJobs: 29,
        isEligible: false,
        rejectionReason: 'Worker marked as currently unavailable / off-duty',
        selectionScore: 29
      }
    ],
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 4).toISOString()
  },
  {
    id: 'b-100',
    customerId: 'c-1',
    customerName: 'Aaditya Roy (Demo Customer)',
    customerPhone: '+91 99001 11222',
    serviceType: 'Plumbing',
    description: 'Fix kitchen faucet high-pressure water leak and replace valve washer.',
    address: 'Flat 402, Green Glen Layout, Indiranagar, Bengaluru',
    area: 'Indiranagar, Bengaluru',
    date: getTodayDate(-1),
    startTime: '11:00',
    endTime: '12:30',
    estimatedHours: 1.5,
    estimatedCost: 525,
    status: 'completed',
    assignedWorkerId: 'w-1',
    assignedWorkerName: 'Ravi Kumar',
    allocationReason: 'Fair Workload Allocation: Ravi Kumar selected with lowest active workload.',
    allocationEvaluations: [],
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    completedAt: new Date(Date.now() - 86400000 * 1 + 3600000).toISOString(),
    customerRating: 5,
    customerFeedback: 'Ravi arrived right on time, explained the issue transparently, and did a clean job. Very fair cooperative pricing!'
  }
];

const SEED_HISTORY: AllocationHistoryEvent[] = [
  {
    id: 'h-1',
    bookingId: 'b-101',
    timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
    eventType: 'BOOKING_CREATED',
    actorRole: 'CUSTOMER',
    actorName: 'Aaditya Roy',
    title: 'Booking Request Received',
    description: 'Electrical repair requested for today, 10:00 - 12:00 at Indiranagar, Bengaluru.'
  },
  {
    id: 'h-2',
    bookingId: 'b-101',
    timestamp: new Date(Date.now() - 3600000 * 3 + 2000).toISOString(),
    eventType: 'ALLOCATION_ATTEMPTED',
    actorRole: 'SYSTEM',
    actorName: 'Cooperative Fair Allocator',
    title: 'Fair Workload Allocation Executed',
    description: 'Evaluated 5 registered workers. Ravi Kumar qualified with 0 active jobs (lowest workload) and certified Electrical skill.'
  },
  {
    id: 'h-3',
    bookingId: 'b-101',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    eventType: 'WORKER_ASSIGNED',
    actorRole: 'SYSTEM',
    actorName: 'System',
    title: 'Assigned to Ravi Kumar',
    description: 'Booking confirmed and dispatched to technician Ravi Kumar.',
    details: {
      workerId: 'w-1',
      workerName: 'Ravi Kumar'
    }
  },
  {
    id: 'h-4',
    bookingId: 'b-100',
    timestamp: new Date(Date.now() - 86400000 * 1 + 3600000).toISOString(),
    eventType: 'BOOKING_COMPLETED',
    actorRole: 'WORKER',
    actorName: 'Ravi Kumar',
    title: 'Job Marked Completed',
    description: 'Service completed successfully. Customer rated 5.0 stars with positive feedback.',
    details: {
      rating: 5
    }
  }
];

type ChangeListener = () => void;

class DatabaseService {
  private listeners: Set<ChangeListener> = new Set();

  constructor() {
    this.ensureInitialized();
  }

  private ensureInitialized() {
    if (!localStorage.getItem(STORAGE_KEY_WORKERS)) {
      this.resetToSeed();
    }
  }

  public subscribe(listener: ChangeListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach(fn => {
      try {
        fn();
      } catch (err) {
        console.error('Listener callback error', err);
      }
    });
  }

  public resetToSeed(): void {
    localStorage.setItem(STORAGE_KEY_WORKERS, JSON.stringify(SEED_WORKERS));
    localStorage.setItem(STORAGE_KEY_CUSTOMERS, JSON.stringify(SEED_CUSTOMERS));
    localStorage.setItem(STORAGE_KEY_BOOKINGS, JSON.stringify(SEED_BOOKINGS));
    localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(SEED_HISTORY));
    this.recalculateWorkloads();
    this.notify();
  }

  // --- WORKERS ---
  public getWorkers(): Worker[] {
    const raw = localStorage.getItem(STORAGE_KEY_WORKERS);
    return raw ? JSON.parse(raw) : SEED_WORKERS;
  }

  public getWorker(id: string): Worker | undefined {
    return this.getWorkers().find(w => w.id === id);
  }

  public saveWorkers(workers: Worker[]) {
    localStorage.setItem(STORAGE_KEY_WORKERS, JSON.stringify(workers));
    this.notify();
  }

  public updateWorkerAvailability(workerId: string, isAvailable: boolean): Worker | null {
    const workers = this.getWorkers();
    const idx = workers.findIndex(w => w.id === workerId);
    if (idx === -1) return null;

    workers[idx].isAvailable = isAvailable;
    workers[idx].lastActiveTime = 'Just now';
    this.saveWorkers(workers);

    // If worker becomes unavailable, check if they have ongoing assigned jobs that need attention
    return workers[idx];
  }

  public verifyWorker(workerId: string, isVerified: boolean, skills?: ServiceCategory[], notes?: string): Worker | null {
    const workers = this.getWorkers();
    const idx = workers.findIndex(w => w.id === workerId);
    if (idx === -1) return null;

    workers[idx].isVerified = isVerified;
    workers[idx].govIdVerified = isVerified;
    workers[idx].policeVerification = isVerified;
    if (skills) workers[idx].skills = skills;
    if (notes) workers[idx].verificationNotes = notes;
    this.saveWorkers(workers);
    return workers[idx];
  }

  public addWorker(newWorker: Omit<Worker, 'id' | 'activeJobsCount' | 'completedJobsCount' | 'rating' | 'reviewsCount'>): Worker {
    const workers = this.getWorkers();
    const created: Worker = {
      ...newWorker,
      id: `w-${Date.now()}`,
      activeJobsCount: 0,
      completedJobsCount: 0,
      rating: 5.0,
      reviewsCount: 0,
      joinedDate: new Date().toISOString().split('T')[0]
    };
    workers.push(created);
    this.saveWorkers(workers);
    return created;
  }

  // --- CUSTOMERS ---
  public getCustomers(): Customer[] {
    const raw = localStorage.getItem(STORAGE_KEY_CUSTOMERS);
    return raw ? JSON.parse(raw) : SEED_CUSTOMERS;
  }

  public getCustomer(id: string): Customer | undefined {
    return this.getCustomers().find(c => c.id === id);
  }

  // --- BOOKINGS ---
  public getBookings(): Booking[] {
    const raw = localStorage.getItem(STORAGE_KEY_BOOKINGS);
    return raw ? JSON.parse(raw) : SEED_BOOKINGS;
  }

  public getBooking(id: string): Booking | undefined {
    return this.getBookings().find(b => b.id === id);
  }

  public saveBookings(bookings: Booking[]) {
    localStorage.setItem(STORAGE_KEY_BOOKINGS, JSON.stringify(bookings));
    this.recalculateWorkloads();
    this.notify();
  }

  /**
   * Recalculates workers' activeJobsCount and completedJobsCount based on bookings
   */
  public recalculateWorkloads() {
    const workers = this.getWorkers();
    const bookings = this.getBookings();

    let changed = false;
    workers.forEach(w => {
      const activeCount = bookings.filter(
        b => b.assignedWorkerId === w.id && (b.status === 'assigned' || b.status === 'in_progress')
      ).length;
      
      const completedCount = bookings.filter(
        b => b.assignedWorkerId === w.id && b.status === 'completed'
      ).length + (w.completedJobsCount >= 10 ? 0 : 0);

      if (w.activeJobsCount !== activeCount) {
        w.activeJobsCount = activeCount;
        changed = true;
      }
    });

    if (changed) {
      localStorage.setItem(STORAGE_KEY_WORKERS, JSON.stringify(workers));
    }
  }

  /**
   * Creates a booking and executes transactional fair allocation
   */
  public createBooking(data: {
    customerId: string;
    customerName: string;
    customerPhone: string;
    serviceType: ServiceCategory;
    description: string;
    address: string;
    area: string;
    date: string;
    startTime: string;
    endTime: string;
    estimatedHours: number;
    estimatedCost: number;
  }): { booking: Booking; allocation: ReturnType<typeof evaluateAllocation> } {
    const allWorkers = this.getWorkers();
    const allBookings = this.getBookings();

    const bookingId = `b-${Date.now().toString().slice(-4)}`;
    const nowIso = new Date().toISOString();

    // Evaluate allocation
    const allocation = evaluateAllocation(
      {
        id: bookingId,
        serviceType: data.serviceType,
        address: data.address,
        area: data.area,
        date: data.date,
        startTime: data.startTime,
        endTime: data.endTime
      },
      allWorkers,
      allBookings
    );

    const initialStatus = allocation.success ? 'assigned' : 'pending';

    const newBooking: Booking = {
      id: bookingId,
      customerId: data.customerId,
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      serviceType: data.serviceType,
      description: data.description,
      address: data.address,
      area: data.area,
      date: data.date,
      startTime: data.startTime,
      endTime: data.endTime,
      estimatedHours: data.estimatedHours,
      estimatedCost: data.estimatedCost,
      status: initialStatus,
      assignedWorkerId: allocation.assignedWorker ? allocation.assignedWorker.id : null,
      assignedWorkerName: allocation.assignedWorker ? allocation.assignedWorker.name : null,
      allocationReason: allocation.reason,
      allocationEvaluations: allocation.evaluations,
      createdAt: nowIso,
      updatedAt: nowIso
    };

    allBookings.unshift(newBooking);
    this.saveBookings(allBookings);

    // Audit logs
    this.addHistoryEvent({
      bookingId,
      eventType: 'BOOKING_CREATED',
      actorRole: 'CUSTOMER',
      actorName: data.customerName,
      title: 'Booking Request Submitted',
      description: `Requested ${data.serviceType} at ${data.area} for ${data.date} (${data.startTime} - ${data.endTime}).`
    });

    if (allocation.success && allocation.assignedWorker) {
      this.addHistoryEvent({
        bookingId,
        eventType: 'WORKER_ASSIGNED',
        actorRole: 'SYSTEM',
        actorName: 'Cooperative Fair Allocator',
        title: `Assigned to ${allocation.assignedWorker.name}`,
        description: allocation.reason,
        details: {
          workerId: allocation.assignedWorker.id,
          workerName: allocation.assignedWorker.name,
          evaluationsCount: allocation.evaluations.length
        }
      });
    } else {
      this.addHistoryEvent({
        bookingId,
        eventType: 'ALLOCATION_FAILED_PENDING',
        actorRole: 'SYSTEM',
        actorName: 'Cooperative Fair Allocator',
        title: allocation.isConflict ? 'Schedule Conflict Detected' : 'No Immediate Match - Queued',
        description: allocation.reason,
        details: {
          evaluationsCount: allocation.evaluations.length
        }
      });
    }

    return { booking: newBooking, allocation };
  }

  /**
   * Safe, robust reassignment: handles worker decline, sick leave, or organiser override.
   * NEVER throws 500! Always preserves state or transitions with clear reasoning.
   */
  public reassignBooking(
    bookingId: string,
    reason: string,
    actor: { role: 'CUSTOMER' | 'WORKER' | 'ORGANISER' | 'SYSTEM'; name: string },
    excludeWorkerId?: string
  ): { success: boolean; booking: Booking; message: string } {
    const bookings = this.getBookings();
    const idx = bookings.findIndex(b => b.id === bookingId);
    if (idx === -1) {
      return { success: false, booking: {} as Booking, message: `Booking ${bookingId} not found.` };
    }

    const currentBooking = bookings[idx];
    const previousWorkerId = currentBooking.assignedWorkerId;
    const previousWorkerName = currentBooking.assignedWorkerName;

    const workers = this.getWorkers();
    const excludedList = excludeWorkerId ? [excludeWorkerId] : (previousWorkerId ? [previousWorkerId] : []);

    const allocation = evaluateAllocation(
      {
        id: currentBooking.id,
        serviceType: currentBooking.serviceType,
        address: currentBooking.address,
        area: currentBooking.area,
        date: currentBooking.date,
        startTime: currentBooking.startTime,
        endTime: currentBooking.endTime
      },
      workers,
      bookings,
      excludedList
    );

    const nowIso = new Date().toISOString();

    if (allocation.success && allocation.assignedWorker) {
      currentBooking.assignedWorkerId = allocation.assignedWorker.id;
      currentBooking.assignedWorkerName = allocation.assignedWorker.name;
      currentBooking.status = 'assigned';
      currentBooking.allocationReason = `Reassigned by ${actor.name}: ${allocation.reason}`;
      currentBooking.allocationEvaluations = allocation.evaluations;
      currentBooking.updatedAt = nowIso;

      this.saveBookings(bookings);

      this.addHistoryEvent({
        bookingId,
        eventType: 'REASSIGNED',
        actorRole: actor.role,
        actorName: actor.name,
        title: `Reassigned to ${allocation.assignedWorker.name}`,
        description: `Reason: ${reason}. Replacement worker chosen via fair workload rules (${allocation.assignedWorker.activeJobsCount} active jobs).`,
        details: {
          workerId: allocation.assignedWorker.id,
          workerName: allocation.assignedWorker.name,
          previousWorkerId: previousWorkerId || undefined,
          previousWorkerName: previousWorkerName || undefined,
          reason
        }
      });

      return {
        success: true,
        booking: currentBooking,
        message: `Successfully reassigned to ${allocation.assignedWorker.name}.`
      };
    } else {
      // No replacement available
      currentBooking.assignedWorkerId = null;
      currentBooking.assignedWorkerName = null;
      currentBooking.status = 'pending';
      currentBooking.allocationReason = `Reassignment attempted: ${allocation.reason}`;
      currentBooking.allocationEvaluations = allocation.evaluations;
      currentBooking.updatedAt = nowIso;

      this.saveBookings(bookings);

      this.addHistoryEvent({
        bookingId,
        eventType: 'REASSIGNMENT_TRIGGERED',
        actorRole: actor.role,
        actorName: actor.name,
        title: 'Reassignment Attempted - Queued as Pending',
        description: `Reassignment triggered (${reason}), but no alternate qualified worker is currently free. Booking placed in Pending queue for organiser dispatch.`,
        details: {
          previousWorkerId: previousWorkerId || undefined,
          previousWorkerName: previousWorkerName || undefined,
          reason
        }
      });

      return {
        success: false,
        booking: currentBooking,
        message: `No eligible replacement worker found without conflicts. Booking returned to Pending queue.`
      };
    }
  }

  /**
   * Update booking status (assigned -> in_progress -> completed or cancelled)
   */
  public updateBookingStatus(
    bookingId: string,
    status: Booking['status'],
    actor: { role: 'CUSTOMER' | 'WORKER' | 'ORGANISER' | 'SYSTEM'; name: string },
    options?: {
      cancellationReason?: string;
      rating?: number;
      feedback?: string;
    }
  ): Booking | null {
    const bookings = this.getBookings();
    const idx = bookings.findIndex(b => b.id === bookingId);
    if (idx === -1) return null;

    const b = bookings[idx];
    const prevStatus = b.status;
    b.status = status;
    b.updatedAt = new Date().toISOString();

    if (status === 'completed') {
      b.completedAt = new Date().toISOString();
      if (options?.rating) {
        b.customerRating = options.rating;
        b.customerFeedback = options.feedback;
        // Update worker rating
        if (b.assignedWorkerId) {
          this.updateWorkerRating(b.assignedWorkerId, options.rating);
        }
      }
    }

    if (status === 'cancelled') {
      b.cancelledAt = new Date().toISOString();
      b.cancellationReason = options?.cancellationReason || 'Cancelled by user';
    }

    this.saveBookings(bookings);

    // Audit log
    const eventType =
      status === 'completed'
        ? 'BOOKING_COMPLETED'
        : status === 'cancelled'
        ? 'BOOKING_CANCELLED'
        : 'STATUS_CHANGED';

    this.addHistoryEvent({
      bookingId,
      eventType,
      actorRole: actor.role,
      actorName: actor.name,
      title: `Status changed to ${status.toUpperCase()}`,
      description: `Booking updated from ${prevStatus} to ${status}${options?.cancellationReason ? ` (${options.cancellationReason})` : ''}`,
      details: {
        reason: options?.cancellationReason,
        rating: options?.rating
      }
    });

    return b;
  }

  private updateWorkerRating(workerId: string, newRating: number) {
    const workers = this.getWorkers();
    const idx = workers.findIndex(w => w.id === workerId);
    if (idx !== -1) {
      const w = workers[idx];
      const totalReviews = w.reviewsCount + 1;
      const updatedRating = Number(((w.rating * w.reviewsCount + newRating) / totalReviews).toFixed(2));
      w.rating = updatedRating;
      w.reviewsCount = totalReviews;
      w.completedJobsCount += 1;
      this.saveWorkers(workers);
    }
  }

  // --- ALLOCATION HISTORY ---
  public getHistory(bookingId?: string): AllocationHistoryEvent[] {
    const raw = localStorage.getItem(STORAGE_KEY_HISTORY);
    const list: AllocationHistoryEvent[] = raw ? JSON.parse(raw) : SEED_HISTORY;
    if (bookingId) {
      return list.filter(h => h.bookingId === bookingId).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }
    return list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  public addHistoryEvent(event: Omit<AllocationHistoryEvent, 'id' | 'timestamp'>) {
    const raw = localStorage.getItem(STORAGE_KEY_HISTORY);
    const list: AllocationHistoryEvent[] = raw ? JSON.parse(raw) : SEED_HISTORY;

    const newEvent: AllocationHistoryEvent = {
      ...event,
      id: `h-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toISOString()
    };

    list.unshift(newEvent);
    localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(list));
    this.notify();
  }
}

export const db = new DatabaseService();
