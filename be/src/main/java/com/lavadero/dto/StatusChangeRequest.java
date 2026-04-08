package com.lavadero.dto;

import com.lavadero.model.ServiceStatus;
import jakarta.validation.constraints.NotNull;

public record StatusChangeRequest(
    @NotNull(message = "Status is required")
    ServiceStatus status
) {}
