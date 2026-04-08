package com.lavadero.repository;

import com.lavadero.model.Invoice;
import com.lavadero.model.PaymentMethod;
import com.lavadero.model.PaymentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface InvoiceRepository extends MongoRepository<Invoice, String> {
    
    Optional<Invoice> findByInvoiceNumber(String invoiceNumber);
    
    Optional<Invoice> findByServiceOrderId(String serviceOrderId);
    
    List<Invoice> findByClientId(String clientId);
    
    List<Invoice> findByPaymentMethod(PaymentMethod paymentMethod);
    
    List<Invoice> findByPaymentStatus(PaymentStatus paymentStatus);
    
    List<Invoice> findByIssuedAtBetween(LocalDateTime start, LocalDateTime end);
    
    Page<Invoice> findByIssuedAtBetween(
        LocalDateTime start, 
        LocalDateTime end, 
        Pageable pageable
    );
    
    boolean existsByServiceOrderId(String serviceOrderId);
}
