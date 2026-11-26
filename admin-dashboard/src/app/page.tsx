'use client';

import React, { useState } from 'react';
import {
  Building2,
  Lock,
  Mail,
  User,
  ShieldCheck,
  CheckCircle,
  Smartphone,
  LayoutDashboard,
  ShieldAlert,
  KeyRound,
  X,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { Sidebar } from '@/components/Sidebar';
import { Navbar } from '@/components/Navbar';
import { DashboardOverview } from '@/components/DashboardOverview';
import { EmployeeManagement } from '@/components/EmployeeManagement';
import { GeofenceMapConfig } from '@/components/GeofenceMapConfig';
import { AttendanceMonitor } from '@/components/AttendanceMonitor';
import { LeaveManagement } from '@/components/LeaveManagement';
import { PayrollModule } from '@/components/PayrollModule';
import { AttendanceReport } from '@/components/AttendanceReport';
import { EmployeePortalView } from '@/components/EmployeePortalView';

import {
  INITIAL_COMPANY_SETTINGS,
  INITIAL_DEPARTMENTS,
  INITIAL_EMPLOYEES,
  INITIAL_OFFICES,
  INITIAL_SHIFTS,
  INITIAL_TODAY_ATTENDANCE,
  INITIAL_LEAVE_REQUESTS,
  INITIAL_PAYROLL,
  generateAllEmployeesPayroll,
  calculateEmployeePayroll,
  getTodayDateString,
} from '@/lib/store';
import { AttendanceRecord, Employee, LeaveRequest, Office, PayrollRecord, UserRole } from '@/types';

export default function Home() {
  // Authentication State
  const [userRole, setUserRole] = useState<UserRole | null>('ADMIN'); // Default to logged-in ADMIN for immediate interaction
  const [loginMode, setLoginMode] = useState<'ADMIN' | 'EMPLOYEE'>('ADMIN');
  const [adminEmail, setAdminEmail] = useState('admin@enterprise.com');
  const [currentAdminPass, setCurrentAdminPass] = useState('admin123');
  const [adminPassword, setAdminPassword] = useState('admin123');
  const [employeeCode, setEmployeeCode] = useState('EMP001');
  const [employeePassword, setEmployeePassword] = useState('emp123');
  const [loginError, setLoginError] = useState<string | null>(null);

  // Forgot Password Modal State
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotMode, setForgotMode] = useState<'ADMIN' | 'EMPLOYEE'>('ADMIN');
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotEmpCode, setForgotEmpCode] = useState('');
  const [forgotPhoneOrEmail, setForgotPhoneOrEmail] = useState('');
  const [forgotNewPass, setForgotNewPass] = useState('');
  const [forgotConfirmPass, setForgotConfirmPass] = useState('');
  const [forgotError, setForgotError] = useState<string | null>(null);
  const [forgotSuccess, setForgotSuccess] = useState<string | null>(null);

  // Active Admin View Tab
  const [currentTab, setCurrentTab] = useState<string>('dashboard');

  // Application Real State
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);
  const [offices, setOffices] = useState<Office[]>(INITIAL_OFFICES);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(INITIAL_TODAY_ATTENDANCE);
  const [leaves, setLeaves] = useState<LeaveRequest[]>(INITIAL_LEAVE_REQUESTS);
  const [payroll, setPayroll] = useState<PayrollRecord[]>(INITIAL_PAYROLL);

  // Current logged in employee (for Employee View)
  const currentEmployee = employees.find((e) => e.employeeCode === employeeCode) || employees[0];
  const currentEmpAttendance = currentEmployee ? attendance.find((a) => a.employeeId === currentEmployee.id) : undefined;
  const currentEmpPayroll = currentEmployee ? payroll.find((p) => p.employeeId === currentEmployee.id) : undefined;

  // Authentication Handlers
  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminEmail === 'admin@enterprise.com' && adminPassword === currentAdminPass) {
      setUserRole('ADMIN');
      setLoginError(null);
    } else {
      setLoginError(`Invalid Admin credentials. (Default: admin@enterprise.com / ${currentAdminPass})`);
    }
  };

  const handleEmployeeLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const found = employees.find((emp) => emp.employeeCode.toUpperCase() === employeeCode.trim().toUpperCase());
    const validPass = found?.password || 'emp123';
    if (found && employeePassword === validPass) {
      setUserRole('EMPLOYEE');
      setLoginError(null);
    } else {
      setLoginError(`Invalid Employee credentials. (Check your Employee ID & Password)`);
    }
  };

  const handleLogout = () => {
    setUserRole(null);
    setLoginError(null);
  };

  // Password Management Handlers
  const handleAdminChangePassword = (newPass: string) => {
    setCurrentAdminPass(newPass);
    setAdminPassword(newPass);
  };

  const handleEmployeeChangePassword = (empId: string, newPass: string) => {
    setEmployees(employees.map((e) => (e.id === empId ? { ...e, password: newPass } : e)));
  };

  const handleResetPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(null);
    setForgotSuccess(null);

    if (forgotNewPass.length < 4) {
      setForgotError('New password must be at least 4 characters long.');
      return;
    }
    if (forgotNewPass !== forgotConfirmPass) {
      setForgotError('New password and confirmation do not match.');
      return;
    }

    if (forgotMode === 'ADMIN') {
      if (forgotEmail.trim().toLowerCase() !== adminEmail.trim().toLowerCase()) {
        setForgotError(`No administrator registered with email "${forgotEmail}".`);
        return;
      }
      setCurrentAdminPass(forgotNewPass);
      setAdminPassword(forgotNewPass);
      setForgotSuccess('Admin password reset successfully! You can now sign in.');
      setTimeout(() => {
        setShowForgotModal(false);
        setForgotSuccess(null);
      }, 2000);
    } else {
      const emp = employees.find(
        (e) => e.employeeCode.trim().toUpperCase() === forgotEmpCode.trim().toUpperCase()
      );
      if (!emp) {
        setForgotError(`No employee found with ID Code "${forgotEmpCode}".`);
        return;
      }

      setEmployees(employees.map((e) => (e.id === emp.id ? { ...e, password: forgotNewPass } : e)));
      setEmployeePassword(forgotNewPass);
      setForgotSuccess(`Password for ${emp.fullName} (${emp.employeeCode}) reset successfully!`);
      setTimeout(() => {
        setShowForgotModal(false);
        setForgotSuccess(null);
      }, 2000);
    }
  };

  // Employee State Handlers
  const handleAddEmployee = (newEmp: Employee) => {
    setEmployees([...employees, newEmp]);
    // Also create attendance record for today
    const newAtt: AttendanceRecord = {
      id: `att-${Date.now()}`,
      employeeId: newEmp.id,
      employeeName: newEmp.fullName,
      employeeCode: newEmp.employeeCode,
      departmentName: newEmp.departmentName,
      attendanceDate: getTodayDateString(),
      checkIn: null,
      checkOut: null,
      totalWorkMinutes: 0,
      breakMinutes: 30,
      attendanceMethod: 'AUTOMATIC',
      status: 'PRESENT',
      approvalStatus: 'APPROVED',
      isLateArrival: false,
      isEarlyDeparture: false,
      verificationStatus: 'VERIFIED',
    };
    setAttendance([...attendance, newAtt]);
  };

  const handleUpdateEmployee = (updatedEmp: Employee) => {
    setEmployees(employees.map((e) => (e.id === updatedEmp.id ? updatedEmp : e)));
  };

  const handleDeleteEmployee = (id: string) => {
    setEmployees(employees.filter((e) => e.id !== id));
  };

  const handleUpdateOffice = (updatedOffice: Office) => {
    setOffices(offices.map((o) => (o.id === updatedOffice.id ? updatedOffice : o)));
  };

  const handleApproveCorrection = (id: string) => {
    setAttendance(
      attendance.map((a) =>
        a.id === id ? { ...a, approvalStatus: 'APPROVED', status: 'PRESENT' } : a
      )
    );
  };

  const handleRejectCorrection = (id: string) => {
    setAttendance(
      attendance.map((a) =>
        a.id === id ? { ...a, approvalStatus: 'REJECTED' } : a
      )
    );
  };

  const handleApproveLeave = (id: string) => {
    setLeaves(
      leaves.map((l) => (l.id === id ? { ...l, approvalStatus: 'APPROVED' } : l))
    );
  };

  const handleRejectLeave = (id: string) => {
    setLeaves(
      leaves.map((l) => (l.id === id ? { ...l, approvalStatus: 'REJECTED' } : l))
    );
  };

  const handleGeneratePayroll = (month: number, year: number) => {
    const newPayroll = employees.map((emp) =>
      calculateEmployeePayroll(emp, month, year, 25, 0, 1, 0, 1, 4)
    );
    setPayroll(newPayroll);
  };

  const handleApprovePayroll = (id: string) => {
    setPayroll(
      payroll.map((p) =>
        p.id === id ? { ...p, paymentStatus: 'APPROVED', approvedAt: new Date().toISOString() } : p
      )
    );
  };

  const handlePayPayroll = (id: string) => {
    setPayroll(
      payroll.map((p) => (p.id === id ? { ...p, paymentStatus: 'PAID' } : p))
    );
  };

  // Employee Self-Service Check-In / Out
  const handleEmployeeCheckIn = (coords?: { lat: number; lng: number; dist: number }) => {
    const nowTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const dist = coords ? coords.dist : 12.5;
    const isInside = dist <= 50;

    setAttendance(
      attendance.map((a) =>
        a.employeeId === currentEmployee.id
          ? {
              ...a,
              checkIn: nowTime,
              checkOut: null,
              status: 'PRESENT',
              attendanceMethod: isInside ? 'AUTOMATIC' : 'MANUAL',
              verificationStatus: isInside ? 'VERIFIED' : 'OUTSIDE_RADIUS',
              distanceToOfficeMeters: dist,
            }
          : a
      )
    );
  };

  const handleEmployeeCheckOut = () => {
    const nowTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    setAttendance(
      attendance.map((a) =>
        a.employeeId === currentEmployee.id
          ? {
              ...a,
              checkOut: nowTime,
              totalWorkMinutes: 485,
              status: 'PRESENT',
            }
          : a
      )
    );
  };

  const handleEmployeeApplyLeave = (startDate: string, endDate: string, reason: string) => {
    const newLeave: LeaveRequest = {
      id: `leave-${Date.now()}`,
      employeeId: currentEmployee.id,
      employeeName: currentEmployee.fullName,
      employeeCode: currentEmployee.employeeCode,
      startDate,
      endDate,
      totalDays: 1,
      reason,
      leaveType: 'UNPAID_STANDARD',
      approvalStatus: 'PENDING',
      appliedOn: new Date().toISOString().split('T')[0],
    };
    setLeaves([newLeave, ...leaves]);
  };

  // ====================================================================
  // 1. LOGIN SCREEN (If not authenticated)
  // ====================================================================
  if (!userRole) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-800">
          {/* Header */}
          <div className="bg-navy-900 p-8 text-center text-white relative">
            <div className="w-14 h-14 bg-brand-blue rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-blue-500/40 mb-3">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">Attendance Report</h1>
            <p className="text-xs text-brand-sky font-medium mt-1">
              OMSAIRAM GPS 50m Geofencing & Statutory Payroll System
            </p>
            <div className="mt-2">
              <a
                href="/AttendanceReport.apk"
                download="AttendanceReport.apk"
                className="inline-flex items-center text-[11px] font-bold text-emerald-400 hover:text-emerald-300 underline"
              >
                📲 Download Android Mobile App (APK)
              </a>
            </div>
          </div>

          {/* Role Tab Switcher */}
          <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-bold">
            <button
              onClick={() => {
                setLoginMode('ADMIN');
                setLoginError(null);
              }}
              className={`flex-1 py-3 text-center transition-all ${
                loginMode === 'ADMIN'
                  ? 'bg-white text-brand-blue border-b-2 border-brand-blue font-extrabold'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Admin Portal
            </button>
            <button
              onClick={() => {
                setLoginMode('EMPLOYEE');
                setLoginError(null);
              }}
              className={`flex-1 py-3 text-center transition-all ${
                loginMode === 'EMPLOYEE'
                  ? 'bg-white text-brand-blue border-b-2 border-brand-blue font-extrabold'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Employee Portal
            </button>
          </div>

          <div className="p-8">
            {loginError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center">
                <ShieldAlert className="w-4 h-4 mr-2 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            {loginMode === 'ADMIN' ? (
              <form onSubmit={handleAdminLogin} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Admin Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 border rounded-xl focus:ring-2 focus:ring-brand-blue outline-none"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block font-semibold text-slate-700">Password</label>
                    <button
                      type="button"
                      onClick={() => {
                        setForgotMode('ADMIN');
                        setForgotError(null);
                        setForgotSuccess(null);
                        setForgotEmail(adminEmail);
                        setForgotNewPass('');
                        setForgotConfirmPass('');
                        setShowForgotModal(true);
                      }}
                      className="text-brand-blue hover:underline font-bold text-[11px]"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 border rounded-xl focus:ring-2 focus:ring-brand-blue outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-brand-blue hover:bg-brand-accent text-white font-bold rounded-xl shadow-lg shadow-blue-500/25 transition-all text-xs"
                >
                  Sign In to Admin Dashboard
                </button>

                <div className="text-center text-[11px] text-slate-400 mt-2">
                  Admin credentials: <span className="font-mono text-slate-600">admin@enterprise.com / {currentAdminPass}</span>
                </div>
              </form>
            ) : (
              <form onSubmit={handleEmployeeLogin} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Employee ID Code</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={employeeCode}
                      onChange={(e) => setEmployeeCode(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 border rounded-xl focus:ring-2 focus:ring-brand-blue outline-none font-mono font-bold"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block font-semibold text-slate-700">Password</label>
                    <button
                      type="button"
                      onClick={() => {
                        setForgotMode('EMPLOYEE');
                        setForgotError(null);
                        setForgotSuccess(null);
                        setForgotEmpCode(employeeCode);
                        setForgotPhoneOrEmail('');
                        setForgotNewPass('');
                        setForgotConfirmPass('');
                        setShowForgotModal(true);
                      }}
                      className="text-brand-blue hover:underline font-bold text-[11px]"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      value={employeePassword}
                      onChange={(e) => setEmployeePassword(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 border rounded-xl focus:ring-2 focus:ring-brand-blue outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-brand-blue hover:bg-brand-accent text-white font-bold rounded-xl shadow-lg shadow-blue-500/25 transition-all text-xs"
                >
                  Sign In to Employee Portal
                </button>

                <div className="text-center text-[11px] text-slate-400 mt-2">
                  Enter your assigned Employee ID and Password (Default: <span className="font-mono text-slate-600">emp123</span>)
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Forgot Password Reset Modal */}
        {showForgotModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-brand-blue">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Reset Account Password</h3>
                    <p className="text-[11px] text-slate-400">Recover your login access</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mode Switcher Tabs */}
              <div className="flex bg-slate-100 p-1 rounded-xl mt-4 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => {
                    setForgotMode('ADMIN');
                    setForgotError(null);
                    setForgotSuccess(null);
                  }}
                  className={`flex-1 py-1.5 rounded-lg transition-all ${
                    forgotMode === 'ADMIN'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Admin Reset
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setForgotMode('EMPLOYEE');
                    setForgotError(null);
                    setForgotSuccess(null);
                  }}
                  className={`flex-1 py-1.5 rounded-lg transition-all ${
                    forgotMode === 'EMPLOYEE'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Employee Reset
                </button>
              </div>

              <form onSubmit={handleResetPasswordSubmit} className="mt-4 space-y-3 text-xs">
                {forgotError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center">
                    <AlertCircle className="w-4 h-4 mr-2 shrink-0 text-rose-600" />
                    <span>{forgotError}</span>
                  </div>
                )}

                {forgotSuccess && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center">
                    <CheckCircle2 className="w-4 h-4 mr-2 shrink-0 text-emerald-600" />
                    <span>{forgotSuccess}</span>
                  </div>
                )}

                {forgotMode === 'ADMIN' ? (
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Registered Admin Email</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        placeholder="admin@enterprise.com"
                        className="w-full pl-9 pr-3 py-2 border rounded-xl focus:ring-2 focus:ring-brand-blue outline-none"
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Employee ID Code</label>
                      <div className="relative">
                        <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          required
                          value={forgotEmpCode}
                          onChange={(e) => setForgotEmpCode(e.target.value)}
                          placeholder="e.g. EMP001"
                          className="w-full pl-9 pr-3 py-2 border rounded-xl focus:ring-2 focus:ring-brand-blue outline-none font-mono font-bold"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Registered Email or Phone (Optional)</label>
                      <input
                        type="text"
                        value={forgotPhoneOrEmail}
                        onChange={(e) => setForgotPhoneOrEmail(e.target.value)}
                        placeholder="Verify your email or phone"
                        className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-brand-blue outline-none"
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">New Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      value={forgotNewPass}
                      onChange={(e) => setForgotNewPass(e.target.value)}
                      placeholder="Enter new password (min 4 chars)"
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
                      value={forgotConfirmPass}
                      onChange={(e) => setForgotConfirmPass(e.target.value)}
                      placeholder="Confirm new password"
                      className="w-full pl-9 pr-3 py-2 border rounded-xl focus:ring-2 focus:ring-brand-blue outline-none"
                    />
                  </div>
                </div>

                <div className="pt-2 flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="w-1/3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-brand-blue hover:bg-brand-accent text-white font-bold rounded-xl shadow-sm transition-all"
                  >
                    Reset Password
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ====================================================================
  // 2. EMPLOYEE VIEW (Mobile-First Self-Service Mode)
  // ====================================================================
  if (userRole === 'EMPLOYEE') {
    if (!currentEmployee) {
      return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xl max-w-md w-full text-center space-y-4">
            <Smartphone className="w-12 h-12 text-brand-blue mx-auto" />
            <h2 className="text-lg font-bold text-slate-800">No Employee Account Registered</h2>
            <p className="text-xs text-slate-500">
              Please sign in as Admin to add your employees first, then test the employee portal.
            </p>
            <button
              onClick={() => {
                setUserRole('ADMIN');
                setLoginMode('ADMIN');
              }}
              className="w-full py-2.5 bg-brand-blue hover:bg-brand-accent text-white rounded-xl font-bold text-xs shadow-md"
            >
              Go to Admin Dashboard
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-slate-100 p-4 sm:p-6">
        <EmployeePortalView
          employee={currentEmployee}
          todayAttendance={currentEmpAttendance}
          payroll={currentEmpPayroll}
          leaves={leaves.filter((l) => l.employeeId === currentEmployee.id)}
          onManualCheckIn={handleEmployeeCheckIn}
          onManualCheckOut={handleEmployeeCheckOut}
          onApplyLeave={handleEmployeeApplyLeave}
          onLogout={handleLogout}
          onChangePassword={(newP) => handleEmployeeChangePassword(currentEmployee.id, newP)}
        />
      </div>
    );
  }

  // ====================================================================
  // 3. ADMIN VIEW (Full Enterprise Web Dashboard)
  // ====================================================================
  const tabTitles: Record<string, string> = {
    dashboard: 'Executive Dashboard & Live Presence',
    employees: 'Employee Management & Statutory Settings',
    geofence: 'Office GPS Map & 50-Meter Geofence Configuration',
    attendance: 'Live Attendance Stream & Audit Logs',
    calendar: 'Interactive Attendance Calendar & Monthly View',
    leaves: 'Leave Policy Management & Approvals',
    payroll: 'Statutory Payroll Engine & PDF Slips',
    reports: 'Monthly Attendance Calendar & Analytics',
    settings: 'Company Settings & Policy Rules',
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Left Navigation Sidebar */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onLogout={handleLogout}
        onSwitchToEmployeeView={() => setUserRole('EMPLOYEE')}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header Navbar */}
        <Navbar
          currentTabName={tabTitles[currentTab] || 'Dashboard'}
          currentAdminPassword={currentAdminPass}
          onAdminChangePassword={handleAdminChangePassword}
        />

        {/* Scrollable Module Canvas */}
        <main className="flex-1 p-6 overflow-y-auto">
          {currentTab === 'dashboard' && (
            <DashboardOverview
              employees={employees}
              attendance={attendance}
              leaves={leaves}
              payroll={payroll}
              onNavigateToTab={setCurrentTab}
            />
          )}

          {currentTab === 'employees' && (
            <EmployeeManagement
              employees={employees}
              departments={INITIAL_DEPARTMENTS}
              offices={offices}
              shifts={INITIAL_SHIFTS}
              onAddEmployee={handleAddEmployee}
              onUpdateEmployee={handleUpdateEmployee}
              onDeleteEmployee={handleDeleteEmployee}
            />
          )}

          {currentTab === 'geofence' && (
            <GeofenceMapConfig
              offices={offices}
              onUpdateOffice={handleUpdateOffice}
              onAddOffice={(o) => setOffices([...offices, o])}
            />
          )}

          {currentTab === 'attendance' && (
            <AttendanceMonitor
              attendance={attendance}
              onApproveCorrection={handleApproveCorrection}
              onRejectCorrection={handleRejectCorrection}
            />
          )}

          {currentTab === 'leaves' && (
            <LeaveManagement
              leaves={leaves}
              onApproveLeave={handleApproveLeave}
              onRejectLeave={handleRejectLeave}
            />
          )}

          {currentTab === 'payroll' && (
            <PayrollModule
              payroll={payroll}
              onGeneratePayroll={handleGeneratePayroll}
              onApprovePayroll={handleApprovePayroll}
              onPayPayroll={handlePayPayroll}
            />
          )}

          {(currentTab === 'calendar' || currentTab === 'reports') && (
            <AttendanceReport
              employees={employees}
              departments={INITIAL_DEPARTMENTS}
              attendance={attendance}
            />
          )}

          {currentTab === 'settings' && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6 max-w-3xl">
              <div>
                <h3 className="text-base font-bold text-slate-900">Company Attendance & Payroll Policies</h3>
                <p className="text-xs text-slate-400 mt-0.5">Strict enforcement of verified company policy</p>
              </div>

              <div className="space-y-4 text-xs">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                  <div className="font-bold text-slate-800">1. Working Hours & Overtime Policy</div>
                  <div className="text-slate-600 space-y-1">
                    <div>• Standard required hours: <span className="font-bold text-slate-900">8.00 Hours (480 minutes)</span></div>
                    <div>• Approved break: <span className="font-bold text-slate-900">30 minutes</span></div>
                    <div>• Overtime policy: <span className="font-bold text-rose-600">PERMANENTLY DISABLED</span> (No extra compensation)</div>
                    <div>• Timezone: <span className="font-bold text-slate-900">Asia/Kolkata (IST)</span></div>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                  <div className="font-bold text-slate-800">2. Leave Policy Rules</div>
                  <div className="text-slate-600 space-y-1">
                    <div>• Monthly leave allowance: <span className="font-bold text-slate-900">4 Days</span></div>
                    <div>• Paid leaves: <span className="font-bold text-rose-600">ZERO (All leaves are unpaid)</span></div>
                    <div>• Divisor: <span className="font-bold text-slate-900">Calendar Days (30 / 31)</span></div>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                  <div className="font-bold text-slate-800">3. GPS Geofencing Configuration</div>
                  <div className="text-slate-600 space-y-1">
                    <div>• Default radius: <span className="font-bold text-brand-blue">50 Meters</span></div>
                    <div>• Exit grace period: <span className="font-bold text-brand-blue">10 Minutes</span></div>
                    <div>• Location permission: <span className="font-bold text-slate-900">Fine Location + Background Location required</span></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
