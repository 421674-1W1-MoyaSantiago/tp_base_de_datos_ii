package com.lavadero.model;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Document(collection = "invoices")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Invoice {
    
    @Id
    private String id;
    
    @Indexed(unique = true)
    @NotBlank(message = "Invoice number is required")
    private String invoiceNumber;
    
    @NotBlank(message = "Service order ID is required")
    @Indexed(unique = true)
    private String serviceOrderId;
    
    @NotBlank(message = "Client ID is required")
    private String clientId;
    
    @NotNull(message = "Amount is required")
    @Positive(message = "Amount must be positive")
    private BigDecimal amount;
    
    @NotNull(message = "Payment method is required")
    private PaymentMethod paymentMethod;
    
    @NotNull(message = "Payment status is required")
    private PaymentStatus paymentStatus = PaymentStatus.PENDING;
    
    @NotBlank(message = "Issued by is required")
    private String issuedBy;
    
    @NotNull(message = "Issued at is required")
    private LocalDateTime issuedAt;
    
    private String notes;
}
