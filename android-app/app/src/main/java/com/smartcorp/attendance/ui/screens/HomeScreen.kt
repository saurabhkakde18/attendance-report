package com.smartcorp.attendance.ui.screens

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.smartcorp.attendance.ui.theme.*
import kotlinx.coroutines.delay

@Composable
fun HomeScreen(
    employeeName: String = "Rahul Sharma",
    employeeCode: String = "EMP001",
    officeName: String = "OMSAIRAM",
    onManualCheckIn: () -> Unit = {},
    onManualCheckOut: () -> Unit = {}
) {
    // Attendance Session State: Starts strictly from ZERO (00:00:00) upon Check-In
    var isCheckedIn by remember { mutableStateOf(false) }
    var checkInTimeText by remember { mutableStateOf("--:--") }
    var checkOutTimeText by remember { mutableStateOf("--:--") }
    var elapsedSeconds by remember { mutableLongStateOf(0L) } // Starts strictly at ZERO (00:00:00)
    val requiredTotalSeconds = 8 * 3600 // Strictly 8 Hours (NO Overtime)

    // Live timer tick from ZERO
    LaunchedEffect(isCheckedIn) {
        while (isCheckedIn) {
            delay(1000L)
            elapsedSeconds++
        }
    }

    val workingHours = elapsedSeconds / 3600
    val workingMinutes = (elapsedSeconds % 3600) / 60
    val workingSecs = elapsedSeconds % 60
    val workingTimeFormatted = String.format("%02d:%02d:%02d", workingHours, workingMinutes, workingSecs)

    val remainingSeconds = (requiredTotalSeconds - elapsedSeconds).coerceAtLeast(0)
    val remainingHours = remainingSeconds / 3600
    val remainingMins = (remainingSeconds % 3600) / 60
    val remainingTimeFormatted = String.format("%02dh %02dm", remainingHours, remainingMins)

    val progress = (elapsedSeconds.toFloat() / requiredTotalSeconds.toFloat()).coerceIn(0f, 1f)

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(LightBackground)
            .verticalScroll(rememberScrollState())
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // Top Welcome Card
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = NavyDark)
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(20.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Column {
                    Text(
                        text = "Welcome back,",
                        color = Color.LightGray,
                        fontSize = 14.sp
                    )
                    Text(
                        text = employeeName,
                        color = Color.White,
                        fontSize = 20.sp,
                        fontWeight = FontWeight.Bold
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = "ID: $employeeCode • General Shift (8h)",
                        color = AccentBlue,
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Medium
                    )
                }

                Box(
                    modifier = Modifier
                        .size(48.dp)
                        .clip(CircleShape)
                        .background(PrimaryBlue),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = employeeName.take(2).uppercase(),
                        color = Color.White,
                        fontWeight = FontWeight.Bold,
                        fontSize = 18.sp
                    )
                }
            }
        }

        // GPS Geofence Radar Status Card (50m Radius)
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = CardBackground)
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            imageVector = Icons.Default.LocationOn,
                            contentDescription = "GPS",
                            tint = SuccessGreen,
                            modifier = Modifier.size(24.dp)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = "Office Geofence Status",
                            fontWeight = FontWeight.SemiBold,
                            fontSize = 15.sp,
                            color = NavyDark
                        )
                    }

                    Badge(
                        containerColor = SuccessGreenLight,
                        contentColor = SuccessGreen
                    ) {
                        Text(
                            text = "INSIDE 50M RADIUS",
                            fontWeight = FontWeight.Bold,
                            fontSize = 11.sp,
                            modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                        )
                    }
                }

                Spacer(modifier = Modifier.height(12.dp))

                Text(
                    text = officeName,
                    fontSize = 13.sp,
                    color = NeutralGray
                )
                Text(
                    text = "GPS Accuracy: ±6 meters • Geofence Radius: 50m • Exit Grace: 10m",
                    fontSize = 11.sp,
                    color = PrimaryBlue,
                    modifier = Modifier.padding(top = 4.dp)
                )
            }
        }

        // Live 8-Hour Working Timer Card (NO OVERTIME)
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = CardBackground)
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(20.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text(
                    text = "TODAY'S WORKING TIMER",
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold,
                    color = NeutralGray,
                    letterSpacing = 1.sp
                )

                Spacer(modifier = Modifier.height(12.dp))

                Text(
                    text = workingTimeFormatted,
                    fontSize = 36.sp,
                    fontWeight = FontWeight.ExtraBold,
                    color = NavyDark
                )

                Spacer(modifier = Modifier.height(8.dp))

                LinearProgressIndicator(
                    progress = { progress },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(8.dp)
                        .clip(RoundedCornerShape(4.dp)),
                    color = if (progress >= 1f) SuccessGreen else PrimaryBlue,
                    trackColor = DividerBorder
                )

                Spacer(modifier = Modifier.height(12.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Column(horizontalAlignment = Alignment.Start) {
                        Text("Required Hours", fontSize = 11.sp, color = NeutralGray)
                        Text("8 Hours 00m", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = NavyDark)
                    }
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text("Approved Break", fontSize = 11.sp, color = NeutralGray)
                        Text("30 Minutes", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = NavyDark)
                    }
                    Column(horizontalAlignment = Alignment.End) {
                        Text("Remaining to 8h", fontSize = 11.sp, color = NeutralGray)
                        Text(remainingTimeFormatted, fontSize = 13.sp, fontWeight = FontWeight.Bold, color = if (remainingSeconds > 0) WarningYellow else SuccessGreen)
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                // Overtime Disclaimer
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(SoftBlue, RoundedCornerShape(8.dp))
                        .padding(8.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = "Company Policy: Overtime is DISABLED. Benchmark is strictly 8 working hours.",
                        fontSize = 11.sp,
                        color = PrimaryBlue,
                        fontWeight = FontWeight.Medium
                    )
                }
            }
        }

        // Daily Check-in / Check-out Details Card
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = CardBackground)
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp),
                horizontalArrangement = Arrangement.SpaceAround
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text("Check-In Time", fontSize = 12.sp, color = NeutralGray)
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(checkInTimeText, fontSize = 16.sp, fontWeight = FontWeight.Bold, color = SuccessGreen)
                    Text("Automatic (50m GPS)", fontSize = 10.sp, color = NeutralGray)
                }

                Box(
                    modifier = Modifier
                        .width(1.dp)
                        .height(40.dp)
                        .background(DividerBorder)
                )

                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text("Check-Out Time", fontSize = 12.sp, color = NeutralGray)
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(checkOutTimeText, fontSize = 16.sp, fontWeight = FontWeight.Bold, color = NeutralGray)
                    Text("Pending (Grace: 10m)", fontSize = 10.sp, color = NeutralGray)
                }
            }
        }

        // Manual Check-in / Check-out Action Buttons (with GPS location verification)
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            Button(
                onClick = {
                    isCheckedIn = true
                    elapsedSeconds = 0L // Starts timer strictly at 00:00:00
                    val formatter = java.text.SimpleDateFormat("hh:mm a", java.util.Locale.getDefault())
                    checkInTimeText = formatter.format(java.util.Date())
                    onManualCheckIn()
                },
                modifier = Modifier
                    .weight(1f)
                    .height(52.dp),
                shape = RoundedCornerShape(12.dp),
                colors = ButtonDefaults.buttonColors(containerColor = SuccessGreen),
                enabled = !isCheckedIn
            ) {
                Icon(Icons.Default.Login, contentDescription = null, modifier = Modifier.size(18.dp))
                Spacer(modifier = Modifier.width(6.dp))
                Text("Manual Check-In", fontWeight = FontWeight.Bold)
            }

            Button(
                onClick = {
                    isCheckedIn = false
                    checkOutTimeText = "05:32 PM"
                    onManualCheckOut()
                },
                modifier = Modifier
                    .weight(1f)
                    .height(52.dp),
                shape = RoundedCornerShape(12.dp),
                colors = ButtonDefaults.buttonColors(containerColor = DangerRed),
                enabled = isCheckedIn
            ) {
                Icon(Icons.Default.Logout, contentDescription = null, modifier = Modifier.size(18.dp))
                Spacer(modifier = Modifier.width(6.dp))
                Text("Manual Check-Out", fontWeight = FontWeight.Bold)
            }
        }
    }
}
