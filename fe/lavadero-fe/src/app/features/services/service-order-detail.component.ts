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
    <div class="container mx-auto p-4 max-w-4xl">
      @if (loading()) {
        <div class="text-center p-8">Cargando...</div>
      } @else if (order()) {
        <mat-card>
          <mat-card-header>
            <mat-card-title class="flex justify-between items-center w-full">
              <span>Orden #{{order()?.orderNumber || order()?.id}}</span>
              <mat-chip [class]="'status-' + order()?.status">
                {{order()?.status}}
              </mat-chip>
            </mat-card-title>
          </mat-card-header>
          
          <mat-card-content class="pt-4">
            <!-- Order Information -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 class="text-lg font-semibold mb-2">Información del Cliente</h3>
                @if (client()) {
                  <dl class="space-y-1">
                    <div><dt class="inline font-medium">Nombre:</dt> <dd class="inline">{{client()?.firstName}} {{client()?.lastName}}</dd></div>
                    <div><dt class="inline font-medium">DNI:</dt> <dd class="inline">{{client()?.dni}}</dd></div>
                    <div><dt class="inline font-medium">Email:</dt> <dd class="inline">{{client()?.email}}</dd></div>
                    @if (client()?.phone) {
                      <div><dt class="inline font-medium">Teléfono:</dt> <dd class="inline">{{client()?.phone}}</dd></div>
                    }
                  </dl>
                }
              </div>

              <div>
                <h3 class="text-lg font-semibold mb-2">Detalles del Servicio</h3>
                <dl class="space-y-1">
                  <div><dt class="inline font-medium">Vehículo:</dt> <dd class="inline">{{order()?.vehicleLicensePlate}}</dd></div>
                  <div><dt class="inline font-medium">Tipo:</dt> <dd class="inline">{{order()?.serviceType}}</dd></div>
                  <div><dt class="inline font-medium">Precio:</dt> <dd class="inline">\${{order()?.price}}</dd></div>
                  @if (employee()) {
                    <div><dt class="inline font-medium">Empleado:</dt> <dd class="inline">{{employee()?.firstName}} {{employee()?.lastName}}</dd></div>
                  }
                </dl>
              </div>
            </div>

            <!-- Timer -->
            @if (order()?.status === ServiceStatus.IN_PROGRESS || order()?.status === ServiceStatus.COMPLETED || order()?.status === ServiceStatus.DELIVERED) {
              <div class="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 class="text-lg font-semibold mb-2">Tiempo de Servicio</h3>
                <app-timer 
                  [startTime]="order()?.startTime"
                  [endTime]="order()?.endTime"
                  [status]="order()!.status">
                </app-timer>
              </div>
            }

            <!-- Status Timeline -->
            <div class="mb-6">
              <h3 class="text-lg font-semibold mb-3">Estado del Servicio</h3>
              <div class="timeline">
                <div class="timeline-item" [class.active]="isStatusActive(ServiceStatus.PENDING)">
                  <div class="timeline-marker"></div>
                  <div class="timeline-content">
                    <div class="font-medium">Pendiente</div>
                    @if (order()?.createdAt) {
                      <div class="text-sm text-gray-600">{{formatDate(order()!.createdAt)}}</div>
                    }
                  </div>
                </div>
                
                <div class="timeline-item" [class.active]="isStatusActive(ServiceStatus.IN_PROGRESS)">
                  <div class="timeline-marker"></div>
                  <div class="timeline-content">
                    <div class="font-medium">En Progreso</div>
                    @if (order()?.startTime) {
                      <div class="text-sm text-gray-600">{{formatDate(order()!.startTime)}}</div>
                    }
                  </div>
                </div>
                
                <div class="timeline-item" [class.active]="isStatusActive(ServiceStatus.COMPLETED)">
                  <div class="timeline-marker"></div>
                  <div class="timeline-content">
                    <div class="font-medium">Completado</div>
                    @if (order()?.endTime) {
                      <div class="text-sm text-gray-600">{{formatDate(order()!.endTime)}}</div>
                    }
                  </div>
                </div>
                
                <div class="timeline-item" [class.active]="isStatusActive(ServiceStatus.DELIVERED)">
                  <div class="timeline-marker"></div>
                  <div class="timeline-content">
                    <div class="font-medium">Entregado</div>
                    @if (order()?.deliveryTime) {
                      <div class="text-sm text-gray-600">{{formatDate(order()!.deliveryTime)}}</div>
                    }
                  </div>
                </div>
              </div>
            </div>

            <!-- Notes -->
            @if (order()?.notes) {
              <div class="mb-6">
                <h3 class="text-lg font-semibold mb-2">Observaciones</h3>
                <p class="text-gray-700">{{order()?.notes}}</p>
              </div>
            }
          </mat-card-content>

          <!-- Action Buttons -->
          <mat-card-actions class="p-4 flex gap-2 justify-end">
            <button mat-button (click)="goBack()">Volver</button>
            
            @if (order()?.status === ServiceStatus.PENDING) {
              <button mat-raised-button color="primary" (click)="changeStatus(ServiceStatus.IN_PROGRESS)">
                <mat-icon>play_arrow</mat-icon> Iniciar
              </button>
            }
            
            @if (order()?.status === ServiceStatus.IN_PROGRESS) {
              <button mat-raised-button color="accent" (click)="changeStatus(ServiceStatus.COMPLETED)">
                <mat-icon>check_circle</mat-icon> Completar
              </button>
            }
            
            @if (order()?.status === ServiceStatus.COMPLETED) {
              <button mat-raised-button color="primary" (click)="changeStatus(ServiceStatus.DELIVERED)">
                <mat-icon>local_shipping</mat-icon> Entregar
              </button>
              <button mat-raised-button color="accent" (click)="createInvoice()">
                <mat-icon>receipt</mat-icon> Facturar
              </button>
            }
          </mat-card-actions>
        </mat-card>
      } @else {
        <div class="text-center p-8">Orden no encontrada</div>
      }
    </div>
  `,
  styles: [`
    .status-PENDING {
      background-color: #fff3cd;
      color: #856404;
    }
    
    .status-IN_PROGRESS {
      background-color: #cfe2ff;
      color: #084298;
    }
    
    .status-COMPLETED {
      background-color: #d1e7dd;
      color: #0f5132;
    }
    
    .status-DELIVERED {
      background-color: #d3d3d3;
      color: #383838;
    }

    .timeline {
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding-left: 24px;
    }

    .timeline-item {
      position: relative;
      display: flex;
      align-items: center;
      gap: 16px;
      opacity: 0.4;
    }

    .timeline-item.active {
      opacity: 1;
    }

    .timeline-marker {
      position: absolute;
      left: -24px;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background-color: #ddd;
      border: 3px solid white;
      box-shadow: 0 0 0 2px #ddd;
    }

    .timeline-item.active .timeline-marker {
      background-color: #1976d2;
      box-shadow: 0 0 0 2px #1976d2;
    }

    .timeline-item:not(:last-child)::before {
      content: '';
      position: absolute;
      left: -17px;
      top: 16px;
      width: 2px;
      height: calc(100% + 16px);
      background-color: #ddd;
    }

    .timeline-item.active:not(:last-child)::before {
      background-color: #1976d2;
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
    if (!currentOrder) return;
    
    this.snackBar.open('Redirigiendo a facturación...', 'Cerrar', { duration: 2000 });
    this.router.navigate(['/dashboard', 'billing'], { 
      queryParams: { serviceOrderId: currentOrder.id } 
    });
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

  goBack() {
    this.router.navigate(['/dashboard', 'services']);
  }
}
