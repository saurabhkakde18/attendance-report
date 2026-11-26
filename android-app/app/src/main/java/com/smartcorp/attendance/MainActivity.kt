package com.smartcorp.attendance

import android.Manifest
import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.core.content.ContextCompat
import com.smartcorp.attendance.geofence.GeofenceManager
import com.smartcorp.attendance.ui.screens.*
import com.smartcorp.attendance.ui.theme.NavyDark
import com.smartcorp.attendance.ui.theme.PrimaryBlue
import com.smartcorp.attendance.ui.theme.SmartAttendanceTheme

class MainActivity : ComponentActivity() {

    private lateinit var geofenceManager: GeofenceManager

    // Permission launcher for Location and Notifications
    private val locationPermissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestMultiplePermissions()
    ) { permissions ->
        val fineLocationGranted = permissions[Manifest.permission.ACCESS_FINE_LOCATION] ?: false
        val coarseLocationGranted = permissions[Manifest.permission.ACCESS_COARSE_LOCATION] ?: false

        if (fineLocationGranted || coarseLocationGranted) {
            setupOfficeGeofence()
            checkBackgroundLocation()
        } else {
            Toast.makeText(this, "GPS location permission required for automatic office attendance", Toast.LENGTH_LONG).show()
        }
    }

    private val backgroundLocationLauncher = registerForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) { granted ->
        if (granted) {
            Toast.makeText(this, "Background location active for 50m automatic attendance", Toast.LENGTH_SHORT).show()
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        geofenceManager = GeofenceManager(this)

        requestInitialPermissions()

        setContent {
            SmartAttendanceTheme {
                MainAppContainer(
                    onTriggerGeofenceSetup = { setupOfficeGeofence() }
                )
            }
        }
    }

    private fun requestInitialPermissions() {
        val permissions = mutableListOf(
            Manifest.permission.ACCESS_FINE_LOCATION,
            Manifest.permission.ACCESS_COARSE_LOCATION
        )
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            permissions.add(Manifest.permission.POST_NOTIFICATIONS)
        }

        locationPermissionLauncher.launch(permissions.toTypedArray())
    }

    private fun checkBackgroundLocation() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_BACKGROUND_LOCATION)
                != PackageManager.PERMISSION_GRANTED) {
                backgroundLocationLauncher.launch(Manifest.permission.ACCESS_BACKGROUND_LOCATION)
            }
        }
    }

    private fun setupOfficeGeofence() {
        geofenceManager.registerOfficeGeofence(
            onSuccess = {
                runOnUiThread {
                    Toast.makeText(this, "Office geofence (50m) active", Toast.LENGTH_SHORT).show()
                }
            },
            onError = { e ->
                runOnUiThread {
                    Toast.makeText(this, "Geofence registration: ${e.message}", Toast.LENGTH_SHORT).show()
                }
            }
        )
    }
}

@Composable
fun MainAppContainer(
    onTriggerGeofenceSetup: () -> Unit
) {
    var isLoggedIn by remember { mutableStateOf(true) }
    var currentTab by remember { mutableStateOf(0) } // 0: Home, 1: Attendance, 2: Salary, 3: Leave, 4: Profile

    if (!isLoggedIn) {
        LoginScreen(onLoginSuccess = { isLoggedIn = true })
        return
    }

    Scaffold(
        bottomBar = {
            NavigationBar(
                containerColor = MaterialTheme.colorScheme.surface
            ) {
                NavigationBarItem(
                    selected = currentTab == 0,
                    onClick = { currentTab = 0 },
                    icon = { Icon(Icons.Default.Home, contentDescription = "Home") },
                    label = { Text("Home") }
                )
                NavigationBarItem(
                    selected = currentTab == 1,
                    onClick = { currentTab = 1 },
                    icon = { Icon(Icons.Default.DateRange, contentDescription = "Attendance") },
                    label = { Text("Attendance") }
                )
                NavigationBarItem(
                    selected = currentTab == 2,
                    onClick = { currentTab = 2 },
                    icon = { Icon(Icons.Default.Payments, contentDescription = "Salary") },
                    label = { Text("Salary") }
                )
                NavigationBarItem(
                    selected = currentTab == 3,
                    onClick = { currentTab = 3 },
                    icon = { Icon(Icons.Default.EventBusy, contentDescription = "Leaves") },
                    label = { Text("Leaves") }
                )
                NavigationBarItem(
                    selected = currentTab == 4,
                    onClick = { currentTab = 4 },
                    icon = { Icon(Icons.Default.Person, contentDescription = "Profile") },
                    label = { Text("Profile") }
                )
            }
        }
    ) { innerPadding ->
        Surface(modifier = Modifier.padding(innerPadding)) {
            when (currentTab) {
                0 -> HomeScreen(
                    onManualCheckIn = {},
                    onManualCheckOut = {}
                )
                1 -> AttendanceScreen()
                2 -> SalaryScreen(onDownloadPdf = {})
                3 -> LeaveScreen()
                4 -> ProfileScreen(onLogout = { isLoggedIn = false })
            }
        }
    }
}
