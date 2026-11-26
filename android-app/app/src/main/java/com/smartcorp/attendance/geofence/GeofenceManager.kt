package com.smartcorp.attendance.geofence

import android.annotation.SuppressLint
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.util.Log
import com.google.android.gms.location.Geofence
import com.google.android.gms.location.GeofencingClient
import com.google.android.gms.location.GeofencingRequest
import com.google.android.gms.location.LocationServices
import com.smartcorp.attendance.BuildConfig

class GeofenceManager(private val context: Context) {

    private val geofencingClient: GeofencingClient = LocationServices.getGeofencingClient(context)

    companion object {
        private const val TAG = "GeofenceManager"
        const val GEOFENCE_REQUEST_ID_OFFICE = "OFFICE_PRIMARY_GEOFENCE"
        const val DEFAULT_RADIUS_METERS = 50f // STRICT 50 METERS REQUIREMENT
        const val GEOFENCE_EXPIRATION_MS = Geofence.NEVER_EXPIRE
        const val LOITERING_DELAY_MS = 10000 // 10 seconds dwell
    }

    private val geofencePendingIntent: PendingIntent by lazy {
        val intent = Intent(context, GeofenceBroadcastReceiver::class.java)
        PendingIntent.getBroadcast(
            context,
            2001,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_MUTABLE
        )
    }

    @SuppressLint("MissingPermission")
    fun registerOfficeGeofence(
        latitude: Double = BuildConfig.DEFAULT_OFFICE_LAT.toDouble(),
        longitude: Double = BuildConfig.DEFAULT_OFFICE_LNG.toDouble(),
        radiusMeters: Float = DEFAULT_RADIUS_METERS,
        onSuccess: () -> Unit = {},
        onError: (Exception) -> Unit = {}
    ) {
        val geofence = Geofence.Builder()
            .setRequestId(GEOFENCE_REQUEST_ID_OFFICE)
            .setCircularRegion(latitude, longitude, radiusMeters)
            .setExpirationDuration(GEOFENCE_EXPIRATION_MS)
            .setTransitionTypes(
                Geofence.GEOFENCE_TRANSITION_ENTER or
                Geofence.GEOFENCE_TRANSITION_EXIT or
                Geofence.GEOFENCE_TRANSITION_DWELL
            )
            .setLoiteringDelay(LOITERING_DELAY_MS)
            .build()

        val geofencingRequest = GeofencingRequest.Builder()
            .setInitialTrigger(GeofencingRequest.INITIAL_TRIGGER_ENTER or GeofencingRequest.INITIAL_TRIGGER_DWELL)
            .addGeofence(geofence)
            .build()

        geofencingClient.addGeofences(geofencingRequest, geofencePendingIntent).run {
            addOnSuccessListener {
                Log.i(TAG, "Successfully registered 50m office geofence at ($latitude, $longitude)")
                onSuccess()
            }
            addOnFailureListener { exception ->
                Log.e(TAG, "Failed to register office geofence: ${exception.message}", exception)
                onError(exception)
            }
        }
    }

    fun removeGeofences(onComplete: () -> Unit = {}) {
        geofencingClient.removeGeofences(geofencePendingIntent).run {
            addOnCompleteListener { onComplete() }
        }
    }
}
