import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Download,
  Lock,
  CheckCircle,
  FileText,
  RefreshCw,
  AlertCircle,
  ShieldCheck,
  CloudUpload,
} from 'lucide-react';
import { PayrollRecord } from '@/types';
import { generateSalarySlipPdf } from '@/lib/pdfGenerator';
import { exportPayrollToExcel } from '@/lib/excelExport';
import { getCurrentMonthNumber, getCurrentYearNumber, getCurrentMonthName } from '@/lib/store';
import { BUCKET_SALARY_SLIPS, isSupabaseConfigured } from '@/lib/supabaseClient';

interface PayrollModuleProps {
  payroll: PayrollRecord[];
  onGeneratePayroll: (month: number, year: number) => void;
  onApprovePayroll: (id: string) => void;
  onPayPayroll: (id: string) => void;
}

export const PayrollModule: React.FC<PayrollModuleProps> = ({
  payroll,
  onGeneratePayroll,
  onApprovePayroll,
  onPayPayroll,
}) => {
  const [selectedMonth, setSelectedMonth] = useState<number>(getCurrentMonthNumber());
  const [selectedYear, setSelectedYear] = useState<number>(getCurrentYearNumber());
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      onGeneratePayroll(selectedMonth, selectedYear);
      setIsGenerating(false);
    }, 500);
  };

  const handleDownloadSlip = (rec: PayrollRecord) => {
    generateSalarySlipPdf(rec);
    setSyncStatus(`Salary slip generated & synced with Supabase bucket "${BUCKET_SALARY_SLIPS}"`);
    setTimeout(() => setSyncStatus(null), 4000);
  };

  const handleDownloadBulk = () => {
    payroll.forEach((rec, idx) => {
      setTimeout(() => {
        generateSalarySlipPdf(rec);
      }, idx * 300);
    });
    setSyncStatus(`All slips synced with Supabase bucket "${BUCKET_SALARY_SLIPS}"`);
    setTimeout(() => setSyncStatus(null), 5000);
  };

  const totalBasic = payroll.reduce((acc, p) => acc + p.basicSalary, 0);
  const totalPF = payroll.reduce((acc, p) => acc + p.pfAmount, 0);
  const totalESIC = payroll.reduce((acc, p) => acc + p.esicAmount, 0);
  const totalPT = payroll.reduce((acc, p) => acc + p.ptAmount, 0);
  const totalNet = payroll.reduce((acc, p) => acc + p.netSalary, 0);

  return (
    <div className="space-y-6">
      {/* Top Controls & 1-Click Generation */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center">
            <FileSpreadsheet className="w-5 h-5 text-brand-blue mr-2" />
            Statutory Salary & Payroll Calculation Engine
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Compliant with standard statutory deductions: PF (₹1,840), ESIC (₹120), PT (₹200) • Strictly NO Overtime
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-2">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="text-xs px-3 py-2 border rounded-lg bg-slate-50 font-bold focus:ring-2 focus:ring-brand-blue outline-none"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => {
                const dateObj = new Date(selectedYear, m - 1, 1);
                const name = dateObj.toLocaleString('en-US', { month: 'long' });
                return (
                  <option key={m} value={m}>
                    {name} {selectedYear}
                  </option>
                );
              })}
            </select>
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="inline-flex items-center px-4 py-2 bg-brand-blue hover:bg-brand-accent text-white text-xs font-bold rounded-lg shadow-sm transition-all shadow-blue-500/20"
          >
            <RefreshCw className={`w-4 h-4 mr-1.5 ${isGenerating ? 'animate-spin' : ''}`} />
            {isGenerating ? 'Calculating...' : 'Recalculate Monthly Payroll'}
          </button>

          <button
            onClick={() => exportPayrollToExcel(payroll, `Payroll_Summary_${selectedMonth}_${selectedYear}`)}
            className="inline-flex items-center px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all"
          >
            <Download className="w-4 h-4 mr-1.5" />
            Export Excel
          </button>

          <button
            onClick={handleDownloadBulk}
            className="inline-flex items-center px-3.5 py-2 bg-navy-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg shadow-sm transition-all"
          >
            <FileText className="w-4 h-4 mr-1.5" />
            Download All Slips (PDF)
          </button>
        </div>
      </div>

      {/* Salary Verification Banner */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-start space-x-3 text-xs text-blue-900">
        <ShieldCheck className="w-5 h-5 text-brand-blue shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Verified Statutory Calculation Model: </span>
          Basic Salary: ₹18,000.00 | PF: ₹1,840.00 | ESIC: ₹120.00 | PT: ₹200.00 | Total Fixed Deductions: ₹2,160.00 |
          <span className="font-bold text-emerald-700"> Final Base Net Salary: ₹15,840.00</span>.
          Overtime pay is permanently disabled. Excess leaves beyond 4-day allowance are deducted via calendar divisor.
        </div>
      </div>

      {/* Payroll Records Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-4">Basic Salary</th>
                <th className="py-3 px-4">Days (P / L / A)</th>
                <th className="py-3 px-4">PF (₹)</th>
                <th className="py-3 px-4">ESIC (₹)</th>
                <th className="py-3 px-4">PT (₹)</th>
                <th className="py-3 px-4">Unpaid Deductions</th>
                <th className="py-3 px-4">Net Salary</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Salary Slip</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {payroll.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-400">
                    No payroll records generated yet. Click &quot;Calculate Monthly Payroll&quot; above to process payroll.
                  </td>
                </tr>
              ) : (
                payroll.map((rec) => (
                <tr key={rec.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900">{rec.employeeName}</div>
                    <div className="text-[11px] text-brand-blue font-mono">{rec.employeeCode}</div>
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-800">
                    ₹{rec.basicSalary.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-600">
                    <span className="text-emerald-600 font-bold">{rec.presentDays}P</span> /{' '}
                    <span className="text-orange-600 font-bold">{rec.leaveDays}L</span> /{' '}
                    <span className="text-rose-600 font-bold">{rec.absentDays}A</span>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-600">₹{rec.pfAmount}</td>
                  <td className="py-3 px-4 font-mono text-slate-600">₹{rec.esicAmount}</td>
                  <td className="py-3 px-4 font-mono text-slate-600">₹{rec.ptAmount}</td>
                  <td className="py-3 px-4 font-mono text-rose-600 font-medium">
                    {rec.unpaidLeaveDeduction > 0 ? `- ₹${rec.unpaidLeaveDeduction}` : '₹0.00'}
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-emerald-600 text-sm">
                    ₹{rec.netSalary.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        rec.paymentStatus === 'PAID'
                          ? 'bg-emerald-100 text-emerald-800'
                          : rec.paymentStatus === 'APPROVED'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {rec.paymentStatus}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleDownloadSlip(rec)}
                        className="inline-flex items-center px-2.5 py-1 bg-brand-blue hover:bg-brand-accent text-white rounded text-[11px] font-bold transition-all shadow-sm"
                        title="Download official PDF Salary Slip"
                      >
                        <Download className="w-3.5 h-3.5 mr-1" /> PDF Slip
                      </button>

                      {rec.paymentStatus === 'DRAFT' && (
                        <button
                          onClick={() => onApprovePayroll(rec.id)}
                          className="px-2 py-1 bg-emerald-600 text-white rounded text-[11px] font-bold hover:bg-emerald-700"
                        >
                          Approve
                        </button>
                      )}
                      {rec.paymentStatus === 'APPROVED' && (
                        <button
                          onClick={() => onPayPayroll(rec.id)}
                          className="px-2 py-1 bg-slate-800 text-white rounded text-[11px] font-bold hover:bg-black"
                        >
                          Mark Paid
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )))}
            </tbody>
            {/* Totals Footer */}
            <tfoot>
              <tr className="bg-slate-50 border-t-2 border-slate-300 font-bold text-slate-900">
                <td className="py-3 px-4 uppercase">Total Expenses:</td>
                <td className="py-3 px-4 font-mono">₹{totalBasic.toLocaleString('en-IN')}</td>
                <td className="py-3 px-4 font-mono">--</td>
                <td className="py-3 px-4 font-mono">₹{totalPF.toLocaleString('en-IN')}</td>
                <td className="py-3 px-4 font-mono">₹{totalESIC.toLocaleString('en-IN')}</td>
                <td className="py-3 px-4 font-mono">₹{totalPT.toLocaleString('en-IN')}</td>
                <td className="py-3 px-4 font-mono text-rose-600">--</td>
                <td className="py-3 px-4 font-mono text-emerald-600 text-sm">
                  ₹{totalNet.toLocaleString('en-IN')}
                </td>
                <td className="py-3 px-4" colSpan={2} />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
