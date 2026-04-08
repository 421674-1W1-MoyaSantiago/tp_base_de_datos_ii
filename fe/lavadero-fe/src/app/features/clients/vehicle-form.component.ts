import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { Vehicle } from '../../core/models/models';

@Component({
  selector: 'app-vehicle-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatDialogModule
  ],
  template: `
    <div class="vehicle-form-container">
      <h2 mat-dialog-title>
        <mat-icon>directions_car</mat-icon>
        {{ isEditMode ? 'Editar Vehículo' : 'Nuevo Vehículo' }}
      </h2>

      <mat-dialog-content>
        <form [formGroup]="vehicleForm">
          <div class="form-content">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Patente</mat-label>
              <input matInput 
                     formControlName="licensePlate" 
                     placeholder="ABC123 o AB123CD"
                     [readonly]="isEditMode">
              <mat-icon matPrefix>confirmation_number</mat-icon>
              @if (vehicleForm.get('licensePlate')?.hasError('required') && vehicleForm.get('licensePlate')?.touched) {
                <mat-error>La patente es requerida</mat-error>
              }
              @if (vehicleForm.get('licensePlate')?.hasError('pattern') && vehicleForm.get('licensePlate')?.touched) {
                <mat-error>Formato de patente inválido (ej: ABC123 o AB123CD)</mat-error>
              }
              @if (isEditMode) {
                <mat-hint>La patente no puede ser modificada</mat-hint>
              }
            </mat-form-field>

            <div class="form-row">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Marca</mat-label>
                <input matInput formControlName="brand" placeholder="Toyota, Ford, Chevrolet...">
                <mat-icon matPrefix>local_offer</mat-icon>
                @if (vehicleForm.get('brand')?.hasError('required') && vehicleForm.get('brand')?.touched) {
                  <mat-error>La marca es requerida</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Modelo</mat-label>
                <input matInput formControlName="model" placeholder="Corolla, Focus, Cruze...">
                <mat-icon matPrefix>directions_car</mat-icon>
                @if (vehicleForm.get('model')?.hasError('required') && vehicleForm.get('model')?.touched) {
                  <mat-error>El modelo es requerido</mat-error>
                }
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Año</mat-label>
                <input matInput 
                       type="number" 
                       formControlName="year" 
                       placeholder="2020"
                       min="1900"
                       [max]="currentYear + 1">
                <mat-icon matPrefix>calendar_today</mat-icon>
                @if (vehicleForm.get('year')?.hasError('min') && vehicleForm.get('year')?.touched) {
                  <mat-error>El año debe ser mayor a 1900</mat-error>
                }
                @if (vehicleForm.get('year')?.hasError('max') && vehicleForm.get('year')?.touched) {
                  <mat-error>El año no puede ser mayor a {{ currentYear + 1 }}</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Color</mat-label>
                <input matInput formControlName="color" placeholder="Rojo, Azul, Blanco...">
                <mat-icon matPrefix>palette</mat-icon>
              </mat-form-field>
            </div>
          </div>
        </form>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button (click)="onCancel()">
          <mat-icon>cancel</mat-icon>
          Cancelar
        </button>
        <button mat-raised-button 
                color="primary" 
                (click)="onSubmit()"
                [disabled]="vehicleForm.invalid">
          <mat-icon>{{ isEditMode ? 'save' : 'add' }}</mat-icon>
          {{ isEditMode ? 'Actualizar' : 'Agregar' }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .vehicle-form-container {
      min-width: 500px;
    }

    h2 {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin: 0;
      font-size: 1.5rem;
      font-weight: 500;
      color: #3f51b5;
    }

    mat-dialog-content {
      padding: 1.5rem 0;
    }

    .form-content {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      padding: 0 1rem;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .full-width {
      width: 100%;
    }

    mat-dialog-actions {
      padding: 1rem 1.5rem;
      gap: 0.5rem;
    }

    @media (max-width: 600px) {
      .vehicle-form-container {
        min-width: auto;
        width: 100%;
      }

      .form-row {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class VehicleFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  public dialogRef = inject(MatDialogRef<VehicleFormComponent>, { optional: true });
  public data = inject(MAT_DIALOG_DATA, { optional: true });

  @Input() vehicle?: Vehicle;
  @Input() standalone: boolean = false;
  @Output() vehicleSubmit = new EventEmitter<Vehicle>();
  @Output() vehicleCancel = new EventEmitter<void>();

  vehicleForm!: FormGroup;
  isEditMode = false;
  currentYear = new Date().getFullYear();

  ngOnInit(): void {
    this.initForm();
    
    // Check if we have vehicle data from dialog or input
    const vehicleData = this.data?.vehicle || this.vehicle;
    if (vehicleData) {
      this.isEditMode = true;
      this.populateForm(vehicleData);
    }
  }

  initForm(): void {
    this.vehicleForm = this.fb.group({
      licensePlate: ['', [
        Validators.required, 
        Validators.pattern(/^[A-Z0-9]{6,7}$/i)
      ]],
      brand: ['', Validators.required],
      model: ['', Validators.required],
      year: [null, [
        Validators.min(1900),
        Validators.max(this.currentYear + 1)
      ]],
      color: ['']
    });
  }

  populateForm(vehicle: Vehicle): void {
    this.vehicleForm.patchValue({
      licensePlate: vehicle.licensePlate,
      brand: vehicle.brand,
      model: vehicle.model,
      year: vehicle.year,
      color: vehicle.color
    });
  }

  onSubmit(): void {
    if (this.vehicleForm.invalid) {
      this.vehicleForm.markAllAsTouched();
      return;
    }

    const vehicleData: Vehicle = {
      licensePlate: this.vehicleForm.value.licensePlate.toUpperCase(),
      brand: this.vehicleForm.value.brand,
      model: this.vehicleForm.value.model,
      year: this.vehicleForm.value.year,
      color: this.vehicleForm.value.color
    };

    if (this.standalone) {
      // Emit event for standalone usage
      this.vehicleSubmit.emit(vehicleData);
    } else if (this.dialogRef) {
      // Close dialog with data
      this.dialogRef.close(vehicleData);
    }
  }

  onCancel(): void {
    if (this.standalone) {
      this.vehicleCancel.emit();
    } else if (this.dialogRef) {
      this.dialogRef.close();
    }
  }
}
