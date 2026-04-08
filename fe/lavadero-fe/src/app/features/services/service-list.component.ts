import { Component, OnInit, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { WashService } from '../../core/services/wash.service';
import { ServiceOrder, ServiceStatus } from '../../core/models/models';

@Component({
  selector: 'app-service-list',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  template: `
    <div class="page-container">
      <div class="header">
        <h1>Órdenes de Servicio</h1>
        <button mat-raised-button color="primary" (click)="createOrder()">
          <mat-icon>add</mat-icon>
          Nueva Orden
        </button>
      </div>

      @if (loading()) {
        <div class="loading">
          <mat-spinner diameter="40"></mat-spinner>
        </div>
      } @else {
        <div class="cards">
          @for (order of sortedOrders(); track order.id) {
            <mat-card>
              <mat-card-content>
                <div class="card-header">
                  <div>
                    <div class="order-number">{{ order.orderNumber || order.id }}</div>
                    <div class="meta">{{ order.vehicleLicensePlate }} · {{ order.serviceType }}</div>
                  </div>
                  <mat-chip [class]="'status-' + order.status">
                    {{ order.status }}
                  </mat-chip>
                </div>
                <div class="details">
                  <span>Cliente: {{ order.clientId }}</span>
                  <span>Precio: \${{ order.price }}</span>
                </div>
              </mat-card-content>
              <mat-card-actions>
                <button mat-button (click)="viewDetail(order)">Ver detalle</button>
                @if (order.status === ServiceStatus.PENDING) {
                  <button mat-button color="primary" (click)="changeStatus(order, ServiceStatus.IN_PROGRESS)">
                    Iniciar
                  </button>
                }
                @if (order.status === ServiceStatus.IN_PROGRESS) {
                  <button mat-button color="primary" (click)="changeStatus(order, ServiceStatus.COMPLETED)">
                    Completar
                  </button>
                }
                @if (order.status === ServiceStatus.COMPLETED) {
                  <button mat-button color="primary" (click)="changeStatus(order, ServiceStatus.DELIVERED)">
                    Entregar
                  </button>
                }
              </mat-card-actions>
            </mat-card>
          } @empty {
            <mat-card><mat-card-content>No hay órdenes de servicio.</mat-card-content></mat-card>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .page-container { padding: 1.5rem; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
    .loading { display: flex; justify-content: center; padding: 2rem; }
    .cards { display: grid; gap: 1rem; }
    .card-header { display: flex; justify-content: space-between; align-items: center; gap: 1rem; }
    .order-number { font-weight: 600; }
    .meta { color: #666; font-size: 0.9rem; }
    .details { margin-top: 0.75rem; display: flex; gap: 1rem; color: #444; font-size: 0.9rem; }
    .status-PENDING { background-color: #fff3cd; color: #856404; }
    .status-IN_PROGRESS { background-color: #cfe2ff; color: #084298; }
    .status-COMPLETED { background-color: #d1e7dd; color: #0f5132; }
    .status-DELIVERED { background-color: #d3d3d3; color: #383838; }
  `]
})
export class ServiceListComponent implements OnInit {
  private washService = inject(WashService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  ServiceStatus = ServiceStatus;
  loading = this.washService.loading;
  serviceOrders = this.washService.serviceOrders;

  sortedOrders = computed(() => [...this.serviceOrders()].sort((a, b) => {
    const left = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const right = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return right - left;
  }));

  ngOnInit(): void {
    this.washService.loadServiceOrders();
  }

  createOrder(): void {
    this.router.navigate(['/dashboard', 'services', 'new']);
  }

  viewDetail(order: ServiceOrder): void {
    if (!order.id) {
      return;
    }
    this.router.navigate(['/dashboard', 'services', order.id]);
  }

  changeStatus(order: ServiceOrder, status: ServiceStatus): void {
    if (!order.id) {
      return;
    }

    this.washService.updateStatus(order.id, status).subscribe({
      next: () => this.snackBar.open('Estado actualizado', 'Cerrar', { duration: 2500 }),
      error: () => this.snackBar.open('No se pudo actualizar el estado', 'Cerrar', { duration: 2500 })
    });
  }
}
