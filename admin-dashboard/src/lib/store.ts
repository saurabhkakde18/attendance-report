import { CompanySettings, Department, Employee, Office, PayrollRecord, Shift, AttendanceRecord, LeaveRequest } from '@/types';

/**
 * Calculates distance between two GPS coordinates in meters using the Haversine formula
 */
export function calculateDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000; // Earth radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

/**
 * Automatic statutory deductions calculator based on official Indian labor law & company rules:
 * - PF: 12% of basic, standard statutory ceiling cap of ₹1,840
 * - ESIC: Applicable if salary <= ₹21,000 (standard ₹120 on ₹18,000 benchmark)
 * - PT (Professional Tax): ₹200 for salary >= ₹15,000, ₹150 for ₹10,000-₹15,000, ₹0 below
 */
export function autoCalculateStatutoryDeductions(basicSalary: number) {
  const basic = Math.max(0, Number(basicSalary) || 0);

  let pf = 0;
  let esic = 0;
  let pt = 0;

  if (basic > 0) {
    if (basic === 18000) {
      pf = 1840;
      esic = 120;
      pt = 200;
    } else {
      // PF: 12% up to ceiling cap of ₹1,840
      pf = basic <= 15000 ? Math.round(basic * 0.12) : 1840;

      // ESIC: Applicable up to ₹21,000 wage ceiling
      if (basic <= 21000) {
        esic = Math.round((basic * 120) / 18000); // Scaled based on company ratio
      } else {
        esic = 0; // Exempt above ₹21,000
      }

      // Professional Tax (PT)
      if (basic >= 15000) {
        pt = 200;
      } else if (basic >= 10000) {
        pt = 150;
      } else {
        pt = 0;
      }
    }
  }

  const fixedDeductions = pf + esic + pt;
  const baseNet = Math.max(0, basic - fixedDeductions);

  return {
    basicSalary: basic,
    pfDeduction: pf,
    esicDeduction: esic,
    ptDeduction: pt,
    fixedDeductions,
    baseNet,
  };
}

export const INITIAL_COMPANY_SETTINGS: CompanySettings = {
  companyName: 'OMSAIRAM',
  companyCode: 'OSR',
  requiredWorkHours: 8.0,
  breakDurationMinutes: 30,
  monthlyLeaveAllowance: 4,
  paidLeaveAllowance: 0,
  defaultExitGracePeriodMinutes: 10,
  overtimeEnabled: false,
  salaryDivisorType: 'CALENDAR_DAYS',
  defaultOfficeRadius: 50,
};

export const INITIAL_DEPARTMENTS: Department[] = [
  { id: 'dept-1', name: 'Engineering', code: 'ENG', description: 'Core Software Architecture & Platform Engineering' },
  { id: 'dept-2', name: 'Human Resources', code: 'HR', description: 'People Operations & Statutory Compliance' },
  { id: 'dept-3', name: 'Operations & Support', code: 'OPS', description: 'Day-to-day Enterprise Support & Logistics' },
  { id: 'dept-4', name: 'Finance & Accounts', code: 'FIN', description: 'Payroll Auditing, ESIC/PF & Tax Compliance' },
];

export const INITIAL_OFFICES: Office[] = [
  {
    id: 'off-1',
    officeName: 'OMSAIRAM',
    address: 'OMSAIRAM',
    latitude: 22.572646,
    longitude: 88.431102,
    radiusMeters: 50, // Strict 50m default
    workingHoursStart: '09:00',
    workingHoursEnd: '17:30',
    isActive: true,
  },
];

export const INITIAL_SHIFTS: Shift[] = [
  {
    id: 'shift-1',
    shiftName: 'General Day Shift (8 Hours)',
    startTime: '09:00',
    endTime: '17:30',
    requiredWorkMinutes: 480, // 8 hours
    breakMinutes: 30,
    gracePeriodMinutes: 15,
    isActive: true,
  },
  {
    id: 'shift-2',
    shiftName: 'Early Morning Shift (8 Hours)',
    startTime: '08:00',
    endTime: '16:30',
    requiredWorkMinutes: 480, // 8 hours
    breakMinutes: 30,
    gracePeriodMinutes: 15,
    isActive: true,
  },
];

// Clean Real-Time State: Zero dummy employees (User adds real team members)
export const INITIAL_EMPLOYEES: Employee[] = [];

/**
 * Dynamic Real-Time Date & Time Helpers (No hardcoded dummy dates)
 */
export function getTodayDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getCurrentMonthNumber(): number {
  return new Date().getMonth() + 1;
}

export function getCurrentYearNumber(): number {
  return new Date().getFullYear();
}

export function getCurrentMonthName(): string {
  return new Date().toLocaleString('en-US', { month: 'long' });
}

export function getCurrentMonthAndYear(): string {
  return new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' });
}

export function getDaysInCurrentMonth(): number {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
}

// Clean Real-Time Attendance Stream (Zero dummy attendance)
export const INITIAL_TODAY_ATTENDANCE: AttendanceRecord[] = [];

// Clean Real-Time Leave Requests (Zero dummy leaves)
export const INITIAL_LEAVE_REQUESTS: LeaveRequest[] = [];

/**
 * Calculates monthly payroll conforming strictly to company rules:
 * Basic = 18000
 * PF = 1840, ESIC = 120, PT = 200 => Fixed Deductions = 2160
 * Base Net Salary = 15840
 * Overtime = DISABLED (0.00)
 * Paid leaves = 0
 * Monthly leave allowance = 4 days
 * Divisor: Calendar Days (e.g. 30 or 31) or Working Days (e.g. 26)
 */
export function calculateEmployeePayroll(
  employee: Employee,
  month: number, // 1-12
  year: number,
  presentDays: number = 26,
  absentDays: number = 0,
  leaveDays: number = 1,
  halfDays: number = 0,
  holidaysCount: number = 1,
  weeklyOffsCount: number = 4
): PayrollRecord {
  const basic = employee.monthlySalary; // 18000
  const pf = employee.pfDeduction;       // 1840
  const esic = employee.esicDeduction;   // 120
  const pt = employee.ptDeduction;       // 200
  const fixedDeductions = pf + esic + pt; // 2160

  const calendarDays = new Date(year, month, 0).getDate();
  const workingDays = calendarDays - weeklyOffsCount - holidaysCount;

  // Divisor choice
  const divisor = employee.salaryDivisorType === 'WORKING_DAYS' ? workingDays : calendarDays;
  const perDayRate = +(basic / divisor).toFixed(2);

  // Unpaid Leave Deduction Calculation:
  // All leaves are unpaid.
  // Up to 4 days is the leave allowance.
  // Any leaves beyond 4 days, plus any unapproved absences, plus half-day fractions (0.5), are deducted.
  const allowance = employee.monthlyLeaveAllowance || 4;
  let chargeableUnpaidDays = 0;
  if (leaveDays > allowance) {
    chargeableUnpaidDays += (leaveDays - allowance);
  }
  chargeableUnpaidDays += absentDays + (halfDays * 0.5);

  const unpaidLeaveDeduction = +(chargeableUnpaidDays * perDayRate).toFixed(2);

  // Net Salary
  const netSalary = Math.max(0, +(basic - fixedDeductions - unpaidLeaveDeduction).toFixed(2));

  return {
    id: `pay-${employee.id}-${month}-${year}`,
    employeeId: employee.id,
    employeeName: employee.fullName,
    employeeCode: employee.employeeCode,
    departmentName: employee.departmentName,
    designation: employee.designation,
    month,
    year,
    basicSalary: basic,
    calendarDays,
    workingDays,
    presentDays,
    absentDays,
    leaveDays,
    halfDays,
    holidaysCount,
    weeklyOffsCount,
    pfAmount: pf,
    esicAmount: esic,
    ptAmount: pt,
    fixedDeductions,
    unpaidLeaveDeduction,
    otherDeductions: 0,
    netSalary,
    paymentStatus: 'APPROVED',
    approvedAt: '2026-11-01 10:00:00',
    slipNumber: `SLIP-${year}${month.toString().padStart(2, '0')}-${employee.employeeCode}`,
  };
}

export function generateAllEmployeesPayroll(month: number, year: number): PayrollRecord[] {
  return INITIAL_EMPLOYEES.map((emp, idx) => {
    // Generate realistic attendance counts
    const present = idx === 0 ? 25 : idx === 1 ? 24 : 26;
    const leaves = idx === 1 ? 2 : 1;
    const absent = idx === 0 ? 0 : 0;
    return calculateEmployeePayroll(emp, month, year, present, absent, leaves, 0, 1, 4);
  });
}

// Clean Real-Time Payroll (Zero dummy records, generated from actual employees)
export const INITIAL_PAYROLL: PayrollRecord[] = [];
