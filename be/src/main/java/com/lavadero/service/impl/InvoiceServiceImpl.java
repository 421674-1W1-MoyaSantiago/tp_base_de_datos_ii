package com.lavadero.service.impl;

import com.lavadero.dto.InvoiceRequest;
import com.lavadero.dto.InvoiceResponse;
import com.lavadero.dto.SalesReportResponse;
import com.lavadero.exception.ResourceNotFoundException;
import com.lavadero.model.Invoice;
import com.lavadero.model.PaymentStatus;
import com.lavadero.model.ServiceOrder;
import com.lavadero.repository.InvoiceRepository;
import com.lavadero.repository.ServiceOrderRepository;
import com.lavadero.service.InvoiceService;
import com.lavadero.util.InvoiceValidator;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InvoiceServiceImpl implements InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final ServiceOrderRepository serviceOrderRepository;
    private final InvoiceValidator invoiceValidator;

    @Override
    public InvoiceResponse createInvoice(InvoiceRequest request, String issuedByEmployeeId) {
        // Get service order and validate
        ServiceOrder serviceOrder = serviceOrderRepository.findById(request.serviceOrderId())
                .orElseThrow(() -> new ResourceNotFoundException(
                    "Service order not found with id: " + request.serviceOrderId()
                ));
        
        // Validate invoice creation using centralized validator
        invoiceValidator.validateInvoiceCreation(serviceOrder);

        Invoice invoice = new Invoice();
        invoice.setInvoiceNumber(generateInvoiceNumber());
        invoice.setServiceOrderId(request.serviceOrderId());
        invoice.setClientId(serviceOrder.getClientId());
        invoice.setAmount(serviceOrder.getPrice());
        invoice.setPaymentMethod(request.paymentMethod());
        invoice.setPaymentStatus(PaymentStatus.PAID);
        invoice.setIssuedBy(issuedByEmployeeId);
        invoice.setIssuedAt(LocalDateTime.now());
        invoice.setNotes(request.notes());

        Invoice savedInvoice = invoiceRepository.save(invoice);
        return mapToResponse(savedInvoice);
    }

    @Override
    public InvoiceResponse getInvoiceById(String id) {
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found with id: " + id));
        return mapToResponse(invoice);
    }

    @Override
    public Page<InvoiceResponse> getAllInvoices(Pageable pageable) {
        return invoiceRepository.findAll(pageable).map(this::mapToResponse);
    }

    @Override
    public List<InvoiceResponse> getInvoicesByClient(String clientId) {
        return invoiceRepository.findByClientId(clientId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public Page<InvoiceResponse> getInvoicesByDateRange(
            LocalDateTime start, 
            LocalDateTime end, 
            Pageable pageable
    ) {
        return invoiceRepository.findByIssuedAtBetween(start, end, pageable)
                .map(this::mapToResponse);
    }

    @Override
    public SalesReportResponse getSalesReport(LocalDateTime start, LocalDateTime end) {
        List<Invoice> invoices = invoiceRepository.findByIssuedAtBetween(start, end);

        BigDecimal totalAmount = invoices.stream()
                .filter(inv -> inv.getPaymentStatus() == PaymentStatus.PAID)
                .map(Invoice::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long totalInvoices = invoices.stream()
                .filter(inv -> inv.getPaymentStatus() == PaymentStatus.PAID)
                .count();

        Map<String, BigDecimal> byPaymentMethod = invoices.stream()
                .filter(inv -> inv.getPaymentStatus() == PaymentStatus.PAID)
                .collect(Collectors.groupingBy(
                        inv -> inv.getPaymentMethod().name(),
                        Collectors.reducing(BigDecimal.ZERO, Invoice::getAmount, BigDecimal::add)
                ));

        Map<String, Long> countByPaymentMethod = invoices.stream()
                .filter(inv -> inv.getPaymentStatus() == PaymentStatus.PAID)
                .collect(Collectors.groupingBy(
                        inv -> inv.getPaymentMethod().name(),
                        Collectors.counting()
                ));

        return new SalesReportResponse(
                totalAmount,
                totalInvoices,
                byPaymentMethod,
                countByPaymentMethod
        );
    }

    private String generateInvoiceNumber() {
        String prefix = "INV";
        String timestamp = String.valueOf(System.currentTimeMillis());
        String random = UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        return prefix + "-" + timestamp + "-" + random;
    }

    private InvoiceResponse mapToResponse(Invoice invoice) {
        return new InvoiceResponse(
                invoice.getId(),
                invoice.getInvoiceNumber(),
                invoice.getServiceOrderId(),
                invoice.getClientId(),
                invoice.getAmount(),
                invoice.getPaymentMethod(),
                invoice.getPaymentStatus(),
                invoice.getIssuedBy(),
                invoice.getIssuedAt(),
                invoice.getNotes()
        );
    }
}
