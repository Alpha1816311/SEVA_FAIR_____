/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { authService, ACCOUNTS, AuthAccount } from '../services/authService';
import { UserSession } from '../types';
import { 
  ShieldCheck, 
  Lock, 
  User, 
  Wrench, 
  Shield, 
  CheckCircle2, 
  LogOut, 
  ArrowRight,
  KeyRound,
  AlertCircle
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess?: (session: UserSession) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess
}) => {
  const currentSession = authService.getCurrentSession();
  const [activeTab, setActiveTab] = useState<'switch' | 'credentials'>('switch');
  const [email, setEmail] = useState<string>('suman.rao@coop.local');
  const [password, setPassword] = useState<string>('admin123');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSelectAccount = (account: AuthAccount) => {
    const session = authService.loginWithAccount(account);
    setSuccessMsg(`Switched session to ${account.name} (${account.role})`);
    if (onLoginSuccess) onLoginSuccess(session);
    setTimeout(() => {
      onClose();
    }, 600);
  };

  const handleCredentialLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const res = authService.login(email, password);
    if (res.success && res.session) {
      setSuccessMsg(res.message);
      if (onLoginSuccess) onLoginSuccess(res.session);
      setTimeout(() => {
        onClose();
      }, 600);
    } else {
      setErrorMsg(res.message);
    }
  };

  const handleLogout = () => {
    authService.logout();
    setSuccessMsg('Session securely signed out.');
    setTimeout(() => {
      onClose();
    }, 600);
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'organiser':
        return <Shield className="w-4 h-4 text-purple-600" />;
      case 'worker':
        return <Wrench className="w-4 h-4 text-emerald-600" />;
      default:
        return <User className="w-4 h-4 text-blue-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold text-sm shadow-inner">
              SF
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight">Cooperative Authentication</h2>
              <p className="text-xs text-slate-400">Role-Based Access Control (RBAC)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-sm p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Current Session Banner */}
        {currentSession ? (
          <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs">
                {currentSession.avatar}
              </div>
              <div>
                <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                  {currentSession.name}
                  <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded font-mono uppercase">
                    {currentSession.role}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500">{currentSession.email}</div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded text-xs font-medium flex items-center gap-1 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign out</span>
            </button>
          </div>
        ) : (
          <div className="bg-amber-50 border-b border-amber-200 px-6 py-2.5 text-xs text-amber-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>No active session. Please sign in to proceed.</span>
          </div>
        )}

        {/* Tab switch */}
        <div className="flex border-b border-slate-200 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('switch')}
            className={`flex-1 py-3 text-center border-b-2 transition-colors ${
              activeTab === 'switch'
                ? 'border-emerald-600 text-emerald-700 bg-emerald-50/40'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Switch Profile
          </button>
          <button
            onClick={() => setActiveTab('credentials')}
            className={`flex-1 py-3 text-center border-b-2 transition-colors ${
              activeTab === 'credentials'
                ? 'border-emerald-600 text-emerald-700 bg-emerald-50/40'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Password Sign In
          </button>
        </div>

        {/* Tab contents */}
        <div className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {activeTab === 'switch' && (
            <div className="space-y-2.5">
              <p className="text-xs text-slate-500">
                Select an authorized cooperative role profile:
              </p>

              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {ACCOUNTS.map(account => {
                  const isCurrent = currentSession?.id === account.id;
                  return (
                    <button
                      key={account.id}
                      onClick={() => handleSelectAccount(account)}
                      className={`w-full text-left p-3 rounded-xl border text-xs transition-all flex items-start gap-3 ${
                        isCurrent
                          ? 'border-emerald-500 bg-emerald-50/50 shadow-xs ring-1 ring-emerald-500'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0 mt-0.5 border border-slate-200">
                        {getRoleIcon(account.role)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-900 truncate">{account.name}</span>
                          <span className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-mono uppercase">
                            {account.role}
                          </span>
                        </div>
                        <div className="text-[11px] text-emerald-700 font-medium">{account.title}</div>
                        <div className="text-[11px] text-slate-500 truncate mt-0.5">{account.email}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'credentials' && (
            <form onSubmit={handleCredentialLogin} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Registered Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="e.g. suman.rao@coop.local"
                  required
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter password"
                  required
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-[11px] text-slate-600 space-y-1">
                <div className="font-semibold text-slate-800">Quick Credentials:</div>
                <div>Organiser: <code className="text-emerald-700">suman.rao@coop.local / admin123</code></div>
                <div>Technician: <code className="text-emerald-700">ravi.kumar@coop.local / worker123</code></div>
                <div>Customer: <code className="text-emerald-700">aaditya.roy@example.com / password123</code></div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Authenticate & Sign In</span>
              </button>
            </form>
          )}
        </div>

        {/* Security badge footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-3 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Secure SHA-256 session token active</span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-700 hover:text-slate-900 font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
