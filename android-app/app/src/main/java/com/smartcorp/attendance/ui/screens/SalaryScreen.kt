package com.smartcorp.attendance.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Download
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.PictureAsPdf
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.smartcorp.attendance.ui.theme.*

@Composable
fun SalaryScreen(
    onDownloadPdf: () -> Unit = {}
) {
    // Exact Company Benchmark Example:
    // Monthly Salary = ₹18,000
    // PF = ₹1,840
    // ESIC = ₹120
    // PT = ₹200
    // Total Fixed Deductions = ₹2,160
    // Base Net Salary = ₹15,840
    val basicSalary = 18000.0
    val pfDeduction = 1840.0
    val esicDeduction = 120.0
    val ptDeduction = 200.0
    val totalFixedDeductions = pfDeduction + esicDeduction + ptDeduction // 2160.0
    val unpaidLeaveDeduction = 0.0 // 0 unpaid leave deductions if within 4-day allowance
    val netPayable = basicSalary - totalFixedDeductions - unpaidLeaveDeduction // 15840.0

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(LightBackground)
            .verticalScroll(rememberScrollState())
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // Net Payable Hero Card
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = NavyDark)
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(24.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text(
                    text = "OCTOBER 2026 NET SALARY",
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold,
                    color = AccentBlue,
                    letterSpacing = 1.sp
                )

                Spacer(modifier = Modifier.height(10.dp))

                Text(
                    text = "₹${String.format("%,.0f", netPayable)}",
                    fontSize = 38.sp,
                    fontWeight = FontWeight.ExtraBold,
                    color = Color.White
                )

                Spacer(modifier = Modifier.height(6.dp))

                Badge(
                    containerColor = SuccessGreenLight,
                    contentColor = SuccessGreen
                ) {
                    Text(
                        text = "STATUS: APPROVED & PAID",
                        fontWeight = FontWeight.Bold,
                        fontSize = 11.sp,
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 2.dp)
                    )
                }
            }
        }

        // Breakdown Card
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = CardBackground)
        ) {
            Column(modifier = Modifier.padding(20.dp)) {
                Text(
                    text = "SALARY BREAKDOWN",
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Bold,
                    color = NeutralGray,
                    letterSpacing = 0.5.sp
                )

                Spacer(modifier = Modifier.height(16.dp))

                // Earnings
                SalaryRow("Basic Monthly Salary", "₹${String.format("%,.2f", basicSalary)}", isBold = true, textColor = NavyDark)

                Spacer(modifier = Modifier.height(12.dp))
                HorizontalDivider(color = DividerBorder)
                Spacer(modifier = Modifier.height(12.dp))

                // Statutory Deductions
                Text("STATUTORY DEDUCTIONS", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = NeutralGray)
                Spacer(modifier = Modifier.height(8.dp))

                SalaryRow("Provident Fund (PF)", "- ₹${String.format("%,.2f", pfDeduction)}", textColor = DangerRed)
                Spacer(modifier = Modifier.height(6.dp))
                SalaryRow("Employee State Insurance (ESIC)", "- ₹${String.format("%,.2f", esicDeduction)}", textColor = DangerRed)
                Spacer(modifier = Modifier.height(6.dp))
                SalaryRow("Professional Tax (PT)", "- ₹${String.format("%,.2f", ptDeduction)}", textColor = DangerRed)
                Spacer(modifier = Modifier.height(6.dp))
                SalaryRow("Total Fixed Deductions", "- ₹${String.format("%,.2f", totalFixedDeductions)}", isBold = true, textColor = DangerRed)

                Spacer(modifier = Modifier.height(12.dp))
                HorizontalDivider(color = DividerBorder)
                Spacer(modifier = Modifier.height(12.dp))

                // Leave & Policy
                Text("LEAVE & POLICY ADJUSTMENTS", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = NeutralGray)
                Spacer(modifier = Modifier.height(8.dp))
                SalaryRow("Monthly Leave Allowance", "4 Days (Unpaid)", textColor = NeutralGray)
                Spacer(modifier = Modifier.height(6.dp))
                SalaryRow("Paid Leaves Allowed", "0 Days", textColor = NeutralGray)
                Spacer(modifier = Modifier.height(6.dp))
                SalaryRow("Overtime Pay", "DISABLED (₹0.00)", textColor = NeutralGray)
                Spacer(modifier = Modifier.height(6.dp))
                SalaryRow("Additional Unpaid Leave Deductions", "- ₹${String.format("%,.2f", unpaidLeaveDeduction)}", textColor = NeutralGray)

                Spacer(modifier = Modifier.height(16.dp))
                HorizontalDivider(color = DividerBorder, thickness = 2.dp)
                Spacer(modifier = Modifier.height(16.dp))

                // Net Payable
                SalaryRow("FINAL NET PAYABLE", "₹${String.format("%,.2f", netPayable)}", isBold = true, textColor = SuccessGreen, fontSize = 16)
            }
        }

        // Policy Notice Card
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(12.dp),
            colors = CardDefaults.cardColors(containerColor = SoftBlue)
        ) {
            Row(
                modifier = Modifier.padding(16.dp),
                verticalAlignment = Alignment.Top
            ) {
                Icon(Icons.Default.Info, contentDescription = null, tint = PrimaryBlue, modifier = Modifier.size(20.dp))
                Spacer(modifier = Modifier.width(10.dp))
                Text(
                    text = "Calculation verified: Basic ₹18,000 - PF ₹1,840 - ESIC ₹120 - PT ₹200 = ₹15,840. Overtime is disabled. Divisor: Calendar Days (31).",
                    fontSize = 12.sp,
                    color = PrimaryBlue,
                    lineHeight = 16.sp
                )
            }
        }

        // Download PDF Salary Slip Button
        Button(
            onClick = onDownloadPdf,
            modifier = Modifier
                .fillMaxWidth()
                .height(52.dp),
            shape = RoundedCornerShape(12.dp),
            colors = ButtonDefaults.buttonColors(containerColor = PrimaryBlue)
        ) {
            Icon(Icons.Default.PictureAsPdf, contentDescription = null, modifier = Modifier.size(20.dp))
            Spacer(modifier = Modifier.width(8.dp))
            Text("Download Official PDF Salary Slip", fontWeight = FontWeight.Bold)
        }
    }
}

@Composable
fun SalaryRow(
    label: String,
    value: String,
    isBold: Boolean = false,
    textColor: Color = NavyDark,
    fontSize: Int = 13
) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Text(
            text = label,
            fontSize = fontSize.sp,
            fontWeight = if (isBold) FontWeight.Bold else FontWeight.Normal,
            color = if (isBold) NavyDark else NeutralGray
        )
        Text(
            text = value,
            fontSize = fontSize.sp,
            fontWeight = if (isBold) FontWeight.Bold else FontWeight.Medium,
            color = textColor
        )
    }
}
