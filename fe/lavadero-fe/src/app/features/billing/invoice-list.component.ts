import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { InvoiceService } from '../../core/services/invoice.service';
import { ClientService } from '../../core/services/client.service';
import { Invoice, PaymentMethod, Client } from '../../core/models/models';

interface InvoiceDisplay extends Invoice {
  clientName?: string;
}

@Component({
  selector: 'app-invoice-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatInputModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="invoice-list-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Facturas</mat-card-title>
        </mat-card-header>
        
        <mat-card-content>
          <!-- Filters -->
          <form [formGroup]="filterForm" class="filters">
            <mat-form-field appearance="outline" floatLabel="always">
              <mat-label>Rango de Fechas</mat-label>
              <mat-icon matPrefix>date_range</mat-icon>
              <mat-date-range-input [rangePicker]="picker">
                <input matStartDate formControlName="fromDate" placeholder="Desde">
                <input matEndDate formControlName="toDate" placeholder="Hasta">
              </mat-date-range-input>
              <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
              <mat-date-range-picker #picker></mat-date-range-picker>
            </mat-form-field>

            <mat-form-field appearance="outline" floatLabel="always">
              <mat-label>Método de Pago</mat-label>
              <mat-icon matPrefix>payment</mat-icon>
              <mat-select formControlName="paymentMethod" placeholder="Seleccionar">
                <mat-option value="">Todos</mat-option>
                <mat-option value="CASH">Efectivo</mat-option>
                <mat-option value="CARD">Tarjeta</mat-option>
                <mat-option value="TRANSFER">Transferencia</mat-option>
              </mat-select>
            </mat-form-field>

            <div class="filter-actions">
              <button
                mat-raised-button
                color="primary"
                type="button"
                class="filter-btn-primary"
                (click)="applyFilters()">
                <mat-icon>filter_alt</mat-icon>
                Filtrar
              </button>
              <button
                mat-stroked-button
                type="button"
                class="filter-btn-ghost"
                (click)="clearFilters()">
                <mat-icon>clear_all</mat-icon>
                Limpiar
              </button>
            </div>
          </form>

          <!-- Table -->
          @if (loading()) {
            <div class="loading-container">
              <mat-spinner></mat-spinner>
            </div>
          } @else {
            <div class="table-container">
              <table mat-table [dataSource]="invoices()" class="invoice-table">
                <!-- Invoice Number Column -->
                <ng-container matColumnDef="invoiceNumber">
                  <th mat-header-cell *matHeaderCellDef>N° Factura</th>
                  <td mat-cell *matCellDef="let invoice">{{ invoice.invoiceNumber }}</td>
                </ng-container>

                <!-- Date Column -->
                <ng-container matColumnDef="issuedAt">
                  <th mat-header-cell *matHeaderCellDef>Fecha</th>
                  <td mat-cell *matCellDef="let invoice">
                    {{ invoice.issuedAt | date:'dd/MM/yyyy HH:mm' }}
                  </td>
                </ng-container>

                <!-- Client Column -->
                <ng-container matColumnDef="client">
                  <th mat-header-cell *matHeaderCellDef>Cliente</th>
                  <td mat-cell *matCellDef="let invoice">{{ invoice.clientName || 'Cargando...' }}</td>
                </ng-container>

                <!-- Amount Column -->
                <ng-container matColumnDef="amount">
                  <th mat-header-cell *matHeaderCellDef>Monto</th>
                  <td mat-cell *matCellDef="let invoice" class="amount-cell">
                    \${{ invoice.amount?.toFixed(2) }}
                  </td>
                </ng-container>

                <!-- Payment Method Column -->
                <ng-container matColumnDef="paymentMethod">
                  <th mat-header-cell *matHeaderCellDef>Método de Pago</th>
                  <td mat-cell *matCellDef="let invoice">
                    {{ getPaymentMethodLabel(invoice.paymentMethod) }}
                  </td>
                </ng-container>

                <!-- Status Column -->
                <ng-container matColumnDef="paymentStatus">
                  <th mat-header-cell *matHeaderCellDef>Estado</th>
                  <td mat-cell *matCellDef="let invoice">
                    <span [class]="'status-badge status-' + invoice.paymentStatus?.toLowerCase()">
                      {{ getStatusLabel(invoice.paymentStatus) }}
                    </span>
                  </td>
                </ng-container>

                <!-- Actions Column -->
                <ng-container matColumnDef="actions">
                  <th mat-header-cell *matHeaderCellDef>Acciones</th>
                  <td mat-cell *matCellDef="let invoice">
                    <button 
                      mat-icon-button 
                      color="primary"
                      (click)="viewTicket(invoice.id!)"
                      matTooltip="Ver Ticket">
                      <mat-icon>receipt</mat-icon>
                    </button>
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
              </table>

              @if (invoices().length === 0) {
                <div class="no-data">
                  <p>No se encontraron facturas</p>
                </div>
              }
            </div>

            <!-- Pagination -->
            <mat-paginator 
              [length]="totalElements()"
              [pageSize]="pageSize()"
              [pageSizeOptions]="[10, 20, 50]"
              (page)="onPageChange($event)"
              showFirstLastButtons>
            </mat-paginator>
          }
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .invoice-list-container {
      padding: 20px;
    }

    mat-card {
      margin-bottom: 20px;
    }

    .filters {
      display: flex;
      gap: 15px;
      margin-bottom: 20px;
      flex-wrap: wrap;
      align-items: flex-start;
    }

    .filters mat-form-field {
      min-width: 250px;
    }

    .filter-actions {
      display: flex;
      gap: 12px;
      align-items: center;
      padding-top: 8px;
    }

    .filter-btn-primary,
    .filter-btn-ghost {
      min-height: 42px;
      border-radius: 10px !important;
      padding: 0 16px !important;
      font-weight: 700 !important;
      letter-spacing: 0.2px;
      text-transform: none;
      transition: all 180ms cubic-bezier(0.4, 0, 0.2, 1) !important;
    }

    .filter-btn-primary {
      border: 1px solid rgba(21, 101, 192, 0.38) !important;
      background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%) !important;
      color: #ffffff !important;
      box-shadow: 0 8px 18px rgba(25, 118, 210, 0.26) !important;
    }

    .filter-btn-primary:hover {
      background: linear-gradient(135deg, #1e88e5 0%, #1976d2 100%) !important;
      box-shadow: 0 12px 22px rgba(25, 118, 210, 0.34) !important;
      transform: translateY(-1px);
    }

    .filter-btn-ghost {
      border: 1px solid #cbd5e1 !important;
      background: #ffffff !important;
      color: #475569 !important;
      box-shadow: 0 4px 12px rgba(15, 23, 42, 0.08) !important;
    }

    .filter-btn-ghost:hover {
      border-color: #94a3b8 !important;
      color: #0f172a !important;
      background: #f8fafc !important;
      box-shadow: 0 8px 16px rgba(15, 23, 42, 0.12) !important;
      transform: translateY(-1px);
    }

    .filter-btn-primary mat-icon,
    .filter-btn-ghost mat-icon {
      margin-right: 6px;
      width: 18px;
      height: 18px;
      font-size: 18px;
    }

    .loading-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 300px;
    }

    .table-container {
      overflow-x: auto;
    }

    .invoice-table {
      width: 100%;
    }

    .amount-cell {
      font-weight: 600;
      color: #1976d2;
    }

    .status-badge {
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
      text-transform: uppercase;
    }

    .status-pending {
      background: #fff3e0;
      color: #e65100;
    }

    .status-paid {
      background: #e8f5e9;
      color: #2e7d32;
    }

    .status-cancelled {
      background: #ffebee;
      color: #c62828;
    }

    .no-data {
      text-align: center;
      padding: 40px;
      color: #666;
    }

    mat-paginator {
      margin-top: 20px;
    }
  `]
})
export class InvoiceListComponent implements OnInit {
  private invoiceService = inject(InvoiceService);
  private clientService = inject(ClientService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  invoices = signal<InvoiceDisplay[]>([]);
  loading = signal<boolean>(true);
  totalElements = signal<number>(0);
  pageSize = signal<number>(20);
  currentPage = signal<number>(0);

  displayedColumns: string[] = [
    'invoiceNumber',
    'issuedAt',
    'client',
    'amount',
    'paymentMethod',
    'paymentStatus',
    'actions'
  ];

  filterForm: FormGroup;
  private clientCache = new Map<string, Client>();

  constructor() {
    this.filterForm = this.fb.group({
      fromDate: [null],
      toDate: [null],
      paymentMethod: ['']
    });
  }

  ngOnInit(): void {
    this.loadInvoices();
  }

  loadInvoices(): void {
    this.loading.set(true);
    this.invoiceService.getInvoices(this.currentPage(), this.pageSize()).subscribe({
      next: (response) => {
        const invoices = response.content || response;
        this.invoices.set(invoices);
        this.totalElements.set(response.totalElements || invoices.length);
        this.loading.set(false);
        
        // Load client names
        invoices.forEach((invoice: Invoice) => {
          this.loadClientName(invoice);
        });
      },
      error: (error) => {
        console.error('Error loading invoices:', error);
        this.loading.set(false);
      }
    });
  }

  loadClientName(invoice: Invoice): void {
    if (this.clientCache.has(invoice.clientId)) {
      const client = this.clientCache.get(invoice.clientId)!;
      this.updateInvoiceClientName(invoice.id!, `${client.firstName} ${client.lastName}`);
    } else {
      this.clientService.getClientById(invoice.clientId).subscribe({
        next: (client) => {
          this.clientCache.set(invoice.clientId, client);
          this.updateInvoiceClientName(invoice.id!, `${client.firstName} ${client.lastName}`);
        },
        error: (error) => {
          console.error('Error loading client:', error);
          this.updateInvoiceClientName(invoice.id!, 'Desconocido');
        }
      });
    }
  }

  updateInvoiceClientName(invoiceId: string, clientName: string): void {
    this.invoices.update(invoices =>
      invoices.map(inv => inv.id === invoiceId ? { ...inv, clientName } : inv)
    );
  }

  applyFilters(): void {
    // In a real implementation, you would pass these filters to the backend
    this.currentPage.set(0);
    this.loadInvoices();
  }

  clearFilters(): void {
    this.filterForm.reset({
      fromDate: null,
      toDate: null,
      paymentMethod: ''
    });
    this.currentPage.set(0);
    this.loadInvoices();
  }

  onPageChange(event: PageEvent): void {
    this.currentPage.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.loadInvoices();
  }

  viewTicket(invoiceId: string): void {
    this.router.navigate(['/dashboard', 'billing', 'invoice-ticket', invoiceId]);
  }

  getPaymentMethodLabel(method: PaymentMethod): string {
    const labels: { [key in PaymentMethod]: string } = {
      CASH: 'Efectivo',
      CARD: 'Tarjeta',
      TRANSFER: 'Transferencia'
    };
    return labels[method] || method;
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      PENDING: 'Pendiente',
      PAID: 'Pagado',
      CANCELLED: 'Cancelado'
    };
    return labels[status] || status;
  }
}
