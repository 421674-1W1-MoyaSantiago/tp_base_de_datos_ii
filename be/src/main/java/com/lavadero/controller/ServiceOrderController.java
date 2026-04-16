package com.lavadero.controller;

import com.lavadero.dto.DashboardStatusDistributionResponse;
import com.lavadero.dto.ServiceOrderRequest;
import com.lavadero.dto.ServiceOrderResponse;
import com.lavadero.dto.StatusChangeRequest;
import com.lavadero.model.ServiceStatus;
import com.lavadero.service.ServiceOrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/service-orders")
@RequiredArgsConstructor
public class ServiceOrderController {

    private final ServiceOrderService serviceOrderService;

    @PostMapping
    public ResponseEntity<ServiceOrderResponse> createServiceOrder(
            @Valid @RequestBody ServiceOrderRequest request
    ) {
        ServiceOrderResponse response = serviceOrderService.createServiceOrder(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<Page<ServiceOrderResponse>> getAllServiceOrders(Pageable pageable) {
        Page<ServiceOrderResponse> orders = serviceOrderService.getAllServiceOrders(pageable);
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ServiceOrderResponse> getServiceOrderById(@PathVariable String id) {
        ServiceOrderResponse response = serviceOrderService.getServiceOrderById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<ServiceOrderResponse>> getServiceOrdersByStatus(
            @PathVariable ServiceStatus status
    ) {
        List<ServiceOrderResponse> orders = serviceOrderService.getServiceOrdersByStatus(status);
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/by-client/{clientId}")
    public ResponseEntity<List<ServiceOrderResponse>> getServiceOrdersByClient(
            @PathVariable String clientId
    ) {
        List<ServiceOrderResponse> orders = serviceOrderService.getServiceOrdersByClient(clientId);
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/date-range")
    public ResponseEntity<Page<ServiceOrderResponse>> getServiceOrdersByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end,
            Pageable pageable
    ) {
        Page<ServiceOrderResponse> orders = serviceOrderService.getServiceOrdersByDateRange(start, end, pageable);
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/analytics/status-distribution")
    public ResponseEntity<DashboardStatusDistributionResponse> getDashboardStatusDistribution(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        DashboardStatusDistributionResponse response = serviceOrderService.getDashboardStatusDistribution(date);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ServiceOrderResponse> updateStatus(
            @PathVariable String id,
            @Valid @RequestBody StatusChangeRequest request
    ) {
        ServiceOrderResponse response = serviceOrderService.updateStatus(id, request.status());
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/assign/{employeeId}")
    public ResponseEntity<ServiceOrderResponse> assignEmployee(
            @PathVariable String id,
            @PathVariable String employeeId
    ) {
        ServiceOrderResponse response = serviceOrderService.assignEmployee(id, employeeId);
        return ResponseEntity.ok(response);
    }
}
