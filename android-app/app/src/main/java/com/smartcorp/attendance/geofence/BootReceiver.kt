package com.smartcorp.attendance.geofence

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.util.Log

class BootReceiver : BroadcastReceiver() {
    companion object {
        private const val TAG = "BootReceiver"
    }

    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action == Intent.ACTION_BOOT_COMPLETED || intent.action == Intent.ACTION_MY_PACKAGE_REPLACED) {
            Log.i(TAG, "Device reboot or package update detected. Restoring 50m office geofences...")
            val geofenceManager = GeofenceManager(context)
            geofenceManager.registerOfficeGeofence(
                onSuccess = { Log.i(TAG, "Re-registered office geofence successfully after reboot.") },
                onError = { e -> Log.e(TAG, "Failed to restore geofence after reboot: ${e.message}") }
            )
        }
    }
}
