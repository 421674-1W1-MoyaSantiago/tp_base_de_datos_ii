import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { PaymentMethod, ServiceOrder } from '../../core/models/models';

export interface InvoiceModalData {
  order: ServiceOrder;
}

@Component({
  selector: 'app-invoice-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatIconModule
  ],
  template: `
    <div class="invoice-modal">
      <h2 mat-dialog-title class="modal-title">
        <mat-icon>receipt</mat-icon>
        Generar Factura
      </h2>
      
      <mat-dialog-content>
        <div class="order-summary">
          <div class="summary-item">
            <span class="label">Orden:</span>
            <span class="value">#{{data.order.orderNumber || data.order.id}}</span>
          </div>
          <div class="summary-item">
            <span class="label">Vehículo:</span>
            <span class="value">{{data.order.vehicleLicensePlate}}</span>
          </div>
          <div class="summary-item total">
            <span class="label">Total a Pagar:</span>
            <span class="value price">\${{data.order.price.toFixed(2)}}</span>
          </div>
        </div>

        <form [formGroup]="invoiceForm" class="invoice-form">
          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Método de Pago</mat-label>
            <mat-select formControlName="paymentMethod">
              <mat-option [value]="PaymentMethod.CASH">Efectivo</mat-option>
              <mat-option [value]="PaymentMethod.CARD">Tarjeta de Débito/Crédito</mat-option>
              <mat-option [value]="PaymentMethod.TRANSFER">Transferencia Bancaria</mat-option>
            </mat-select>
            <mat-icon matPrefix>payments</mat-icon>
          </mat-form-field>

          <mat-form-field appearance="outline" class="w-full">
            <mat-label>Observaciones de Facturación</mat-label>
            <textarea 
              matInput 
              formControlName="notes" 
              rows="3" 
              placeholder="Ej: Cliente solicita factura A, pago parcial, etc.">
            </textarea>
            <mat-icon matPrefix>notes</mat-icon>
          </mat-form-field>
        </form>
      </mat-dialog-content>

      <mat-dialog-actions align="end" class="modal-actions">
        <button mat-button (click)="onCancel()" class="btn-cancel">Cancelar</button>
        <button 
          mat-raised-button 
          color="primary" 
          [disabled]="invoiceForm.invalid" 
          (click)="onConfirm()"
          class="btn-confirm">
          <mat-icon>check</mat-icon>
          Confirmar y Facturar
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .invoice-modal {
      padding: 8px;
    }

    .modal-title {
      display: flex;
      align-items: center;
      gap: 12px;
      color: #0f172a;
      font-weight: 800;
      font-size: 1.5rem;
      margin-bottom: 20px !important;
    }

    .modal-title mat-icon {
      color: #1976d2;
      font-size: 28px;
      width: 28px;
      height: 28px;
    }

    .order-summary {
      background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 24px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .summary-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .summary-item .label {
      color: #64748b;
      font-weight: 600;
      font-size: 0.95rem;
    }

    .summary-item .value {
      color: #1e293b;
      font-weight: 700;
    }

    .summary-item.total {
      margin-top: 8px;
      padding-top: 12px;
      border-top: 2px dashed #cbd5e1;
    }

    .summary-item.total .label {
      color: #0f172a;
      font-size: 1.1rem;
    }

    .summary-item.total .price {
      color: #15803d;
      font-size: 1.5rem;
      font-weight: 800;
    }

    .invoice-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .w-full {
      width: 100%;
    }

    .modal-actions {
      padding: 16px 24px 24px !important;
      gap: 12px;
    }

    .btn-cancel {
      font-weight: 700;
      color: #64748b;
    }

    .btn-confirm {
      padding: 0 24px !important;
      height: 48px !important;
      border-radius: 12px !important;
      font-weight: 700 !important;
      font-size: 1rem !important;
      box-shadow: 0 8px 16px rgba(25, 118, 210, 0.25) !important;
    }

    ::ng-deep .mat-mdc-dialog-container .mdc-dialog__surface {
      border-radius: 20px !important;
      overflow: hidden !important;
    }
  `]
})
export class InvoiceModalComponent {
  data: InvoiceModalData = inject(MAT_DIALOG_DATA);
  private dialogRef = inject(MatDialogRef<InvoiceModalComponent>);
  private fb = inject(FormBuilder);

  PaymentMethod = PaymentMethod;
  invoiceForm: FormGroup;

  constructor() {
    this.invoiceForm = this.fb.group({
      paymentMethod: [PaymentMethod.CASH, Validators.required],
      notes: ['']
    });
  }

  onConfirm() {
    if (this.invoiceForm.valid) {
      this.dialogRef.close({
        confirmed: true,
        ...this.invoiceForm.value
      });
    }
  }

  onCancel() {
    this.dialogRef.close({ confirmed: false });
  }
}
