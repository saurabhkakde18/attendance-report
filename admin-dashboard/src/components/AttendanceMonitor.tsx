import React, { useState } from 'react';
import { Clock, CheckCircle, XCircle, FileSpreadsheet, ShieldAlert, Check, X } from 'lucide-react';
import { AttendanceRecord } from '@/types';
import { exportAttendanceToExcel } from '@/lib/excelExport';

interface AttendanceMonitorProps {
  attendance: AttendanceRecord[];
  onApproveCorrection: (id: string) => void;
  onRejectCorrection: (id: string) => void;
}

export const AttendanceMonitor: React.FC<AttendanceMonitorProps> = ({
  attendance,
  onApproveCorrection,
  onRejectCorrection,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  const filtered = attendance.filter((a) => {
    if (filterStatus === 'ALL') return true;
    if (filterStatus === 'PENDING') return a.approvalStatus === 'PENDING';
    return a.status === filterStatus;
  });

  return (
    <div className="space-y-6">
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-base font-bold text-slate-800 flex items-center">
            <Clock className="w-5 h-5 text-brand-blue mr-2" />
            Live Attendance Stream & Audit Logs
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time server timestamps, 50-meter GPS accuracy logs, and manual attendance correction approvals
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="text-xs px-3 py-2 border rounded-lg focus:ring-2 focus:ring-brand-blue outline-none bg-slate-50 font-medium"
          >
            <option value="ALL">All Records</option>
            <option value="PRESENT">Present Only</option>
            <option value="ON_LEAVE">On Leave</option>
            <option value="ABSENT">Absent Only</option>
            <option value="PENDING">Pending Corrections</option>
          </select>

          <button
            onClick={() => exportAttendanceToExcel(attendance)}
            className="inline-flex items-center px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all"
          >
            <FileSpreadsheet className="w-4 h-4 mr-1.5" />
            Export to Excel
          </button>
        </div>
      </div>

      {/* Attendance Audit Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Check-In</th>
                <th className="py-3 px-4">Check-Out</th>
                <th className="py-3 px-4">Total Work</th>
                <th className="py-3 px-4">Method & GPS</th>
                <th className="py-3 px-4">Approval Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No attendance records logged. As employees check in via GPS at OMSAIRAM, logs will stream here.
                  </td>
                </tr>
              ) : (
                filtered.map((rec) => (
                <tr key={rec.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900">{rec.employeeName}</div>
                    <div className="text-[11px] text-brand-blue font-mono">{rec.employeeCode}</div>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-600">{rec.attendanceDate}</td>
                  <td className="py-3 px-4 font-mono font-medium">
                    {rec.checkIn || <span className="text-slate-400">--:--</span>}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-600">
                    {rec.checkOut || <span className="text-emerald-600 font-medium">In Session</span>}
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-800">
                    {rec.totalWorkMinutes > 0 ? (
                      `${Math.floor(rec.totalWorkMinutes / 60)}h ${rec.totalWorkMinutes % 60}m`
                    ) : (
                      <span className="text-slate-400">0h 0m</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-1">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          rec.attendanceMethod === 'AUTOMATIC'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {rec.attendanceMethod}
                      </span>
                      {rec.distanceToOfficeMeters && (
                        <span className="text-[10px] text-emerald-600 font-mono">
                          ({rec.distanceToOfficeMeters}m)
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        rec.approvalStatus === 'APPROVED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : rec.approvalStatus === 'REJECTED'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {rec.approvalStatus}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    {rec.approvalStatus === 'PENDING' ? (
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          onClick={() => onApproveCorrection(rec.id)}
                          className="px-2 py-1 bg-emerald-600 text-white rounded text-[11px] font-bold hover:bg-emerald-700 transition-colors"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => onRejectCorrection(rec.id)}
                          className="px-2 py-1 bg-rose-600 text-white rounded text-[11px] font-bold hover:bg-rose-700 transition-colors"
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span className="text-slate-400 text-[11px]">Audit Complete</span>
                    )}
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
