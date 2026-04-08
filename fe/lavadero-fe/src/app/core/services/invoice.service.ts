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

  createInvoice(serviceOrderId: string, paymentMethod: PaymentMethod, notes?: string): Observable<Invoice> {
    return this.http.post<Invoice>(`${environment.apiUrl}/invoices`, {
      serviceOrderId,
      paymentMethod,
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
