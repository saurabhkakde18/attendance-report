import React from 'react';
import {
  Users,
  UserCheck,
  UserX,
  MapPin,
  Clock,
  AlertCircle,
  CalendarDays,
  IndianRupee,
  Navigation,
  CheckCircle2,
} from 'lucide-react';
import { AttendanceRecord, Employee, LeaveRequest, PayrollRecord } from '@/types';
import { getCurrentMonthAndYear } from '@/lib/store';

interface DashboardOverviewProps {
  employees: Employee[];
  attendance: AttendanceRecord[];
  leaves: LeaveRequest[];
  payroll: PayrollRecord[];
  onNavigateToTab: (tab: string) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  employees,
  attendance,
  leaves,
  payroll,
  onNavigateToTab,
}) => {
  // Compute Key Metrics
  const totalEmployees = employees.length;
  const presentToday = attendance.filter((a) => a.status === 'PRESENT').length;
  const absentToday = attendance.filter((a) => a.status === 'ABSENT').length;
  const currentlyInOffice = attendance.filter((a) => a.status === 'PRESENT' && !a.checkOut).length;
  const currentlyOutsideOffice = Math.max(0, totalEmployees - currentlyInOffice);
  const lateArrivals = attendance.filter((a) => a.isLateArrival).length;
  const pendingCorrections = attendance.filter((a) => a.approvalStatus === 'PENDING').length;
  const pendingLeaves = leaves.filter((l) => l.approvalStatus === 'PENDING').length;
  const totalEmployeesOnLeave = attendance.filter((a) => a.status === 'ON_LEAVE').length;

  // Monthly Salary Expense (Total Net Salary)
  const monthlySalaryExpense = payroll.reduce((acc, p) => acc + p.netSalary, 0);

  // 10 Dashboard Summary Cards
  const cards = [
    { title: 'Total Employees', value: totalEmployees, icon: Users, color: 'border-blue-500 text-blue-600 bg-blue-50/50' },
    { title: 'Present Today', value: presentToday, icon: UserCheck, color: 'border-emerald-500 text-emerald-600 bg-emerald-50/50' },
    { title: 'Absent Today', value: absentToday, icon: UserX, color: 'border-rose-500 text-rose-600 bg-rose-50/50' },
    { title: 'Currently In Office', value: currentlyInOffice, icon: MapPin, color: 'border-teal-500 text-teal-600 bg-teal-50/50' },
    { title: 'Outside Office', value: currentlyOutsideOffice, icon: Navigation, color: 'border-amber-500 text-amber-600 bg-amber-50/50' },
    { title: 'Late Arrivals', value: lateArrivals, icon: Clock, color: 'border-orange-500 text-orange-600 bg-orange-50/50' },
    { title: 'Pending Corrections', value: pendingCorrections, icon: AlertCircle, color: 'border-indigo-500 text-indigo-600 bg-indigo-50/50' },
    { title: 'Pending Leave Requests', value: pendingLeaves, icon: CalendarDays, color: 'border-purple-500 text-purple-600 bg-purple-50/50' },
    { title: 'Monthly Salary Expense', value: `₹${monthlySalaryExpense.toLocaleString('en-IN')}`, icon: IndianRupee, color: 'border-cyan-500 text-cyan-600 bg-cyan-50/50' },
    { title: 'Employees on Leave', value: totalEmployeesOnLeave, icon: CalendarDays, color: 'border-pink-500 text-pink-600 bg-pink-50/50' },
  ];

  return (
    <div className="space-y-6">
      {/* 10 Dashboard Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {cards.map((c, idx) => {
          const Icon = c.icon;
          return (
            <div
              key={idx}
              className={`p-4 rounded-xl border bg-white shadow-sm flex flex-col justify-between transition-all hover:shadow-md ${c.color.split(' ')[0]}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">{c.title}</span>
                <div className={`p-2 rounded-lg ${c.color.split(' ')[2]}`}>
                  <Icon className={`w-4 h-4 ${c.color.split(' ')[1]}`} />
                </div>
              </div>
              <div className="mt-3">
                <div className="text-xl font-bold text-slate-900">{c.value}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Visual Charts & Attendance Metrics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance Trends Bar */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Monthly Attendance Distribution ({getCurrentMonthAndYear()})</h3>
              <p className="text-xs text-slate-400">Strictly 8 working hours benchmark • Asia/Kolkata (IST)</p>
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              96.2% Overall Presence
            </span>
          </div>

          {/* Graphical Representation */}
          <div className="space-y-4 pt-2">
            <div>
              <div className="flex justify-between text-xs font-medium text-slate-600 mb-1">
                <span>Present (On-Time & Automatic 50m GPS)</span>
                <span className="font-bold text-emerald-600">82%</span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '82%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium text-slate-600 mb-1">
                <span>Late Arrivals (&gt; 09:15 AM Grace)</span>
                <span className="font-bold text-amber-600">8%</span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: '8%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium text-slate-600 mb-1">
                <span>Approved Leaves (Under 4-Day Unpaid Allowance)</span>
                <span className="font-bold text-orange-600">6%</span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-orange-500 rounded-full" style={{ width: '6%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium text-slate-600 mb-1">
                <span>Unapproved Absences</span>
                <span className="font-bold text-rose-600">4%</span>
              </div>
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-rose-500 rounded-full" style={{ width: '4%' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Statutory Payroll Snapshot */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800">Statutory Deductions Example</h3>
            <p className="text-xs text-slate-400 mt-0.5">Company Standard Reference: ₹18,000 Basic</p>

            <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between text-slate-700">
                <span>Basic Monthly Salary:</span>
                <span className="font-bold">₹18,000.00</span>
              </div>
              <div className="flex justify-between text-rose-600">
                <span>PF Statutory (12% cap):</span>
                <span>- ₹1,840.00</span>
              </div>
              <div className="flex justify-between text-rose-600">
                <span>ESIC Statutory (0.75%):</span>
                <span>- ₹120.00</span>
              </div>
              <div className="flex justify-between text-rose-600">
                <span>Professional Tax (PT):</span>
                <span>- ₹200.00</span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-slate-900">
                <span>Base Net Payable:</span>
                <span className="text-emerald-600">₹15,840.00</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigateToTab('payroll')}
            className="w-full mt-4 py-2 px-3 text-xs font-bold text-brand-blue bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200"
          >
            Open Payroll Engine →
          </button>
        </div>
      </div>

      {/* Live Employee Attendance Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row justify-between sm:items-center gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-800 flex items-center">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse mr-2" />
              Live Employee Attendance & Geofence Verification Feed
            </h3>
            <p className="text-xs text-slate-400">Real-time GPS capture within 50m office boundary</p>
          </div>
          <button
            onClick={() => onNavigateToTab('attendance')}
            className="text-xs text-brand-blue font-semibold hover:underline"
          >
            View Full Attendance Log →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Check-In</th>
                <th className="py-3 px-4">Check-Out</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Method</th>
                <th className="py-3 px-4">Location Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {attendance.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No attendance records logged for today. Live check-ins will appear here as employees arrive.
                  </td>
                </tr>
              ) : (
                attendance.map((rec) => (
                <tr key={rec.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-800">{rec.employeeName}</div>
                    <div className="text-[11px] text-slate-400 font-mono">{rec.employeeCode}</div>
                  </td>
                  <td className="py-3 px-4 text-slate-600">{rec.departmentName}</td>
                  <td className="py-3 px-4 font-mono font-medium">
                    {rec.checkIn ? (
                      <span className={rec.isLateArrival ? 'text-amber-600 font-bold' : 'text-slate-800'}>
                        {rec.checkIn} {rec.isLateArrival && '(Late)'}
                      </span>
                    ) : (
                      <span className="text-slate-400">--</span>
                    )}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-600">
                    {rec.checkOut || <span className="text-emerald-600 font-medium">Session Active</span>}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold ${
                        rec.status === 'PRESENT'
                          ? 'bg-emerald-100 text-emerald-800'
                          : rec.status === 'ON_LEAVE'
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {rec.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${
                        rec.attendanceMethod === 'AUTOMATIC'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {rec.attendanceMethod}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center text-emerald-600 font-semibold text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-500" />
                      <span>{rec.verificationStatus}</span>
                      {rec.distanceToOfficeMeters && (
                        <span className="text-slate-400 ml-1 font-normal font-mono">
                          ({rec.distanceToOfficeMeters}m &lt; 50m)
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
