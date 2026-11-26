import * as XLSX from 'xlsx';
import { AttendanceRecord, PayrollRecord } from '@/types';

export function exportAttendanceToExcel(records: AttendanceRecord[], fileName: string = 'Attendance_Report_November_2026') {
  const data = records.map((rec) => ({
    'Employee Code': rec.employeeCode,
    'Employee Name': rec.employeeName,
    'Department': rec.departmentName,
    'Date': rec.attendanceDate,
    'Check-In': rec.checkIn || '--',
    'Check-Out': rec.checkOut || '--',
    'Total Work Minutes': rec.totalWorkMinutes,
    'Total Work Hours': +(rec.totalWorkMinutes / 60).toFixed(2),
    'Attendance Method': rec.attendanceMethod,
    'Status': rec.status,
    'Late Arrival': rec.isLateArrival ? 'YES' : 'NO',
    'Early Departure': rec.isEarlyDeparture ? 'YES' : 'NO',
    'GPS Verification': rec.verificationStatus,
    'Distance from Office (m)': rec.distanceToOfficeMeters || 'N/A',
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendance Records');

  XLSX.writeFile(workbook, `${fileName}.xlsx`);
}

export function exportPayrollToExcel(records: PayrollRecord[], fileName: string = 'Monthly_Payroll_Report') {
  const data = records.map((rec) => ({
    'Slip Number': rec.slipNumber,
    'Employee Code': rec.employeeCode,
    'Employee Name': rec.employeeName,
    'Department': rec.departmentName,
    'Designation': rec.designation,
    'Month': rec.month,
    'Year': rec.year,
    'Basic Monthly Salary': rec.basicSalary,
    'Calendar Days': rec.calendarDays,
    'Working Days': rec.workingDays,
    'Present Days': rec.presentDays,
    'Absent Days': rec.absentDays,
    'Leave Days (Unpaid)': rec.leaveDays,
    'PF Deduction': rec.pfAmount,
    'ESIC Deduction': rec.esicAmount,
    'PT Deduction': rec.ptAmount,
    'Total Fixed Deductions': rec.fixedDeductions,
    'Unpaid Leave Deductions': rec.unpaidLeaveDeduction,
    'Net Payable Salary': rec.netSalary,
    'Payment Status': rec.paymentStatus,
    'Approved At': rec.approvedAt || '--',
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Monthly Payroll');

  XLSX.writeFile(workbook, `${fileName}.xlsx`);
}
