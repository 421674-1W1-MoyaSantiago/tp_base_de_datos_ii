import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';

import { WashService } from '../../core/services/wash.service';
import { ClientService } from '../../core/services/client.service';
import { EmployeeService } from '../../core/services/employee.service';
import { InvoiceService } from '../../core/services/invoice.service';
import { ServiceOrder, ServiceStatus, Client, Employee } from '../../core/models/models';
import { StatusChangeModalComponent } from '../../shared/components/status-change-modal.component';
import { InvoiceModalComponent } from '../../shared/components/invoice-modal.component';
import { TimerComponent } from '../../shared/components/timer.component';

@Component({
  selector: 'app-service-order-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatDialogModule,
    MatSnackBarModule,
    MatChipsModule,
    MatIconModule,
    TimerComponent
  ],
  template: `
    <div class="page-container">
      @if (loading()) {
        <div class="loading-state">Cargando detalle del servicio...</div>
      } @else if (order()) {
        <mat-card class="detail-card">
          <mat-card-header class="detail-header">
            <div class="detail-title-row">
              <div>
                <h1>Orden #{{ order()?.orderNumber || order()?.id }}</h1>
                <p class="subtitle">{{ order()?.vehicleLicensePlate }} · {{ getServiceTypeLabel(order()?.serviceType || '') }}</p>
              </div>
              <mat-chip class="status-chip" [class]="'status-chip status-' + order()?.status">
                {{ getStatusLabel(order()?.status || ServiceStatus.PENDING) }}
              </mat-chip>
            </div>
          </mat-card-header>

          <mat-card-content>
            <div class="detail-grid">
              <section class="info-panel">
                <h3>Información del Cliente</h3>
                @if (client()) {
                  <div class="info-list">
                    <div class="info-row"><span class="label">Nombre</span><span class="value">{{client()?.firstName}} {{client()?.lastName}}</span></div>
                    <div class="info-row"><span class="label">DNI</span><span class="value">{{client()?.dni}}</span></div>
                    <div class="info-row"><span class="label">Email</span><span class="value">{{client()?.email}}</span></div>
                    @if (client()?.phone) {
                      <div class="info-row"><span class="label">Teléfono</span><span class="value">{{client()?.phone}}</span></div>
                    }
                  </div>
                }
              </section>

              <section class="info-panel">
                <h3>Detalles del Servicio</h3>
                <div class="info-list">
                  <div class="info-row"><span class="label">Vehículo</span><span class="value">{{order()?.vehicleLicensePlate}}</span></div>
                  <div class="info-row"><span class="label">Tipo</span><span class="value">{{ getServiceTypeLabel(order()?.serviceType || '') }}</span></div>
                  <div class="info-row price-display" [class.paid]="order()?.invoiced">
                    <span class="label">Precio</span>
                    <span class="value">\${{order()?.price?.toFixed(2)}} ({{order()?.invoiced ? 'Pagado' : 'Pendiente'}})</span>
                  </div>
                  @if (employee()) {
                    <div class="info-row"><span class="label">Empleado</span><span class="value">{{employee()?.firstName}} {{employee()?.lastName}}</span></div>
                  }
                </div>
              </section>
            </div>

            @if (order()?.status !== ServiceStatus.PENDING) {
              <section class="timer-panel">
                <h3>Tiempo de Servicio</h3>
                <app-timer 
                  [startTime]="order()?.startTime"
                  [endTime]="order()?.endTime"
                  [status]="order()!.status">
                </app-timer>
              </section>
            }

            <section class="timeline-panel">
              <h3>Estado del Servicio</h3>
              <div class="timeline">
                <div class="timeline-item" [class.active]="isStatusActive(ServiceStatus.PENDING)">
                  <div class="timeline-marker"></div>
                  <div class="timeline-content">
                    <div class="timeline-title">Pendiente</div>
                    @if (order()?.createdAt) { <div class="timeline-date">{{formatDate(order()!.createdAt)}}</div> }
                  </div>
                </div>
                
                <div class="timeline-item" [class.active]="isStatusActive(ServiceStatus.IN_PROGRESS)">
                  <div class="timeline-marker"></div>
                  <div class="timeline-content">
                    <div class="timeline-title">En Progreso</div>
                    @if (order()?.startTime) { <div class="timeline-date">{{formatDate(order()!.startTime)}}</div> }
                  </div>
                </div>
                
                <div class="timeline-item" [class.active]="isStatusActive(ServiceStatus.COMPLETED)">
                  <div class="timeline-marker"></div>
                  <div class="timeline-content">
                    <div class="timeline-title">Completado</div>
                    @if (order()?.endTime) { <div class="timeline-date">{{formatDate(order()!.endTime)}}</div> }
                  </div>
                </div>
                
                <div class="timeline-item" [class.active]="isStatusActive(ServiceStatus.DELIVERED)">
                  <div class="timeline-marker"></div>
                  <div class="timeline-content">
                    <div class="timeline-title">Entregado</div>
                    @if (order()?.deliveryTime) { <div class="timeline-date">{{formatDate(order()!.deliveryTime)}}</div> }
                  </div>
                </div>
              </div>
            </section>

            @if (order()?.notes) {
              <section class="notes-panel">
                <h3>Observaciones</h3>
                <p>{{order()?.notes}}</p>
              </section>
            }
          </mat-card-content>

          <mat-card-actions class="actions">
            <button mat-flat-button class="btn-secondary" (click)="goBack()">Volver</button>
            
            @if (order()?.status === ServiceStatus.PENDING) {
              <button mat-flat-button class="btn-primary" (click)="changeStatus(ServiceStatus.IN_PROGRESS)">
                <mat-icon>play_arrow</mat-icon> Iniciar
              </button>
            }
            
            @if (order()?.status === ServiceStatus.IN_PROGRESS) {
              <button mat-flat-button class="btn-success" (click)="changeStatus(ServiceStatus.COMPLETED)">
                <mat-icon>check_circle</mat-icon> Completar
              </button>
            }
            
            @if (order()?.status === ServiceStatus.COMPLETED) {
              <button mat-flat-button class="btn-primary" (click)="changeStatus(ServiceStatus.DELIVERED)">
                <mat-icon>local_shipping</mat-icon> Entregar
              </button>
            }

            @if ((order()?.status === ServiceStatus.COMPLETED || order()?.status === ServiceStatus.DELIVERED) && !order()?.invoiced) {
              <button mat-flat-button class="btn-warn" (click)="createInvoice()">
                <mat-icon>receipt</mat-icon> Facturar
              </button>
            }
          </mat-card-actions>
        </mat-card>
      } @else {
        <div class="loading-state">Orden no encontrada</div>
      }
    </div>
  `,
  styles: [`
    .page-container { padding: 24px 16px; max-width: 980px; margin: 0 auto; }
    .loading-state { text-align: center; padding: 48px; color: #64748b; font-weight: 600; }
    .detail-card { border-radius: 16px !important; border: 1px solid #e4ebf4 !important; box-shadow: 0 10px 30px rgba(0,0,0,0.08) !important; }
    .detail-header { border-bottom: 1px solid #f1f5f9; padding-bottom: 16px; margin-bottom: 16px; }
    .detail-title-row { width: 100%; display: flex; justify-content: space-between; align-items: flex-start; }
    h1 { margin: 0; font-size: 1.5rem; font-weight: 800; color: #0f172a; }
    .subtitle { margin: 4px 0 0 0; color: #64748b; font-size: 0.9rem; font-weight: 600; }
    .status-chip { border-radius: 999px !important; font-weight: 700 !important; text-transform: uppercase; font-size: 0.7rem !important; }
    .status-PENDING { background: #fef3c7 !important; color: #92400e !important; }
    .status-IN_PROGRESS { background: #dbeafe !important; color: #1d4ed8 !important; }
    .status-COMPLETED { background: #dcfce7 !important; color: #166534 !important; }
    .status-DELIVERED { background: #f1f5f9 !important; color: #475569 !important; }
    .detail-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin-bottom: 24px; }
    .info-panel, .timer-panel, .timeline-panel, .notes-panel { border: 1px solid #f1f5f9; border-radius: 12px; padding: 20px; background: white; margin-bottom: 20px; }
    h3 { margin: 0 0 12px 0; color: #1e293b; font-size: 1rem; font-weight: 700; }
    .info-list { display: flex; flex-direction: column; gap: 10px; }
    .info-row { display: flex; justify-content: space-between; padding-bottom: 8px; border-bottom: 1px dashed #f1f5f9; }
    .price-display.paid { color: #166534; font-weight: 800; }
    .price-display:not(.paid) { color: #b91c1c; font-weight: 800; }
    .label { color: #64748b; font-weight: 600; font-size: 0.85rem; }
    .value { color: #1e293b; font-weight: 700; }
    .timeline { display: flex; flex-direction: column; gap: 16px; padding-left: 20px; }
    .timeline-item { position: relative; display: flex; align-items: center; gap: 12px; opacity: 0.5; }
    .timeline-item.active { opacity: 1; }
    .timeline-marker { width: 12px; height: 12px; border-radius: 50%; background: #cbd5e1; border: 2px solid white; box-shadow: 0 0 0 2px #cbd5e1; }
    .timeline-item.active .timeline-marker { background: #1976d2; box-shadow: 0 0 0 2px #1976d2; }
    .actions { display: flex; gap: 12px; justify-content: flex-end; padding: 16px !important; border-top: 1px solid #f1f5f9; }
    .btn-secondary { background: #f8fafc !important; color: #475569 !important; border: 1px solid #e2e8f0 !important; }
    .btn-primary { background: #1976d2 !important; color: white !important; }
    .btn-success { background: #16a34a !important; color: white !important; }
    .btn-warn { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%) !important; color: white !important; }
    @media (max-width: 600px) { .actions { flex-direction: column; } .actions button { width: 100%; } }
  `]
})
export class ServiceOrderDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private washService = inject(WashService);
  private clientService = inject(ClientService);
  private employeeService = inject(EmployeeService);
  private invoiceService = inject(InvoiceService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  ServiceStatus = ServiceStatus;
  order = signal<ServiceOrder | null>(null);
  client = signal<Client | null>(null);
  employee = signal<Employee | null>(null);
  loading = signal(true);

  ngOnInit() {
    const orderId = this.route.snapshot.paramMap.get('id');
    if (orderId) this.loadOrder(orderId);
  }

  loadOrder(id: string) {
    this.loading.set(true);
    this.washService.getServiceOrderById(id).subscribe({
      next: (order) => {
        this.order.set(order);
        this.loadRelatedData(order);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  loadRelatedData(order: ServiceOrder) {
    if (order.clientId) this.clientService.getClientById(order.clientId).subscribe(c => this.client.set(c));
    if (order.assignedEmployeeId) this.employeeService.getEmployeeById(order.assignedEmployeeId).subscribe(e => this.employee.set(e));
  }

  changeStatus(newStatus: ServiceStatus) {
    const currentOrder = this.order();
    if (!currentOrder?.id) return;

    this.washService.updateStatus(currentOrder.id, newStatus).subscribe({
      next: (updatedOrder) => {
        this.order.set(updatedOrder);
        this.snackBar.open('Estado actualizado', 'Cerrar', { duration: 2500 });
      }
    });
  }

  createInvoice() {
    const currentOrder = this.order();
    if (!currentOrder?.id) return;
    
<<<<<<< HEAD
    const dialogRef = this.dialog.open(InvoiceModalComponent, { width: '500px', data: { order: currentOrder } });
    dialogRef.afterClosed().subscribe(result => {
      if (result?.confirmed) {
        this.invoiceService.createInvoice(currentOrder.id!, result.paymentMethod, result.notes).subscribe({
          next: (invoice) => {
            this.snackBar.open(`Factura #${invoice.invoiceNumber} generada`, 'Cerrar', { duration: 5000 });
            this.loadOrder(currentOrder.id!);
          }
        });
      }
    });
=======
    this.snackBar.open('Redirigiendo a facturación...', 'Cerrar', { duration: 2000 });
    this.router.navigate(['/dashboard', 'billing', 'invoice-form', currentOrder.id]);
>>>>>>> develop
  }

  isStatusActive(status: ServiceStatus): boolean {
    const currentOrder = this.order();
    if (!currentOrder) return false;
    const statusOrder = [ServiceStatus.PENDING, ServiceStatus.IN_PROGRESS, ServiceStatus.COMPLETED, ServiceStatus.DELIVERED];
    return statusOrder.indexOf(status) <= statusOrder.indexOf(currentOrder.status);
  }

  formatDate(dateString?: string): string {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('es-AR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
  }

  getServiceTypeLabel(type: string): string {
    const labels: any = { BASIC: 'Basico', COMPLETE: 'Completo', PREMIUM: 'Premium', EXPRESS: 'Express' };
    return labels[type] || type;
  }

  getStatusLabel(status: ServiceStatus): string {
    const labels: any = { PENDING: 'Pendiente', IN_PROGRESS: 'En progreso', COMPLETED: 'Completado', DELIVERED: 'Entregado' };
    return labels[status] || status;
  }

  goBack() { this.router.navigate(['/dashboard', 'services']); }
}
