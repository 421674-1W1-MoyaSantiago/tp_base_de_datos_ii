package com.lavadero.dto;

import jakarta.validation.constraints.NotBlank;

public record VehicleDto(
    @NotBlank(message = "License plate is required")
    String licensePlate,
    
    @NotBlank(message = "Brand is required")
    String brand,
    
    @NotBlank(message = "Model is required")
    String model,
    
    Integer year,
    
    String color
) {}
