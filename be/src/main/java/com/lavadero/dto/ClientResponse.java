package com.lavadero.dto;

import java.time.LocalDateTime;
import java.util.List;

public record ClientResponse(
    String id,
    String firstName,
    String lastName,
    String email,
    String phone,
    String dni,
    List<VehicleDto> vehicles,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {}
