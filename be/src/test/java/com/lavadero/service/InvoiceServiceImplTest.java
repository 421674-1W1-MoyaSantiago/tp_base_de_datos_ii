package com.lavadero.service;

import com.lavadero.dto.InvoiceRequest;
import com.lavadero.dto.InvoiceResponse;
import com.lavadero.dto.SalesReportResponse;
import com.lavadero.exception.DuplicateResourceException;
import com.lavadero.exception.InvalidStateTransitionException;
import com.lavadero.model.Invoice;
import com.lavadero.model.PaymentMethod;
import com.lavadero.model.PaymentStatus;
import com.lavadero.model.ServiceOrder;
import com.lavadero.model.ServiceStatus;
import com.lavadero.model.ServiceType;
import com.lavadero.repository.InvoiceRepository;
import com.lavadero.repository.ServiceOrderRepository;
import com.lavadero.service.impl.InvoiceServiceImpl;
import com.lavadero.util.InvoiceValidator;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("InvoiceServiceImpl Tests")
class InvoiceServiceImplTest {

    @Mock
    private InvoiceRepository invoiceRepository;
    @Mock
    private ServiceOrderRepository serviceOrderRepository;

    private InvoiceServiceImpl invoiceService;
    private ServiceOrder serviceOrder;
    private InvoiceRequest invoiceRequest;
    private Invoice createdInvoice;

    @BeforeEach
    void setUp() {
        invoiceService = new InvoiceServiceImpl(
                invoiceRepository,
                serviceOrderRepository,
                new InvoiceValidator(invoiceRepository)
        );

        invoiceRequest = new InvoiceRequest("order-1", PaymentMethod.CARD, "paid");

        serviceOrder = new ServiceOrder();
        serviceOrder.setId("order-1");
        serviceOrder.setClientId("client-1");
        serviceOrder.setServiceType(ServiceType.COMPLETE);
        serviceOrder.setStatus(ServiceStatus.COMPLETED);
        serviceOrder.setPrice(new BigDecimal("100.00"));

        createdInvoice = new Invoice();
        createdInvoice.setId("inv-1");
        createdInvoice.setInvoiceNumber("INV-1");
        createdInvoice.setServiceOrderId("order-1");
        createdInvoice.setClientId("client-1");
        createdInvoice.setAmount(new BigDecimal("100.00"));
        createdInvoice.setPaymentMethod(PaymentMethod.CARD);
        createdInvoice.setPaymentStatus(PaymentStatus.PAID);
        createdInvoice.setIssuedBy("employee-1");
        createdInvoice.setIssuedAt(LocalDateTime.now());
    }

    @Test
    @DisplayName("createInvoice: success for COMPLETED order")
    void createInvoiceSuccess() {
        when(serviceOrderRepository.findById("order-1")).thenReturn(Optional.of(serviceOrder));
        when(invoiceRepository.existsByServiceOrderId("order-1")).thenReturn(false);
        when(invoiceRepository.save(any(Invoice.class))).thenReturn(createdInvoice);

        InvoiceResponse response = invoiceService.createInvoice(invoiceRequest, "employee-1");

        assertThat(response.serviceOrderId()).isEqualTo("order-1");
        assertThat(response.amount()).isEqualByComparingTo("100.00");
        assertThat(response.paymentStatus()).isEqualTo(PaymentStatus.PAID);
    }

    @Test
    @DisplayName("createInvoice: fails if duplicate invoice exists")
    void createInvoiceDuplicate() {
        when(serviceOrderRepository.findById("order-1")).thenReturn(Optional.of(serviceOrder));
        when(invoiceRepository.existsByServiceOrderId("order-1")).thenReturn(true);

        assertThatThrownBy(() -> invoiceService.createInvoice(invoiceRequest, "employee-1"))
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessageContaining("Invoice already exists");

        verify(invoiceRepository, never()).save(any(Invoice.class));
    }

    @Test
    @DisplayName("createInvoice: fails for invalid service status")
    void createInvoiceInvalidState() {
        serviceOrder.setStatus(ServiceStatus.PENDING);
        when(serviceOrderRepository.findById("order-1")).thenReturn(Optional.of(serviceOrder));
        when(invoiceRepository.existsByServiceOrderId("order-1")).thenReturn(false);

        assertThatThrownBy(() -> invoiceService.createInvoice(invoiceRequest, "employee-1"))
                .isInstanceOf(InvalidStateTransitionException.class)
                .hasMessageContaining("must be COMPLETED or DELIVERED");

        verify(invoiceRepository, never()).save(any(Invoice.class));
    }

    @Test
    @DisplayName("sales report: totals and groupings only include paid invoices")
    void salesReportCalculations() {
        LocalDateTime start = LocalDateTime.of(2024, 1, 1, 0, 0);
        LocalDateTime end = LocalDateTime.of(2024, 1, 31, 23, 59);

        Invoice paidCard1 = invoice("inv-1", "100.00", PaymentMethod.CARD, PaymentStatus.PAID);
        Invoice paidCard2 = invoice("inv-2", "150.00", PaymentMethod.CARD, PaymentStatus.PAID);
        Invoice paidCash = invoice("inv-3", "50.00", PaymentMethod.CASH, PaymentStatus.PAID);
        Invoice unpaid = invoice("inv-4", "999.00", PaymentMethod.TRANSFER, PaymentStatus.PENDING);
        when(invoiceRepository.findByIssuedAtBetween(start, end))
                .thenReturn(List.of(paidCard1, paidCard2, paidCash, unpaid));

        SalesReportResponse report = invoiceService.getSalesReport(start, end);

        assertThat(report.totalAmount()).isEqualByComparingTo("300.00");
        assertThat(report.totalInvoices()).isEqualTo(3L);
        assertThat(report.byPaymentMethod())
                .containsEntry("CARD", new BigDecimal("250.00"))
                .containsEntry("CASH", new BigDecimal("50.00"))
                .doesNotContainKey("TRANSFER");
        assertThat(report.countByPaymentMethod())
                .containsEntry("CARD", 2L)
                .containsEntry("CASH", 1L)
                .doesNotContainKey("TRANSFER");
    }

    private Invoice invoice(String id, String amount, PaymentMethod method, PaymentStatus status) {
        Invoice invoice = new Invoice();
        invoice.setId(id);
        invoice.setAmount(new BigDecimal(amount));
        invoice.setPaymentMethod(method);
        invoice.setPaymentStatus(status);
        invoice.setIssuedAt(LocalDateTime.now());
        return invoice;
    }
}
