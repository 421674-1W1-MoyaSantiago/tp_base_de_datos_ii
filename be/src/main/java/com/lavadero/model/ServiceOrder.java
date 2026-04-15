package com.lavadero.model;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DBRef;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Document(collection = "service_orders")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ServiceOrder {
    
    @Id
    private String id;
    
    @Indexed(unique = true)
    @NotBlank(message = "Order number is required")
    private String orderNumber;
    
    @NotBlank(message = "Client ID is required")
    private String clientId;
    
    @NotBlank(message = "Vehicle license plate is required")
    private String vehicleLicensePlate;
    
    @NotNull(message = "Service type is required")
    private ServiceType serviceType;
    
    @NotNull(message = "Status is required")
    @Indexed
    private ServiceStatus status = ServiceStatus.PENDING;
    
    private String assignedEmployeeId;
    
    @Positive(message = "Price must be positive")
    private BigDecimal price;
    
    private LocalDateTime startTime;
    
    private LocalDateTime endTime;
    
    private LocalDateTime deliveryTime;
    
    private String notes;
    
    private boolean invoiced = false;
    
    @CreatedDate
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    private LocalDateTime updatedAt;
}
