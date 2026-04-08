package com.lavadero.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

import java.util.List;

public record ClientRequest(
    @NotBlank(message = "First name is required")
    String firstName,
    
    @NotBlank(message = "Last name is required")
    String lastName,
    
    @Email(message = "Email should be valid")
    String email,
    
    String phone,
    
    @NotBlank(message = "DNI is required")
    String dni,
    
    @Valid
    List<VehicleDto> vehicles
) {}
