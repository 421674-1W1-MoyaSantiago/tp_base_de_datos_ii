package com.lavadero.dto;

import com.lavadero.model.ServiceStatus;
import com.lavadero.model.ServiceType;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record ServiceOrderResponse(
    String id,
    String orderNumber,
    String clientId,
    String vehicleLicensePlate,
    ServiceType serviceType,
    ServiceStatus status,
    String assignedEmployeeId,
    BigDecimal price,
    LocalDateTime startTime,
    LocalDateTime endTime,
    LocalDateTime deliveryTime,
    String notes,
    boolean invoiced,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {}
