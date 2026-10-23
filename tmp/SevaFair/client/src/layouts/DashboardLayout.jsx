import React, { useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Menu, X, Home, Calendar, Users, Briefcase, LogOut, BarChart3,
  ShieldCheck, Sparkles, Scale, RefreshCw, ChevronRight, CheckCircle2
} from 'lucide-react';
import api from '../services/api';

const navItems = [
  { to: '/customer', label: 'Customer Portal', icon: Home, role: 'customer' },
  { to: '/customer/bookings/new', label: 'Book a Service', icon: Calendar, role: 'customer' },
  { to: '/worker', label: 'Worker Portal', icon: Briefcase, role: 'worker' },
  { to: '/organiser', label: 'Organiser Portal', icon: BarChart3, role: 'organiser' },
  { to: '/allocation', label: 'Fair Allocation Audit', icon: ShieldCheck, role: 'all' },
];

export default function DashboardLayout({ role = 'customer' }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleResetData = async () => {
    if (window.confirm('Reset demo data to initial clean hackathon state?')) {
      await api.resetDemo();
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      {/* Top Cooperative Bar */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden p-2 text-slate-600 hover:text-slate-900"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <NavLink to="/" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-sm shadow-emerald-500/20">
                <Scale className="w-5 h-5" />
              </div>
              <div>
                <span className="text-lg font-bold tracking-tight text-slate-900">SEVA FAIR</span>
                <span className="hidden sm:inline-block ml-2 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
                  Cooperative Allocation
                </span>
              </div>
            </NavLink>
          </div>

          {/* Quick Role Switcher for Hackathon Judges */}
          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center bg-slate-100 p-1 rounded-xl text-xs font-medium border border-slate-200">
              <button
                onClick={() => navigate('/customer')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  location.pathname.startsWith('/customer')
                    ? 'bg-white text-emerald-700 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Customer
              </button>
              <button
                onClick={() => navigate('/worker')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  location.pathname.startsWith('/worker')
                    ? 'bg-white text-emerald-700 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Worker
              </button>
              <button
                onClick={() => navigate('/organiser')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  location.pathname.startsWith('/organiser')
                    ? 'bg-white text-emerald-700 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Organiser
              </button>
              <button
                onClick={() => navigate('/allocation')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  location.pathname.startsWith('/allocation')
                    ? 'bg-white text-emerald-700 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Audit
              </button>
            </div>

            <button
              onClick={handleResetData}
              title="Reset Demo Data"
              className="p-2 text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs flex items-center gap-1.5 font-medium border border-slate-200"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset Demo</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar Navigation */}
        <aside
          className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transform transition-transform duration-200 pt-16 lg:pt-0 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
        >
          <div className="p-4 space-y-1">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-3 mb-2">
              Navigation
            </div>
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200/60'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`
                }
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="w-4 h-4 text-emerald-600" />
                {item.label}
              </NavLink>
            ))}

            <div className="pt-6 border-t border-slate-100 mt-6">
              <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-900">
                <div className="font-bold flex items-center gap-1.5 text-emerald-800 mb-1">
                  <ShieldCheck className="w-4 h-4" /> Cooperative Rules
                </div>
                <p className="text-[11px] text-emerald-700 leading-relaxed">
                  Verified workers only. Zero overlaps allowed. Dynamic workload balancing prevents worker burnout.
                </p>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
