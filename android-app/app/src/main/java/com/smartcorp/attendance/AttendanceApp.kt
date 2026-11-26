package com.smartcorp.attendance

import android.app.Application
import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context
import android.os.Build

class AttendanceApp : Application() {

    companion object {
        const val CHANNEL_GEOFENCE_ID = "channel_geofence_attendance"
        const val CHANNEL_GEOFENCE_NAME = "GPS Geofence Attendance"
        const val CHANNEL_PAYROLL_ID = "channel_payroll_notifications"
        const val CHANNEL_PAYROLL_NAME = "Payroll & Leave Alerts"
        lateinit var instance: AttendanceApp
            private set
    }

    override fun onCreate() {
        super.onCreate()
        instance = this
        createNotificationChannels()
    }

    private fun createNotificationChannels() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

            val geofenceChannel = NotificationChannel(
                CHANNEL_GEOFENCE_ID,
                CHANNEL_GEOFENCE_NAME,
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = "Real-time automatic geofence check-in and checkout alerts"
                enableLights(true)
                enableVibration(true)
            }

            val payrollChannel = NotificationChannel(
                CHANNEL_PAYROLL_ID,
                CHANNEL_PAYROLL_NAME,
                NotificationManager.IMPORTANCE_DEFAULT
            ).apply {
                description = "Notifications regarding payroll generation, salary slips, and leave status"
            }

            notificationManager.createNotificationChannel(geofenceChannel)
            notificationManager.createNotificationChannel(payrollChannel)
        }
    }
}
