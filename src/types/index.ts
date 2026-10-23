/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ServiceCategory = 
  | 'Plumbing'
  | 'Electrical'
  | 'Cleaning'
  | 'Home Repair'
  | 'Carpentry'
  | 'Appliance Repair'
  | 'Painting';

export interface Worker {
  id: string;
  name: string;
  phone: string;
  email: string;
  avatar: string;
  skills: ServiceCategory[];
  serviceAreas: string[];
  isVerified: boolean;
  isAvailable: boolean;
  activeJobsCount: number;
  completedJobsCount: number;
  rating: number;
  reviewsCount: number;
  hourlyRate: number;
  joinedDate: string;
  verificationNotes?: string;
  govIdVerified: boolean;
  policeVerification: boolean;
  lastActiveTime?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  area: string;
}

export type BookingStatus = 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';

export interface AllocationCandidateEvaluation {
  workerId: string;
  workerName: string;
  isVerified: boolean;
  isAvailable: boolean;
  hasSkill: boolean;
  servesArea: boolean;
  hasScheduleConflict: boolean;
  activeWorkload: number;
  completedJobs: number;
  isEligible: boolean;
  rejectionReason?: string;
  selectionScore: number;
  conflictingBookingId?: string;
}

export interface AllocationResult {
  success: boolean;
  assignedWorker: Worker | null;
  reason: string;
  evaluations: AllocationCandidateEvaluation[];
  isConflict: boolean;
  tieBreakerApplied?: boolean;
}

export interface AllocationHistoryEvent {
  id: string;
  bookingId: string;
  timestamp: string;
  eventType: 
    | 'BOOKING_CREATED'
    | 'ALLOCATION_ATTEMPTED'
    | 'WORKER_ASSIGNED'
    | 'ALLOCATION_FAILED_PENDING'
    | 'WORKER_ACCEPTED'
    | 'WORKER_DECLINED'
    | 'STATUS_CHANGED'
    | 'REASSIGNMENT_TRIGGERED'
    | 'REASSIGNED'
    | 'BOOKING_CANCELLED'
    | 'BOOKING_COMPLETED';
  actorRole: 'CUSTOMER' | 'WORKER' | 'ORGANISER' | 'SYSTEM';
  actorName: string;
  title: string;
  description: string;
  details?: {
    workerId?: string;
    workerName?: string;
    previousWorkerId?: string;
    previousWorkerName?: string;
    reason?: string;
    evaluationsCount?: number;
    rating?: number;
  };
}

export interface Booking {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  serviceType: ServiceCategory;
  description: string;
  address: string;
  area: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm (24h)
  endTime: string; // HH:mm (24h)
  estimatedHours: number;
  estimatedCost: number;
  status: BookingStatus;
  assignedWorkerId: string | null;
  assignedWorkerName: string | null;
  allocationReason: string | null;
  allocationEvaluations: AllocationCandidateEvaluation[];
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  customerRating?: number;
  customerFeedback?: string;
}

export type ActiveRole = 'customer' | 'worker' | 'organiser';

export interface DemoScenario {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  highlightCategory: string;
  badgeText: string;
}
