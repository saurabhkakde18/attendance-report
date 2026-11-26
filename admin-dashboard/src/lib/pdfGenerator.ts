import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { PayrollRecord } from '@/types';
import { uploadSalarySlipToBucket } from '@/lib/supabaseClient';

export function generateSalarySlipPdf(payroll: PayrollRecord, companyName: string = 'Attendance Report - OMSAIRAM') {
  const doc = new jsPDF();

  // Primary Colors
  const navyColor: [number, number, number] = [15, 23, 42]; // #0F172A
  const primaryBlue: [number, number, number] = [37, 99, 235]; // #2563EB
  const grayText: [number, number, number] = [100, 116, 139];

  // Header Banner
  doc.setFillColor(...navyColor);
  doc.rect(0, 0, 210, 38, 'F');

  // Company Name & Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(companyName.toUpperCase(), 14, 16);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Attendance Report - GPS 50m Geofencing & Statutory Payroll System', 14, 23);

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(`CONFIDENTIAL SALARY SLIP - ${getMonthName(payroll.month)} ${payroll.year}`, 14, 32);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Slip No: ${payroll.slipNumber}`, 140, 32);

  // Employee Information Box
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, 44, 182, 38, 3, 3, 'FD');

  doc.setTextColor(...navyColor);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('EMPLOYEE DETAILS', 18, 52);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...grayText);
  doc.text('Employee Name:', 18, 60);
  doc.text('Employee ID:', 18, 68);
  doc.text('Department:', 18, 76);

  doc.setTextColor(...navyColor);
  doc.setFont('helvetica', 'bold');
  doc.text(payroll.employeeName, 55, 60);
  doc.text(payroll.employeeCode, 55, 68);
  doc.text(payroll.departmentName, 55, 76);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...grayText);
  doc.text('Designation:', 110, 60);
  doc.text('Attendance Days:', 110, 68);
  doc.text('Payment Status:', 110, 76);

  doc.setTextColor(...navyColor);
  doc.setFont('helvetica', 'bold');
  doc.text(payroll.designation, 145, 60);
  doc.text(`${payroll.presentDays} Present / ${payroll.workingDays} Working`, 145, 68);

  doc.setTextColor(16, 185, 129); // Green
  doc.text(payroll.paymentStatus, 145, 76);

  // Attendance & Days Summary Table
  autoTable(doc, {
    startY: 88,
    theme: 'grid',
    head: [['Calendar Days', 'Working Days', 'Present Days', 'Leave Days', 'Weekly Offs', 'Holidays']],
    body: [[
      payroll.calendarDays,
      payroll.workingDays,
      payroll.presentDays,
      `${payroll.leaveDays} (Unpaid)`,
      payroll.weeklyOffsCount,
      payroll.holidaysCount
    ]],
    headStyles: { fillColor: primaryBlue, textColor: 255, fontSize: 8, fontStyle: 'bold', halign: 'center' },
    bodyStyles: { fontSize: 8, halign: 'center', textColor: navyColor },
    margin: { left: 14, right: 14 }
  });

  // Earnings & Deductions Comparison Table
  const currentY = (doc as any).lastAutoTable.finalY + 8;

  autoTable(doc, {
    startY: currentY,
    theme: 'striped',
    head: [['EARNINGS COMPONENT', 'AMOUNT (INR)', 'STATUTORY DEDUCTIONS', 'AMOUNT (INR)']],
    body: [
      ['Basic Monthly Salary', `₹${formatCurrency(payroll.basicSalary)}`, 'Provident Fund (PF)', `₹${formatCurrency(payroll.pfAmount)}`],
      ['Special Allowance', '₹0.00', 'Employee State Insurance (ESIC)', `₹${formatCurrency(payroll.esicAmount)}`],
      ['Performance Incentive', '₹0.00', 'Professional Tax (PT)', `₹${formatCurrency(payroll.ptAmount)}`],
      ['Overtime Payment (Policy)', 'DISABLED (₹0.00)', 'Additional Unpaid Leave Deductions', `₹${formatCurrency(payroll.unpaidLeaveDeduction)}`],
      ['Other Allowances', '₹0.00', 'Other Statutory Deductions', `₹${formatCurrency(payroll.otherDeductions)}`],
      ['TOTAL GROSS EARNINGS', `₹${formatCurrency(payroll.basicSalary)}`, 'TOTAL DEDUCTIONS', `₹${formatCurrency(payroll.fixedDeductions + payroll.unpaidLeaveDeduction)}`],
    ],
    headStyles: { fillColor: navyColor, textColor: 255, fontSize: 8, fontStyle: 'bold' },
    bodyStyles: { fontSize: 8 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 55 },
      1: { halign: 'right', fontStyle: 'bold', cellWidth: 35 },
      2: { fontStyle: 'bold', cellWidth: 55 },
      3: { halign: 'right', fontStyle: 'bold', cellWidth: 35 },
    },
    margin: { left: 14, right: 14 }
  });

  // Net Payable Highlight Box
  const summaryY = (doc as any).lastAutoTable.finalY + 8;
  doc.setFillColor(239, 246, 255); // Soft blue
  doc.setDrawColor(37, 99, 235);
  doc.roundedRect(14, summaryY, 182, 28, 3, 3, 'FD');

  doc.setTextColor(37, 99, 235);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('NET PAYABLE SALARY (TAKE-HOME)', 20, summaryY + 12);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...grayText);
  doc.text('(Basic ₹18,000.00 - Total Deductions ₹2,160.00 = ₹15,840.00)', 20, summaryY + 20);

  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...navyColor);
  doc.text(`₹ ${formatCurrency(payroll.netSalary)}`, 140, summaryY + 17);

  // Policy Compliance Note
  const policyY = summaryY + 34;
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...grayText);
  doc.text('Notes & Statutory Declaration:', 14, policyY);
  doc.text('1. Company Policy: Overtime is strictly disabled. No overtime allowance is credited.', 14, policyY + 5);
  doc.text('2. Monthly Leave Allowance: 4 days unpaid leave allowance. Paid leaves: zero. Excess leaves are deducted per salary divisor.', 14, policyY + 9);
  doc.text('3. Attendance logged automatically via 50-meter GPS Geofencing and verified on secure server timestamps.', 14, policyY + 13);

  // Signatures
  const signY = policyY + 28;
  doc.line(18, signY, 70, signY);
  doc.text('Employee Signature', 26, signY + 5);

  doc.line(140, signY, 192, signY);
  doc.text('Authorized HR Signatory', 145, signY + 5);

  // Save/Download PDF & Sync to Supabase Bucket ('salary-slips')
  const fileName = `Salary_Slip_${payroll.employeeCode}_${payroll.year}_${payroll.month}.pdf`;
  try {
    const pdfBlob = doc.output('blob');
    uploadSalarySlipToBucket(fileName, pdfBlob).catch((err) => {
      console.warn('Supabase storage bucket upload error:', err);
    });
  } catch (err) {
    console.warn('Could not generate PDF blob for bucket:', err);
  }

  doc.save(fileName);
}

function formatCurrency(amount: number): string {
  return amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function getMonthName(monthNumber: number): string {
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  return months[monthNumber - 1] || 'Month';
}
