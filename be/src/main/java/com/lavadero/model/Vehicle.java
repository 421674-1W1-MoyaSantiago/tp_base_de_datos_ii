package com.lavadero.model;

import com.lavadero.util.LicensePlateValidator.ValidLicensePlate;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Vehicle {
    
    @NotBlank(message = "License plate is required")
    @ValidLicensePlate
    private String licensePlate;
    
    @NotBlank(message = "Brand is required")
    private String brand;
    
    @NotBlank(message = "Model is required")
    private String model;
    
    private Integer year;
    
    private String color;
}
