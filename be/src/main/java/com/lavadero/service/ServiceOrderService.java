package com.lavadero.service;

import com.lavadero.dto.ServiceOrderRequest;
import com.lavadero.dto.ServiceOrderResponse;
import com.lavadero.model.ServiceStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;

public interface ServiceOrderService {
    ServiceOrderResponse createServiceOrder(ServiceOrderRequest request);
    ServiceOrderResponse getServiceOrderById(String id);
    Page<ServiceOrderResponse> getAllServiceOrders(Pageable pageable);
    List<ServiceOrderResponse> getServiceOrdersByStatus(ServiceStatus status);
    List<ServiceOrderResponse> getServiceOrdersByClient(String clientId);
    ServiceOrderResponse updateStatus(String id, ServiceStatus newStatus);
    ServiceOrderResponse assignEmployee(String orderId, String employeeId);
    Page<ServiceOrderResponse> getServiceOrdersByDateRange(
        LocalDateTime start, 
        LocalDateTime end, 
        Pageable pageable
    );
}
