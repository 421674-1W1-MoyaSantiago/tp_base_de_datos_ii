import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { forkJoin } from 'rxjs';
import { WashService } from '../../core/services/wash.service';
import { InvoiceService } from '../../core/services/invoice.service';
import { InvoiceModalComponent } from '../../shared/components/invoice-modal.component';
import { DashboardDailyRevenue, DashboardStatusDistribution, ServiceOrder, ServiceStatus, ServiceType } from '../../core/models/models';
import { WashCardComponent } from './wash-card.component';

@Component({
  selector: 'app-wash-board',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    DragDropModule,
    MatSelectModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatDialogModule,
    WashCardComponent
  ],
  template: `
    <div class="wash-board-container">
      <h1>Dashboard de Lavados</h1>
      
      <!-- Filters Section -->
      <div class="filters-section">
        <div class="filters-header">
          <div class="filter-chips">
            <div class="filter-chipset" role="tablist" aria-label="Filtros del dashboard">
              <button type="button" class="filter-type-btn" [class.active]="selectedFilterType() === 'all'" (click)="selectedFilterType.set('all')" [attr.aria-pressed]="selectedFilterType() === 'all'">
                <mat-icon>view_module</mat-icon>
                <span>Todos ({{ filteredOrders().length }})</span>
              </button>
              <button type="button" class="filter-type-btn" [class.active]="selectedFilterType() === 'status'" (click)="selectedFilterType.set('status')" [attr.aria-pressed]="selectedFilterType() === 'status'">
                <mat-icon>filter_list</mat-icon>
                <span>Por Estado</span>
              </button>
              <button type="button" class="filter-type-btn" [class.active]="selectedFilterType() === 'employee'" (click)="selectedFilterType.set('employee')" [attr.aria-pressed]="selectedFilterType() === 'employee'">
                <mat-icon>badge</mat-icon>
                <span>Por Empleado</span>
              </button>
              <button type="button" class="filter-type-btn" [class.active]="selectedFilterType() === 'service'" (click)="selectedFilterType.set('service')" [attr.aria-pressed]="selectedFilterType() === 'service'">
                <mat-icon>local_car_wash</mat-icon>
                <span>Por Servicio</span>
              </button>
              <button type="button" class="filter-type-btn" [class.active]="selectedFilterType() === 'date'" (click)="selectedFilterType.set('date')" [attr.aria-pressed]="selectedFilterType() === 'date'">
                <mat-icon>date_range</mat-icon>
                <span>Por Fecha</span>
              </button>
            </div>
          </div>

          <button mat-icon-button 
                  matTooltip="Limpiar filtros" 
                  (click)="clearFilters()"
                  class="clear-filters-btn">
            <mat-icon>close</mat-icon>
          </button>
        </div>
        
        <div class="filter-controls">
          @if (selectedFilterType() === 'status') {
            <mat-form-field appearance="outline" class="filter-field" floatLabel="always">
              <mat-label>Estado</mat-label>
              <mat-select [ngModel]="filterStatus()" (ngModelChange)="filterStatus.set($event)" placeholder="Seleccione un estado">
                <mat-option [value]="null">Todos</mat-option>
                @for (status of statuses; track status.value) {
                  <mat-option [value]="status.value">{{ status.label }}</mat-option>
                }
              </mat-select>
              <mat-hint>Filtrar órdenes por estado</mat-hint>
            </mat-form-field>
          }
          
          @if (selectedFilterType() === 'employee') {
            <mat-form-field appearance="outline" class="filter-field" floatLabel="always">
              <mat-label>Empleado</mat-label>
              <mat-select [ngModel]="filterEmployee()" (ngModelChange)="filterEmployee.set($event)" placeholder="Seleccione un empleado">
                <mat-option [value]="null">Todos</mat-option>
                @for (empId of uniqueEmployees(); track empId) {
                  <mat-option [value]="empId">{{ empId }}</mat-option>
                }
              </mat-select>
              <mat-hint>Filtrar órdenes por empleado</mat-hint>
            </mat-form-field>
          }
          
          @if (selectedFilterType() === 'service') {
            <mat-form-field appearance="outline" class="filter-field" floatLabel="always">
              <mat-label>Tipo de Servicio</mat-label>
              <mat-select [ngModel]="filterServiceType()" (ngModelChange)="filterServiceType.set($event)" placeholder="Seleccione un servicio">
                <mat-option [value]="null">Todos</mat-option>
                <mat-option value="BASIC">Básico</mat-option>
                <mat-option value="COMPLETE">Completo</mat-option>
                <mat-option value="PREMIUM">Premium</mat-option>
                <mat-option value="EXPRESS">Express</mat-option>
              </mat-select>
              <mat-hint>Filtrar órdenes por tipo de servicio</mat-hint>
            </mat-form-field>
          }
          
          @if (selectedFilterType() === 'date') {
            <mat-form-field appearance="outline" class="filter-field" floatLabel="always">
              <mat-label>Fecha Desde</mat-label>
              <mat-icon matPrefix>calendar_today</mat-icon>
              <input matInput [matDatepicker]="pickerFrom" [ngModel]="filterDateFrom()" (ngModelChange)="filterDateFrom.set($event)" placeholder="dd/mm/yyyy">
              <mat-hint>Formato: dd/mm/yyyy</mat-hint>
              <mat-datepicker-toggle matIconSuffix [for]="pickerFrom"></mat-datepicker-toggle>
              <mat-datepicker #pickerFrom></mat-datepicker>
            </mat-form-field>
            
            <mat-form-field appearance="outline" class="filter-field" floatLabel="always">
              <mat-label>Fecha Hasta</mat-label>
              <mat-icon matPrefix>calendar_today</mat-icon>
              <input matInput [matDatepicker]="pickerTo" [ngModel]="filterDateTo()" (ngModelChange)="filterDateTo.set($event)" placeholder="dd/mm/yyyy">
              <mat-hint>Formato: dd/mm/yyyy</mat-hint>
              <mat-datepicker-toggle matIconSuffix [for]="pickerTo"></mat-datepicker-toggle>
              <mat-datepicker #pickerTo></mat-datepicker>
            </mat-form-field>
          }
        </div>
      </div>

      <!-- Kanban Board -->
      <div class="kanban-board" cdkDropListGroup>
        @for (status of visibleStatuses(); track status.value) {
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

      <!-- Analytics Section -->
      <div class="analytics-section">
        <div class="analytics-header">
          <h2>Resumen analítico</h2>
          <button mat-raised-button type="button" class="analytics-btn-primary" [disabled]="analyticsBusy()"
            (click)="loadAnalytics()">
            <mat-icon>refresh</mat-icon>
            Actualizar gráficos
          </button>
        </div>

        @if (analyticsError()) {
          <p class="analytics-state error">{{ analyticsError() }}</p>
        }

        <div class="analytics-grid">
          <section class="chart-card">
            <h3>Órdenes por estado</h3>
            <p class="chart-subtitle">Distribución del día {{ formatDateForDisplay(selectedStatusDate()) }}.</p>
            <div class="chart-controls">
              <mat-form-field appearance="outline" class="analytics-date-field">
                <mat-label>Fecha</mat-label>
                <input matInput [matDatepicker]="statusDatePicker" [ngModel]="selectedStatusDate()" (ngModelChange)="onStatusDateSelected($event)">
                <mat-datepicker-toggle matIconSuffix [for]="statusDatePicker"></mat-datepicker-toggle>
                <mat-datepicker #statusDatePicker></mat-datepicker>
              </mat-form-field>
              <button mat-stroked-button type="button" class="analytics-btn-secondary" [disabled]="statusLoading()"
                (click)="reloadStatusDistribution()">
                <mat-icon>refresh</mat-icon>
                Recargar día
              </button>
            </div>
            @if (statusLoading()) {
              <p class="chart-loading">Actualizando gráfico de órdenes...</p>
            }

            <div class="status-pie-layout">
              <div class="status-pie-wrapper">
                <div class="status-pie" [style.background]="statusPieBackground()" role="img"
                  [attr.aria-label]="'Distribución de órdenes del día seleccionado. Total: ' + (statusDistribution()?.totalOrders ?? 0)">
                </div>
                <div class="status-pie-total">
                  <strong>{{ statusDistribution()?.totalOrders ?? 0 }}</strong>
                  <span>órdenes</span>
                </div>
              </div>

              <div class="status-legend">
                @for (item of statusChartData(); track item.status) {
                  <div class="status-legend-row">
                    <span class="status-color" [style.background]="item.color"></span>
                    <span>{{ item.label }}</span>
                    <span>{{ item.count }} ({{ item.percentage }}%)</span>
                  </div>
                } @empty {
                  <p class="empty-chart">Sin datos para mostrar.</p>
                }
              </div>
            </div>
          </section>

          <section class="chart-card">
            <h3>Facturación diaria (7 días)</h3>
            <p class="chart-subtitle">Montos cobrados por día para facturas con estado PAID.</p>
            <div class="chart-controls revenue-window-controls">
              <button mat-icon-button type="button" class="analytics-nav-btn" [disabled]="revenueLoading()"
                aria-label="Ventana anterior de facturación" (click)="moveRevenueWindow(-revenueWindowDays)">
                <mat-icon>chevron_left</mat-icon>
              </button>
              <span class="revenue-window-label">
                {{ formatDateForDisplay(revenueWindowStartDate()) }} - {{ formatDateForDisplay(revenueWindowEndDate()) }}
              </span>
              <button mat-icon-button type="button" class="analytics-nav-btn" [disabled]="revenueLoading()"
                aria-label="Ventana siguiente de facturación" (click)="moveRevenueWindow(revenueWindowDays)">
                <mat-icon>chevron_right</mat-icon>
              </button>
            </div>
            @if (revenueLoading()) {
              <p class="chart-loading">Actualizando gráfico de facturación...</p>
            }

            <div class="revenue-bars-chart">
              @for (point of revenueChartData(); track point.date) {
                <div class="revenue-bar-column">
                  <div class="revenue-bar-track">
                    <div class="revenue-bar-fill" [style.height.%]="point.percentage"
                      [attr.aria-label]="formatChartDate(point.date) + ': ' + point.invoiceCount + ' facturas, $' + point.totalAmount">
                    </div>
                  </div>
                  <span class="revenue-bar-value" [attr.title]="'Facturación del día: $' + (point.totalAmount | number:'1.0-2')">
                    {{ formatRevenueAmount(point.totalAmount) }}
                  </span>
                </div>
              }
            </div>
            <div class="revenue-summary">
              <span class="revenue-summary-label">Facturación total de la ventana</span>
              <strong class="revenue-summary-value">\${{ revenueWindowTotal() | number:'1.0-2' }}</strong>
            </div>
          </section>
        </div>
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
    
    .filters-section {
      background: linear-gradient(135deg, #ffffff 0%, #f9fafb 100%);
      padding: 1.5rem;
      border-radius: 12px;
      margin-bottom: 2rem;
      box-shadow: 0 4px 12px rgba(0,0,0,0.08);
      border: 1px solid rgba(255,255,255,0.8);
    }
    
    .filters-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1.5rem;
      flex-wrap: wrap;
    }
    
    .filter-chips {
      flex: 1;
      min-width: 250px;
    }

    .filter-chipset {
      display: flex;
      gap: 0.75rem;
      flex-wrap: wrap;
      align-items: center;
    }

    .filter-type-btn {
      position: relative;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      min-height: 40px;
      padding: 8px 14px;
      margin: 0;
      border: 1.5px solid #d1d5db;
      border-radius: 20px;
      background: linear-gradient(135deg, #ffffff 0%, #fcfdfe 100%);
      color: #4b5563;
      font-size: 0.9rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
      white-space: nowrap;
    }

    .filter-type-btn:hover {
      border-color: #9ca3af;
      background: linear-gradient(135deg, #fafbfc 0%, #f8fafc 100%);
      box-shadow: 0 4px 8px rgba(0,0,0,0.1);
      transform: translateY(-1px);
    }

    .filter-type-btn.active {
      background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
      color: white;
      border-color: #1976d2;
      box-shadow: 0 4px 12px rgba(25, 118, 210, 0.3);
      font-weight: 600;
    }

    .filter-controls {
      display: flex;
      gap: 1rem;
      align-items: flex-start;
      flex-wrap: wrap;
      padding-top: 0.5rem;
      border-top: 1px solid #f0f0f0;
    }
    
    .filter-controls mat-form-field {
      min-width: 220px;
      flex: 0 1 auto;
    }
    
    .filter-field {
      width: 100%;
    }

    .analytics-section {
      margin-top: 2rem;
      background: linear-gradient(135deg, #ffffff 0%, #f9fafb 100%);
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 4px 12px rgba(0,0,0,0.08);
      border: 1px solid rgba(255,255,255,0.8);
    }

    .analytics-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1rem;
      flex-wrap: wrap;
    }

    .analytics-header h2 {
      margin: 0;
      color: #2c3e50;
      font-size: 1.3rem;
      font-weight: 600;
    }

    .analytics-state {
      margin: 0;
      color: #4b5563;
      font-weight: 500;
    }

    .analytics-state.error {
      color: #b91c1c;
    }

    .analytics-grid {
      display: grid;
      grid-template-columns: minmax(300px, 0.9fr) minmax(480px, 1.4fr);
      gap: 1rem;
      align-items: stretch;
    }

    .chart-card {
      border: 1px solid #e5e7eb;
      border-radius: 10px;
      padding: 1rem;
      background: #ffffff;
      display: flex;
      flex-direction: column;
      min-height: 420px;
    }

    .chart-card h3 {
      margin: 0 0 0.35rem 0;
      color: #1f2937;
      font-size: 1.05rem;
    }

    .chart-subtitle {
      margin: 0 0 1rem 0;
      color: #6b7280;
      font-size: 0.85rem;
    }

    .chart-loading {
      margin: 0 0 0.8rem 0;
      color: #2563eb;
      font-size: 0.85rem;
      font-weight: 600;
    }

    .chart-controls {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
      align-items: center;
      margin-bottom: 1rem;
    }

    .analytics-date-field {
      width: min(100%, 240px);
    }

    .analytics-btn-primary,
    .analytics-btn-secondary {
      min-height: 42px;
      border-radius: 10px !important;
      padding: 0 16px !important;
      font-weight: 700 !important;
      letter-spacing: 0.2px;
      text-transform: none;
      transition: all 180ms cubic-bezier(0.4, 0, 0.2, 1) !important;
    }

    .analytics-btn-primary {
      border: 1px solid rgba(21, 101, 192, 0.38) !important;
      background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%) !important;
      color: #ffffff !important;
      box-shadow: 0 8px 18px rgba(25, 118, 210, 0.26) !important;
    }

    .analytics-btn-primary:hover {
      background: linear-gradient(135deg, #1e88e5 0%, #1976d2 100%) !important;
      box-shadow: 0 12px 22px rgba(25, 118, 210, 0.34) !important;
      transform: translateY(-1px);
    }

    .analytics-btn-secondary {
      border: 1px solid #cbd5e1 !important;
      background: #ffffff !important;
      color: #475569 !important;
      box-shadow: 0 4px 12px rgba(15, 23, 42, 0.08) !important;
    }

    .analytics-btn-secondary:hover {
      border-color: #94a3b8 !important;
      color: #0f172a !important;
      background: #f8fafc !important;
      box-shadow: 0 8px 16px rgba(15, 23, 42, 0.12) !important;
      transform: translateY(-1px);
    }

    .analytics-nav-btn {
      background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
      color: #ffffff !important;
      box-shadow: 0 6px 14px rgba(25, 118, 210, 0.26);
      border: 1px solid rgba(21, 101, 192, 0.35);
      transition: all 180ms cubic-bezier(0.4, 0, 0.2, 1);
    }

    .analytics-nav-btn:hover {
      background: linear-gradient(135deg, #1e88e5 0%, #1976d2 100%);
      box-shadow: 0 10px 18px rgba(25, 118, 210, 0.34);
      transform: translateY(-1px);
    }

    .revenue-window-controls {
      justify-content: center;
    }

    .revenue-window-label {
      color: #374151;
      font-size: 0.9rem;
      font-weight: 600;
      text-align: center;
      min-width: 220px;
    }

    .status-pie-layout {
      display: grid;
      grid-template-columns: minmax(180px, 220px) minmax(0, 1fr);
      gap: 1rem;
      align-items: center;
    }

    .status-pie-wrapper {
      display: flex;
      justify-content: center;
      position: relative;
      margin: 0 auto;
      width: 145px;
      height: 145px;
    }

    .status-pie {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      border: 1px solid #e5e7eb;
      transition: background 200ms ease;
      position: relative;
    }

    .status-pie::after {
      content: '';
      position: absolute;
      inset: 24px;
      background: #ffffff;
      border-radius: 50%;
    }

    .status-pie-total {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      z-index: 1;
      color: #1f2937;
    }

    .status-pie-total strong {
      font-size: 1.2rem;
      line-height: 1;
    }

    .status-pie-total span {
      font-size: 0.75rem;
      color: #6b7280;
    }

    .status-legend {
      display: grid;
      gap: 0.6rem;
    }

    .status-legend-row {
      display: grid;
      grid-template-columns: 14px minmax(0, 1fr) auto;
      align-items: center;
      gap: 0.6rem;
      color: #374151;
      font-size: 0.9rem;
    }

    .status-color {
      width: 14px;
      height: 14px;
      border-radius: 50%;
    }

    .revenue-bars-chart {
      display: grid;
      grid-template-columns: repeat(7, minmax(0, 1fr));
      gap: 0.7rem;
      align-items: end;
      min-height: 250px;
      width: 100%;
      margin-bottom: 0.75rem;
    }

    .revenue-bar-column {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.35rem;
    }

    .revenue-bar-track {
      width: 100%;
      height: 190px;
      border-radius: 10px;
      background: #e5e7eb;
      overflow: hidden;
      display: flex;
      align-items: flex-end;
    }

    .revenue-bar-fill {
      width: 100%;
      min-height: 2px;
      border-radius: 10px 10px 0 0;
      background: linear-gradient(180deg, #42a5f5 0%, #1976d2 55%, #1565c0 100%);
      transition: height 200ms ease;
    }

    .revenue-summary {
      margin-top: auto;
      padding: 0.75rem;
      border-radius: 10px;
      background: linear-gradient(135deg, #f0f6ff 0%, #e8f1ff 100%);
      border: 1px solid rgba(25, 118, 210, 0.15);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.2rem;
    }

    .revenue-summary-label {
      font-size: 0.84rem;
      color: #475569;
      font-weight: 600;
    }

    .revenue-summary-value {
      font-size: 1.4rem;
      line-height: 1.1;
      color: #1565c0;
    }

    .revenue-bar-value {
      min-height: 1.8rem;
      font-size: 0.78rem;
      color: #334155;
      line-height: 1.1;
      text-align: center;
      font-weight: 600;
      word-break: break-word;
    }

    .empty-chart {
      margin: 0.5rem 0 0 0;
      color: #6b7280;
      font-style: italic;
    }

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
      padding: 0.75rem;
      min-height: 300px;
      max-height: calc(100vh - 320px);
      flex: 1;
      overflow-y: auto;
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
    
    @media (max-width: 1400px) {
      .kanban-board {
        grid-template-columns: repeat(2, 1fr);
      }

      .analytics-grid {
        grid-template-columns: 1fr;
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

      .status-pie-layout {
        grid-template-columns: 1fr;
      }

      .status-pie-wrapper {
        width: 150px;
        height: 150px;
      }

      .revenue-bar-track {
        height: 130px;
      }
    }
  `]
})
export class WashBoardComponent implements OnInit {
  private washService = inject(WashService);
  private invoiceService = inject(InvoiceService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);
  readonly revenueWindowDays = 7;

  serviceOrders = this.washService.serviceOrders;
  statusDistribution = signal<DashboardStatusDistribution | null>(null);
  dailyRevenue = signal<DashboardDailyRevenue | null>(null);
  statusLoading = signal<boolean>(false);
  revenueLoading = signal<boolean>(false);
  analyticsError = signal<string | null>(null);
  selectedStatusDate = signal<Date>(this.normalizeDate(new Date()));
  revenueWindowStartDate = signal<Date>(this.getInitialRevenueStartDate());
  analyticsBusy = computed(() => this.statusLoading() || this.revenueLoading());

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

  visibleStatuses = computed(() => {
    if (this.selectedFilterType() === 'status' && this.filterStatus()) {
      return this.statuses.filter(status => status.value === this.filterStatus());
    }
    return this.statuses;
  });

  uniqueEmployees = computed(() => {
    const employees = this.serviceOrders()
      .map(order => order.assignedEmployeeId)
      .filter(id => id !== null && id !== undefined);
    return Array.from(new Set(employees));
  });

  filteredOrders = computed(() => {
    let orders = this.serviceOrders();
    
    if (this.filterStatus()) {
      orders = orders.filter(o => o.status === this.filterStatus());
    }
    
    if (this.filterEmployee()) {
      orders = orders.filter(o => o.assignedEmployeeId === this.filterEmployee());
    }
    
    if (this.filterServiceType()) {
      orders = orders.filter(o => o.serviceType === this.filterServiceType());
    }
    
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

  statusChartData = computed(() => {
    const distribution = this.statusDistribution();
    if (!distribution) {
      return [];
    }

    const total = distribution.totalOrders || 0;
    return distribution.statuses.map(item => ({
      ...item,
      label: this.statusLabel(item.status),
      rawPercentage: total > 0 ? (item.count / total) * 100 : 0,
      percentage: total > 0 ? Math.round((item.count / total) * 100) : 0,
      color: this.statusColor(item.status)
    }));
  });

  statusPieBackground = computed(() => {
    const segments = this.statusChartData().filter(item => item.rawPercentage > 0);
    if (!segments.length) {
      return 'conic-gradient(#e5e7eb 0 100%)';
    }

    let current = 0;
    const gradientStops = segments.map(item => {
      const start = current;
      current += item.rawPercentage;
      return `${item.color} ${start}% ${current}%`;
    });

    if (current < 100) {
      gradientStops.push(`#e5e7eb ${current}% 100%`);
    }

    return `conic-gradient(${gradientStops.join(', ')})`;
  });

  revenueWindowEndDate = computed(() => this.addDays(this.revenueWindowStartDate(), this.revenueWindowDays - 1));

  revenueChartData = computed(() => {
    const pointsByDate = new Map((this.dailyRevenue()?.points ?? []).map(point => [point.date, point]));
    const points: DashboardDailyRevenue['points'] = [];

    for (let offset = 0; offset < this.revenueWindowDays; offset++) {
      const currentDate = this.addDays(this.revenueWindowStartDate(), offset);
      const dateIso = this.formatDateForApi(currentDate);
      const point = pointsByDate.get(dateIso);
      points.push({
        date: dateIso,
        totalAmount: point?.totalAmount ?? 0,
        invoiceCount: point?.invoiceCount ?? 0
      });
    }

    const maxAmount = points.reduce((max, point) => Math.max(max, point.totalAmount), 0);

    return points.map(point => ({
      ...point,
      percentage: maxAmount > 0 ? Math.round((point.totalAmount / maxAmount) * 100) : 0
    }));
  });

  revenueWindowTotal = computed(() =>
    this.revenueChartData().reduce((total, point) => total + point.totalAmount, 0)
  );

  ngOnInit(): void {
    this.washService.loadServiceOrders();
    this.loadAnalytics();
  }

  loadAnalytics(): void {
    this.statusLoading.set(true);
    this.revenueLoading.set(true);
    this.analyticsError.set(null);

    const selectedDate = this.formatDateForApi(this.selectedStatusDate());
    const revenueStartDate = this.formatDateForApi(this.revenueWindowStartDate());

    forkJoin({
      statusDistribution: this.washService.getDashboardStatusDistribution(selectedDate),
      dailyRevenue: this.invoiceService.getDashboardDailyRevenue(revenueStartDate, this.revenueWindowDays)
    }).subscribe({
      next: ({ statusDistribution, dailyRevenue }) => {
        this.statusDistribution.set(statusDistribution);
        this.dailyRevenue.set(dailyRevenue);
        this.statusLoading.set(false);
        this.revenueLoading.set(false);
      },
      error: () => {
        this.statusLoading.set(false);
        this.revenueLoading.set(false);
        this.analyticsError.set('No se pudieron cargar las métricas del dashboard.');
      }
    });
  }

  onStatusDateSelected(date: Date | null): void {
    if (!date) {
      return;
    }

    this.selectedStatusDate.set(this.normalizeDate(date));
    this.reloadStatusDistribution();
  }

  reloadStatusDistribution(): void {
    this.statusLoading.set(true);
    this.analyticsError.set(null);

    const selectedDate = this.formatDateForApi(this.selectedStatusDate());
    this.washService.getDashboardStatusDistribution(selectedDate).subscribe({
      next: (statusDistribution) => {
        this.statusDistribution.set(statusDistribution);
        this.statusLoading.set(false);
      },
      error: () => {
        this.statusLoading.set(false);
        this.analyticsError.set('No se pudo cargar la distribución de órdenes.');
      }
    });
  }

  moveRevenueWindow(daysOffset: number): void {
    this.revenueWindowStartDate.set(this.addDays(this.revenueWindowStartDate(), daysOffset));
    this.reloadRevenueWindow();
  }

  formatDateForDisplay(date: Date): string {
    return new Intl.DateTimeFormat('es-AR').format(date);
  }

  formatChartDate(dateIso: string): string {
    const [year, month, day] = dateIso.split('-');
    if (!year || !month || !day) {
      return dateIso;
    }
    return `${day}/${month}`;
  }

  formatRevenueAmount(amount: number): string {
    if (!Number.isFinite(amount) || amount <= 0) {
      return '$0';
    }

    const compactAmount = new Intl.NumberFormat('es-AR', {
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(amount);

    return `$${compactAmount}`;
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
    
    this.washService.updateStatus(event.orderId, event.newStatus).subscribe({
      next: () => {
        this.snackBar.open('Estado actualizado correctamente', 'OK', { duration: 2000 });
        this.loadAnalytics();
      },
      error: () => {
        this.snackBar.open('Error al actualizar el estado', 'Cerrar', { duration: 3000 });
      }
    });
  }

  handleInvoice(orderId: string): void {
    const order = this.serviceOrders().find(o => o.id === orderId);
    if (!order) return;
    
    const dialogRef = this.dialog.open(InvoiceModalComponent, {
      width: '500px',
      data: { order }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.confirmed) {
        this.invoiceService.createInvoice(
          orderId, 
          result.paymentMethod, 
          result.notes
        ).subscribe({
          next: (invoice) => {
            this.snackBar.open(`Factura #${invoice.invoiceNumber} generada exitosamente`, 'OK', { 
              duration: 5000
            });
            this.washService.loadServiceOrders();
            this.loadAnalytics();
          },
          error: (err) => {
            console.error('Error creating invoice:', err);
            this.snackBar.open('Error al generar la factura', 'Cerrar', { duration: 3000 });
          }
        });
      }
    });
  }

  onDrop(event: CdkDragDrop<ServiceOrder[]>): void {
    const order = event.item.data as ServiceOrder;
    const newStatus = event.container.id as ServiceStatus;
    
    if (event.previousContainer === event.container) {
      return;
    }
    
    this.washService.updateStatus(order.id!, newStatus).subscribe({
      next: () => {
        this.snackBar.open('Estado actualizado correctamente', 'OK', { duration: 2000 });
        this.loadAnalytics();
      },
      error: () => {
        this.snackBar.open('Error al actualizar el estado', 'Cerrar', { duration: 3000 });
      }
    });
  }

  private statusLabel(status: ServiceStatus): string {
    const statusConfig = this.statuses.find(item => item.value === status);
    return statusConfig?.label ?? status;
  }

  private statusColor(status: ServiceStatus): string {
    const statusConfig = this.statuses.find(item => item.value === status);
    return statusConfig?.color ?? '#9ca3af';
  }

  private reloadRevenueWindow(): void {
    this.revenueLoading.set(true);
    this.analyticsError.set(null);

    const revenueStartDate = this.formatDateForApi(this.revenueWindowStartDate());
    this.invoiceService.getDashboardDailyRevenue(revenueStartDate, this.revenueWindowDays).subscribe({
      next: (dailyRevenue) => {
        this.dailyRevenue.set(dailyRevenue);
        this.revenueLoading.set(false);
      },
      error: () => {
        this.revenueLoading.set(false);
        this.analyticsError.set('No se pudo cargar la facturación diaria.');
      }
    });
  }

  private getInitialRevenueStartDate(): Date {
    return this.addDays(this.normalizeDate(new Date()), -(this.revenueWindowDays - 1));
  }

  private normalizeDate(date: Date): Date {
    const normalizedDate = new Date(date);
    normalizedDate.setHours(0, 0, 0, 0);
    return normalizedDate;
  }

  private addDays(baseDate: Date, days: number): Date {
    const result = new Date(baseDate);
    result.setDate(result.getDate() + days);
    return this.normalizeDate(result);
  }

  private formatDateForApi(date: Date): string {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
