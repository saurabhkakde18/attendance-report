package com.smartcorp.attendance.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Business
import androidx.compose.material.icons.filled.Email
import androidx.compose.material.icons.filled.Logout
import androidx.compose.material.icons.filled.Phone
import androidx.compose.material.icons.filled.Schedule
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.smartcorp.attendance.ui.theme.*

@Composable
fun ProfileScreen(
    onLogout: () -> Unit = {}
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(LightBackground)
            .verticalScroll(rememberScrollState())
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // Profile Card
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = CardBackground)
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(24.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Box(
                    modifier = Modifier
                        .size(80.dp)
                        .clip(CircleShape)
                        .background(PrimaryBlue),
                    contentAlignment = Alignment.Center
                ) {
                    Text("RS", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 28.sp)
                }

                Spacer(modifier = Modifier.height(12.dp))

                Text("Rahul Sharma", fontSize = 20.sp, fontWeight = FontWeight.Bold, color = NavyDark)
                Text("Senior Full-Stack Engineer", fontSize = 13.sp, color = NeutralGray)
                Text("EMP ID: EMP001", fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = PrimaryBlue)
            }
        }

        // Details Card
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = CardBackground)
        ) {
            Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                ProfileDetailRow(Icons.Default.Email, "Email", "rahul.sharma@enterprise.com")
                ProfileDetailRow(Icons.Default.Phone, "Phone", "+91 98765 43210")
                ProfileDetailRow(Icons.Default.Business, "Department", "Engineering & Systems")
                ProfileDetailRow(Icons.Default.Business, "Assigned Office", "Headquarters (50m GPS Radius)")
                ProfileDetailRow(Icons.Default.Schedule, "Shift", "General Day Shift (09:00 - 17:30)")
            }
        }

        // Statutory & Leave Rules Card
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = CardBackground)
        ) {
            Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                Text("CONTRACT DETAILS", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = NeutralGray)
                Spacer(modifier = Modifier.height(4.dp))
                SalaryRow("Basic Monthly Salary", "₹18,000.00", isBold = true)
                SalaryRow("Statutory PF Deduction", "₹1,840.00")
                SalaryRow("Statutory ESIC Deduction", "₹120.00")
                SalaryRow("Statutory PT Deduction", "₹200.00")
                SalaryRow("Monthly Leave Allowance", "4 Days (Unpaid)")
                SalaryRow("Paid Leave Allowance", "0 Days")
                SalaryRow("Overtime Policy", "Disabled")
            }
        }

        // Logout Button
        OutlinedButton(
            onClick = onLogout,
            modifier = Modifier
                .fillMaxWidth()
                .height(50.dp),
            shape = RoundedCornerShape(12.dp),
            colors = ButtonDefaults.outlinedButtonColors(contentColor = DangerRed)
        ) {
            Icon(Icons.Default.Logout, contentDescription = null, modifier = Modifier.size(18.dp))
            Spacer(modifier = Modifier.width(8.dp))
            Text("Sign Out of Account", fontWeight = FontWeight.Bold)
        }
    }
}

@Composable
fun ProfileDetailRow(icon: ImageVector, label: String, value: String) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Icon(icon, contentDescription = null, tint = NeutralGray, modifier = Modifier.size(20.dp))
        Spacer(modifier = Modifier.width(12.dp))
        Column {
            Text(label, fontSize = 11.sp, color = NeutralGray)
            Text(value, fontSize = 13.sp, fontWeight = FontWeight.Medium, color = NavyDark)
        }
    }
}
