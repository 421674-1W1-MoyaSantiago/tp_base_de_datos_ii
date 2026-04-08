package com.lavadero.util;

import com.lavadero.exception.DuplicateResourceException;
import com.lavadero.exception.InvalidStateTransitionException;
import com.lavadero.model.ServiceOrder;
import com.lavadero.model.ServiceStatus;
import com.lavadero.repository.InvoiceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
@RequiredArgsConstructor
public class InvoiceValidator {
    
    private final InvoiceRepository invoiceRepository;
    
    public void validateInvoiceCreation(ServiceOrder serviceOrder) {
        List<String> errors = new ArrayList<>();
        
        if (serviceOrder == null) {
            throw new IllegalArgumentException("Service order cannot be null");
        }
        
        if (!isServiceOrderInValidState(serviceOrder.getStatus())) {
            errors.add("Service order must be COMPLETED or DELIVERED. Current status: " + serviceOrder.getStatus());
        }
        
        if (invoiceAlreadyExists(serviceOrder.getId())) {
            errors.add("Invoice already exists for service order: " + serviceOrder.getId());
        }
        
        if (!errors.isEmpty()) {
            if (errors.get(0).startsWith("Invoice already exists")) {
                throw new DuplicateResourceException(String.join("; ", errors));
            } else {
                throw new InvalidStateTransitionException(String.join("; ", errors));
            }
        }
    }
    
    public boolean canCreateInvoice(ServiceOrder serviceOrder) {
        if (serviceOrder == null) {
            return false;
        }
        
        return isServiceOrderInValidState(serviceOrder.getStatus()) 
               && !invoiceAlreadyExists(serviceOrder.getId());
    }
    
    public boolean isServiceOrderInValidState(ServiceStatus status) {
        return status == ServiceStatus.COMPLETED || status == ServiceStatus.DELIVERED;
    }
    
    public boolean invoiceAlreadyExists(String serviceOrderId) {
        if (serviceOrderId == null || serviceOrderId.isBlank()) {
            return false;
        }
        return invoiceRepository.existsByServiceOrderId(serviceOrderId);
    }
    
    public String getValidationMessage(ServiceOrder serviceOrder) {
        if (serviceOrder == null) {
            return "Service order is required";
        }
        
        if (!isServiceOrderInValidState(serviceOrder.getStatus())) {
            return String.format("Cannot create invoice: service order status must be COMPLETED or DELIVERED (current: %s)", 
                               serviceOrder.getStatus());
        }
        
        if (invoiceAlreadyExists(serviceOrder.getId())) {
            return String.format("Cannot create invoice: invoice already exists for service order %s", 
                               serviceOrder.getId());
        }
        
        return "Validation passed";
    }
}
