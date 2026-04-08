package com.lavadero.dto;

import com.lavadero.model.EmployeeRole;

public record LoginResponse(
    String token,
    String type,
    String id,
    String username,
    String firstName,
    String lastName,
    EmployeeRole role
) {
    public LoginResponse(String token, String id, String username, String firstName, String lastName, EmployeeRole role) {
        this(token, "Bearer", id, username, firstName, lastName, role);
    }
}
