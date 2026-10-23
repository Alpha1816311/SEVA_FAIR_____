/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { db } from './db';
import {
  Worker,
  Customer,
  Booking,
  AllocationHistoryEvent,
  ServiceCategory
} from '../types';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

const delay = (ms = 120) => new Promise(resolve => setTimeout(resolve, ms));

export const api = {
  // Workers
  async getWorkers(): Promise<ApiResponse<Worker[]>> {
    await delay();
    try {
      const data = db.getWorkers();
      return { success: true, data };
    } catch (err: any) {
      return { success: false, data: [], error: err.message || 'Failed to fetch workers' };
    }
  },

  async getWorker(id: string): Promise<ApiResponse<Worker | null>> {
    await delay();
    const worker = db.getWorker(id);
    if (!worker) {
      return { success: false, data: null, error: `Worker ${id} not found` };
    }
    return { success: true, data: worker };
  },

  async updateWorkerAvailability(workerId: string, isAvailable: boolean): Promise<ApiResponse<Worker | null>> {
    await delay(150);
    const updated = db.updateWorkerAvailability(workerId, isAvailable);
    if (!updated) {
      return { success: false, data: null, error: 'Worker not found' };
    }
    return { success: true, data: updated, message: `Worker availability updated to ${isAvailable ? 'Available' : 'Unavailable'}` };
  },

  async verifyWorker(workerId: string, isVerified: boolean, skills?: ServiceCategory[], notes?: string): Promise<ApiResponse<Worker | null>> {
    await delay(180);
    const updated = db.verifyWorker(workerId, isVerified, skills, notes);
    if (!updated) {
      return { success: false, data: null, error: 'Worker not found' };
    }
    return { success: true, data: updated, message: isVerified ? 'Worker verified and approved for allocations!' : 'Worker set to unverified' };
  },

  async addWorker(workerData: Omit<Worker, 'id' | 'activeJobsCount' | 'completedJobsCount' | 'rating' | 'reviewsCount'>): Promise<ApiResponse<Worker>> {
    await delay(200);
    const created = db.addWorker(workerData);
    return { success: true, data: created, message: 'Worker profile registered successfully' };
  },

  // Customers
  async getCustomers(): Promise<ApiResponse<Customer[]>> {
    await delay();
    return { success: true, data: db.getCustomers() };
  },

  // Bookings
  async getBookings(): Promise<ApiResponse<Booking[]>> {
    await delay();
    try {
      const data = db.getBookings();
      return { success: true, data };
    } catch (err: any) {
      return { success: false, data: [], error: err.message };
    }
  },

  async getBooking(id: string): Promise<ApiResponse<Booking | null>> {
    await delay();
    const booking = db.getBooking(id);
    if (!booking) {
      return { success: false, data: null, error: `Booking ${id} not found` };
    }
    return { success: true, data: booking };
  },

  async createBooking(bookingData: {
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
  }): Promise<ApiResponse<{ booking: Booking; message: string }>> {
    await delay(250);
    try {
      const result = db.createBooking(bookingData);
      const isAssigned = result.booking.status === 'assigned';
      return {
        success: true,
        data: {
          booking: result.booking,
          message: isAssigned 
            ? `Assigned to ${result.booking.assignedWorkerName} via fair workload allocation.`
            : `Booking queued as Pending: ${result.allocation.reason}`
        }
      };
    } catch (err: any) {
      return { success: false, data: {} as any, error: err.message || 'Failed to create booking' };
    }
  },

  async updateBookingStatus(
    bookingId: string,
    status: Booking['status'],
    actor: { role: 'CUSTOMER' | 'WORKER' | 'ORGANISER' | 'SYSTEM'; name: string },
    options?: {
      cancellationReason?: string;
      rating?: number;
      feedback?: string;
    }
  ): Promise<ApiResponse<Booking | null>> {
    await delay(150);
    try {
      const updated = db.updateBookingStatus(bookingId, status, actor, options);
      if (!updated) {
        return { success: false, data: null, error: 'Booking not found' };
      }
      return { success: true, data: updated, message: `Booking status changed to ${status}` };
    } catch (err: any) {
      return { success: false, data: null, error: err.message };
    }
  },

  async reassignBooking(
    bookingId: string,
    reason: string,
    actor: { role: 'CUSTOMER' | 'WORKER' | 'ORGANISER' | 'SYSTEM'; name: string },
    excludeWorkerId?: string
  ): Promise<ApiResponse<{ booking: Booking; message: string }>> {
    await delay(250);
    try {
      const res = db.reassignBooking(bookingId, reason, actor, excludeWorkerId);
      return {
        success: res.success,
        data: { booking: res.booking, message: res.message },
        message: res.message
      };
    } catch (err: any) {
      return { success: false, data: {} as any, error: err.message || 'Reassignment error' };
    }
  },

  // History & Audit
  async getHistory(bookingId?: string): Promise<ApiResponse<AllocationHistoryEvent[]>> {
    await delay();
    return { success: true, data: db.getHistory(bookingId) };
  },

  // Reset demo state
  async resetDemo(): Promise<ApiResponse<boolean>> {
    await delay(100);
    db.resetToSeed();
    return { success: true, data: true, message: 'Database reset to initial demo state' };
  }
};
