package com.smartcorp.attendance.geofence

import android.app.Notification
import android.app.Service
import android.content.Intent
import android.os.CountDownTimer
import android.os.IBinder
import android.util.Log
import androidx.core.app.NotificationCompat
import com.smartcorp.attendance.AttendanceApp
import com.smartcorp.attendance.data.local.AppDatabase
import com.smartcorp.attendance.data.local.CachedAttendanceEvent
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

class GeofenceTransitionService : Service() {

    companion object {
        const val ACTION_START_EXIT_GRACE_PERIOD = "ACTION_START_EXIT_GRACE_PERIOD"
        const val ACTION_CANCEL_GRACE_PERIOD = "ACTION_CANCEL_GRACE_PERIOD"
        private const val NOTIFICATION_ID = 5001
        private const val DEFAULT_GRACE_PERIOD_MS = 10 * 60 * 1000L // 10 Minutes Grace Period
    }

    private var graceTimer: CountDownTimer? = null

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        val action = intent?.action

        if (action == ACTION_START_EXIT_GRACE_PERIOD) {
            val exitLat = intent.getDoubleExtra("lat", 0.0)
            val exitLng = intent.getDoubleExtra("lng", 0.0)

            startForeground(NOTIFICATION_ID, buildForegroundNotification("Office Exit Grace Period Active", "10:00 remaining before automatic checkout"))

            startGracePeriodTimer(exitLat, exitLng)
        } else if (action == ACTION_CANCEL_GRACE_PERIOD) {
            graceTimer?.cancel()
            stopForeground(STOP_FOREGROUND_REMOVE)
            stopSelf()
        }

        return START_NOT_STICKY
    }

    private fun startGracePeriodTimer(lat: Double, lng: Double) {
        graceTimer?.cancel()
        graceTimer = object : CountDownTimer(DEFAULT_GRACE_PERIOD_MS, 1000) {
            override fun onTick(millisUntilFinished: Long) {
                val minutes = (millisUntilFinished / 1000) / 60
                val seconds = (millisUntilFinished / 1000) % 60
                val timeFormatted = String.format("%02d:%02d", minutes, seconds)
                updateNotification("Office Exit Grace Period Active", "$timeFormatted remaining before automatic checkout")
            }

            override fun onFinish() {
                Log.i("GracePeriodService", "10-minute grace period elapsed without return. Marking automatic checkout.")
                recordAutomaticCheckout(lat, lng)
                stopForeground(STOP_FOREGROUND_REMOVE)
                stopSelf()
            }
        }.start()
    }

    private fun recordAutomaticCheckout(lat: Double, lng: Double) {
        CoroutineScope(Dispatchers.IO).launch {
            val db = AppDatabase.getInstance(applicationContext)
            val event = CachedAttendanceEvent(
                employeeId = "CURRENT_EMPLOYEE",
                eventType = "AUTO_CHECK_OUT",
                latitude = lat,
                longitude = lng,
                accuracyMeters = 15f,
                eventTimestamp = System.currentTimeMillis(),
                source = "ANDROID_GEOFENCE",
                isSynced = false
            )
            db.attendanceDao().insertEvent(event)
            com.smartcorp.attendance.worker.AttendanceSyncWorker.enqueueSync(applicationContext)
        }
    }

    private fun buildForegroundNotification(title: String, text: String): Notification {
        return NotificationCompat.Builder(this, AttendanceApp.CHANNEL_GEOFENCE_ID)
            .setSmallIcon(android.R.drawable.ic_menu_mylocation)
            .setContentTitle(title)
            .setContentText(text)
            .setOngoing(true)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .build()
    }

    private fun updateNotification(title: String, text: String) {
        val manager = getSystemService(NOTIFICATION_SERVICE) as android.app.NotificationManager
        manager.notify(NOTIFICATION_ID, buildForegroundNotification(title, text))
    }

    override fun onDestroy() {
        graceTimer?.cancel()
        super.onDestroy()
    }

    override fun onBind(intent: Intent?): IBinder? = null
}
