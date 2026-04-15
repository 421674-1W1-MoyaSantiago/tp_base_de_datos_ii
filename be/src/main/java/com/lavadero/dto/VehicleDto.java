package com.lavadero.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public record VehicleDto(
    @NotBlank(message = "License plate is required")
    String licensePlate,
    
    @NotBlank(message = "Brand is required")
    String brand,
    
    @NotBlank(message = "Model is required")
    String model,
    
    @Min(value = 1900, message = "Year must be greater than 1900")
    @Max(value = 2100, message = "Year must be less than 2100")
    Integer year,
    
    String color
) {}
