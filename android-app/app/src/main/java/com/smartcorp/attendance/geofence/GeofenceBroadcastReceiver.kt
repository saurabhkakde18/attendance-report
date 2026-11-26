package com.smartcorp.attendance.geofence

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.os.Build
import android.util.Log
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import com.google.android.gms.location.Geofence
import com.google.android.gms.location.GeofencingEvent
import com.smartcorp.attendance.AttendanceApp
import com.smartcorp.attendance.R
import com.smartcorp.attendance.data.local.AppDatabase
import com.smartcorp.attendance.data.local.CachedAttendanceEvent
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

class GeofenceBroadcastReceiver : BroadcastReceiver() {

    companion object {
        private const val TAG = "GeofenceReceiver"
    }

    override fun onReceive(context: Context, intent: Intent) {
        val geofencingEvent = GeofencingEvent.fromIntent(intent) ?: return

        if (geofencingEvent.hasError()) {
            val errorMessage = "Geofencing error code: ${geofencingEvent.errorCode}"
            Log.e(TAG, errorMessage)
            return
        }

        val transitionType = geofencingEvent.geofenceTransition
        val triggeringLocation = geofencingEvent.triggeringLocation
        val timestamp = System.currentTimeMillis()

        Log.d(TAG, "Geofence transition triggered: $transitionType, loc: $triggeringLocation")

        when (transitionType) {
            Geofence.GEOFENCE_TRANSITION_ENTER, Geofence.GEOFENCE_TRANSITION_DWELL -> {
                // 1. Employee entered 50-meter office geofence
                // 2. Automatically initiate check-in process
                showNotification(
                    context,
                    "Office Geofence Detected",
                    "Entered office radius (50m). Processing automatic check-in..."
                )

                triggerAttendanceEvent(
                    context = context,
                    eventType = "AUTO_CHECK_IN",
                    lat = triggeringLocation?.latitude ?: 0.0,
                    lng = triggeringLocation?.longitude ?: 0.0,
                    accuracy = triggeringLocation?.accuracy ?: 10f,
                    timestamp = timestamp
                )
            }

            Geofence.GEOFENCE_TRANSITION_EXIT -> {
                // 1. Employee exited 50-meter office geofence
                // 2. Start 10-minute grace period foreground service
                showNotification(
                    context,
                    "Exited Office Geofence",
                    "Grace period (10 mins) started. Checkout will be recorded if you do not return."
                )

                val serviceIntent = Intent(context, GeofenceTransitionService::class.java).apply {
                    action = GeofenceTransitionService.ACTION_START_EXIT_GRACE_PERIOD
                    putExtra("exit_timestamp", timestamp)
                    putExtra("lat", triggeringLocation?.latitude ?: 0.0)
                    putExtra("lng", triggeringLocation?.longitude ?: 0.0)
                }

                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    context.startForegroundService(serviceIntent)
                } else {
                    context.startService(serviceIntent)
                }
            }
        }
    }

    private fun triggerAttendanceEvent(
        context: Context,
        eventType: String,
        lat: Double,
        lng: Double,
        accuracy: Float,
        timestamp: Long
    ) {
        CoroutineScope(Dispatchers.IO).launch {
            val db = AppDatabase.getInstance(context)
            val event = CachedAttendanceEvent(
                employeeId = "CURRENT_EMPLOYEE",
                eventType = eventType,
                latitude = lat,
                longitude = lng,
                accuracyMeters = accuracy,
                eventTimestamp = timestamp,
                source = "ANDROID_GEOFENCE",
                isSynced = false
            )
            db.attendanceDao().insertEvent(event)
            // Trigger sync worker
            com.smartcorp.attendance.worker.AttendanceSyncWorker.enqueueSync(context)
        }
    }

    private fun showNotification(context: Context, title: String, content: String) {
        try {
            val builder = NotificationCompat.Builder(context, AttendanceApp.CHANNEL_GEOFENCE_ID)
                .setSmallIcon(android.R.drawable.ic_dialog_info)
                .setContentTitle(title)
                .setContentText(content)
                .setPriority(NotificationCompat.PRIORITY_HIGH)
                .setAutoCancel(true)

            NotificationManagerCompat.from(context).notify(System.currentTimeMillis().toInt(), builder.build())
        } catch (e: SecurityException) {
            Log.w(TAG, "Notification permission not granted: ${e.message}")
        }
    }
}
