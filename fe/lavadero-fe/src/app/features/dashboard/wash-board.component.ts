import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { MatChipsModule } from '@angular/material/chips';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { WashService } from '../../core/services/wash.service';
import { ServiceOrder, ServiceStatus, ServiceType } from '../../core/models/models';
import { WashCardComponent } from './wash-card.component';

@Component({
  selector: 'app-wash-board',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    DragDropModule,
    MatChipsModule,
    MatSelectModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    WashCardComponent
  ],
  template: `
    <div class="wash-board-container">
      <h1>Dashboard de Lavados</h1>
      
      <!-- Filters Section -->
      <div class="filters-section">
        <mat-chip-listbox class="filter-chips" [(ngModel)]="selectedFilterType">
          <mat-chip-option value="all" selected>
            <mat-icon>view_module</mat-icon>
            Todos ({{ filteredOrders().length }})
          </mat-chip-option>
          <mat-chip-option value="status">
            <mat-icon>filter_list</mat-icon>
            Por Estado
          </mat-chip-option>
          <mat-chip-option value="employee">
            <mat-icon>badge</mat-icon>
            Por Empleado
          </mat-chip-option>
          <mat-chip-option value="service">
            <mat-icon>car_wash</mat-icon>
            Por Servicio
          </mat-chip-option>
          <mat-chip-option value="date">
            <mat-icon>date_range</mat-icon>
            Por Fecha
          </mat-chip-option>
        </mat-chip-listbox>
        
        <div class="filter-controls">
          @if (selectedFilterType() === 'status') {
            <mat-form-field appearance="outline">
              <mat-label>Estado</mat-label>
              <mat-select [(ngModel)]="filterStatus">
                <mat-option [value]="null">Todos</mat-option>
                @for (status of statuses; track status.value) {
                  <mat-option [value]="status.value">{{ status.label }}</mat-option>
                }
              </mat-select>
            </mat-form-field>
          }
          
          @if (selectedFilterType() === 'employee') {
            <mat-form-field appearance="outline">
              <mat-label>Empleado</mat-label>
              <mat-select [(ngModel)]="filterEmployee">
                <mat-option [value]="null">Todos</mat-option>
                @for (empId of uniqueEmployees(); track empId) {
                  <mat-option [value]="empId">{{ empId }}</mat-option>
                }
              </mat-select>
            </mat-form-field>
          }
          
          @if (selectedFilterType() === 'service') {
            <mat-form-field appearance="outline">
              <mat-label>Tipo de Servicio</mat-label>
              <mat-select [(ngModel)]="filterServiceType">
                <mat-option [value]="null">Todos</mat-option>
                <mat-option value="BASIC">Básico</mat-option>
                <mat-option value="COMPLETE">Completo</mat-option>
                <mat-option value="PREMIUM">Premium</mat-option>
                <mat-option value="EXPRESS">Express</mat-option>
              </mat-select>
            </mat-form-field>
          }
          
          @if (selectedFilterType() === 'date') {
            <mat-form-field appearance="outline">
              <mat-label>Fecha Desde</mat-label>
              <input matInput [matDatepicker]="pickerFrom" [(ngModel)]="filterDateFrom">
              <mat-datepicker-toggle matIconSuffix [for]="pickerFrom"></mat-datepicker-toggle>
              <mat-datepicker #pickerFrom></mat-datepicker>
            </mat-form-field>
            
            <mat-form-field appearance="outline">
              <mat-label>Fecha Hasta</mat-label>
              <input matInput [matDatepicker]="pickerTo" [(ngModel)]="filterDateTo">
              <mat-datepicker-toggle matIconSuffix [for]="pickerTo"></mat-datepicker-toggle>
              <mat-datepicker #pickerTo></mat-datepicker>
            </mat-form-field>
          }
          
          <button mat-raised-button color="warn" (click)="clearFilters()" class="clear-btn">
            <mat-icon>clear</mat-icon>
            Limpiar Filtros
          </button>
        </div>
      </div>
      
      <!-- Kanban Board -->
      <div class="kanban-board" cdkDropListGroup>
        @for (status of statuses; track status.value) {
          <div class="kanban-column">
            <div class="column-header" [style.background-color]="status.color">
              <h3>{{ status.label }}</h3>
              <span class="count">{{ getFilteredOrdersByStatus(status.value).length }}</span>
            </div>
            
            <div 
              class="cards-container"
              cdkDropList
              [cdkDropListData]="getFilteredOrdersByStatus(status.value)"
              [id]="status.value"
              (cdkDropListDropped)="onDrop($event)">
              @for (order of getFilteredOrdersByStatus(status.value); track order.id) {
                <div cdkDrag [cdkDragData]="order">
                  <app-wash-card 
                    [order]="order"
                    (statusChange)="handleStatusChange($event)"
                    (invoiceRequested)="handleInvoice($event)">
                  </app-wash-card>
                  
                  <div class="drag-placeholder" *cdkDragPlaceholder></div>
                </div>
              } @empty {
                <p class="empty-message">No hay órdenes</p>
              }
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .wash-board-container {
      padding: 2rem;
      background-color: #f5f6fa;
      min-height: 100vh;
    }

    h1 {
      margin-bottom: 1.5rem;
      color: #2c3e50;
      font-weight: 600;
    }
    
    /* Filters Section */
    .filters-section {
      background: white;
      padding: 1.5rem;
      border-radius: 8px;
      margin-bottom: 2rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.08);
    }
    
    .filter-chips {
      margin-bottom: 1rem;
    }
    
    .filter-chips mat-chip-option {
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }
    
    .filter-chips mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }
    
    .filter-controls {
      display: flex;
      gap: 1rem;
      align-items: center;
      flex-wrap: wrap;
    }
    
    .filter-controls mat-form-field {
      min-width: 200px;
    }
    
    .clear-btn {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    /* Kanban Board */
    .kanban-board {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1.5rem;
    }

    .kanban-column {
      background: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      display: flex;
      flex-direction: column;
    }

    .column-header {
      padding: 1rem;
      color: white;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-shrink: 0;
    }

    .column-header h3 {
      margin: 0;
      font-size: 1rem;
      font-weight: 600;
    }

    .count {
      background: rgba(255,255,255,0.3);
      padding: 0.25rem 0.5rem;
      border-radius: 12px;
      font-size: 0.875rem;
      font-weight: 600;
    }

    .cards-container {
      padding: 1rem;
      min-height: 300px;
      flex: 1;
      overflow-y: auto;
    }
    
    /* Drag & Drop Styles */
    .cdk-drag-preview {
      box-shadow: 0 5px 15px rgba(0,0,0,0.3);
      border-radius: 8px;
      opacity: 0.9;
    }
    
    .cdk-drag-animating {
      transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
    }
    
    .cards-container.cdk-drop-list-dragging .cdk-drag {
      transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
    }
    
    .drag-placeholder {
      background: #e3f2fd;
      border: 2px dashed #2196f3;
      border-radius: 8px;
      min-height: 100px;
      margin-bottom: 12px;
    }

    .empty-message {
      text-align: center;
      color: #95a5a6;
      padding: 2rem;
      font-style: italic;
    }
    
    /* Responsive */
    @media (max-width: 1400px) {
      .kanban-board {
        grid-template-columns: repeat(2, 1fr);
      }
    }
    
    @media (max-width: 768px) {
      .kanban-board {
        grid-template-columns: 1fr;
      }
      
      .filter-controls {
        flex-direction: column;
        align-items: stretch;
      }
      
      .filter-controls mat-form-field,
      .clear-btn {
        width: 100%;
      }
    }
  `]
})
export class WashBoardComponent implements OnInit {
  private washService = inject(WashService);
  private snackBar = inject(MatSnackBar);

  serviceOrders = this.washService.serviceOrders;

  // Filter signals
  selectedFilterType = signal<string>('all');
  filterStatus = signal<ServiceStatus | null>(null);
  filterEmployee = signal<string | null>(null);
  filterServiceType = signal<ServiceType | null>(null);
  filterDateFrom = signal<Date | null>(null);
  filterDateTo = signal<Date | null>(null);

  statuses = [
    { value: ServiceStatus.PENDING, label: 'Pendiente', color: '#95a5a6' },
    { value: ServiceStatus.IN_PROGRESS, label: 'En Proceso', color: '#3498db' },
    { value: ServiceStatus.COMPLETED, label: 'Completado', color: '#27ae60' },
    { value: ServiceStatus.DELIVERED, label: 'Entregado', color: '#16a085' }
  ];

  // Computed values
  uniqueEmployees = computed(() => {
    const employees = this.serviceOrders()
      .map(order => order.assignedEmployeeId)
      .filter(id => id !== null && id !== undefined);
    return Array.from(new Set(employees));
  });

  filteredOrders = computed(() => {
    let orders = this.serviceOrders();
    
    // Apply status filter
    if (this.filterStatus()) {
      orders = orders.filter(o => o.status === this.filterStatus());
    }
    
    // Apply employee filter
    if (this.filterEmployee()) {
      orders = orders.filter(o => o.assignedEmployeeId === this.filterEmployee());
    }
    
    // Apply service type filter
    if (this.filterServiceType()) {
      orders = orders.filter(o => o.serviceType === this.filterServiceType());
    }
    
    // Apply date range filter
    if (this.filterDateFrom()) {
      const fromDate = new Date(this.filterDateFrom()!);
      fromDate.setHours(0, 0, 0, 0);
      orders = orders.filter(o => {
        const orderDate = new Date(o.createdAt || '');
        return orderDate >= fromDate;
      });
    }
    
    if (this.filterDateTo()) {
      const toDate = new Date(this.filterDateTo()!);
      toDate.setHours(23, 59, 59, 999);
      orders = orders.filter(o => {
        const orderDate = new Date(o.createdAt || '');
        return orderDate <= toDate;
      });
    }
    
    return orders;
  });

  ngOnInit(): void {
    this.washService.loadServiceOrders();
  }

  getFilteredOrdersByStatus(status: ServiceStatus): ServiceOrder[] {
    return this.filteredOrders().filter(order => order.status === status);
  }

  clearFilters(): void {
    this.selectedFilterType.set('all');
    this.filterStatus.set(null);
    this.filterEmployee.set(null);
    this.filterServiceType.set(null);
    this.filterDateFrom.set(null);
    this.filterDateTo.set(null);
    this.snackBar.open('Filtros limpiados', 'OK', { duration: 2000 });
  }

  handleStatusChange(event: { orderId: string, newStatus: ServiceStatus }): void {
    const order = this.serviceOrders().find(o => o.id === event.orderId);
    if (!order) return;
    
    if (this.isValidTransition(order.status, event.newStatus)) {
      this.washService.updateStatus(event.orderId, event.newStatus).subscribe({
        next: () => {
          this.snackBar.open('Estado actualizado correctamente', 'OK', { duration: 2000 });
        },
        error: () => {
          this.snackBar.open('Error al actualizar el estado', 'Cerrar', { duration: 3000 });
        }
      });
    } else {
      this.snackBar.open('Transición de estado no válida', 'Cerrar', { duration: 3000 });
    }
  }

  handleInvoice(orderId: string): void {
    this.snackBar.open('Función de facturación en desarrollo', 'OK', { duration: 2000 });
  }

  onDrop(event: CdkDragDrop<ServiceOrder[]>): void {
    const order = event.item.data as ServiceOrder;
    const newStatus = event.container.id as ServiceStatus;
    
    if (event.previousContainer === event.container) {
      // Same column - just reorder
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      return;
    }
    
    // Validate transition
    if (!this.isValidTransition(order.status, newStatus)) {
      this.snackBar.open(
        `No se puede mover de ${this.getStatusLabel(order.status)} a ${this.getStatusLabel(newStatus)}`,
        'Cerrar',
        { duration: 3000 }
      );
      return;
    }
    
    // Update status via service
    this.washService.updateStatus(order.id!, newStatus).subscribe({
      next: () => {
        this.snackBar.open('Estado actualizado correctamente', 'OK', { duration: 2000 });
      },
      error: () => {
        this.snackBar.open('Error al actualizar el estado', 'Cerrar', { duration: 3000 });
      }
    });
  }

  private isValidTransition(currentStatus: ServiceStatus, newStatus: ServiceStatus): boolean {
    const validTransitions: { [key: string]: ServiceStatus[] } = {
      [ServiceStatus.PENDING]: [ServiceStatus.IN_PROGRESS],
      [ServiceStatus.IN_PROGRESS]: [ServiceStatus.COMPLETED],
      [ServiceStatus.COMPLETED]: [ServiceStatus.DELIVERED],
      [ServiceStatus.DELIVERED]: []
    };
    
    return validTransitions[currentStatus]?.includes(newStatus) || false;
  }

  private getStatusLabel(status: ServiceStatus): string {
    return this.statuses.find(s => s.value === status)?.label || status;
  }
}
