package com.lavadero.repository;

import com.lavadero.model.ServiceOrder;
import com.lavadero.model.ServiceStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ServiceOrderRepository extends MongoRepository<ServiceOrder, String> {
    
    Optional<ServiceOrder> findByOrderNumber(String orderNumber);
    
    List<ServiceOrder> findByStatus(ServiceStatus status);
    
    List<ServiceOrder> findByClientId(String clientId);
    
    List<ServiceOrder> findByAssignedEmployeeId(String employeeId);
    
    Page<ServiceOrder> findByStatus(ServiceStatus status, Pageable pageable);
    
    Page<ServiceOrder> findByCreatedAtBetween(
        LocalDateTime start, 
        LocalDateTime end, 
        Pageable pageable
    );

    List<ServiceOrder> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);
    
    boolean existsByOrderNumber(String orderNumber);
}
