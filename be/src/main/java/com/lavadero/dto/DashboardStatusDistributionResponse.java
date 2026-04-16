package com.lavadero.dto;

import com.lavadero.model.ServiceStatus;

import java.util.List;

public record DashboardStatusDistributionResponse(
    List<StatusCount> statuses,
    Long totalOrders
) {
    public record StatusCount(ServiceStatus status, Long count) {}
}
