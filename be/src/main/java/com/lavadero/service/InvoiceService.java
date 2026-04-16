package com.lavadero.service;

import com.lavadero.dto.DashboardDailyRevenueResponse;
import com.lavadero.dto.InvoiceRequest;
import com.lavadero.dto.InvoiceResponse;
import com.lavadero.dto.SalesReportResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public interface InvoiceService {
    InvoiceResponse createInvoice(InvoiceRequest request, String issuedByEmployeeId);
    InvoiceResponse getInvoiceById(String id);
    Page<InvoiceResponse> getAllInvoices(Pageable pageable);
    List<InvoiceResponse> getInvoicesByClient(String clientId);
    Page<InvoiceResponse> getInvoicesByDateRange(
        LocalDateTime start, 
        LocalDateTime end, 
        Pageable pageable
    );
    SalesReportResponse getSalesReport(LocalDateTime start, LocalDateTime end);
    DashboardDailyRevenueResponse getDashboardDailyRevenue(LocalDate startDate, int days);
}
