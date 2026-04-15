package com.lavadero.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

import java.util.List;

public record ClientRequest(
    @NotBlank(message = "First name is required")
    String firstName,
    
    @NotBlank(message = "Last name is required")
    String lastName,
    
    @Email(message = "Email should be valid")
    String email,
    
    @Pattern(regexp = "^[0-9]*$", message = "Phone must contain only numbers")
    String phone,
    
    @NotBlank(message = "DNI is required")
    @Pattern(regexp = "^[0-9]{8,9}$", message = "DNI must be between 8 and 9 digits")
    String dni,
    
    @Valid
    List<VehicleDto> vehicles
) {}
