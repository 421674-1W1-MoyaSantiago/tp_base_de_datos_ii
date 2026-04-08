import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { InvoiceService } from '../../core/services/invoice.service';
import { ClientService } from '../../core/services/client.service';
import { WashService } from '../../core/services/wash.service';
import { Invoice, Client, ServiceOrder, PaymentMethod } from '../../core/models/models';

@Component({
  selector: 'app-invoice-ticket',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDividerModule
  ],
  template: `
    <div class="ticket-container">
      @if (loading()) {
        <div class="loading-container">
          <mat-spinner></mat-spinner>
        </div>
      } @else if (invoice()) {
        <div class="ticket-actions no-print">
          <button mat-button (click)="goBack()">
            <mat-icon>arrow_back</mat-icon>
            Volver
          </button>
          <button mat-raised-button color="primary" (click)="print()">
            <mat-icon>print</mat-icon>
            Imprimir
          </button>
        </div>

        <div class="ticket-content" #ticketContent>
          <div class="ticket-header">
            <div class="logo">
              <mat-icon class="car-icon">directions_car</mat-icon>
              <h1>Lavadero de Autos</h1>
            </div>
            <div class="company-info">
              <p>Premium Car Wash Services</p>
              <p>Tel: (123) 456-7890</p>
              <p>Email: info@lavadero.com</p>
            </div>
          </div>

          <mat-divider></mat-divider>

          <div class="ticket-info">
            <div class="info-row">
              <span class="label">N° de Factura:</span>
              <span class="value">{{ invoice()?.invoiceNumber }}</span>
            </div>
            <div class="info-row">
              <span class="label">Fecha:</span>
              <span class="value">{{ invoice()?.issuedAt | date:'dd/MM/yyyy HH:mm' }}</span>
            </div>
            <div class="info-row">
              <span class="label">Estado:</span>
              <span class="value" [class]="'status-' + invoice()?.paymentStatus?.toLowerCase()">
                {{ getStatusLabel(invoice()!.paymentStatus) }}
              </span>
            </div>
          </div>

          <mat-divider></mat-divider>

          <div class="client-info section">
            <h2>Información del Cliente</h2>
            @if (client()) {
              <div class="info-grid">
                <div class="info-item">
                  <span class="label">Nombre:</span>
                  <span class="value">{{ client()?.firstName }} {{ client()?.lastName }}</span>
                </div>
                <div class="info-item">
                  <span class="label">DNI:</span>
                  <span class="value">{{ client()?.dni }}</span>
                </div>
                <div class="info-item">
                  <span class="label">Email:</span>
                  <span class="value">{{ client()?.email }}</span>
                </div>
                <div class="info-item">
                  <span class="label">Teléfono:</span>
                  <span class="value">{{ client()?.phone || 'N/A' }}</span>
                </div>
              </div>
            }
          </div>

          <mat-divider></mat-divider>

          <div class="service-info section">
            <h2>Detalles del Servicio</h2>
            @if (serviceOrder()) {
              <div class="info-grid">
                <div class="info-item">
                  <span class="label">Orden N°:</span>
                  <span class="value">{{ serviceOrder()?.orderNumber }}</span>
                </div>
                <div class="info-item">
                  <span class="label">Vehículo:</span>
                  <span class="value">{{ serviceOrder()?.vehicleLicensePlate }}</span>
                </div>
                <div class="info-item">
                  <span class="label">Tipo de Servicio:</span>
                  <span class="value">{{ getServiceTypeLabel(serviceOrder()!.serviceType) }}</span>
                </div>
                <div class="info-item">
                  <span class="label">Estado del Servicio:</span>
                  <span class="value">{{ getServiceStatusLabel(serviceOrder()!.status) }}</span>
                </div>
                @if (serviceOrder()?.startTime) {
                  <div class="info-item">
                    <span class="label">Inicio:</span>
                    <span class="value">{{ serviceOrder()?.startTime | date:'dd/MM/yyyy HH:mm' }}</span>
                  </div>
                }
                @if (serviceOrder()?.endTime) {
                  <div class="info-item">
                    <span class="label">Fin:</span>
                    <span class="value">{{ serviceOrder()?.endTime | date:'dd/MM/yyyy HH:mm' }}</span>
                  </div>
                }
              </div>
              @if (serviceOrder()?.notes) {
                <div class="notes">
                  <span class="label">Notas:</span>
                  <p>{{ serviceOrder()?.notes }}</p>
                </div>
              }
            }
          </div>

          <mat-divider></mat-divider>

          <div class="payment-info section">
            <h2>Información de Pago</h2>
            <div class="payment-details">
              <div class="payment-row">
                <span class="label">Método de Pago:</span>
                <span class="value">{{ getPaymentMethodLabel(invoice()!.paymentMethod) }}</span>
              </div>
              <div class="payment-row total">
                <span class="label">Total:</span>
                <span class="value">\${{ invoice()?.amount?.toFixed(2) }}</span>
              </div>
            </div>
            @if (invoice()?.notes) {
              <div class="notes">
                <span class="label">Notas de Facturación:</span>
                <p>{{ invoice()?.notes }}</p>
              </div>
            }
          </div>

          <mat-divider></mat-divider>

          <div class="ticket-footer">
            <p class="thank-you">¡Gracias por su preferencia!</p>
            <p class="footer-text">Este documento es un comprobante de pago</p>
            <p class="footer-text">Para consultas o reclamos, comuníquese con nosotros</p>
          </div>
        </div>
      } @else {
        <div class="error-container">
          <mat-icon class="error-icon">error_outline</mat-icon>
          <p>No se pudo cargar la factura</p>
          <button mat-raised-button color="primary" (click)="goBack()">
            Volver a la lista
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    .ticket-container {
      padding: 20px;
      max-width: 900px;
      margin: 0 auto;
    }

    .loading-container,
    .error-container {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      min-height: 400px;
      gap: 20px;
    }

    .error-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #f44336;
    }

    .ticket-actions {
      display: flex;
      justify-content: space-between;
      margin-bottom: 20px;
    }

    .ticket-content {
      background: white;
      padding: 40px;
      border: 2px solid #ddd;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .ticket-header {
      text-align: center;
      margin-bottom: 30px;
    }

    .logo {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
    }

    .car-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #1976d2;
    }

    .logo h1 {
      margin: 0;
      color: #333;
      font-size: 32px;
    }

    .company-info {
      margin-top: 15px;
      color: #666;
      font-size: 14px;
    }

    .company-info p {
      margin: 5px 0;
    }

    mat-divider {
      margin: 20px 0;
    }

    .ticket-info {
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin: 20px 0;
    }

    .info-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
    }

    .section {
      margin: 20px 0;
    }

    .section h2 {
      font-size: 18px;
      color: #333;
      margin-bottom: 15px;
      border-bottom: 2px solid #1976d2;
      padding-bottom: 8px;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
    }

    .info-item {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }

    .label {
      font-size: 12px;
      color: #666;
      text-transform: uppercase;
      font-weight: 500;
    }

    .value {
      font-size: 16px;
      color: #333;
    }

    .status-pending {
      color: #e65100;
    }

    .status-paid {
      color: #2e7d32;
      font-weight: 600;
    }

    .status-cancelled {
      color: #c62828;
    }

    .payment-details {
      background: #f5f5f5;
      padding: 20px;
      border-radius: 8px;
    }

    .payment-row {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
    }

    .payment-row.total {
      border-top: 2px solid #333;
      margin-top: 10px;
      padding-top: 15px;
    }

    .payment-row.total .label {
      font-size: 18px;
      font-weight: 600;
    }

    .payment-row.total .value {
      font-size: 28px;
      font-weight: 700;
      color: #1976d2;
    }

    .notes {
      margin-top: 15px;
      padding: 15px;
      background: #fff8e1;
      border-left: 4px solid #ffc107;
      border-radius: 4px;
    }

    .notes .label {
      display: block;
      margin-bottom: 8px;
    }

    .notes p {
      margin: 0;
      color: #333;
      font-size: 14px;
    }

    .ticket-footer {
      text-align: center;
      margin-top: 30px;
      padding-top: 20px;
    }

    .thank-you {
      font-size: 20px;
      font-weight: 600;
      color: #1976d2;
      margin-bottom: 15px;
    }

    .footer-text {
      font-size: 12px;
      color: #666;
      margin: 5px 0;
    }

    /* Print styles */
    @media print {
      .ticket-container {
        padding: 0;
      }

      .no-print {
        display: none !important;
      }

      .ticket-content {
        border: none;
        box-shadow: none;
        padding: 20px;
      }

      .section {
        page-break-inside: avoid;
      }

      body {
        print-color-adjust: exact;
        -webkit-print-color-adjust: exact;
      }
    }
  `]
})
export class InvoiceTicketComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private invoiceService = inject(InvoiceService);
  private clientService = inject(ClientService);
  private washService = inject(WashService);

  invoice = signal<Invoice | null>(null);
  client = signal<Client | null>(null);
  serviceOrder = signal<ServiceOrder | null>(null);
  loading = signal<boolean>(true);

  ngOnInit(): void {
    const invoiceId = this.route.snapshot.paramMap.get('id');
    if (invoiceId) {
      this.loadInvoice(invoiceId);
    } else {
      this.loading.set(false);
    }
  }

  loadInvoice(id: string): void {
    this.loading.set(true);
    this.invoiceService.getInvoiceById(id).subscribe({
      next: (invoice) => {
        this.invoice.set(invoice);
        this.loadClient(invoice.clientId);
        this.loadServiceOrder(invoice.serviceOrderId);
      },
      error: (error) => {
        console.error('Error loading invoice:', error);
        this.loading.set(false);
      }
    });
  }

  loadClient(clientId: string): void {
    this.clientService.getClientById(clientId).subscribe({
      next: (client) => {
        this.client.set(client);
      },
      error: (error) => {
        console.error('Error loading client:', error);
      }
    });
  }

  loadServiceOrder(serviceOrderId: string): void {
    this.washService.getServiceOrderById(serviceOrderId).subscribe({
      next: (order) => {
        this.serviceOrder.set(order);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading service order:', error);
        this.loading.set(false);
      }
    });
  }

  print(): void {
    window.print();
  }

  goBack(): void {
    this.router.navigate(['/billing/invoices']);
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

  getServiceTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      BASIC: 'Básico',
      COMPLETE: 'Completo',
      PREMIUM: 'Premium',
      EXPRESS: 'Express'
    };
    return labels[type] || type;
  }

  getServiceStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      PENDING: 'Pendiente',
      IN_PROGRESS: 'En Progreso',
      COMPLETED: 'Completado',
      DELIVERED: 'Entregado'
    };
    return labels[status] || status;
  }
}
