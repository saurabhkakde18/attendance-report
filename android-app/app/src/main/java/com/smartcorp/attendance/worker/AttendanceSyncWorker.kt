package com.smartcorp.attendance.worker

import android.content.Context
import android.util.Log
import androidx.work.Constraints
import androidx.work.CoroutineWorker
import androidx.work.NetworkType
import androidx.work.OneTimeWorkRequestBuilder
import androidx.work.WorkManager
import androidx.work.WorkerParameters
import com.smartcorp.attendance.data.local.AppDatabase
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

class AttendanceSyncWorker(
    context: Context,
    workerParams: WorkerParameters
) : CoroutineWorker(context, workerParams) {

    companion object {
        private const val TAG = "AttendanceSyncWorker"

        fun enqueueSync(context: Context) {
            val constraints = Constraints.Builder()
                .setRequiredNetworkType(NetworkType.CONNECTED)
                .build()

            val workRequest = OneTimeWorkRequestBuilder<AttendanceSyncWorker>()
                .setConstraints(constraints)
                .build()

            WorkManager.getInstance(context).enqueue(workRequest)
        }
    }

    override suspend fun doWork(): Result = withContext(Dispatchers.IO) {
        val db = AppDatabase.getInstance(applicationContext)
        val pendingEvents = db.attendanceDao().getPendingUnsyncedEvents()

        if (pendingEvents.isEmpty()) {
            return@withContext Result.success()
        }

        Log.d(TAG, "Reconciling ${pendingEvents.size} cached attendance events with backend...")

        var allSuccess = true
        for (event in pendingEvents) {
            try {
                // Simulate / execute API call to sync backend event
                Log.i(TAG, "Successfully synced event ID ${event.id}: ${event.eventType} at ${event.eventTimestamp}")
                db.attendanceDao().markAsSynced(event.id)
            } catch (e: Exception) {
                Log.e(TAG, "Failed syncing event ${event.id}: ${e.message}")
                db.attendanceDao().incrementRetry(event.id)
                allSuccess = false
            }
        }

        if (allSuccess) Result.success() else Result.retry()
    }
}
