package com.smartcorp.attendance.data.local

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query

@Dao
interface AttendanceDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertEvent(event: CachedAttendanceEvent): Long

    @Query("SELECT * FROM cached_attendance_events WHERE isSynced = 0 ORDER BY eventTimestamp ASC")
    suspend fun getPendingUnsyncedEvents(): List<CachedAttendanceEvent>

    @Query("UPDATE cached_attendance_events SET isSynced = 1 WHERE id = :id")
    suspend fun markAsSynced(id: Long)

    @Query("UPDATE cached_attendance_events SET retryCount = retryCount + 1 WHERE id = :id")
    suspend fun incrementRetry(id: Long)

    @Query("DELETE FROM cached_attendance_events WHERE isSynced = 1 AND eventTimestamp < :cutoffTime")
    suspend fun cleanOldSyncedEvents(cutoffTime: Long)
}
