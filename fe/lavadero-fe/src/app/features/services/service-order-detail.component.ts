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
import { ServiceOrder, ServiceStatus, Client, Employee } from '../../core/models/models';
import { StatusChangeModalComponent } from '../../shared/components/status-change-modal.component';
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
                  <div class="info-row"><span class="label">Precio</span><span class="value price">\${{order()?.price?.toFixed(2)}}</span></div>
                  @if (employee()) {
                    <div class="info-row"><span class="label">Empleado</span><span class="value">{{employee()?.firstName}} {{employee()?.lastName}}</span></div>
                  }
                </div>
              </section>
            </div>

            @if (order()?.status === ServiceStatus.IN_PROGRESS || order()?.status === ServiceStatus.COMPLETED || order()?.status === ServiceStatus.DELIVERED) {
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
                    @if (order()?.createdAt) {
                      <div class="timeline-date">{{formatDate(order()!.createdAt)}}</div>
                    }
                  </div>
                </div>
                
                <div class="timeline-item" [class.active]="isStatusActive(ServiceStatus.IN_PROGRESS)">
                  <div class="timeline-marker"></div>
                  <div class="timeline-content">
                    <div class="timeline-title">En Progreso</div>
                    @if (order()?.startTime) {
                      <div class="timeline-date">{{formatDate(order()!.startTime)}}</div>
                    }
                  </div>
                </div>
                
                <div class="timeline-item" [class.active]="isStatusActive(ServiceStatus.COMPLETED)">
                  <div class="timeline-marker"></div>
                  <div class="timeline-content">
                    <div class="timeline-title">Completado</div>
                    @if (order()?.endTime) {
                      <div class="timeline-date">{{formatDate(order()!.endTime)}}</div>
                    }
                  </div>
                </div>
                
                <div class="timeline-item" [class.active]="isStatusActive(ServiceStatus.DELIVERED)">
                  <div class="timeline-marker"></div>
                  <div class="timeline-content">
                    <div class="timeline-title">Entregado</div>
                    @if (order()?.deliveryTime) {
                      <div class="timeline-date">{{formatDate(order()!.deliveryTime)}}</div>
                    }
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
    .page-container {
      padding: 24px 16px;
      max-width: 980px;
      margin: 0 auto;
    }

    .loading-state {
      text-align: center;
      padding: 48px 20px;
      color: #64748b;
      font-weight: 600;
      background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
      border: 1px solid #e5edf7;
      border-radius: 14px;
    }

    .detail-card {
      border-radius: 16px !important;
      border: 1px solid #e4ebf4 !important;
      background: linear-gradient(165deg, #ffffff 0%, #f8fbff 100%) !important;
      box-shadow: 0 14px 28px rgba(15, 23, 42, 0.08) !important;
    }

    .detail-header {
      padding-bottom: 10px;
      border-bottom: 1px solid #e9eff6;
      margin-bottom: 8px;
    }

    .detail-title-row {
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 14px;
      flex-wrap: wrap;
    }

    h1 {
      margin: 0;
      font-size: 1.35rem;
      font-weight: 800;
      color: #0f172a;
    }

    .subtitle {
      margin: 4px 0 0 0;
      color: #64748b;
      font-size: 0.9rem;
      letter-spacing: 0.3px;
      text-transform: uppercase;
      font-weight: 600;
    }

    .status-chip {
      border-radius: 999px !important;
      font-weight: 700 !important;
      letter-spacing: 0.35px;
      text-transform: uppercase;
      border: 1px solid transparent;
      font-size: 0.75rem !important;
    }

    .status-PENDING { background: #fef3c7 !important; color: #92400e !important; border-color: #fcd34d; }
    .status-IN_PROGRESS { background: #dbeafe !important; color: #1d4ed8 !important; border-color: #93c5fd; }
    .status-COMPLETED { background: #dcfce7 !important; color: #166534 !important; border-color: #86efac; }
    .status-DELIVERED { background: #e2e8f0 !important; color: #334155 !important; border-color: #cbd5e1; }

    .detail-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 14px;
      margin: 8px 0 16px;
    }

    .info-panel,
    .timer-panel,
    .timeline-panel,
    .notes-panel {
      border: 1px solid #e7edf6;
      border-radius: 12px;
      padding: 14px;
      background: linear-gradient(135deg, #ffffff 0%, #f9fbff 100%);
      margin-bottom: 14px;
    }

    h3 {
      margin: 0 0 10px 0;
      color: #1f2937;
      font-size: 1rem;
      font-weight: 700;
    }

    .info-list {
      display: flex;
      flex-direction: column;
      gap: 9px;
    }

    .info-row {
      display: flex;
      justify-content: space-between;
      gap: 12px;
      border-bottom: 1px dashed #e6edf5;
      padding-bottom: 8px;
    }

    .info-row:last-child {
      border-bottom: none;
      padding-bottom: 0;
    }

    .label {
      color: #64748b;
      font-weight: 600;
      font-size: 0.9rem;
    }

    .value {
      color: #1f2937;
      font-weight: 600;
      text-align: right;
      overflow-wrap: anywhere;
    }

    .price {
      color: #15803d;
      font-size: 1.05rem;
    }

    .timeline {
      display: flex;
      flex-direction: column;
      gap: 14px;
      padding-left: 22px;
    }

    .timeline-item {
      position: relative;
      display: flex;
      align-items: center;
      gap: 14px;
      opacity: 0.45;
      transition: opacity 180ms ease;
    }

    .timeline-item.active {
      opacity: 1;
    }

    .timeline-marker {
      position: absolute;
      left: -22px;
      width: 14px;
      height: 14px;
      border-radius: 50%;
      background-color: #cbd5e1;
      border: 3px solid #ffffff;
      box-shadow: 0 0 0 2px #cbd5e1;
    }

    .timeline-item.active .timeline-marker {
      background-color: #1976d2;
      box-shadow: 0 0 0 2px #1976d2;
    }

    .timeline-item:not(:last-child)::before {
      content: '';
      position: absolute;
      left: -16px;
      top: 14px;
      width: 2px;
      height: calc(100% + 14px);
      background-color: #d5deea;
    }

    .timeline-item.active:not(:last-child)::before {
      background-color: #1976d2;
    }

    .timeline-title {
      font-weight: 700;
      color: #1f2937;
      font-size: 0.95rem;
    }

    .timeline-date {
      color: #64748b;
      font-size: 0.82rem;
      margin-top: 2px;
    }

    .notes-panel p {
      margin: 0;
      color: #334155;
      line-height: 1.55;
    }

    .actions {
      display: flex;
      gap: 10px;
      justify-content: flex-end;
      border-top: 1px solid #e9eff6;
      padding: 12px 16px 16px !important;
      flex-wrap: wrap;
    }

    .actions button {
      border-radius: 10px !important;
      min-height: 38px;
      font-weight: 700;
    }

    .btn-secondary {
      border: 1px solid #d1dbe8 !important;
      background: #ffffff !important;
      color: #475569 !important;
    }

    .btn-primary {
      background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%) !important;
      color: #ffffff !important;
      box-shadow: 0 4px 12px rgba(25, 118, 210, 0.28) !important;
    }

    .btn-success {
      background: linear-gradient(135deg, #16a34a 0%, #15803d 100%) !important;
      color: #ffffff !important;
      box-shadow: 0 4px 12px rgba(22, 163, 74, 0.26) !important;
    }

    .btn-warn {
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%) !important;
      color: #ffffff !important;
      box-shadow: 0 4px 12px rgba(217, 119, 6, 0.24) !important;
    }

    @media (max-width: 768px) {
      .page-container {
        padding: 16px;
      }

      .actions button {
        width: 100%;
      }

      .info-row {
        flex-direction: column;
        align-items: flex-start;
      }

      .value {
        text-align: left;
      }
    }
  `]
})
export class ServiceOrderDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private washService = inject(WashService);
  private clientService = inject(ClientService);
  private employeeService = inject(EmployeeService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  ServiceStatus = ServiceStatus;
  
  order = signal<ServiceOrder | null>(null);
  client = signal<Client | null>(null);
  employee = signal<Employee | null>(null);
  loading = signal(true);

  ngOnInit() {
    const orderId = this.route.snapshot.paramMap.get('id');
    if (orderId) {
      this.loadOrder(orderId);
    }
  }

  loadOrder(id: string) {
    this.loading.set(true);
    this.washService.getServiceOrderById(id).subscribe({
      next: (order) => {
        this.order.set(order);
        this.loadRelatedData(order);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading order:', err);
        this.loading.set(false);
      }
    });
  }

  loadRelatedData(order: ServiceOrder) {
    if (order.clientId) {
      this.clientService.getClientById(order.clientId).subscribe({
        next: (client) => this.client.set(client),
        error: (err) => console.error('Error loading client:', err)
      });
    }

    if (order.assignedEmployeeId) {
      this.employeeService.getEmployeeById(order.assignedEmployeeId).subscribe({
        next: (employee) => this.employee.set(employee),
        error: (err) => console.error('Error loading employee:', err)
      });
    }
  }

  changeStatus(newStatus: ServiceStatus) {
    const currentOrder = this.order();
    if (!currentOrder || !currentOrder.id) return;

    const dialogRef = this.dialog.open(StatusChangeModalComponent, {
      width: '500px',
      data: {
        currentStatus: currentOrder.status,
        newStatus: newStatus,
        orderId: currentOrder.id
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.confirmed && currentOrder.id) {
        this.washService.updateStatus(currentOrder.id, newStatus).subscribe({
          next: (updatedOrder) => {
            this.order.set(updatedOrder);
            this.snackBar.open('Estado actualizado exitosamente', 'Cerrar', { duration: 3000 });
          },
          error: (err) => {
            console.error('Error updating status:', err);
            this.snackBar.open('Error al actualizar el estado', 'Cerrar', { duration: 3000 });
          }
        });
      }
    });
  }

  createInvoice() {
    const currentOrder = this.order();
    if (!currentOrder?.id) return;
    
    this.snackBar.open('Redirigiendo a facturación...', 'Cerrar', { duration: 2000 });
    this.router.navigate(['/dashboard', 'billing', 'invoice-form', currentOrder.id]);
  }

  isStatusActive(status: ServiceStatus): boolean {
    const currentOrder = this.order();
    if (!currentOrder) return false;

    const statusOrder = [
      ServiceStatus.PENDING,
      ServiceStatus.IN_PROGRESS,
      ServiceStatus.COMPLETED,
      ServiceStatus.DELIVERED
    ];

    const currentIndex = statusOrder.indexOf(currentOrder.status);
    const checkIndex = statusOrder.indexOf(status);

    return checkIndex <= currentIndex;
  }

  formatDate(dateString?: string): string {
    if (!dateString) {
      return '-';
    }
    const date = new Date(dateString);
    return date.toLocaleString('es-AR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
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

  goBack() {
    this.router.navigate(['/dashboard', 'services']);
  }
}
