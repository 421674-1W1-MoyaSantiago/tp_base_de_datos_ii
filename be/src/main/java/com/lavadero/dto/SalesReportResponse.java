package com.lavadero.dto;

import java.math.BigDecimal;
import java.util.Map;

public record SalesReportResponse(
    BigDecimal totalAmount,
    Long totalInvoices,
    Map<String, BigDecimal> byPaymentMethod,
    Map<String, Long> countByPaymentMethod
) {}
