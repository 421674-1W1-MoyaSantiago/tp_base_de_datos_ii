package com.lavadero.dto;

import com.lavadero.model.PaymentMethod;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record InvoiceRequest(
    @NotBlank(message = "Service order ID is required")
    String serviceOrderId,
    
    @NotNull(message = "Payment method is required")
    PaymentMethod paymentMethod,
    
    String notes
) {}
