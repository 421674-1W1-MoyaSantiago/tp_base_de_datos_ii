import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { InvoiceService } from '../../core/services/invoice.service';
import { SalesReport } from '../../core/models/models';

@Component({
  selector: 'app-sales-report',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatSnackBarModule
  ],
  template: `
    <div class="sales-report-container">
      <mat-card class="filter-card">
        <mat-card-header>
          <mat-card-title>Reporte de Ventas</mat-card-title>
        </mat-card-header>
        
        <mat-card-content>
          <form [formGroup]="reportForm" (ngSubmit)="generateReport()">
            <div class="date-filters">
              <mat-form-field appearance="outline" floatLabel="always">
                <mat-label>Fecha Desde</mat-label>
                <mat-icon matPrefix>calendar_today</mat-icon>
                <input 
                  matInput 
                  [matDatepicker]="fromPicker" 
                  formControlName="fromDate"
                  placeholder="dd/mm/yyyy">
                <mat-datepicker-toggle matIconSuffix [for]="fromPicker"></mat-datepicker-toggle>
                <mat-datepicker #fromPicker></mat-datepicker>
                @if (reportForm.get('fromDate')?.invalid && reportForm.get('fromDate')?.touched) {
                  <mat-error>Fecha requerida</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline" floatLabel="always">
                <mat-label>Fecha Hasta</mat-label>
                <mat-icon matPrefix>calendar_today</mat-icon>
                <input 
                  matInput 
                  [matDatepicker]="toPicker" 
                  formControlName="toDate"
                  placeholder="dd/mm/yyyy">
                <mat-datepicker-toggle matIconSuffix [for]="toPicker"></mat-datepicker-toggle>
                <mat-datepicker #toPicker></mat-datepicker>
                @if (reportForm.get('toDate')?.invalid && reportForm.get('toDate')?.touched) {
                  <mat-error>Fecha requerida</mat-error>
                }
              </mat-form-field>

              <button 
                mat-raised-button 
                color="primary" 
                type="submit"
                [disabled]="reportForm.invalid || loading()">
                @if (loading()) {
                  <mat-spinner diameter="20"></mat-spinner>
                } @else {
                  <ng-container>
                    <mat-icon>assessment</mat-icon>
                    Generar Reporte
                  </ng-container>
                }
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>

      @if (salesReport(); as report) {
        <div class="report-content">
          <!-- Total Summary Card -->
          <mat-card class="total-card">
            <mat-card-content>
              <div class="total-display">
                <div class="total-icon">
                  <mat-icon>monetization_on</mat-icon>
                </div>
                <div class="total-info">
                  <span class="total-label">Total Facturado</span>
                  <span class="total-amount">\${{ report.totalAmount.toFixed(2) }}</span>
                </div>
              </div>
              <div class="invoice-count">
                <mat-icon>receipt_long</mat-icon>
                <span>{{ report.totalInvoices }} facturas emitidas</span>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Payment Methods Breakdown -->
          <div class="breakdown-section">
            <h2>Desglose por Método de Pago</h2>
            <div class="payment-cards">
              @for (method of getPaymentMethods(); track method) {
                <mat-card class="payment-card">
                  <mat-card-content>
                    <div class="payment-header">
                      <mat-icon [class]="'payment-icon ' + method.toLowerCase()">
                        {{ getPaymentIcon(method) }}
                      </mat-icon>
                      <span class="payment-method-name">
                        {{ getPaymentMethodLabel(method) }}
                      </span>
                    </div>
                    <div class="payment-stats">
                      <div class="stat">
                        <span class="stat-label">Monto</span>
                        <span class="stat-value">
                          \${{ getAmountByMethod(method).toFixed(2) }}
                        </span>
                      </div>
                      <div class="stat">
                        <span class="stat-label">Cantidad</span>
                        <span class="stat-value">
                          {{ getCountByMethod(method) }}
                        </span>
                      </div>
                      <div class="stat">
                        <span class="stat-label">Porcentaje</span>
                        <span class="stat-value">
                          {{ getPercentage(method) }}%
                        </span>
                      </div>
                    </div>
                  </mat-card-content>
                </mat-card>
              }
            </div>
          </div>

          <!-- Visual Representation -->
          <mat-card class="chart-card">
            <mat-card-header>
              <mat-card-title>Distribución de Ventas</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="chart-container">
                @for (method of getPaymentMethods(); track method) {
                  <div class="bar-chart-item">
                    <div class="bar-label">{{ getPaymentMethodLabel(method) }}</div>
                    <div class="bar-container">
                      <div 
                        class="bar"
                        [style.width.%]="getPercentage(method)"
                        [class]="'bar-' + method.toLowerCase()">
                      </div>
                    </div>
                    <div class="bar-value">\${{ getAmountByMethod(method).toFixed(2) }}</div>
                  </div>
                }
              </div>
            </mat-card-content>
          </mat-card>
        </div>
      }
    </div>
  `,
  styles: [`
    .sales-report-container {
      padding: 20px;
      max-width: 1400px;
      margin: 0 auto;
    }

    .filter-card {
      margin-bottom: 30px;
    }

    .date-filters {
      display: flex;
      gap: 20px;
      align-items: flex-start;
      flex-wrap: wrap;
    }

    .date-filters mat-form-field {
      flex: 1;
      min-width: 200px;
    }

    .date-filters button {
      min-width: 200px;
      height: 56px;
      display: flex;
      align-items: center;
      gap: 8px;
      justify-content: center;
    }

    mat-spinner {
      display: inline-block;
    }

    .report-content {
      display: flex;
      flex-direction: column;
      gap: 30px;
    }

    .total-card {
      background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
      color: white;
    }

    .total-display {
      display: flex;
      align-items: center;
      gap: 30px;
      padding: 20px 0;
    }

    .total-icon mat-icon {
      font-size: 80px;
      width: 80px;
      height: 80px;
      color: rgba(255, 255, 255, 0.9);
    }

    .total-info {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .total-label {
      font-size: 18px;
      opacity: 0.9;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .total-amount {
      font-size: 56px;
      font-weight: 700;
    }

    .invoice-count {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid rgba(255, 255, 255, 0.3);
      font-size: 16px;
    }

    .breakdown-section h2 {
      margin-bottom: 20px;
      color: #333;
      font-size: 24px;
    }

    .payment-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
    }

    .payment-card {
      border-left: 4px solid #1976d2;
    }

    .payment-header {
      display: flex;
      align-items: center;
      gap: 15px;
      margin-bottom: 20px;
    }

    .payment-icon {
      font-size: 40px;
      width: 40px;
      height: 40px;
    }

    .payment-icon.cash {
      color: #4caf50;
    }

    .payment-icon.card {
      color: #2196f3;
    }

    .payment-icon.transfer {
      color: #ff9800;
    }

    .payment-method-name {
      font-size: 18px;
      font-weight: 600;
      color: #333;
    }

    .payment-stats {
      display: flex;
      flex-direction: column;
      gap: 15px;
    }

    .stat {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px;
      background: #f5f5f5;
      border-radius: 4px;
    }

    .stat-label {
      font-size: 14px;
      color: #666;
      text-transform: uppercase;
    }

    .stat-value {
      font-size: 18px;
      font-weight: 600;
      color: #333;
    }

    .chart-card {
      margin-top: 20px;
    }

    .chart-container {
      display: flex;
      flex-direction: column;
      gap: 20px;
      padding: 20px 0;
    }

    .bar-chart-item {
      display: grid;
      grid-template-columns: 120px 1fr 120px;
      align-items: center;
      gap: 15px;
    }

    .bar-label {
      font-weight: 500;
      color: #333;
    }

    .bar-container {
      height: 40px;
      background: #e0e0e0;
      border-radius: 4px;
      overflow: hidden;
      position: relative;
    }

    .bar {
      height: 100%;
      border-radius: 4px;
      transition: width 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      padding-right: 10px;
      color: white;
      font-weight: 600;
    }

    .bar-cash {
      background: linear-gradient(90deg, #66bb6a 0%, #4caf50 100%);
    }

    .bar-card {
      background: linear-gradient(90deg, #42a5f5 0%, #2196f3 100%);
    }

    .bar-transfer {
      background: linear-gradient(90deg, #ffb74d 0%, #ff9800 100%);
    }

    .bar-value {
      text-align: right;
      font-weight: 600;
      color: #333;
    }

    @media print {
      .filter-card {
        display: none;
      }

      .total-card {
        print-color-adjust: exact;
        -webkit-print-color-adjust: exact;
      }
    }
  `]
})
export class SalesReportComponent {
  private fb = inject(FormBuilder);
  private invoiceService = inject(InvoiceService);
  private snackBar = inject(MatSnackBar);

  salesReport = signal<SalesReport | null>(null);
  loading = signal<boolean>(false);

  reportForm: FormGroup;

  constructor() {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    this.reportForm = this.fb.group({
      fromDate: [firstDayOfMonth, Validators.required],
      toDate: [today, Validators.required]
    });
  }

  generateReport(): void {
    if (this.reportForm.valid) {
      this.loading.set(true);
      const fromDate = this.formatDate(this.reportForm.value.fromDate);
      const toDate = this.formatDate(this.reportForm.value.toDate);

      this.invoiceService.getSalesReport(fromDate, toDate).subscribe({
        next: (report) => {
          this.salesReport.set(report);
          this.loading.set(false);
        },
        error: (error) => {
          console.error('Error generating report:', error);
          this.loading.set(false);
          this.snackBar.open('Error al generar el reporte', 'Cerrar', { duration: 3000 });
        }
      });
    }
  }

  formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  getPaymentMethods(): string[] {
    const report = this.salesReport();
    return report ? Object.keys(report.byPaymentMethod) : [];
  }

  getAmountByMethod(method: string): number {
    const report = this.salesReport();
    if (!report) return 0;
    return report.byPaymentMethod[method] ?? 0;
  }

  getCountByMethod(method: string): number {
    const report = this.salesReport();
    if (!report) return 0;
    return report.countByPaymentMethod[method] ?? 0;
  }

  getPaymentMethodLabel(method: string): string {
    const labels: { [key: string]: string } = {
      CASH: 'Efectivo',
      CARD: 'Tarjeta',
      TRANSFER: 'Transferencia'
    };
    return labels[method] || method;
  }

  getPaymentIcon(method: string): string {
    const icons: { [key: string]: string } = {
      CASH: 'payments',
      CARD: 'credit_card',
      TRANSFER: 'account_balance'
    };
    return icons[method] || 'payment';
  }

  getPercentage(method: string): number {
    const report = this.salesReport();
    if (!report || report.totalAmount === 0) return 0;
    return Math.round((this.getAmountByMethod(method) / report.totalAmount) * 100);
  }
}
