import { Component, OnInit, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { WashService } from '../../core/services/wash.service';
import { InvoiceService } from '../../core/services/invoice.service';
import { InvoiceModalComponent } from '../../shared/components/invoice-modal.component';
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
    MatSnackBarModule,
    MatDialogModule
  ],
  template: `
    <div class="page-container">
      <div class="header">
        <h1>Órdenes de Servicio</h1>
        <button mat-raised-button color="primary" class="new-order-btn" (click)="createOrder()">
          <mat-icon>add</mat-icon> Nueva Orden
        </button>
      </div>

      @if (loading()) {
        <div class="loading">
          <mat-spinner diameter="40"></mat-spinner>
        </div>
      } @else {
        <div class="cards">
          @for (order of sortedOrders(); track order.id) {
            <mat-card class="service-history-card" [class]="'status-card-' + order.status">
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
                  <div class="detail-item price" [class.paid]="order.invoiced" [class.unpaid]="!order.invoiced">
                    <mat-icon>{{ order.invoiced ? 'check_circle' : 'payments' }}</mat-icon>
                    <div>
                      <span class="detail-label">{{ order.invoiced ? 'Pagado' : 'Pendiente de Pago' }}</span>
                      <span class="detail-value">\${{ order.price.toFixed(2) }}</span>
                    </div>
                  </div>
                </div>
              </mat-card-content>

              <mat-card-actions class="action-row">
                <div class="main-actions">
                  <button mat-flat-button class="action-btn action-secondary" (click)="viewDetail(order)">
                    <mat-icon>visibility</mat-icon> Detalle
                  </button>
                  
                  @if (order.status === 'PENDING') {
                    <button mat-flat-button class="action-btn action-primary" (click)="changeStatus(order, ServiceStatus.IN_PROGRESS)">
                      Iniciar
                    </button>
                  }
                  @if (order.status === 'IN_PROGRESS') {
                    <button mat-flat-button class="action-btn action-success" (click)="changeStatus(order, ServiceStatus.COMPLETED)">
                      Completar
                    </button>
                  }
                  @if (order.status === 'COMPLETED') {
                    <button mat-flat-button class="action-btn action-primary" (click)="changeStatus(order, ServiceStatus.DELIVERED)">
                      Entregar
                    </button>
                  }
                </div>

                <!-- Botón de Facturación: Siempre visible en COMPLETED/DELIVERED si no está facturado -->
                @if ((order.status === 'COMPLETED' || order.status === 'DELIVERED') && !order.invoiced) {
                  <button mat-raised-button class="action-btn action-invoice" (click)="handleInvoice(order)">
                    <mat-icon>receipt</mat-icon> Facturar
                  </button>
                }
              </mat-card-actions>
            </mat-card>
          } @empty {
            <div class="empty-state">No hay órdenes registradas</div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .page-container { padding: 1.5rem; max-width: 1200px; margin: 0 auto; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
    .header h1 { margin: 0; font-size: 1.8rem; font-weight: 800; color: #1e293b; }
    .new-order-btn { border-radius: 12px !important; font-weight: 700 !important; background: #1976d2 !important; color: white !important; }
    .loading { display: flex; justify-content: center; padding: 3rem; }
    .cards { display: grid; gap: 1.5rem; }
    .service-history-card { border-radius: 16px !important; border: 1px solid #e2e8f0 !important; border-left: 6px solid #cbd5e1 !important; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1) !important; background: white !important; }
    .status-card-PENDING { border-left-color: #f59e0b !important; }
    .status-card-IN_PROGRESS { border-left-color: #2563eb !important; }
    .status-card-COMPLETED { border-left-color: #16a34a !important; }
    .status-card-DELIVERED { border-left-color: #64748b !important; }
    .card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; border-bottom: 1px solid #f1f5f9; padding-bottom: 0.75rem; }
    .order-number { font-weight: 800; font-size: 1.1rem; color: #0f172a; }
    .vehicle-plate { font-weight: 700; color: #475569; }
    .service-tag { font-size: 0.75rem; font-weight: 800; text-transform: uppercase; padding: 4px 8px; background: #f1f5f9; border-radius: 6px; color: #475569; }
    .details-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; }
    .detail-item { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem; border-radius: 10px; border: 1px solid #f1f5f9; }
    .detail-item.price.unpaid { background: #fff1f1; border-color: #fee2e2; color: #991b1b; }
    .detail-item.price.paid { background: #f0fdf4; border-color: #dcfce7; color: #166534; }
    .detail-label { display: block; font-size: 0.7rem; font-weight: 700; text-transform: uppercase; opacity: 0.7; }
    .detail-value { font-weight: 800; font-size: 1rem; }
    .action-row { display: flex; justify-content: space-between; padding: 1rem !important; border-top: 1px solid #f1f5f9; flex-wrap: wrap; gap: 0.75rem; }
    .main-actions { display: flex; gap: 0.5rem; }
    .action-btn { border-radius: 10px !important; font-weight: 700; min-height: 40px; }
    .action-invoice { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%) !important; color: white !important; box-shadow: 0 4px 12px rgba(217, 119, 6, 0.3) !important; }
    .status-chip { border-radius: 999px !important; font-weight: 800; text-transform: uppercase; font-size: 0.7rem !important; }
    @media (max-width: 600px) { .action-row { flex-direction: column; } .main-actions { flex-direction: column; } .action-invoice { width: 100%; } }
  `]
})
export class ServiceListComponent implements OnInit {
  private washService = inject(WashService);
  private invoiceService = inject(InvoiceService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  ServiceStatus = ServiceStatus;
  loading = this.washService.loading;
  serviceOrders = this.washService.serviceOrders;

  sortedOrders = computed(() => [...this.serviceOrders()].sort((a, b) => {
    const left = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const right = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return right - left;
  }));

  ngOnInit() { this.washService.loadServiceOrders(); }
  createOrder() { this.router.navigate(['/dashboard', 'services', 'new']); }
  viewDetail(order: ServiceOrder) { if (order.id) this.router.navigate(['/dashboard', 'services', order.id]); }

  changeStatus(order: ServiceOrder, status: ServiceStatus) {
    if (!order.id) return;
    this.washService.updateStatus(order.id, status).subscribe({
      next: () => this.snackBar.open('Estado actualizado', 'OK', { duration: 2000 }),
      error: () => this.snackBar.open('Error al actualizar', 'Cerrar', { duration: 2000 })
    });
  }

  handleInvoice(order: ServiceOrder) {
    if (!order.id) return;
    const dialogRef = this.dialog.open(InvoiceModalComponent, { width: '500px', data: { order } });
    dialogRef.afterClosed().subscribe(result => {
      if (result?.confirmed) {
        this.invoiceService.createInvoice(order.id!, result.paymentMethod, result.notes).subscribe({
          next: (invoice) => {
            this.snackBar.open(`Factura #${invoice.invoiceNumber} generada exitosamente`, 'OK', { duration: 5000 });
            this.washService.loadServiceOrders();
          },
          error: () => this.snackBar.open('Error al facturar', 'Cerrar', { duration: 3000 })
        });
      }
    });
  }

  getServiceTypeLabel(type: string): string {
    const labels: any = { BASIC: 'Basico', COMPLETE: 'Completo', PREMIUM: 'Premium', EXPRESS: 'Express' };
    return labels[type] || type;
  }

  getStatusLabel(status: ServiceStatus | string): string {
    const labels: any = { PENDING: 'Pendiente', IN_PROGRESS: 'En progreso', COMPLETED: 'Completado', DELIVERED: 'Entregado' };
    return labels[status] || status;
  }

  formatClientId(clientId: string): string {
    if (!clientId) return '-';
    return clientId.length <= 12 ? clientId : `${clientId.slice(0, 6)}...${clientId.slice(-4)}`;
  }
}
