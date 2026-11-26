export type UserRole = 'ADMIN' | 'EMPLOYEE' | 'HR_MANAGER';

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  employeeId?: string;
  fullName: string;
}

export interface Office {
  id: string;
  officeName: string;
  address: string;
  latitude: number;
  longitude: number;
  radiusMeters: number; // Default 50m
  workingHoursStart: string; // "09:00"
  workingHoursEnd: string;   // "17:30"
  isActive: boolean;
}

export interface Shift {
  id: string;
  shiftName: string;
  startTime: string; // "09:00"
  endTime: string;   // "17:30"
  requiredWorkMinutes: number; // 480 (8 hours)
  breakMinutes: number; // 30
  gracePeriodMinutes: number; // 15
  isActive: boolean;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  description: string;
}

export interface Employee {
  id: string;
  employeeCode: string;
  fullName: string;
  email: string;
  phone: string;
  departmentId: string;
  departmentName: string;
  officeId: string;
  officeName: string;
  shiftId: string;
  shiftName: string;
  designation: string;
  joiningDate: string;
  monthlySalary: number; // 18000.00
  pfDeduction: number;   // 1840.00
  esicDeduction: number; // 120.00
  ptDeduction: number;   // 200.00
  monthlyLeaveAllowance: number; // 4
  paidLeaveAllowance: number;    // 0
  salaryDivisorType: 'CALENDAR_DAYS' | 'WORKING_DAYS' | 'FIXED_30';
  employmentStatus: 'ACTIVE' | 'ON_LEAVE' | 'SUSPENDED' | 'TERMINATED';
  password?: string; // Default: 'emp123'
}

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'HALF_DAY' | 'WEEKLY_OFF' | 'HOLIDAY' | 'ON_LEAVE';
export type AttendanceMethod = 'AUTOMATIC' | 'MANUAL' | 'ADMIN_ADJUSTED';

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  departmentName: string;
  attendanceDate: string; // "YYYY-MM-DD"
  checkIn: string | null;  // ISO timestamp or HH:mm
  checkOut: string | null; // ISO timestamp or HH:mm
  totalWorkMinutes: number;
  breakMinutes: number;
  attendanceMethod: AttendanceMethod;
  status: AttendanceStatus;
  approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  isLateArrival: boolean;
  isEarlyDeparture: boolean;
  distanceToOfficeMeters?: number;
  verificationStatus: 'VERIFIED' | 'OUTSIDE_RADIUS' | 'ACCURACY_POOR' | 'FLAGGED';
  notes?: string;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  leaveType: 'UNPAID_STANDARD' | 'CASUAL' | 'SICK' | 'EMERGENCY';
  approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  appliedOn: string;
  adminRemarks?: string;
}

export interface PayrollRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  departmentName: string;
  designation: string;
  month: number;
  year: number;
  basicSalary: number; // 18000
  calendarDays: number;
  workingDays: number;
  presentDays: number;
  absentDays: number;
  leaveDays: number;
  halfDays: number;
  holidaysCount: number;
  weeklyOffsCount: number;
  pfAmount: number;   // 1840
  esicAmount: number; // 120
  ptAmount: number;   // 200
  fixedDeductions: number; // 2160 (1840+120+200)
  unpaidLeaveDeduction: number;
  otherDeductions: number;
  netSalary: number;  // 15840 base before extra unpaid leaves
  paymentStatus: 'DRAFT' | 'APPROVED' | 'PAID' | 'LOCKED';
  approvedAt?: string;
  slipNumber: string;
}

export interface CompanySettings {
  companyName: string;
  companyCode: string;
  requiredWorkHours: number; // 8.0
  breakDurationMinutes: number; // 30
  monthlyLeaveAllowance: number; // 4
  paidLeaveAllowance: number; // 0
  defaultExitGracePeriodMinutes: number; // 10
  overtimeEnabled: boolean; // false
  salaryDivisorType: 'CALENDAR_DAYS' | 'WORKING_DAYS' | 'FIXED_30';
  defaultOfficeRadius: number; // 50m
}
