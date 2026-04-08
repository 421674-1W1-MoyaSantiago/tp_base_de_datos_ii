package com.lavadero.service;

import com.lavadero.dto.ServiceOrderRequest;
import com.lavadero.dto.ServiceOrderResponse;
import com.lavadero.exception.InvalidStateTransitionException;
import com.lavadero.exception.ResourceNotFoundException;
import com.lavadero.model.ServiceOrder;
import com.lavadero.model.ServiceStatus;
import com.lavadero.model.ServiceType;
import com.lavadero.repository.ClientRepository;
import com.lavadero.repository.EmployeeRepository;
import com.lavadero.repository.ServiceOrderRepository;
import com.lavadero.service.impl.ServiceOrderServiceImpl;
import com.lavadero.util.StateTransitionValidator;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("ServiceOrderServiceImpl Tests")
class ServiceOrderServiceImplTest {

    @Mock
    private ServiceOrderRepository serviceOrderRepository;
    @Mock
    private ClientRepository clientRepository;
    @Mock
    private EmployeeRepository employeeRepository;

    private ServiceOrderServiceImpl serviceOrderService;
    private ServiceOrderRequest validRequest;
    private ServiceOrder order;

    @BeforeEach
    void setUp() {
        serviceOrderService = new ServiceOrderServiceImpl(
                serviceOrderRepository,
                clientRepository,
                employeeRepository,
                new StateTransitionValidator()
        );

        validRequest = new ServiceOrderRequest(
                "client-1",
                "ABC123",
                ServiceType.COMPLETE,
                "employee-1",
                new BigDecimal("100.00"),
                "Regular service"
        );

        order = new ServiceOrder();
        order.setId("order-1");
        order.setOrderNumber("ORD-1");
        order.setClientId("client-1");
        order.setVehicleLicensePlate("ABC123");
        order.setServiceType(ServiceType.COMPLETE);
        order.setStatus(ServiceStatus.PENDING);
        order.setAssignedEmployeeId("employee-1");
        order.setPrice(new BigDecimal("100.00"));
        order.setCreatedAt(LocalDateTime.now());
        order.setUpdatedAt(LocalDateTime.now());
    }

    @Test
    @DisplayName("createServiceOrder: success")
    void createServiceOrderSuccess() {
        when(clientRepository.existsById("client-1")).thenReturn(true);
        when(employeeRepository.existsById("employee-1")).thenReturn(true);
        when(serviceOrderRepository.save(any(ServiceOrder.class))).thenReturn(order);

        ServiceOrderResponse response = serviceOrderService.createServiceOrder(validRequest);

        assertThat(response.clientId()).isEqualTo("client-1");
        assertThat(response.serviceType()).isEqualTo(ServiceType.COMPLETE);
        assertThat(response.status()).isEqualTo(ServiceStatus.PENDING);
    }

    @Test
    @DisplayName("createServiceOrder: client does not exist")
    void createServiceOrderClientNotFound() {
        when(clientRepository.existsById("client-1")).thenReturn(false);

        assertThatThrownBy(() -> serviceOrderService.createServiceOrder(validRequest))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Client not found");

        verify(serviceOrderRepository, never()).save(any(ServiceOrder.class));
    }

    @Test
    @DisplayName("updateStatus: PENDING -> IN_PROGRESS sets start time")
    void updateStatusPendingToInProgress() {
        when(serviceOrderRepository.findById("order-1")).thenReturn(Optional.of(order));
        when(serviceOrderRepository.save(any(ServiceOrder.class))).thenAnswer(inv -> inv.getArgument(0));

        ServiceOrderResponse response = serviceOrderService.updateStatus("order-1", ServiceStatus.IN_PROGRESS);

        assertThat(response.status()).isEqualTo(ServiceStatus.IN_PROGRESS);
        assertThat(response.startTime()).isNotNull();
        assertThat(response.endTime()).isNull();
    }

    @Test
    @DisplayName("updateStatus: invalid transition PENDING -> COMPLETED")
    void updateStatusInvalidTransition() {
        when(serviceOrderRepository.findById("order-1")).thenReturn(Optional.of(order));

        assertThatThrownBy(() -> serviceOrderService.updateStatus("order-1", ServiceStatus.COMPLETED))
                .isInstanceOf(InvalidStateTransitionException.class)
                .hasMessageContaining("Invalid transition");

        verify(serviceOrderRepository, never()).save(any(ServiceOrder.class));
    }

    @Test
    @DisplayName("updateStatus: service order not found")
    void updateStatusOrderNotFound() {
        when(serviceOrderRepository.findById("missing")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> serviceOrderService.updateStatus("missing", ServiceStatus.IN_PROGRESS))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Service order not found");
    }
}
