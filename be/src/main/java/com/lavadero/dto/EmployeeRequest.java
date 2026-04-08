package com.lavadero.dto;

import com.lavadero.model.EmployeeRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record EmployeeRequest(
    @NotBlank(message = "First name is required")
    String firstName,
    
    @NotBlank(message = "Last name is required")
    String lastName,
    
    @Email(message = "Email should be valid")
    String email,
    
    String phone,
    
    @NotNull(message = "Role is required")
    EmployeeRole role,
    
    @NotBlank(message = "Username is required")
    String username,
    
    String password
) {}
