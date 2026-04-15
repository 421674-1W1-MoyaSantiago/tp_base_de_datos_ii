package com.lavadero.service.impl;

import com.lavadero.dto.ServiceOrderRequest;
import com.lavadero.dto.ServiceOrderResponse;
import com.lavadero.exception.InvalidStateTransitionException;
import com.lavadero.exception.ResourceNotFoundException;
import com.lavadero.model.ServiceOrder;
import com.lavadero.model.ServiceStatus;
import com.lavadero.repository.ClientRepository;
import com.lavadero.repository.EmployeeRepository;
import com.lavadero.repository.ServiceOrderRepository;
import com.lavadero.service.ServiceOrderService;
import com.lavadero.util.StateTransitionValidator;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ServiceOrderServiceImpl implements ServiceOrderService {

    private final ServiceOrderRepository serviceOrderRepository;
    private final ClientRepository clientRepository;
    private final EmployeeRepository employeeRepository;
    private final StateTransitionValidator stateTransitionValidator;

    @Override
    public ServiceOrderResponse createServiceOrder(ServiceOrderRequest request) {
        // Validate client exists
        if (!clientRepository.existsById(request.clientId())) {
            throw new ResourceNotFoundException("Client not found with id: " + request.clientId());
        }

        // Validate employee if assigned
        if (request.assignedEmployeeId() != null && !request.assignedEmployeeId().isBlank()) {
            if (!employeeRepository.existsById(request.assignedEmployeeId())) {
                throw new ResourceNotFoundException("Employee not found with id: " + request.assignedEmployeeId());
            }
        }

        ServiceOrder order = new ServiceOrder();
        order.setOrderNumber(generateOrderNumber());
        order.setClientId(request.clientId());
        order.setVehicleLicensePlate(request.vehicleLicensePlate());
        order.setServiceType(request.serviceType());
        order.setStatus(ServiceStatus.PENDING);
        order.setAssignedEmployeeId(request.assignedEmployeeId());
        order.setPrice(request.price());
        order.setNotes(request.notes());

        ServiceOrder savedOrder = serviceOrderRepository.save(order);
        return mapToResponse(savedOrder);
    }

    @Override
    public ServiceOrderResponse getServiceOrderById(String id) {
        ServiceOrder order = serviceOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Service order not found with id: " + id));
        return mapToResponse(order);
    }

    @Override
    public Page<ServiceOrderResponse> getAllServiceOrders(Pageable pageable) {
        return serviceOrderRepository.findAll(pageable).map(this::mapToResponse);
    }

    @Override
    public List<ServiceOrderResponse> getServiceOrdersByStatus(ServiceStatus status) {
        return serviceOrderRepository.findByStatus(status).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<ServiceOrderResponse> getServiceOrdersByClient(String clientId) {
        return serviceOrderRepository.findByClientId(clientId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public ServiceOrderResponse updateStatus(String id, ServiceStatus newStatus) {
        ServiceOrder order = serviceOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Service order not found with id: " + id));

        ServiceStatus currentStatus = order.getStatus();
        
        // Validate state transition
        if (!stateTransitionValidator.isValidTransition(currentStatus, newStatus)) {
            throw new InvalidStateTransitionException(
                stateTransitionValidator.getTransitionErrorMessage(currentStatus, newStatus)
            );
        }

        order.setStatus(newStatus);

        // Update timestamps based on status
        switch (newStatus) {
            case IN_PROGRESS -> order.setStartTime(LocalDateTime.now());
            case COMPLETED -> order.setEndTime(LocalDateTime.now());
            case DELIVERED -> order.setDeliveryTime(LocalDateTime.now());
        }

        ServiceOrder updatedOrder = serviceOrderRepository.save(order);
        return mapToResponse(updatedOrder);
    }

    @Override
    public ServiceOrderResponse assignEmployee(String orderId, String employeeId) {
        ServiceOrder order = serviceOrderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Service order not found with id: " + orderId));

        if (!employeeRepository.existsById(employeeId)) {
            throw new ResourceNotFoundException("Employee not found with id: " + employeeId);
        }

        order.setAssignedEmployeeId(employeeId);
        ServiceOrder updatedOrder = serviceOrderRepository.save(order);
        return mapToResponse(updatedOrder);
    }

    @Override
    public Page<ServiceOrderResponse> getServiceOrdersByDateRange(
            LocalDateTime start, 
            LocalDateTime end, 
            Pageable pageable
    ) {
        return serviceOrderRepository.findByCreatedAtBetween(start, end, pageable)
                .map(this::mapToResponse);
    }

    private String generateOrderNumber() {
        String prefix = "ORD";
        String timestamp = String.valueOf(System.currentTimeMillis());
        String random = UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        return prefix + "-" + timestamp + "-" + random;
    }

    private ServiceOrderResponse mapToResponse(ServiceOrder order) {
        return new ServiceOrderResponse(
                order.getId(),
                order.getOrderNumber(),
                order.getClientId(),
                order.getVehicleLicensePlate(),
                order.getServiceType(),
                order.getStatus(),
                order.getAssignedEmployeeId(),
                order.getPrice(),
                order.getStartTime(),
                order.getEndTime(),
                order.getDeliveryTime(),
                order.getNotes(),
                order.isInvoiced(),
                order.getCreatedAt(),
                order.getUpdatedAt()
        );
    }
}
