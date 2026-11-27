import React, { useState } from 'react';
import {
  Bell,
  Search,
  ShieldCheck,
  User,
  Database,
  Cloud,
  X,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  FolderPlus,
  KeyRound,
  Lock,
  Download,
  Menu,
} from 'lucide-react';
import {
  BUCKET_SALARY_SLIPS,
  BUCKET_COMPANY_ASSETS,
  isSupabaseConfigured,
  getSupabaseCredentials,
  resetSupabaseClient,
  testSupabaseConnection,
} from '@/lib/supabaseClient';

interface NavbarProps {
  currentTabName: string;
  adminName?: string;
  adminEmail?: string;
  currentAdminPassword?: string;
  onAdminChangePassword?: (newPass: string) => boolean | void;
  onToggleMobileSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTabName,
  adminName = 'Super Administrator',
  adminEmail = 'admin@enterprise.com',
  currentAdminPassword = 'admin123',
  onAdminChangePassword,
  onToggleMobileSidebar,
}) => {
  const [showSupabaseModal, setShowSupabaseModal] = useState(false);
  const [showChangePassModal, setShowChangePassModal] = useState(false);
  const [currPass, setCurrPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [passError, setPassError] = useState<string | null>(null);
  const [passSuccess, setPassSuccess] = useState<string | null>(null);

  const creds = getSupabaseCredentials();
  const [supabaseUrl, setSupabaseUrl] = useState(creds.url);
  const [supabaseKey, setSupabaseKey] = useState(creds.anonKey);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    buckets?: string[];
  } | null>(null);

  const handleChangePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPassError(null);
    setPassSuccess(null);

    if (currPass !== currentAdminPassword) {
      setPassError('Current password is incorrect.');
      return;
    }
    if (newPass.length < 4) {
      setPassError('New password must be at least 4 characters long.');
      return;
    }
    if (newPass !== confirmPass) {
      setPassError('New password and confirmation do not match.');
      return;
    }

    if (onAdminChangePassword) {
      onAdminChangePassword(newPass);
    }
    setPassSuccess('Admin password changed successfully!');
    setCurrPass('');
    setNewPass('');
    setConfirmPass('');
    setTimeout(() => {
      setShowChangePassModal(false);
      setPassSuccess(null);
    }, 2000);
  };

  const handleTestConnection = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsTesting(true);
    setTestResult(null);

    // Save and reset client
    resetSupabaseClient(supabaseUrl, supabaseKey);

    const res = await testSupabaseConnection(supabaseUrl, supabaseKey);
    setIsTesting(false);
    setTestResult(res);
  };

  const configured = isSupabaseConfigured();

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-3 sm:px-6 flex items-center justify-between shrink-0">
      <div className="flex items-center space-x-2 sm:space-x-4 min-w-0">
        {/* Hamburger Menu Toggle for Mobile */}
        <button
          onClick={onToggleMobileSidebar}
          className="p-2 -ml-1 rounded-xl text-slate-700 hover:bg-slate-100 md:hidden transition-colors shrink-0 border border-slate-200"
          title="Toggle Navigation Menu"
        >
          <Menu className="w-5 h-5 text-slate-700" />
        </button>

        <div className="min-w-0">
          <h2 className="text-base sm:text-lg font-bold text-slate-800 truncate">{currentTabName}</h2>
          <p className="text-[11px] sm:text-xs text-slate-500 truncate hidden xs:block">
            OMSAIRAM GPS Geofence & Statutory Payroll Engine • Asia/Kolkata (IST)
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {/* Supabase Cloud Connection & Bucket Status Indicator */}
        <button
          onClick={() => setShowSupabaseModal(true)}
          className={`hidden sm:inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
            configured
              ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100 shadow-sm'
              : 'bg-blue-50 text-brand-blue border-blue-200 hover:bg-blue-100 shadow-sm'
          }`}
        >
          <Database className="w-3.5 h-3.5 text-brand-blue mr-1.5" />
          <span>Supabase & Buckets</span>
          <span
            className={`w-2 h-2 rounded-full ${
              configured ? 'bg-emerald-500' : 'bg-blue-500'
            } animate-pulse ml-2`}
          />
        </button>

        {/* Download Android Mobile APK */}
        <a
          href="/AttendanceReport.apk"
          download="AttendanceReport.apk"
          className="hidden md:inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-bold border transition-all bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100 shadow-sm"
          title="Download Attendance Report Android APK for Mobile"
        >
          <Download className="w-3.5 h-3.5 text-emerald-600 mr-1.5" />
          <span>Download Mobile APK</span>
        </a>

        {/* Quick Search */}
        <div className="relative hidden md:block">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search employee, ID, shift..."
            className="pl-9 pr-4 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-blue w-56 bg-slate-50"
          />
        </div>

        {/* Notifications Icon with Active Badge */}
        <div className="relative">
          <button className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors relative">
            <Bell className="w-4 h-4" />
            <span className="w-2 h-2 rounded-full bg-brand-blue absolute top-1.5 right-1.5 animate-pulse" />
          </button>
        </div>

        {/* Admin Profile Chip */}
        <div className="flex items-center space-x-3 pl-3 border-l border-slate-200">
          <div className="w-9 h-9 rounded-full bg-navy-900 text-white flex items-center justify-center font-bold text-xs shadow-sm">
            SA
          </div>
          <div className="text-left hidden sm:block">
            <div className="text-xs font-bold text-slate-800 flex items-center">
              {adminName}
              <ShieldCheck className="w-3 h-3 text-emerald-500 ml-1 inline" />
            </div>
            <div className="flex items-center space-x-1.5 mt-0.5">
              <span className="text-[11px] text-slate-400">OMSAIRAM Admin</span>
              <span className="text-slate-300">•</span>
              <button
                type="button"
                onClick={() => {
                  setPassError(null);
                  setPassSuccess(null);
                  setShowChangePassModal(true);
                }}
                className="text-[11px] text-brand-blue hover:underline font-bold inline-flex items-center"
              >
                <KeyRound className="w-3 h-3 mr-0.5" />
                Change Password
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Supabase & Bucket Status Modal */}
      {showSupabaseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">
                  <Database className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Supabase Cloud Backend & Storage Buckets
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    PostgreSQL Database + Storage Integration
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowSupabaseModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              {/* Storage Buckets Status Card */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
                <div className="font-bold text-slate-800 text-xs flex items-center">
                  <FolderPlus className="w-4 h-4 text-brand-blue mr-1.5" />
                  Active Cloud Storage Buckets
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Bucket 1 (Salary Slips PDF):</span>
                  <span className="px-2.5 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800 font-mono">
                    {BUCKET_SALARY_SLIPS}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Bucket 2 (Company Assets):</span>
                  <span className="px-2.5 py-0.5 rounded-full font-bold bg-blue-100 text-blue-800 font-mono">
                    {BUCKET_COMPANY_ASSETS}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">PostgreSQL Database Schema:</span>
                  <span className="text-emerald-700 font-bold">17 Tables + RLS Policies Active</span>
                </div>
              </div>

              {/* Supabase Credentials Form */}
              <form onSubmit={handleTestConnection} className="space-y-3 pt-2">
                <div className="font-bold text-slate-800 text-xs">
                  Connect Your Supabase Project:
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Supabase Project URL
                  </label>
                  <input
                    type="text"
                    value={supabaseUrl}
                    onChange={(e) => setSupabaseUrl(e.target.value)}
                    placeholder="https://xyzcompany.supabase.co"
                    className="w-full px-3 py-2 border rounded-xl font-mono text-xs focus:ring-2 focus:ring-brand-blue outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Supabase Anon API Key
                  </label>
                  <input
                    type="password"
                    value={supabaseKey}
                    onChange={(e) => setSupabaseKey(e.target.value)}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI..."
                    className="w-full px-3 py-2 border rounded-xl font-mono text-xs focus:ring-2 focus:ring-brand-blue outline-none"
                  />
                </div>

                <div className="flex items-center space-x-2 pt-1">
                  <button
                    type="submit"
                    disabled={isTesting}
                    className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-sm text-xs flex items-center justify-center transition-all"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isTesting ? 'animate-spin' : ''}`} />
                    {isTesting ? 'Testing Connection & Buckets...' : 'Verify Supabase & Buckets'}
                  </button>
                </div>
              </form>

              {/* Test Result Message */}
              {testResult && (
                <div
                  className={`p-3 rounded-xl border text-xs flex items-start space-x-2 ${
                    testResult.success
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-rose-50 border-rose-200 text-rose-800'
                  }`}
                >
                  {testResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <div className="font-bold">{testResult.message}</div>
                    {testResult.buckets && testResult.buckets.length > 0 && (
                      <div className="text-[11px] mt-1">
                        Active Buckets: {testResult.buckets.join(', ')}
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 text-blue-900 text-[11px] space-y-1">
                <div className="font-bold flex items-center">
                  <CheckCircle2 className="w-3.5 h-3.5 text-brand-blue mr-1" />
                  SQL Migration Available
                </div>
                <p>
                  PostgreSQL schema & storage bucket scripts are in:
                  <span className="font-mono block text-brand-blue font-bold mt-1">
                    supabase/migrations/20261126_storage_buckets.sql
                  </span>
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowSupabaseModal(false)}
                className="w-full py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl shadow-sm text-xs"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Change Admin Password Modal */}
      {showChangePassModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-brand-blue">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Change Admin Password</h3>
                  <p className="text-[11px] text-slate-400">Update your administrator access credentials</p>
                </div>
              </div>
              <button
                onClick={() => setShowChangePassModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleChangePasswordSubmit} className="mt-4 space-y-3 text-xs">
              {passError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center">
                  <AlertCircle className="w-4 h-4 mr-2 shrink-0 text-rose-600" />
                  <span>{passError}</span>
                </div>
              )}

              {passSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center">
                  <CheckCircle2 className="w-4 h-4 mr-2 shrink-0 text-emerald-600" />
                  <span>{passSuccess}</span>
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Current Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={currPass}
                    onChange={(e) => setCurrPass(e.target.value)}
                    placeholder="Enter current password"
                    className="w-full pl-9 pr-3 py-2 border rounded-xl focus:ring-2 focus:ring-brand-blue outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">New Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={newPass}
                    onChange={(e) => setNewPass(e.target.value)}
                    placeholder="Enter new secure password (min 4 chars)"
                    className="w-full pl-9 pr-3 py-2 border rounded-xl focus:ring-2 focus:ring-brand-blue outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Confirm New Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={confirmPass}
                    onChange={(e) => setConfirmPass(e.target.value)}
                    placeholder="Re-enter new password"
                    className="w-full pl-9 pr-3 py-2 border rounded-xl focus:ring-2 focus:ring-brand-blue outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setShowChangePassModal(false)}
                  className="w-1/3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-brand-blue hover:bg-brand-accent text-white font-bold rounded-xl shadow-sm transition-all"
                >
                  Save New Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
};
