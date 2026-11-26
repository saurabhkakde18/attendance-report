package com.smartcorp.attendance.data.api

import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.Path
import retrofit2.http.Query

interface AttendanceApiService {

    @POST("auth/employee-login")
    suspend fun login(
        @Body request: LoginRequest
    ): Response<LoginResponse>

    @POST("attendance/geofence-event")
    suspend fun sendGeofenceEvent(
        @Body request: GeofenceEventRequest
    ): Response<AttendanceResponse>

    @POST("attendance/manual-checkin")
    suspend fun manualCheckIn(
        @Body request: GeofenceEventRequest
    ): Response<AttendanceResponse>

    @POST("attendance/manual-checkout")
    suspend fun manualCheckOut(
        @Body request: GeofenceEventRequest
    ): Response<AttendanceResponse>

    @GET("attendance/monthly-summary/{employeeId}")
    suspend fun getMonthlyAttendance(
        @Path("employeeId") employeeId: String,
        @Query("month") month: Int,
        @Query("year") year: Int
    ): Response<List<DailyAttendanceDto>>

    @POST("leaves/apply")
    suspend fun applyLeave(
        @Body request: LeaveApplicationRequest
    ): Response<Map<String, Any>>

    @GET("leaves/history/{employeeId}")
    suspend fun getLeaveHistory(
        @Path("employeeId") employeeId: String
    ): Response<List<LeaveItemDto>>

    @GET("payroll/summary/{employeeId}")
    suspend fun getPayrollSummary(
        @Path("employeeId") employeeId: String,
        @Query("month") month: Int,
        @Query("year") year: Int
    ): Response<PayrollSummaryDto>
}
