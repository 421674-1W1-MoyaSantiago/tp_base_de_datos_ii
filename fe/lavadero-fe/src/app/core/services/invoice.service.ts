import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Invoice, PaymentMethod, SalesReport } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {
  private http = inject(HttpClient);

  private normalizePaymentMethod(paymentMethod: PaymentMethod | string): PaymentMethod {
    const normalized = String(paymentMethod ?? '')
      .trim()
      .toUpperCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '_');

    if (normalized === 'CASH' || normalized === 'EFECTIVO') {
      return PaymentMethod.CASH;
    }

    if (
      normalized === 'CARD' ||
      normalized === 'TARJETA' ||
      normalized === 'DEBIT_CARD' ||
      normalized === 'CREDIT_CARD' ||
      normalized === 'DEBITO_CREDITO'
    ) {
      return PaymentMethod.CARD;
    }

    if (normalized === 'TRANSFER' || normalized === 'TRANSFERENCIA' || normalized === 'BANK_TRANSFER') {
      return PaymentMethod.TRANSFER;
    }

    return paymentMethod as PaymentMethod;
  }

  createInvoice(serviceOrderId: string, paymentMethod: PaymentMethod | string, notes?: string): Observable<Invoice> {
    const normalizedPaymentMethod = this.normalizePaymentMethod(paymentMethod);

    return this.http.post<Invoice>(`${environment.apiUrl}/invoices`, {
      serviceOrderId,
      paymentMethod: normalizedPaymentMethod,
      notes
    });
  }

  getInvoices(page: number = 0, size: number = 20): Observable<any> {
    return this.http.get(`${environment.apiUrl}/invoices?page=${page}&size=${size}`);
  }

  getInvoiceById(id: string): Observable<Invoice> {
    return this.http.get<Invoice>(`${environment.apiUrl}/invoices/${id}`);
  }

  getInvoicesByClient(clientId: string): Observable<Invoice[]> {
    return this.http.get<Invoice[]>(`${environment.apiUrl}/invoices/by-client/${clientId}`);
  }

  getSalesReport(fromDate: string, toDate: string): Observable<SalesReport> {
    return this.http.get<SalesReport>(
      `${environment.apiUrl}/invoices/report?fromDate=${fromDate}&toDate=${toDate}`
    );
  }
}
