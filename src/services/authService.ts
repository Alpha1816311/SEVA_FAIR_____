/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { UserSession, ActiveRole } from '../types';

const STORAGE_KEY_SESSION = 'seva_fair_auth_session_v2';

export interface AuthAccount {
  id: string;
  role: ActiveRole;
  name: string;
  email: string;
  phone: string;
  password: string;
  avatar: string;
  title: string;
  description: string;
  workerId?: string;
  customerId?: string;
  isVerified?: boolean;
}

export const ACCOUNTS: AuthAccount[] = [
  {
    id: 'c-1',
    customerId: 'c-1',
    role: 'customer',
    name: 'Aaditya Roy',
    email: 'aaditya.roy@example.com',
    phone: '+91 99001 11222',
    password: 'password123',
    avatar: 'AR',
    title: 'Registered Resident',
    description: 'Resident at Indiranagar, Bengaluru. Can book household services and view live allocation breakdowns.'
  },
  {
    id: 'c-2',
    customerId: 'c-2',
    role: 'customer',
    name: 'Meera Nair',
    email: 'meera.nair@example.com',
    phone: '+91 99002 33445',
    password: 'password123',
    avatar: 'MN',
    title: 'Registered Resident',
    description: 'Resident at Whitefield, Bengaluru.'
  },
  {
    id: 'w-1',
    workerId: 'w-1',
    role: 'worker',
    name: 'Ravi Kumar',
    email: 'ravi.kumar@coop.local',
    phone: '+91 98450 12345',
    password: 'worker123',
    avatar: 'RK',
    title: 'Certified Electrician & Handyman',
    description: 'Verified worker with active KYC, 4.9 rating. Can manage assigned jobs, accept/decline, and mark completion.',
    isVerified: true
  },
  {
    id: 'w-2',
    workerId: 'w-2',
    role: 'worker',
    name: 'Priya Sharma',
    email: 'priya.sharma@coop.local',
    phone: '+91 98450 54321',
    password: 'worker123',
    avatar: 'PS',
    title: 'Certified Sanitation & Plumbing Technician',
    description: 'Verified worker in Koramangala. 4.85 rating.',
    isVerified: true
  },
  {
    id: 'org-1',
    role: 'organiser',
    name: 'Suman Rao',
    email: 'suman.rao@coop.local',
    phone: '+91 98450 99999',
    password: 'admin123',
    avatar: 'SR',
    title: 'Cooperative Lead Administrator',
    description: 'Manages worker KYC verification, skill authorizations, cooperative workload distribution, and audit trails.'
  }
];

class AuthService {
  private currentSession: UserSession | null = null;
  private listeners: ((session: UserSession | null) => void)[] = [];

  constructor() {
    this.restoreSession();
  }

  private restoreSession(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_SESSION);
      if (stored) {
        this.currentSession = JSON.parse(stored);
      } else {
        // Default session: Aaditya Roy (Customer)
        this.loginWithAccount(ACCOUNTS[0]);
      }
    } catch {
      this.loginWithAccount(ACCOUNTS[0]);
    }
  }

  public subscribe(callback: (session: UserSession | null) => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  private notify(): void {
    for (const listener of this.listeners) {
      listener(this.currentSession);
    }
  }

  public getCurrentSession(): UserSession | null {
    return this.currentSession;
  }

  public isAuthenticated(): boolean {
    return this.currentSession !== null;
  }

  public loginWithAccount(account: AuthAccount): UserSession {
    const session: UserSession = {
      id: account.id,
      name: account.name,
      email: account.email,
      phone: account.phone,
      role: account.role,
      avatar: account.avatar,
      workerId: account.workerId,
      customerId: account.customerId,
      isVerified: account.isVerified,
      token: `sf_sec_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      loginTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    this.currentSession = session;
    try {
      localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(session));
    } catch (e) {
      console.warn('Failed to save session to localStorage', e);
    }
    this.notify();
    return session;
  }

  public login(email: string, password: string): { success: boolean; message: string; session?: UserSession } {
    const account = ACCOUNTS.find(a => a.email.toLowerCase() === email.trim().toLowerCase());
    if (!account) {
      return { success: false, message: 'No registered cooperative user found with this email.' };
    }
    if (account.password !== password) {
      return { success: false, message: 'Invalid password. Security notice: unauthorized access is logged.' };
    }

    const session = this.loginWithAccount(account);
    return { success: true, message: `Welcome back, ${session.name}!`, session };
  }

  public logout(): void {
    this.currentSession = null;
    try {
      localStorage.removeItem(STORAGE_KEY_SESSION);
    } catch (e) {
      console.warn('Failed to remove session from localStorage', e);
    }
    this.notify();
  }

  public canAccess(requiredRole: ActiveRole): boolean {
    if (!this.currentSession) return false;
    if (this.currentSession.role === 'organiser') return true; // Organiser has super-access
    return this.currentSession.role === requiredRole;
  }
}

export const authService = new AuthService();
