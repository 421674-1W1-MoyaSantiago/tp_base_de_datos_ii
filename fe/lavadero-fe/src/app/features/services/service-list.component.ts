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
        <button mat-raised-button color="primary" class="new-order-btn" (click)="createOrder()">
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
                <button mat-button class="action-btn action-secondary" (click)="viewDetail(order)">Ver detalle</button>
                @if (order.status === ServiceStatus.PENDING) {
                  <button mat-button class="action-btn action-primary" (click)="changeStatus(order, ServiceStatus.IN_PROGRESS)">
                    Iniciar
                  </button>
                }
                @if (order.status === ServiceStatus.IN_PROGRESS) {
                  <button mat-button class="action-btn action-primary" (click)="changeStatus(order, ServiceStatus.COMPLETED)">
                    Completar
                  </button>
                }
                @if (order.status === ServiceStatus.COMPLETED) {
                  <button mat-button class="action-btn action-primary" (click)="changeStatus(order, ServiceStatus.DELIVERED)">
                    Entregar
                  </button>
                }
              </mat-card-actions>
            </mat-card>
          } @empty {
            <mat-card class="empty-state-card">
              <mat-card-content>
                <div class="empty-state">
                  <mat-icon>local_car_wash</mat-icon>
                  <h2>Sin servicios cargados</h2>
                  <p>Aún no hay órdenes de servicio para mostrar. Podés crear una nueva orden para comenzar.</p>
                  <button mat-raised-button color="primary" class="empty-state-btn" (click)="createOrder()">
                    <mat-icon>add</mat-icon>
                    Crear primera orden
                  </button>
                </div>
              </mat-card-content>
            </mat-card>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .page-container {
      padding: 1.5rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.25rem;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .header h1 {
      margin: 0;
      font-size: 1.7rem;
      color: #1f2937;
      letter-spacing: -0.3px;
    }

    .new-order-btn {
      border-radius: 10px !important;
      padding: 0 16px !important;
      min-height: 42px;
      box-shadow: 0 6px 14px rgba(25, 118, 210, 0.25) !important;
      font-weight: 700 !important;
      letter-spacing: 0.2px;
      border: 1px solid rgba(21, 101, 192, 0.4) !important;
      background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%) !important;
      color: #ffffff !important;
    }

    .new-order-btn mat-icon {
      margin-right: 6px;
      color: #ffffff;
    }

    .new-order-btn:hover {
      background: linear-gradient(135deg, #1e88e5 0%, #1976d2 100%) !important;
      box-shadow: 0 10px 20px rgba(25, 118, 210, 0.35) !important;
    }

    .loading {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 3rem 1rem;
    }

    .cards {
      display: grid;
      gap: 1rem;
    }

    .cards mat-card {
      border-radius: 12px !important;
      border: 1px solid #e5e7eb !important;
      box-shadow: 0 4px 14px rgba(15, 23, 42, 0.06) !important;
      background: linear-gradient(135deg, #ffffff 0%, #f9fafb 100%) !important;
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
    }

    .order-number {
      font-weight: 700;
      font-size: 1rem;
      color: #111827;
    }

    .meta {
      color: #6b7280;
      font-size: 0.9rem;
      margin-top: 2px;
    }

    .details {
      margin-top: 0.85rem;
      display: flex;
      gap: 1rem;
      color: #374151;
      font-size: 0.92rem;
      flex-wrap: wrap;
    }

    .empty-state-card {
      border-style: dashed !important;
      border-width: 2px !important;
      border-color: #d1d5db !important;
      box-shadow: none !important;
      background: linear-gradient(135deg, #fafafa 0%, #f3f4f6 100%) !important;
    }

    .empty-state {
      min-height: 280px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      gap: 0.75rem;
      padding: 2rem 1rem;
    }

    .empty-state > mat-icon {
      width: 56px;
      height: 56px;
      font-size: 56px;
      color: #9ca3af;
      opacity: 0.9;
    }

    .empty-state h2 {
      margin: 0;
      font-size: 1.25rem;
      color: #1f2937;
    }

    .empty-state p {
      margin: 0;
      max-width: 520px;
      color: #6b7280;
      line-height: 1.5;
    }

    .empty-state-btn {
      margin-top: 0.5rem;
      border-radius: 10px !important;
      min-height: 42px;
      padding: 0 16px !important;
      font-weight: 700 !important;
      border: 1px solid rgba(21, 101, 192, 0.42) !important;
      box-shadow: 0 8px 18px rgba(25, 118, 210, 0.26) !important;
      background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%) !important;
      color: #fff !important;
    }

    .empty-state-btn mat-icon {
      width: 20px;
      height: 20px;
      font-size: 20px;
      margin-right: 6px;
    }

    .empty-state-btn:hover {
      background: linear-gradient(135deg, #1e88e5 0%, #1976d2 100%) !important;
      box-shadow: 0 12px 22px rgba(25, 118, 210, 0.34) !important;
    }

    mat-card-actions {
      display: flex;
      gap: 0.5rem;
      justify-content: flex-end;
      padding: 0.8rem 1rem 1rem !important;
      border-top: 1px solid #edf0f3;
      flex-wrap: wrap;
    }

    .action-btn {
      border-radius: 8px;
      font-weight: 600;
      padding: 6px 12px !important;
      min-height: 34px;
      transition: all 160ms ease;
    }

    .action-secondary {
      color: #475569 !important;
      border: 1px solid #d1d5db;
      background: #ffffff;
    }

    .action-secondary:hover {
      border-color: #9ca3af;
      background: #f8fafc;
    }

    .action-primary {
      color: #0b5394 !important;
      border: 1px solid #bfdbfe;
      background: #eef6ff;
    }

    .action-primary:hover {
      border-color: #93c5fd;
      background: #dbeafe;
      color: #1d4ed8 !important;
    }

    .status-PENDING { background-color: #fff3cd; color: #856404; }
    .status-IN_PROGRESS { background-color: #cfe2ff; color: #084298; }
    .status-COMPLETED { background-color: #d1e7dd; color: #0f5132; }
    .status-DELIVERED { background-color: #d3d3d3; color: #383838; }

    @media (max-width: 768px) {
      .page-container {
        padding: 1rem;
      }

      .new-order-btn {
        width: 100%;
        justify-content: center;
      }

      mat-card-actions {
        justify-content: stretch;
      }

      .action-btn {
        flex: 1;
        justify-content: center;
      }
    }
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
