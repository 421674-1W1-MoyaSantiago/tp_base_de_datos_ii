package com.lavadero.controller;

import com.lavadero.dto.DashboardDailyRevenueResponse;
import com.lavadero.dto.InvoiceRequest;
import com.lavadero.dto.InvoiceResponse;
import com.lavadero.dto.SalesReportResponse;
import com.lavadero.service.InvoiceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/invoices")
@RequiredArgsConstructor
public class InvoiceController {

    private final InvoiceService invoiceService;

    @PostMapping
    public ResponseEntity<InvoiceResponse> createInvoice(
            @Valid @RequestBody InvoiceRequest request,
            Authentication authentication
    ) {
        // Extract employee ID from authenticated user (simplified - in production use a proper UserDetails)
        String employeeId = authentication.getName(); // This would need to be the actual employee ID
        InvoiceResponse response = invoiceService.createInvoice(request, employeeId);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<Page<InvoiceResponse>> getAllInvoices(Pageable pageable) {
        Page<InvoiceResponse> invoices = invoiceService.getAllInvoices(pageable);
        return ResponseEntity.ok(invoices);
    }

    @GetMapping("/{id}")
    public ResponseEntity<InvoiceResponse> getInvoiceById(@PathVariable String id) {
        InvoiceResponse response = invoiceService.getInvoiceById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/by-client/{clientId}")
    public ResponseEntity<List<InvoiceResponse>> getInvoicesByClient(@PathVariable String clientId) {
        List<InvoiceResponse> invoices = invoiceService.getInvoicesByClient(clientId);
        return ResponseEntity.ok(invoices);
    }

    @GetMapping("/date-range")
    public ResponseEntity<Page<InvoiceResponse>> getInvoicesByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end,
            Pageable pageable
    ) {
        Page<InvoiceResponse> invoices = invoiceService.getInvoicesByDateRange(start, end, pageable);
        return ResponseEntity.ok(invoices);
    }

    @GetMapping("/report")
    public ResponseEntity<SalesReportResponse> getSalesReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fromDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime toDate
    ) {
        SalesReportResponse report = invoiceService.getSalesReport(fromDate, toDate);
        return ResponseEntity.ok(report);
    }

    @GetMapping("/analytics/daily-revenue")
    public ResponseEntity<DashboardDailyRevenueResponse> getDashboardDailyRevenue(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(defaultValue = "14") Integer days
    ) {
        DashboardDailyRevenueResponse response = invoiceService.getDashboardDailyRevenue(startDate, days);
        return ResponseEntity.ok(response);
    }
}
