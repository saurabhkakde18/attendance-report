package com.smartcorp.attendance.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

private val LightColorScheme = lightColorScheme(
    primary = PrimaryBlue,
    onPrimary = Color.White,
    primaryContainer = SoftBlue,
    onPrimaryContainer = NavyDark,
    secondary = AccentBlue,
    onSecondary = Color.White,
    background = LightBackground,
    surface = CardBackground,
    onBackground = NavyDark,
    onSurface = NavyDark
)

@Composable
fun SmartAttendanceTheme(
    content: @Composable () -> Unit
) {
    MaterialTheme(
        colorScheme = LightColorScheme,
        content = content
    )
}
