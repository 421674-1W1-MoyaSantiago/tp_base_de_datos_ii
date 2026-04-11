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
            <mat-card class="service-history-card" [class]="'service-history-card status-card-' + order.status">
              <mat-card-content>
                <div class="card-header">
                  <div class="card-heading">
                    <div class="order-number">{{ order.orderNumber || order.id }}</div>
                    <div class="meta-row">
                      <span class="vehicle-plate">{{ order.vehicleLicensePlate }}</span>
                      <span class="meta-dot">•</span>
                      <span class="service-tag">{{ getServiceTypeLabel(order.serviceType) }}</span>
                    </div>
                  </div>
                  <mat-chip [class]="'status-chip status-' + order.status">
                    {{ getStatusLabel(order.status) }}
                  </mat-chip>
                </div>

                <div class="details-grid">
                  <div class="detail-item">
                    <mat-icon>person</mat-icon>
                    <div>
                      <span class="detail-label">Cliente</span>
                      <span class="detail-value">{{ formatClientId(order.clientId) }}</span>
                    </div>
                  </div>
                  <div class="detail-item price">
                    <mat-icon>attach_money</mat-icon>
                    <div>
                      <span class="detail-label">Precio</span>
                      <span class="detail-value">\${{ order.price.toFixed(2) }}</span>
                    </div>
                  </div>
                </div>
              </mat-card-content>

              <mat-card-actions>
                <button mat-flat-button class="action-btn action-secondary" (click)="viewDetail(order)">Ver detalle</button>
                @if (order.status === ServiceStatus.PENDING) {
                  <button mat-flat-button class="action-btn action-primary" (click)="changeStatus(order, ServiceStatus.IN_PROGRESS)">
                    Iniciar
                  </button>
                }
                @if (order.status === ServiceStatus.IN_PROGRESS) {
                  <button mat-flat-button class="action-btn action-primary" (click)="changeStatus(order, ServiceStatus.COMPLETED)">
                    Completar
                  </button>
                }
                @if (order.status === ServiceStatus.COMPLETED) {
                  <button mat-flat-button class="action-btn action-primary" (click)="changeStatus(order, ServiceStatus.DELIVERED)">
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
      margin-top: 0;
      padding-top: 20px;
    }

    .service-history-card {
      border-radius: 16px !important;
      border: 1px solid #e4ebf5 !important;
      border-left: 5px solid #d0d9e8 !important;
      box-shadow: 0 10px 22px rgba(15, 23, 42, 0.07) !important;
      background: linear-gradient(160deg, #ffffff 0%, #f8fbff 100%) !important;
      transition: transform 180ms cubic-bezier(0.4, 0, 0.2, 1), box-shadow 180ms cubic-bezier(0.4, 0, 0.2, 1), border-color 180ms cubic-bezier(0.4, 0, 0.2, 1);
    }

    .service-history-card mat-card-content {
      padding: 14px 16px 10px !important;
    }

    .status-card-PENDING { border-left-color: #f59e0b !important; }
    .status-card-IN_PROGRESS { border-left-color: #2563eb !important; }
    .status-card-COMPLETED { border-left-color: #16a34a !important; }
    .status-card-DELIVERED { border-left-color: #64748b !important; }

    .service-history-card:hover {
      transform: translateY(-2px);
      border-color: #d7e3f1 !important;
      box-shadow: 0 16px 28px rgba(15, 23, 42, 0.1) !important;
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
      border-bottom: 1px solid #e9eff6;
      padding-bottom: 10px;
    }

    .card-heading {
      min-width: 0;
    }

    .order-number {
      font-weight: 700;
      font-size: 1rem;
      color: #111827;
    }

    .meta-row {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 4px;
    }

    .vehicle-plate {
      color: #475569;
      font-size: 0.95rem;
      font-weight: 700;
      letter-spacing: 0.3px;
    }

    .meta-dot {
      color: #94a3b8;
      font-weight: 700;
    }

    .service-tag {
      color: #64748b;
      font-size: 0.83rem;
      text-transform: uppercase;
      letter-spacing: 0.45px;
      font-weight: 700;
      padding: 3px 9px;
      border-radius: 999px;
      background: #eef4ff;
      border: 1px solid #dbe6f7;
    }

    .meta {
      color: #6b7280;
      font-size: 0.9rem;
      margin-top: 2px;
      text-transform: uppercase;
      letter-spacing: 0.35px;
      font-weight: 600;
    }

    .details-grid {
      margin-top: 0.9rem;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 10px;
      color: #374151;
      font-size: 0.9rem;
    }

    .detail-item {
      display: flex;
      align-items: center;
      gap: 10px;
      border: 1px solid #e5edf7;
      border-radius: 10px;
      padding: 10px 12px;
      background: linear-gradient(135deg, #ffffff 0%, #f8fbff 100%);
      color: #334155;
      font-weight: 500;
    }

    .detail-item mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      color: #748196;
    }

    .detail-item.price {
      background: linear-gradient(135deg, #f4fbf5 0%, #ecf9ef 100%);
      border-color: #d5edd8;
    }

    .detail-item div {
      display: flex;
      flex-direction: column;
      gap: 1px;
      min-width: 0;
    }

    .detail-label {
      color: #64748b;
      font-size: 0.78rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.35px;
    }

    .detail-value {
      color: #1f2937;
      font-size: 0.95rem;
      font-weight: 700;
      overflow-wrap: anywhere;
    }

    .detail-item.price .detail-value {
      color: #166534;
    }

    .detail-item.price mat-icon {
      color: #16a34a;
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
      border-radius: 9px !important;
      font-weight: 700;
      padding: 6px 14px !important;
      min-height: 36px;
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
      color: #ffffff !important;
      border: 1px solid rgba(21, 101, 192, 0.4);
      background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
      box-shadow: 0 6px 14px rgba(25, 118, 210, 0.24);
    }

    .action-primary:hover {
      background: linear-gradient(135deg, #1e88e5 0%, #1976d2 100%);
      box-shadow: 0 10px 18px rgba(25, 118, 210, 0.32);
      transform: translateY(-1px);
    }

    .status-chip {
      border-radius: 999px !important;
      border: 1px solid transparent;
      font-weight: 700;
      letter-spacing: 0.35px;
      text-transform: uppercase;
      font-size: 0.74rem !important;
    }

    .status-PENDING { background-color: #fef3c7 !important; color: #92400e !important; border-color: #fcd34d; }
    .status-IN_PROGRESS { background-color: #dbeafe !important; color: #1d4ed8 !important; border-color: #93c5fd; }
    .status-COMPLETED { background-color: #dcfce7 !important; color: #166534 !important; border-color: #86efac; }
    .status-DELIVERED { background-color: #e2e8f0 !important; color: #334155 !important; border-color: #cbd5e1; }

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

      .details-grid {
        grid-template-columns: 1fr;
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

  getServiceTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      BASIC: 'Basico',
      COMPLETE: 'Completo',
      PREMIUM: 'Premium',
      EXPRESS: 'Express'
    };
    return labels[type] || type;
  }

  getStatusLabel(status: ServiceStatus): string {
    const labels: Record<ServiceStatus, string> = {
      [ServiceStatus.PENDING]: 'Pendiente',
      [ServiceStatus.IN_PROGRESS]: 'En progreso',
      [ServiceStatus.COMPLETED]: 'Completado',
      [ServiceStatus.DELIVERED]: 'Entregado'
    };
    return labels[status] || status;
  }

  formatClientId(clientId: string): string {
    if (!clientId) {
      return '-';
    }

    if (clientId.length <= 16) {
      return clientId;
    }

    return `${clientId.slice(0, 8)}...${clientId.slice(-6)}`;
  }
}
