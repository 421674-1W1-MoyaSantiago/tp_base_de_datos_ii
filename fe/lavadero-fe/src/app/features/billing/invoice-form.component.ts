import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { InvoiceService } from '../../core/services/invoice.service';
import { WashService } from '../../core/services/wash.service';
import { ClientService } from '../../core/services/client.service';
import { PaymentMethod, ServiceOrder, Client } from '../../core/models/models';

@Component({
  selector: 'app-invoice-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatRadioModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  template: `
    <div class="invoice-form-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Generar Factura</mat-card-title>
        </mat-card-header>
        
        <mat-card-content>
          @if (loading()) {
            <div class="loading-container">
              <mat-spinner></mat-spinner>
            </div>
          } @else if (serviceOrder()) {
            <!-- Order Summary -->
            <div class="order-summary">
              <h3>Detalles de la Orden</h3>
              <div class="summary-grid">
                <div class="summary-item">
                  <span class="label">Número de Orden:</span>
                  <span class="value">{{ serviceOrder()?.orderNumber }}</span>
                </div>
                <div class="summary-item">
                  <span class="label">Cliente:</span>
                  <span class="value">{{ client()?.firstName }} {{ client()?.lastName }}</span>
                </div>
                <div class="summary-item">
                  <span class="label">Vehículo:</span>
                  <span class="value">{{ serviceOrder()?.vehicleLicensePlate }}</span>
                </div>
                <div class="summary-item">
                  <span class="label">Tipo de Servicio:</span>
                  <span class="value">{{ serviceOrder()?.serviceType }}</span>
                </div>
                <div class="summary-item">
                  <span class="label">Estado:</span>
                  <span class="value">{{ serviceOrder()?.status }}</span>
                </div>
                <div class="summary-item amount">
                  <span class="label">Monto Total:</span>
                  <span class="value">\${{ serviceOrder()?.price?.toFixed(2) }}</span>
                </div>
              </div>
            </div>

            <!-- Invoice Form -->
            <form [formGroup]="invoiceForm" (ngSubmit)="onSubmit()">
              <div class="form-section">
                <h3>Información de Pago</h3>
                
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Método de Pago</mat-label>
                  <mat-radio-group formControlName="paymentMethod" class="payment-method-group">
                    <mat-radio-button value="CASH">Efectivo</mat-radio-button>
                    <mat-radio-button value="CARD">Tarjeta</mat-radio-button>
                    <mat-radio-button value="TRANSFER">Transferencia</mat-radio-button>
                  </mat-radio-group>
                  @if (invoiceForm.get('paymentMethod')?.invalid && invoiceForm.get('paymentMethod')?.touched) {
                    <mat-error>Seleccione un método de pago</mat-error>
                  }
                </mat-form-field>

                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Notas (Opcional)</mat-label>
                  <textarea 
                    matInput 
                    formControlName="notes" 
                    rows="3"
                    placeholder="Agregar notas adicionales..."></textarea>
                </mat-form-field>

                <div class="amount-display">
                  <span class="amount-label">Monto a Cobrar:</span>
                  <span class="amount-value">\${{ serviceOrder()?.price?.toFixed(2) }}</span>
                </div>
              </div>

              <div class="actions">
                <button mat-button type="button" (click)="onCancel()">Cancelar</button>
                <button 
                  mat-raised-button 
                  color="primary" 
                  type="submit"
                  [disabled]="invoiceForm.invalid || submitting()">
                  @if (submitting()) {
                    <mat-spinner diameter="20"></mat-spinner>
                  } @else {
                    Generar Factura
                  }
                </button>
              </div>
            </form>
          } @else {
            <div class="error-message">
              <p>No se pudo cargar la orden de servicio</p>
              <button mat-raised-button (click)="onCancel()">Volver</button>
            </div>
          }
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .invoice-form-container {
      padding: 20px;
      max-width: 900px;
      margin: 0 auto;
    }

    mat-card {
      margin-bottom: 20px;
    }

    .loading-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 300px;
    }

    .order-summary {
      background: #f5f5f5;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 30px;
    }

    .order-summary h3 {
      margin-top: 0;
      margin-bottom: 20px;
      color: #333;
    }

    .summary-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 15px;
    }

    .summary-item {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }

    .summary-item .label {
      font-size: 12px;
      color: #666;
      text-transform: uppercase;
    }

    .summary-item .value {
      font-size: 16px;
      font-weight: 500;
      color: #333;
    }

    .summary-item.amount .value {
      font-size: 24px;
      font-weight: 600;
      color: #1976d2;
    }

    .form-section {
      margin-top: 20px;
    }

    .form-section h3 {
      margin-bottom: 20px;
      color: #333;
    }

    .full-width {
      width: 100%;
    }

    .payment-method-group {
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin: 15px 0;
    }

    .amount-display {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #e3f2fd;
      padding: 20px;
      border-radius: 8px;
      margin: 20px 0;
    }

    .amount-label {
      font-size: 18px;
      font-weight: 500;
      color: #333;
    }

    .amount-value {
      font-size: 32px;
      font-weight: 700;
      color: #1976d2;
    }

    .actions {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      margin-top: 30px;
    }

    .actions button {
      min-width: 150px;
    }

    .error-message {
      text-align: center;
      padding: 40px;
    }

    .error-message p {
      font-size: 18px;
      color: #f44336;
      margin-bottom: 20px;
    }

    mat-spinner {
      display: inline-block;
    }
  `]
})
export class InvoiceFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private invoiceService = inject(InvoiceService);
  private washService = inject(WashService);
  private clientService = inject(ClientService);

  serviceOrder = signal<ServiceOrder | null>(null);
  client = signal<Client | null>(null);
  loading = signal<boolean>(true);
  submitting = signal<boolean>(false);

  invoiceForm: FormGroup;

  constructor() {
    this.invoiceForm = this.fb.group({
      paymentMethod: ['', Validators.required],
      notes: ['']
    });
  }

  ngOnInit(): void {
    const serviceOrderId = this.route.snapshot.paramMap.get('id');
    if (serviceOrderId) {
      this.loadServiceOrder(serviceOrderId);
    } else {
      this.loading.set(false);
      this.snackBar.open('ID de orden no válido', 'Cerrar', { duration: 3000 });
    }
  }

  loadServiceOrder(id: string): void {
    this.loading.set(true);
    this.washService.getServiceOrderById(id).subscribe({
      next: (order) => {
        this.serviceOrder.set(order);
        this.loadClient(order.clientId);
      },
      error: (error) => {
        console.error('Error loading service order:', error);
        this.snackBar.open('Error al cargar la orden', 'Cerrar', { duration: 3000 });
        this.loading.set(false);
      }
    });
  }

  loadClient(clientId: string): void {
    this.clientService.getClientById(clientId).subscribe({
      next: (client) => {
        this.client.set(client);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading client:', error);
        this.loading.set(false);
      }
    });
  }

  onSubmit(): void {
    if (this.invoiceForm.valid && this.serviceOrder()) {
      this.submitting.set(true);
      const formValue = this.invoiceForm.value;
      
      this.invoiceService.createInvoice(
        this.serviceOrder()!.id!,
        formValue.paymentMethod as PaymentMethod,
        formValue.notes
      ).subscribe({
        next: (invoice) => {
          this.submitting.set(false);
          this.snackBar.open('Factura generada exitosamente', 'Cerrar', { duration: 3000 });
          this.router.navigate(['/dashboard', 'billing', 'invoice-ticket', invoice.id]);
        },
        error: (error) => {
          console.error('Error creating invoice:', error);
          this.submitting.set(false);
          this.snackBar.open('Error al generar la factura', 'Cerrar', { duration: 3000 });
        }
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/dashboard', 'billing']);
  }
}
