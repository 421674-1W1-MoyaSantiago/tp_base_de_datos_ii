package com.lavadero.dto;

import com.lavadero.model.PaymentMethod;
import com.lavadero.model.PaymentStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record InvoiceResponse(
    String id,
    String invoiceNumber,
    String serviceOrderId,
    String clientId,
    BigDecimal amount,
    PaymentMethod paymentMethod,
    PaymentStatus paymentStatus,
    String issuedBy,
    LocalDateTime issuedAt,
    String notes
) {}
