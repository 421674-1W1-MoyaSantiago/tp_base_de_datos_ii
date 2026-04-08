package com.lavadero.dto;

import com.lavadero.model.ServiceType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;

public record ServiceOrderRequest(
    @NotBlank(message = "Client ID is required")
    String clientId,
    
    @NotBlank(message = "Vehicle license plate is required")
    String vehicleLicensePlate,
    
    @NotNull(message = "Service type is required")
    ServiceType serviceType,
    
    String assignedEmployeeId,
    
    @Positive(message = "Price must be positive")
    BigDecimal price,
    
    String notes
) {}
