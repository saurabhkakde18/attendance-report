package com.smartcorp.attendance.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ChevronLeft
import androidx.compose.material.icons.filled.ChevronRight
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

data class CalendarDay(
    val dayNumber: Int,
    val status: String, // PRESENT, ABSENT, HALF_DAY, WEEKLY_OFF, HOLIDAY, ON_LEAVE, FUTURE
    val workMinutes: Int = 0
)

@Composable
fun AttendanceScreen() {
    var selectedMonth by remember { mutableStateOf("November 2026") }

    // Summary statistics for November 2026
    val totalCalendarDays = 30
    val presentDays = 19
    val absentDays = 1
    val halfDays = 1
    val weeklyOffs = 4
    val holidays = 1
    val leaveDays = 1
    val attendancePercentage = 95.0

    // Sample 30 calendar days
    val daysList = remember {
        (1..30).map { day ->
            when (day) {
                1, 8, 15, 22, 29 -> CalendarDay(day, "WEEKLY_OFF")
                8 -> CalendarDay(day, "HOLIDAY")
                12 -> CalendarDay(day, "ON_LEAVE")
                18 -> CalendarDay(day, "HALF_DAY", 220)
                20 -> CalendarDay(day, "ABSENT")
                in 26..30 -> CalendarDay(day, "FUTURE")
                else -> CalendarDay(day, "PRESENT", 480)
            }
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(LightBackground)
            .verticalScroll(rememberScrollState())
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // Month Selector Header
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = CardBackground)
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 12.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                IconButton(onClick = {}) {
                    Icon(Icons.Default.ChevronLeft, contentDescription = "Previous Month", tint = NavyDark)
                }

                Text(
                    text = selectedMonth,
                    fontWeight = FontWeight.Bold,
                    fontSize = 18.sp,
                    color = NavyDark
                )

                IconButton(onClick = {}) {
                    Icon(Icons.Default.ChevronRight, contentDescription = "Next Month", tint = NavyDark)
                }
            }
        }

        // Summary Metric Grid
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = CardBackground)
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text(
                    text = "MONTHLY ATTENDANCE SUMMARY",
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold,
                    color = NeutralGray,
                    letterSpacing = 1.sp
                )

                Spacer(modifier = Modifier.height(12.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    AttendanceMetricItem("Present", "$presentDays", SuccessGreen)
                    AttendanceMetricItem("Absent", "$absentDays", DangerRed)
                    AttendanceMetricItem("Half-Day", "$halfDays", WarningYellow)
                    AttendanceMetricItem("Leaves", "$leaveDays", LeaveOrange)
                    AttendanceMetricItem("Weekly Off", "$weeklyOffs", WeeklyOffBlue)
                }

                Spacer(modifier = Modifier.height(12.dp))
                HorizontalDivider(color = DividerBorder)
                Spacer(modifier = Modifier.height(12.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text("Attendance Rate", fontSize = 13.sp, fontWeight = FontWeight.Medium, color = NeutralGray)
                    Text("$attendancePercentage%", fontSize = 16.sp, fontWeight = FontWeight.Bold, color = SuccessGreen)
                }
            }
        }

        // Status Legend (Green=Present, Red=Absent, Yellow=Half Day, Blue=Weekly Off, Purple=Holiday, Orange=Leave)
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = CardBackground)
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text("STATUS LEGEND", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = NeutralGray)
                Spacer(modifier = Modifier.height(8.dp))
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    LegendItem("Present", SuccessGreen)
                    LegendItem("Absent", DangerRed)
                    LegendItem("Half Day", WarningYellow)
                    LegendItem("Leave", LeaveOrange)
                    LegendItem("Weekly Off", WeeklyOffBlue)
                    LegendItem("Holiday", HolidayPurple)
                }
            }
        }

        // Calendar Grid
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = CardBackground)
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                // Day Headers
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    listOf("Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat").forEach { day ->
                        Text(
                            text = day,
                            modifier = Modifier.weight(1f),
                            fontWeight = FontWeight.Bold,
                            fontSize = 12.sp,
                            color = NeutralGray,
                            textAlign = androidx.compose.ui.text.style.TextAlign.Center
                        )
                    }
                }

                Spacer(modifier = Modifier.height(12.dp))

                // Days Grid (30 days)
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    daysList.chunked(7).forEach { week ->
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            week.forEach { dayItem ->
                                val (bgColor, textColor) = getStatusColors(dayItem.status)
                                Box(
                                    modifier = Modifier
                                        .weight(1f)
                                        .aspectRatio(1f)
                                        .padding(2.dp)
                                        .clip(RoundedCornerShape(8.dp))
                                        .background(bgColor),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Text(
                                        text = "${dayItem.dayNumber}",
                                        fontSize = 13.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = textColor
                                    )
                                }
                            }
                            // Pad remaining week cells if needed
                            if (week.size < 7) {
                                repeat(7 - week.size) {
                                    Spacer(modifier = Modifier.weight(1f).padding(2.dp))
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun AttendanceMetricItem(label: String, value: String, color: Color) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Text(value, fontSize = 18.sp, fontWeight = FontWeight.Bold, color = color)
        Text(label, fontSize = 11.sp, color = NeutralGray)
    }
}

@Composable
fun LegendItem(label: String, color: Color) {
    Row(verticalAlignment = Alignment.CenterVertically) {
        Box(
            modifier = Modifier
                .size(10.dp)
                .clip(CircleShape)
                .background(color)
        )
        Spacer(modifier = Modifier.width(4.dp))
        Text(label, fontSize = 10.sp, color = NeutralGray)
    }
}

fun getStatusColors(status: String): Pair<Color, Color> {
    return when (status) {
        "PRESENT" -> Pair(SuccessGreenLight, SuccessGreen)
        "ABSENT" -> Pair(DangerRedLight, DangerRed)
        "HALF_DAY" -> Pair(WarningYellowLight, WarningYellow)
        "WEEKLY_OFF" -> Pair(Color(0xFFE0F2FE), WeeklyOffBlue)
        "HOLIDAY" -> Pair(Color(0xFFF3E8FF), HolidayPurple)
        "ON_LEAVE" -> Pair(Color(0xFFFFEDD5), LeaveOrange)
        else -> Pair(LightBackground, NeutralGray)
    }
}
