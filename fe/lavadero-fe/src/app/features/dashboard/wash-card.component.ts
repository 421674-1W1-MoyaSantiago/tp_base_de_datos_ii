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
      
      <mat-card-header>
        <mat-card-title>
          <div class="card-title-row">
            <span class="order-number">{{ order.orderNumber }}</span>
            <mat-chip class="service-chip">{{ formatServiceType(order.serviceType) }}</mat-chip>
          </div>
        </mat-card-title>
      </mat-card-header>
      
      <mat-card-content>
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
              mat-raised-button 
              color="primary" 
              (click)="onStatusChange(ServiceStatus.IN_PROGRESS)"
              class="action-btn">
              <mat-icon>play_arrow</mat-icon>
              Iniciar
            </button>
          }
          
          @if (order.status === 'IN_PROGRESS') {
            <button 
              mat-raised-button 
              color="accent" 
              (click)="onStatusChange(ServiceStatus.COMPLETED)"
              class="action-btn">
              <mat-icon>check_circle</mat-icon>
              Completar
            </button>
          }
          
          @if (order.status === 'COMPLETED') {
            <button 
              mat-raised-button 
              color="primary" 
              (click)="onStatusChange(ServiceStatus.DELIVERED)"
              class="action-btn">
              <mat-icon>local_shipping</mat-icon>
              Entregar
            </button>
            <button 
              mat-raised-button 
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
      margin-bottom: 12px;
      border-left: 4px solid transparent;
      transition: all 0.3s ease;
      cursor: grab;
    }
    
    .wash-card:hover {
      box-shadow: 0 4px 8px rgba(0,0,0,0.15);
      transform: translateY(-2px);
    }
    
    .wash-card:active {
      cursor: grabbing;
    }
    
    .wash-card.status-pending {
      border-left-color: #95a5a6;
    }
    
    .wash-card.status-in-progress {
      border-left-color: #3498db;
    }
    
    .wash-card.status-completed {
      border-left-color: #27ae60;
    }
    
    .wash-card.status-delivered {
      border-left-color: #16a085;
    }
    
    .card-title-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
    }
    
    .order-number {
      font-weight: 600;
      font-size: 1rem;
      color: #2c3e50;
    }
    
    .service-chip {
      font-size: 0.75rem;
      min-height: 24px;
      padding: 4px 8px;
    }
    
    mat-card-content {
      padding: 16px 0;
    }
    
    .info-section {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    
    .info-row {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.875rem;
    }
    
    .info-icon {
      color: #7f8c8d;
      font-size: 18px;
      width: 18px;
      height: 18px;
    }
    
    .info-label {
      color: #7f8c8d;
      font-weight: 500;
    }
    
    .info-value {
      color: #2c3e50;
      font-weight: 400;
    }
    
    .price-row {
      margin-top: 8px;
      padding-top: 8px;
      border-top: 1px solid #ecf0f1;
    }
    
    .price {
      font-weight: 700;
      font-size: 1.1rem;
      color: #27ae60;
    }
    
    .timer-section {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 12px;
      padding: 8px;
      background-color: #fff3cd;
      border-radius: 4px;
      color: #856404;
    }
    
    .timer-section mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }
    
    .timer-text {
      font-weight: 600;
      font-size: 0.9rem;
    }
    
    mat-card-actions {
      padding: 0 16px 16px;
    }
    
    .action-buttons {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }
    
    .action-btn {
      flex: 1;
      min-width: 100px;
    }
    
    .action-btn mat-icon {
      margin-right: 4px;
    }
    
    .invoice-btn {
      background-color: #f39c12;
      color: white;
    }
    
    .invoice-btn:hover {
      background-color: #e67e22;
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
