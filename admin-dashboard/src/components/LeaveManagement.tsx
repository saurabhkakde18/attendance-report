import React from 'react';
import { CalendarDays, Check, X, ShieldAlert, AlertTriangle } from 'lucide-react';
import { LeaveRequest } from '@/types';

interface LeaveManagementProps {
  leaves: LeaveRequest[];
  onApproveLeave: (id: string) => void;
  onRejectLeave: (id: string) => void;
}

export const LeaveManagement: React.FC<LeaveManagementProps> = ({
  leaves,
  onApproveLeave,
  onRejectLeave,
}) => {
  return (
    <div className="space-y-6">
      {/* Top Banner explaining leave policy */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center">
            <CalendarDays className="w-5 h-5 text-brand-blue mr-2" />
            Company Leave Policy & Application Approvals
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Monthly leave allowance: 4 days. Paid leaves: 0. All leaves are unpaid in payroll calculation.
          </p>
        </div>

        <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-center text-xs text-amber-800">
          <AlertTriangle className="w-4 h-4 text-amber-600 mr-2 shrink-0" />
          <span>Leave allowance grants absence permission, but salary is deducted as unpaid leave.</span>
        </div>
      </div>

      {/* Pending & Approved Leave Requests Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200">
          <h3 className="text-sm font-bold text-slate-800">Leave Applications & Approval Workflow</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-4">Dates</th>
                <th className="py-3 px-4">Days</th>
                <th className="py-3 px-4">Reason</th>
                <th className="py-3 px-4">Leave Policy</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Admin Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {leaves.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No leave applications submitted yet.
                  </td>
                </tr>
              ) : (
                leaves.map((l) => (
                <tr key={l.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900">{l.employeeName}</div>
                    <div className="text-[11px] text-brand-blue font-mono">{l.employeeCode}</div>
                  </td>
                  <td className="py-3 px-4 font-mono font-medium text-slate-700">
                    {l.startDate} to {l.endDate}
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-800">{l.totalDays} Day(s)</td>
                  <td className="py-3 px-4 text-slate-600 max-w-xs">{l.reason}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-100 text-orange-800">
                      Unpaid Allowance
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        l.approvalStatus === 'APPROVED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : l.approvalStatus === 'REJECTED'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {l.approvalStatus}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    {l.approvalStatus === 'PENDING' ? (
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => onApproveLeave(l.id)}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-bold transition-colors flex items-center"
                        >
                          <Check className="w-3.5 h-3.5 mr-1" /> Approve
                        </button>
                        <button
                          onClick={() => onRejectLeave(l.id)}
                          className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded text-[11px] font-bold transition-colors flex items-center"
                        >
                          <X className="w-3.5 h-3.5 mr-1" /> Reject
                        </button>
                      </div>
                    ) : (
                      <span className="text-slate-400 font-medium text-[11px]">Processed</span>
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
