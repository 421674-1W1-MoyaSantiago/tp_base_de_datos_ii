import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ServiceStatus } from '../../core/models/models';

export interface StatusChangeData {
  currentStatus: ServiceStatus;
  newStatus: ServiceStatus;
  orderId: string;
}

@Component({
  selector: 'app-status-change-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule
  ],
  template: `
    <h2 mat-dialog-title>Confirmar Cambio de Estado</h2>
    <mat-dialog-content>
      <div class="status-transition">
        <div class="status-flex-container">
          <span class="status-badge current">{{formatStatus(data.currentStatus)}}</span>
          <span class="arrow">→</span>
          <span class="status-badge new">{{formatStatus(data.newStatus)}}</span>
        </div>
      </div>

      <div class="observations-section">
        <mat-form-field class="w-full" appearance="outline" floatLabel="always">
          <mat-label>Observaciones (opcional)</mat-label>
          <textarea
            matInput
            [(ngModel)]="notes"
            rows="4"
            placeholder="Ingrese cualquier observación sobre este cambio...">
          </textarea>
        </mat-form-field>
      </div>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancelar</button>
      <button mat-raised-button color="primary" (click)="onConfirm()">Confirmar</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .status-transition {
      text-align: center;
      padding: 32px 16px;
      background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      margin-bottom: 32px;
      box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);
    }

    .status-flex-container {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 32px;
    }

    .status-badge {
      padding: 12px 24px;
      border-radius: 999px;
      font-weight: 700;
      font-size: 15px;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      min-width: 140px;
    }

    .status-badge.current {
      background-color: #ffffff;
      color: #64748b;
      border: 2px solid #e2e8f0;
    }

    .status-badge.new {
      background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
      color: #ffffff;
      border: none;
    }

    .arrow {
      font-size: 28px;
      color: #94a3b8;
      font-weight: bold;
    }

    .observations-section {
      margin-top: 16px;
    }

    .w-full {
      width: 100%;
    }

    mat-dialog-content {
      min-width: 480px;
      padding-top: 20px;
    }

    @media (max-width: 600px) {
      .status-flex-container {
        flex-direction: column;
        gap: 16px;
      }
      
      .arrow {
        transform: rotate(90deg);
      }

      mat-dialog-content {
        min-width: 100%;
      }
    }
  `]
})
export class StatusChangeModalComponent {
  data: StatusChangeData = inject(MAT_DIALOG_DATA);
  private dialogRef = inject(MatDialogRef<StatusChangeModalComponent>);

  notes: string = '';

  formatStatus(status: ServiceStatus): string {
    const labels: { [key: string]: string } = {
      'PENDING': 'Pendiente',
      'IN_PROGRESS': 'En proceso',
      'COMPLETED': 'Completado',
      'DELIVERED': 'Entregado'
    };
    return labels[status] || status;
  }

  onConfirm() {
    this.dialogRef.close({ confirmed: true, notes: this.notes });
  }

  onCancel() {
    this.dialogRef.close({ confirmed: false });
  }
}
