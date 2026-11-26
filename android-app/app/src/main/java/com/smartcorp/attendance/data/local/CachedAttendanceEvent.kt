package com.smartcorp.attendance.data.local

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "cached_attendance_events")
data class CachedAttendanceEvent(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    val employeeId: String,
    val eventType: String, // GEOFENCE_ENTER, GEOFENCE_EXIT, MANUAL_CHECK_IN, MANUAL_CHECK_OUT
    val latitude: Double,
    val longitude: Double,
    val accuracyMeters: Float,
    val eventTimestamp: Long, // Epoch millis
    val source: String, // ANDROID_GEOFENCE, ANDROID_MANUAL
    val isSynced: Boolean = false,
    val retryCount: Int = 0
)
