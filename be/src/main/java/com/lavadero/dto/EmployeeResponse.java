package com.lavadero.dto;

import com.lavadero.model.EmployeeRole;

import java.time.LocalDateTime;

public record EmployeeResponse(
    String id,
    String firstName,
    String lastName,
    String email,
    String phone,
    EmployeeRole role,
    String username,
    Boolean active,
    LocalDateTime createdAt
) {}
