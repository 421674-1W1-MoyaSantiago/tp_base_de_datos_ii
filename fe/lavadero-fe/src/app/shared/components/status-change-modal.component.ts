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
      <div class="status-transition mb-4">
        <div class="flex items-center gap-4">
          <span class="status-badge current">{{data.currentStatus}}</span>
          <span class="arrow">→</span>
          <span class="status-badge new">{{data.newStatus}}</span>
        </div>
      </div>

      <mat-form-field class="w-full">
        <mat-label>Observaciones (opcional)</mat-label>
        <textarea
          matInput
          [(ngModel)]="notes"
          rows="4"
          placeholder="Ingrese cualquier observación sobre este cambio...">
        </textarea>
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancelar</button>
      <button mat-raised-button color="primary" (click)="onConfirm()">Confirmar</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .status-transition {
      text-align: center;
      padding: 16px;
      background-color: #f5f5f5;
      border-radius: 8px;
    }

    .status-badge {
      padding: 8px 16px;
      border-radius: 4px;
      font-weight: 500;
      font-size: 14px;
    }

    .status-badge.current {
      background-color: #e3f2fd;
      color: #1976d2;
    }

    .status-badge.new {
      background-color: #c8e6c9;
      color: #388e3c;
    }

    .arrow {
      font-size: 24px;
      color: #666;
    }

    mat-dialog-content {
      min-width: 400px;
      padding-top: 16px;
    }
  `]
})
export class StatusChangeModalComponent {
  data: StatusChangeData = inject(MAT_DIALOG_DATA);
  private dialogRef = inject(MatDialogRef<StatusChangeModalComponent>);

  notes: string = '';

  onConfirm() {
    this.dialogRef.close({ confirmed: true, notes: this.notes });
  }

  onCancel() {
    this.dialogRef.close({ confirmed: false });
  }
}
