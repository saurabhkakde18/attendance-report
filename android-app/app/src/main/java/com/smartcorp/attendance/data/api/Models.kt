package com.smartcorp.attendance.data.api

data class LoginRequest(
    val employeeCode: String,
    val password: String,
    val fcmToken: String? = null
)

data class LoginResponse(
    val success: Boolean,
    val token: String?,
    val employee: EmployeeDto?,
    val office: OfficeDto?,
    val message: String?
)

data class EmployeeDto(
    val id: String,
    val employeeCode: String,
    val fullName: String,
    val email: String,
    val phone: String,
    val designation: String,
    val departmentName: String,
    val monthlySalary: Double,
    val pfDeduction: Double = 1840.0,
    val esicDeduction: Double = 120.0,
    val ptDeduction: Double = 200.0,
    val netSalary: Double = 15840.0,
    val monthlyLeaveAllowance: Int = 4
)

data class OfficeDto(
    val id: String,
    val officeName: String,
    val latitude: Double,
    val longitude: Double,
    val radiusMeters: Int = 50,
    val exitGracePeriodMinutes: Int = 10
)

data class GeofenceEventRequest(
    val employeeId: String,
    val eventType: String, // GEOFENCE_ENTER, GEOFENCE_EXIT, AUTO_CHECK_IN, AUTO_CHECK_OUT, MANUAL_CHECK_IN, MANUAL_CHECK_OUT
    val latitude: Double,
    val longitude: Double,
    val accuracyMeters: Float,
    val timestampIso: String,
    val source: String,
    val reason: String? = null
)

data class AttendanceResponse(
    val success: Boolean,
    val message: String,
    val attendanceId: String?,
    val checkInTime: String?,
    val checkOutTime: String?,
    val totalWorkMinutes: Int,
    val status: String
)

data class DailyAttendanceDto(
    val date: String,
    val checkIn: String?,
    val checkOut: String?,
    val totalWorkMinutes: Int,
    val status: String, // PRESENT, ABSENT, HALF_DAY, WEEKLY_OFF, HOLIDAY, ON_LEAVE
    val method: String,
    val isLate: Boolean,
    val isEarly: Boolean
)

data class LeaveApplicationRequest(
    val employeeId: String,
    val startDate: String,
    val endDate: String,
    val reason: String,
    val leaveType: String = "UNPAID_STANDARD"
)

data class LeaveItemDto(
    val id: String,
    val startDate: String,
    val endDate: String,
    val totalDays: Double,
    val reason: String,
    val status: String,
    val appliedOn: String
)

data class PayrollSummaryDto(
    val month: Int,
    val year: Int,
    val basicSalary: Double, // 18000.00
    val pfAmount: Double, // 1840.00
    val esicAmount: Double, // 120.00
    val ptAmount: Double, // 200.00
    val fixedDeductions: Double, // 2160.00
    val unpaidLeaveDeductions: Double,
    val netSalary: Double, // 15840.00
    val paymentStatus: String,
    val slipNumber: String?
)
