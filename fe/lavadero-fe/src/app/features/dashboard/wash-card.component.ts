import { Component, Input, Output, EventEmitter, signal, OnDestroy, OnInit, OnChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { Router } from '@angular/router';
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

      <mat-card-content (click)="viewDetail()" style="cursor: pointer;">
        <div class="card-title-row">
          <div class="title-block">
            <span class="order-number">{{ order.orderNumber || order.id }}</span>
            <span class="service-type">{{ formatServiceType(order.serviceType) }}</span>
          </div>
          <mat-chip class="status-chip" [class]="'status-chip status-' + order.status">
            {{ formatStatus(order.status) }}
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
            <mat-icon class="info-icon">payments</mat-icon>
            <span class="info-label">Precio:</span>
            <span class="info-value price">
              <span class="currency">$</span>
              {{ order.price.toFixed(2) }}
            </span>
          </div>
        </div>
        
        @if (shouldShowTimer()) {
          <div class="timer-section">
            <mat-icon>timer</mat-icon>
            <span class="timer-text">{{ displayTime() }}</span>
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
            <button mat-stroked-button (click)="viewDetail()" class="action-btn detail-btn">
              <mat-icon>visibility</mat-icon> Detalle
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
            <button mat-stroked-button (click)="viewDetail()" class="action-btn detail-btn">
              <mat-icon>visibility</mat-icon> Detalle
            </button>
          }
          
          @if (order.status === 'COMPLETED' || order.status === 'DELIVERED') {
            <div class="button-grid-50">
              @if (order.status === 'COMPLETED') {
                <button 
                  mat-flat-button
                  (click)="onStatusChange(ServiceStatus.DELIVERED)"
                  class="action-btn action-primary compact-btn">
                  <mat-icon>local_shipping</mat-icon>
                  Entregar
                </button>
              }
              @if (!order.invoiced) {
                <button 
                  mat-flat-button
                  (click)="onInvoice()"
                  class="action-btn invoice-btn compact-btn">
                  <mat-icon>receipt</mat-icon>
                  Facturar
                </button>
              }
              <button 
                mat-stroked-button 
                (click)="viewDetail()" 
                class="action-btn detail-btn compact-btn"
                [style.grid-column]="(order.invoiced && order.status === 'DELIVERED') ? 'span 2' : 'auto'">
                <mat-icon>visibility</mat-icon> 
                Detalle
              </button>
            </div>
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
    }
    
    .wash-card:hover {
      box-shadow: 0 12px 22px rgba(15, 23, 42, 0.1);
      transform: translateY(-1px);
      border-color: #d7e2ef;
    }
    
    .wash-card.status-pending { border-left-color: #94a3b8; }
    .wash-card.status-in-progress { border-left-color: #2563eb; }
    .wash-card.status-completed { border-left-color: #16a34a; }
    .wash-card.status-delivered { border-left-color: #0f766e; }
    
    .card-title-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      margin-bottom: 10px;
      padding-bottom: 8px;
      border-bottom: 1px solid #e9eff6;
    }

    .title-block { display: flex; flex-direction: column; gap: 3px; }
    .order-number { font-weight: 800; font-size: 0.96rem; color: #1e293b; }
    .service-type { font-size: 0.76rem; color: #64748b; font-weight: 600; text-transform: uppercase; }

    .status-chip {
      font-size: 0.68rem !important;
      font-weight: 700 !important;
      border-radius: 999px !important;
      text-transform: uppercase;
    }

    .status-PENDING { background: #fef3c7 !important; color: #92400e !important; }
    .status-IN_PROGRESS { background: #dbeafe !important; color: #1d4ed8 !important; }
    .status-COMPLETED { background: #dcfce7 !important; color: #166534 !important; }
    .status-DELIVERED { background: #e2e8f0 !important; color: #334155 !important; }
    
    .info-section { display: flex; flex-direction: column; gap: 7px; }
    .info-row { display: flex; align-items: center; gap: 6px; font-size: 0.82rem; }
    .info-icon { color: #7b8794; font-size: 16px; width: 16px; height: 16px; }
    .info-label { color: #64748b; font-weight: 600; }
    .info-value { color: #334155; font-weight: 500; overflow-wrap: anywhere; }
    
    .price-row { margin-top: 5px; padding-top: 8px; border-top: 1px solid #e9eff6; }
    .price { font-weight: 700; font-size: 1.08rem; color: #16a34a; }

    .timer-section {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-top: 9px;
      padding: 7px 9px;
      background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
      border-radius: 8px;
      color: #1e293b;
      border: 1px solid #cbd5e1;
    }
    
    .timer-section mat-icon { font-size: 16px; width: 16px; height: 16px; }
    .timer-text { font-weight: 700; font-size: 0.83rem; font-family: monospace; }
    
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

    .button-grid-50 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      width: 100%;
    }
    
    .action-btn {
      flex: 1;
      border-radius: 9px !important;
      min-height: 34px;
      font-weight: 700;
      font-size: 0.8rem;
    }

    .compact-btn {
      min-width: 0 !important;
      width: 100%;
    }
    
    .action-primary { background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%) !important; color: #ffffff !important; }
    .action-success { background: linear-gradient(135deg, #16a34a 0%, #15803d 100%) !important; color: #ffffff !important; }
    .invoice-btn { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%) !important; color: #ffffff !important; }
    .detail-btn { color: #1976d2 !important; border-color: #1976d2 !important; }
  `]
})
export class WashCardComponent implements OnInit, OnChanges, OnDestroy {
  @Input({ required: true }) order!: ServiceOrder;
  @Output() statusChange = new EventEmitter<{ orderId: string, newStatus: ServiceStatus }>();
  @Output() invoiceRequested = new EventEmitter<string>();
  
  private router = inject(Router);
  ServiceStatus = ServiceStatus;
  
  displayTime = signal('00:00:00');
  private timerInterval?: any;
  
  ngOnInit() {
    this.initTimer();
  }

  ngOnChanges() {
    this.initTimer();
  }
  
  ngOnDestroy() {
    this.stopTimer();
  }

  private initTimer(): void {
    this.stopTimer();
    this.updateDisplay();
    
    if (this.order.status === ServiceStatus.IN_PROGRESS) {
      this.startTimer();
    }
  }
  
  shouldShowTimer(): boolean {
    return this.order.status === ServiceStatus.IN_PROGRESS || 
           this.order.status === ServiceStatus.COMPLETED ||
           this.order.status === ServiceStatus.DELIVERED;
  }
  
  private startTimer(): void {
    if (this.timerInterval) return;
    this.timerInterval = setInterval(() => {
      this.updateDisplay();
    }, 1000);
  }
  
  private stopTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = undefined;
    }
  }

  private updateDisplay() {
    if (!this.order.startTime) return;

    const start = new Date(this.order.startTime).getTime();
    let durationSeconds = 0;

    if (this.order.status === ServiceStatus.IN_PROGRESS) {
      const now = Date.now();
      durationSeconds = Math.max(0, Math.floor((now - start) / 1000));
    } else if (this.order.endTime) {
      const end = new Date(this.order.endTime).getTime();
      durationSeconds = Math.max(0, Math.floor((end - start) / 1000));
    }

    this.displayTime.set(this.formatSeconds(durationSeconds));
  }
  
  private formatSeconds(totalSeconds: number): string {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    return [hours, minutes, seconds]
      .map(v => Math.max(0, v).toString().padStart(2, '0'))
      .join(':');
  }

  formatStatus(status: ServiceStatus): string {
    const labels: { [key: string]: string } = {
      'PENDING': 'Pendiente',
      'IN_PROGRESS': 'En proceso',
      'COMPLETED': 'Completado',
      'DELIVERED': 'Entregado'
    };
    return labels[status] || status;
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
    this.statusChange.emit({ orderId: this.order.id!, newStatus });
  }
  
  onInvoice(): void {
    this.invoiceRequested.emit(this.order.id!);
  }

  viewDetail(): void {
    this.router.navigate(['/dashboard', 'services', this.order.id]);
  }
}
