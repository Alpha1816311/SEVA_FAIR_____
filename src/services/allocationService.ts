/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  Booking,
  Worker,
  AllocationCandidateEvaluation,
  AllocationResult,
  ServiceCategory
} from '../types';

/**
 * Canonical Skill Normalization
 * Maps colloquial or partial strings to canonical service categories
 */
export const normalizeSkill = (input: string): ServiceCategory | null => {
  if (!input) return null;
  const s = input.trim().toLowerCase();
  
  if (s.includes('elect') || s.includes('wire') || s.includes('switch') || s.includes('light') || s.includes('fan')) {
    return 'Electrical';
  }
  if (s.includes('plumb') || s.includes('pipe') || s.includes('tap') || s.includes('leak') || s.includes('drain')) {
    return 'Plumbing';
  }
  if (s.includes('clean') || s.includes('maid') || s.includes('wash') || s.includes('sweep') || s.includes('sanit')) {
    return 'Cleaning';
  }
  if (s.includes('carpent') || s.includes('wood') || s.includes('furniture') || s.includes('door') || s.includes('table')) {
    return 'Carpentry';
  }
  if (s.includes('appliance') || s.includes('ac ') || s.includes('refriger') || s.includes('geyser') || s.includes('washing machine')) {
    return 'Appliance Repair';
  }
  if (s.includes('paint') || s.includes('whitewash') || s.includes('wall')) {
    return 'Painting';
  }
  if (s.includes('repair') || s.includes('fix') || s.includes('handyman') || s.includes('maintenance')) {
    return 'Home Repair';
  }
  
  return null;
};

/**
 * Resilient Area Matching
 * Checks if a booking's address/area matches any of the worker's service areas
 * Handles formats like "Flat 402, Indiranagar, Bengaluru" matching "Bengaluru" or "Indiranagar"
 */
export const checkAreaMatch = (bookingArea: string, bookingAddress: string, workerAreas: string[]): boolean => {
  if (!workerAreas || workerAreas.length === 0) return true; // worker serves all areas if unconstrained
  
  const textToScan = `${bookingArea || ''} ${bookingAddress || ''}`.toLowerCase();
  
  return workerAreas.some(area => {
    const normArea = area.toLowerCase().trim();
    if (!normArea) return false;
    
    // Check if the address contains the worker's area, or if worker covers the entire city (e.g. Bengaluru)
    if (textToScan.includes(normArea)) return true;
    
    // Check token overlap
    const areaTokens = normArea.split(/\s+/).filter(t => t.length > 2);
    return areaTokens.some(token => textToScan.includes(token));
  });
};

/**
 * Checks for time overlap between two intervals on the same date
 * Times formatted as "HH:mm" (24h)
 */
export const isTimeOverlapping = (
  startA: string,
  endA: string,
  startB: string,
  endB: string
): boolean => {
  const toMinutes = (timeStr: string) => {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + (m || 0);
  };

  const aStart = toMinutes(startA);
  const aEnd = toMinutes(endA);
  const bStart = toMinutes(startB);
  const bEnd = toMinutes(endB);

  // Overlap occurs if one interval does not strictly finish before the other starts
  return !(aEnd <= bStart || aStart >= bEnd);
};

/**
 * Core Fair Allocation Algorithm
 * 1. Filters by isVerified (Organiser verified)
 * 2. Filters by isAvailable (Worker availability toggle)
 * 3. Filters by skill match
 * 4. Filters by location/area match
 * 5. Filters by non-overlapping schedule with other Assigned or In Progress jobs
 * 6. Chooses worker with lowest active workload, followed by completed jobs, then deterministic ID
 */
export const evaluateAllocation = (
  booking: Pick<Booking, 'id' | 'serviceType' | 'address' | 'area' | 'date' | 'startTime' | 'endTime'>,
  allWorkers: Worker[],
  allBookings: Booking[],
  excludedWorkerIds: string[] = []
): AllocationResult => {
  const evaluations: AllocationCandidateEvaluation[] = [];

  const canonicalService = normalizeSkill(booking.serviceType) || booking.serviceType;

  // Active bookings on the same date to check for conflicts
  const activeBookingsOnDate = allBookings.filter(
    b => b.date === booking.date && 
         (b.status === 'assigned' || b.status === 'in_progress') &&
         b.id !== booking.id
  );

  for (const worker of allWorkers) {
    if (excludedWorkerIds.includes(worker.id)) {
      continue;
    }

    // 1. Skill check
    const hasSkill = worker.skills.some(
      s => s.toLowerCase() === canonicalService.toLowerCase() ||
           normalizeSkill(s) === canonicalService
    );

    // 2. Area match
    const servesArea = checkAreaMatch(booking.area, booking.address, worker.serviceAreas);

    // 3. Schedule conflict check
    let hasScheduleConflict = false;
    let conflictingBookingId: string | undefined;

    const workerBookings = activeBookingsOnDate.filter(b => b.assignedWorkerId === worker.id);
    for (const eb of workerBookings) {
      if (isTimeOverlapping(booking.startTime, booking.endTime, eb.startTime, eb.endTime)) {
        hasScheduleConflict = true;
        conflictingBookingId = eb.id;
        break;
      }
    }

    // 4. Calculate actual active workload (Assigned + In Progress across all dates)
    const activeJobs = allBookings.filter(
      b => b.assignedWorkerId === worker.id &&
           (b.status === 'assigned' || b.status === 'in_progress') &&
           b.id !== booking.id
    ).length;

    // Check overall eligibility
    const isEligible =
      worker.isVerified &&
      worker.isAvailable &&
      hasSkill &&
      servesArea &&
      !hasScheduleConflict;

    let rejectionReason: string | undefined;
    if (!worker.isVerified) {
      rejectionReason = 'Pending organiser profile verification & KYC';
    } else if (!worker.isAvailable) {
      rejectionReason = 'Worker marked as currently unavailable / off-duty';
    } else if (!hasSkill) {
      rejectionReason = `Lacks verified skill in ${canonicalService}`;
    } else if (!servesArea) {
      rejectionReason = `Service area does not cover "${booking.area || booking.address}"`;
    } else if (hasScheduleConflict) {
      rejectionReason = `Overlapping schedule conflict between ${booking.startTime} - ${booking.endTime}`;
    }

    // Workload score: Lower score is better.
    // Primary sort: Active workload (weight 1000)
    // Secondary sort: Completed jobs to give newer workers fair opportunity (weight 1)
    const selectionScore = activeJobs * 1000 + worker.completedJobsCount;

    evaluations.push({
      workerId: worker.id,
      workerName: worker.name,
      isVerified: worker.isVerified,
      isAvailable: worker.isAvailable,
      hasSkill,
      servesArea,
      hasScheduleConflict,
      activeWorkload: activeJobs,
      completedJobs: worker.completedJobsCount,
      isEligible,
      rejectionReason,
      selectionScore,
      conflictingBookingId
    });
  }

  // Filter eligible candidates
  const eligibleCandidates = evaluations.filter(e => e.isEligible);

  if (eligibleCandidates.length === 0) {
    // Determine the primary bottleneck reason for transparency
    let summaryReason = 'No eligible worker found.';
    const anyWithSkill = evaluations.some(e => e.hasSkill);
    const anyAvailableWithSkill = evaluations.some(e => e.hasSkill && e.isAvailable && e.isVerified);
    const conflictWorkers = evaluations.filter(e => e.hasSkill && e.isVerified && e.isAvailable && e.hasScheduleConflict);

    if (conflictWorkers.length > 0) {
      summaryReason = `Scheduling conflict: All ${conflictWorkers.length} qualified worker(s) (${conflictWorkers.map(w => w.workerName).join(', ')}) have overlapping bookings during ${booking.startTime} - ${booking.endTime}.`;
    } else if (!anyWithSkill) {
      summaryReason = `No registered worker currently holds the certified skill "${canonicalService}".`;
    } else if (!anyAvailableWithSkill) {
      summaryReason = `Qualified workers for ${canonicalService} are currently unverified or off-duty.`;
    } else {
      summaryReason = `No verified worker available in service area "${booking.area || 'selected locality'}".`;
    }

    return {
      success: false,
      assignedWorker: null,
      reason: summaryReason,
      evaluations,
      isConflict: conflictWorkers.length > 0
    };
  }

  // Sort eligible candidates by:
  // 1. Lowest active workload
  // 2. Lowest total completed jobs (distribute opportunity)
  // 3. Worker ID tie breaker (deterministic)
  eligibleCandidates.sort((a, b) => {
    if (a.activeWorkload !== b.activeWorkload) {
      return a.activeWorkload - b.activeWorkload;
    }
    if (a.completedJobs !== b.completedJobs) {
      return a.completedJobs - b.completedJobs;
    }
    return a.workerId.localeCompare(b.workerId);
  });

  const bestCandidate = eligibleCandidates[0];
  const assignedWorker = allWorkers.find(w => w.id === bestCandidate.workerId) || null;

  const tieBreaker = eligibleCandidates.length > 1 && eligibleCandidates[0].activeWorkload === eligibleCandidates[1].activeWorkload;

  const reason = `Fair Workload Allocation: ${bestCandidate.workerName} selected with lowest active workload (${bestCandidate.activeWorkload} ongoing jobs), verified skills (${canonicalService}), and zero time-slot conflicts on ${booking.date} (${booking.startTime}-${booking.endTime}).`;

  return {
    success: true,
    assignedWorker,
    reason,
    evaluations,
    isConflict: false,
    tieBreakerApplied: tieBreaker
  };
};
