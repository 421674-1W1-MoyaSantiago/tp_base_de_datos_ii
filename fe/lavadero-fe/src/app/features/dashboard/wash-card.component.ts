import { Component, Input, Output, EventEmitter, computed, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { ServiceOrder, ServiceStatus } from '../../core/models/models';

@Component({
  selector: 'app-wash-card',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatChipsModule],
  template: `
    <mat-card 
      class="wash-card" 
      [class.status-pending]="order.status === 'PENDING'"
      [class.status-in-progress]="order.status === 'IN_PROGRESS'"
      [class.status-completed]="order.status === 'COMPLETED'"
      [class.status-delivered]="order.status === 'DELIVERED'">

      <mat-card-content>
        <div class="card-title-row">
          <div class="title-block">
            <span class="order-number">{{ order.orderNumber || order.id }}</span>
            <span class="service-type">{{ formatServiceType(order.serviceType) }}</span>
          </div>
          <mat-chip class="status-chip" [class]="'status-chip status-' + order.status">
            {{ order.status.replace('_', ' ') }}
          </mat-chip>
        </div>

        <div class="info-section">
          <div class="info-row">
            <mat-icon class="info-icon">person</mat-icon>
            <span class="info-label">Cliente:</span>
            <span class="info-value">{{ order.clientId }}</span>
          </div>
          
          <div class="info-row">
            <mat-icon class="info-icon">directions_car</mat-icon>
            <span class="info-label">Vehículo:</span>
            <span class="info-value">{{ order.vehicleLicensePlate }}</span>
          </div>
          
          @if (order.assignedEmployeeId) {
            <div class="info-row">
              <mat-icon class="info-icon">badge</mat-icon>
              <span class="info-label">Empleado:</span>
              <span class="info-value">{{ order.assignedEmployeeId }}</span>
            </div>
          }
          
          <div class="info-row price-row">
            <mat-icon class="info-icon">attach_money</mat-icon>
            <span class="info-label">Precio:</span>
            <span class="info-value price">\${{ order.price.toFixed(2) }}</span>
          </div>
        </div>
        
        @if (shouldShowTimer()) {
          <div class="timer-section">
            <mat-icon>timer</mat-icon>
            <span class="timer-text">{{ getElapsedTime() }}</span>
          </div>
        }
      </mat-card-content>

      <mat-card-actions>
        <div class="action-buttons">
          @if (order.status === 'PENDING') {
            <button 
              mat-flat-button
              (click)="onStatusChange(ServiceStatus.IN_PROGRESS)"
              class="action-btn action-primary">
              <mat-icon>play_arrow</mat-icon>
              Iniciar
            </button>
          }
          
          @if (order.status === 'IN_PROGRESS') {
            <button 
              mat-flat-button
              (click)="onStatusChange(ServiceStatus.COMPLETED)"
              class="action-btn action-success">
              <mat-icon>check_circle</mat-icon>
              Completar
            </button>
          }
          
          @if (order.status === 'COMPLETED') {
            <button 
              mat-flat-button
              (click)="onStatusChange(ServiceStatus.DELIVERED)"
              class="action-btn action-primary">
              <mat-icon>local_shipping</mat-icon>
              Entregar
            </button>
            <button 
              mat-flat-button
              (click)="onInvoice()"
              class="action-btn invoice-btn">
              <mat-icon>receipt</mat-icon>
              Facturar
            </button>
          }
        </div>
      </mat-card-actions>
    </mat-card>
  `,
  styles: [`
    .wash-card {
      margin-bottom: 10px;
      border: 1px solid #e5ebf3;
      border-left: 4px solid transparent;
      border-radius: 13px !important;
      box-shadow: 0 8px 16px rgba(15, 23, 42, 0.06);
      background: linear-gradient(165deg, #ffffff 0%, #f8fbff 100%) !important;
      transition: transform 220ms cubic-bezier(0.4, 0, 0.2, 1), box-shadow 220ms cubic-bezier(0.4, 0, 0.2, 1), border-color 220ms cubic-bezier(0.4, 0, 0.2, 1);
      cursor: grab;
    }
    
    .wash-card:hover {
      box-shadow: 0 12px 22px rgba(15, 23, 42, 0.1);
      transform: translateY(-1px);
      border-color: #d7e2ef;
    }
    
    .wash-card:active {
      cursor: grabbing;
    }
    
    .wash-card.status-pending {
      border-left-color: #94a3b8;
    }
    
    .wash-card.status-in-progress {
      border-left-color: #2563eb;
    }
    
    .wash-card.status-completed {
      border-left-color: #16a34a;
    }
    
    .wash-card.status-delivered {
      border-left-color: #0f766e;
    }
    
    .card-title-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      margin-bottom: 10px;
      padding-bottom: 8px;
      border-bottom: 1px solid #e9eff6;
      gap: 8px;
      flex-wrap: wrap;
    }

    .title-block {
      display: flex;
      flex-direction: column;
      gap: 3px;
    }
    
    .order-number {
      font-weight: 800;
      font-size: 0.96rem;
      color: #1e293b;
      letter-spacing: 0.2px;
    }

    .service-type {
      font-size: 0.76rem;
      color: #64748b;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.4px;
    }

    .status-chip {
      font-size: 0.68rem !important;
      font-weight: 700 !important;
      border-radius: 999px !important;
      border: 1px solid transparent !important;
      letter-spacing: 0.3px;
      text-transform: uppercase;
    }

    .status-PENDING {
      background: #fef3c7 !important;
      color: #92400e !important;
      border-color: #fcd34d !important;
    }

    .status-IN_PROGRESS {
      background: #dbeafe !important;
      color: #1d4ed8 !important;
      border-color: #93c5fd !important;
    }

    .status-COMPLETED {
      background: #dcfce7 !important;
      color: #166534 !important;
      border-color: #86efac !important;
    }

    .status-DELIVERED {
      background: #e2e8f0 !important;
      color: #334155 !important;
      border-color: #cbd5e1 !important;
    }
    
    mat-card-content {
      padding: 12px !important;
    }
    
    .info-section {
      display: flex;
      flex-direction: column;
      gap: 7px;
    }
    
    .info-row {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.82rem;
    }
    
    .info-icon {
      color: #7b8794;
      font-size: 16px;
      width: 16px;
      height: 16px;
    }
    
    .info-label {
      color: #64748b;
      font-weight: 600;
    }
    
    .info-value {
      color: #334155;
      font-weight: 500;
      overflow-wrap: anywhere;
    }
    
    .price-row {
      margin-top: 5px;
      padding-top: 8px;
      border-top: 1px solid #e9eff6;
    }
    
    .price {
      font-weight: 700;
      font-size: 1.08rem;
      color: #16a34a;
    }
    
    .timer-section {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-top: 9px;
      padding: 7px 9px;
      background: linear-gradient(135deg, #fff7dc 0%, #fef1c2 100%);
      border-radius: 8px;
      color: #8a6400;
      border: 1px solid #f7dd88;
    }
    
    .timer-section mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }
    
    .timer-text {
      font-weight: 700;
      font-size: 0.83rem;
      letter-spacing: 0.3px;
    }
    
    mat-card-actions {
      padding: 0 12px 12px !important;
      border-top: 1px solid #ebf1f8;
    }
    
    .action-buttons {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      width: 100%;
      padding-top: 9px;
    }
    
    .action-btn {
      flex: 1;
      min-width: 104px;
      border-radius: 9px !important;
      min-height: 34px;
      font-weight: 700;
      letter-spacing: 0.1px;
      font-size: 0.8rem;
    }
    
    .action-btn mat-icon {
      margin-right: 3px;
      font-size: 16px;
      width: 16px;
      height: 16px;
    }

    .action-primary {
      background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%) !important;
      color: #ffffff !important;
      box-shadow: 0 4px 12px rgba(25, 118, 210, 0.26) !important;
    }

    .action-primary:hover {
      box-shadow: 0 8px 18px rgba(25, 118, 210, 0.32) !important;
      transform: translateY(-1px);
    }

    .action-success {
      background: linear-gradient(135deg, #16a34a 0%, #15803d 100%) !important;
      color: #ffffff !important;
      box-shadow: 0 4px 12px rgba(22, 163, 74, 0.24) !important;
    }

    .action-success:hover {
      box-shadow: 0 8px 18px rgba(22, 163, 74, 0.32) !important;
      transform: translateY(-1px);
    }
    
    .invoice-btn {
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%) !important;
      color: #ffffff !important;
      box-shadow: 0 4px 12px rgba(217, 119, 6, 0.25) !important;
    }
    
    .invoice-btn:hover {
      box-shadow: 0 8px 18px rgba(217, 119, 6, 0.32) !important;
      transform: translateY(-1px);
    }
  `]
})
export class WashCardComponent {
  @Input({ required: true }) order!: ServiceOrder;
  @Output() statusChange = new EventEmitter<{ orderId: string, newStatus: ServiceStatus }>();
  @Output() invoiceRequested = new EventEmitter<string>();
  
  // Make ServiceStatus available in template
  ServiceStatus = ServiceStatus;
  
  private elapsedSeconds = signal(0);
  private timerInterval?: number;
  
  constructor() {
    effect(() => {
      if (this.shouldShowTimer()) {
        this.startTimer();
      } else {
        this.stopTimer();
      }
    });
  }
  
  ngOnDestroy() {
    this.stopTimer();
  }
  
  shouldShowTimer(): boolean {
    return this.order.status === ServiceStatus.IN_PROGRESS || 
           this.order.status === ServiceStatus.COMPLETED ||
           this.order.status === ServiceStatus.DELIVERED;
  }
  
  private startTimer(): void {
    if (this.timerInterval) {
      return;
    }
    
    const startTime = this.order.startTime ? new Date(this.order.startTime).getTime() : Date.now();
    
    this.timerInterval = window.setInterval(() => {
      const now = Date.now();
      const elapsed = Math.floor((now - startTime) / 1000);
      this.elapsedSeconds.set(elapsed);
    }, 1000);
  }
  
  private stopTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = undefined;
    }
  }
  
  getElapsedTime(): string {
    const seconds = this.elapsedSeconds();
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return `${this.padZero(hours)}:${this.padZero(minutes)}:${this.padZero(secs)}`;
  }
  
  private padZero(num: number): string {
    return num.toString().padStart(2, '0');
  }
  
  formatServiceType(type: string): string {
    const types: { [key: string]: string } = {
      'BASIC': 'Básico',
      'COMPLETE': 'Completo',
      'PREMIUM': 'Premium',
      'EXPRESS': 'Express'
    };
    return types[type] || type;
  }
  
  onStatusChange(newStatus: ServiceStatus): void {
    this.statusChange.emit({
      orderId: this.order.id!,
      newStatus
    });
  }
  
  onInvoice(): void {
    this.invoiceRequested.emit(this.order.id!);
  }
}
