package com.lavadero.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record DashboardDailyRevenueResponse(
    Integer days,
    List<RevenuePoint> points,
    BigDecimal totalAmount,
    Long totalInvoices
) {
    public record RevenuePoint(
        LocalDate date,
        BigDecimal totalAmount,
        Long invoiceCount
    ) {}
}
