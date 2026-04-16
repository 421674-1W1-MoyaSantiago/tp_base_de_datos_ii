import { inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DashboardStatusDistribution, ServiceOrder, ServiceStatus } from '../models/models';

interface PageResponse<T> {
  content: T[];
}

@Injectable({
  providedIn: 'root'
})
export class WashService {
  private http = inject(HttpClient);
  
  serviceOrders = signal<ServiceOrder[]>([]);
  loading = signal<boolean>(false);

  loadServiceOrders(): void {
    this.loading.set(true);
    this.http.get<ServiceOrder[] | PageResponse<ServiceOrder>>(`${environment.apiUrl}/service-orders`)
      .pipe(tap(() => this.loading.set(false)))
      .subscribe({
        next: (response) => {
          const orders = Array.isArray(response) ? response : response.content ?? [];
          this.serviceOrders.set(orders);
        },
        error: () => this.loading.set(false)
      });
  }

  getServiceOrdersByStatus(status: ServiceStatus): ServiceOrder[] {
    return this.serviceOrders().filter(order => order.status === status);
  }

  createServiceOrder(order: Partial<ServiceOrder>): Observable<ServiceOrder> {
    return this.http.post<ServiceOrder>(`${environment.apiUrl}/service-orders`, order)
      .pipe(tap(newOrder => {
        this.serviceOrders.update(orders => [...orders, newOrder]);
      }));
  }

  updateStatus(orderId: string, newStatus: ServiceStatus): Observable<ServiceOrder> {
    return this.http.patch<ServiceOrder>(
      `${environment.apiUrl}/service-orders/${orderId}/status`,
      { status: newStatus }
    ).pipe(tap(updatedOrder => {
      this.serviceOrders.update(orders =>
        orders.map(o => o.id === orderId ? updatedOrder : o)
      );
    }));
  }

  getServiceOrderById(id: string): Observable<ServiceOrder> {
    return this.http.get<ServiceOrder>(`${environment.apiUrl}/service-orders/${id}`);
  }

  getServiceOrdersByClient(clientId: string): Observable<ServiceOrder[]> {
    return this.http.get<ServiceOrder[]>(`${environment.apiUrl}/service-orders/by-client/${clientId}`);
  }

  getDashboardStatusDistribution(date: string): Observable<DashboardStatusDistribution> {
    const params = new HttpParams().set('date', date);

    return this.http.get<DashboardStatusDistribution>(
      `${environment.apiUrl}/service-orders/analytics/status-distribution`,
      { params }
    );
  }
}
