import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { debounceTime, distinctUntilChanged, switchMap, of } from 'rxjs';

import { WashService } from '../../core/services/wash.service';
import { ClientService } from '../../core/services/client.service';
import { Client, ServiceType } from '../../core/models/models';
import { EmployeeSelectorComponent } from '../../shared/components/employee-selector.component';

@Component({
  selector: 'app-service-order-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatAutocompleteModule,
    MatSnackBarModule,
    EmployeeSelectorComponent
  ],
  template: `
    <div class="container mx-auto p-4 max-w-2xl">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Nueva Orden de Servicio</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="orderForm" (ngSubmit)="onSubmit()" class="flex flex-col gap-4">
            
            <!-- Client Autocomplete -->
            <mat-form-field>
              <mat-label>Cliente</mat-label>
              <input
                type="text"
                matInput
                formControlName="clientSearch"
                [matAutocomplete]="auto"
                placeholder="Buscar cliente por nombre o DNI">
              <mat-autocomplete #auto="matAutocomplete" (optionSelected)="onClientSelected($event.option.value)">
                @for (client of filteredClients(); track client.id) {
                  <mat-option [value]="client">
                    {{client.firstName}} {{client.lastName}} - {{client.dni}}
                  </mat-option>
                }
              </mat-autocomplete>
            </mat-form-field>

            @if (selectedClient()) {
              <div class="selected-client p-3 bg-blue-50 rounded">
                <strong>Cliente seleccionado:</strong> 
                {{selectedClient()?.firstName}} {{selectedClient()?.lastName}}
              </div>
            }

            <!-- Vehicle Select -->
            <mat-form-field>
              <mat-label>Vehículo</mat-label>
              <mat-select formControlName="vehicleLicensePlate" [disabled]="!selectedClient()">
                @for (vehicle of selectedClient()?.vehicles || []; track vehicle.licensePlate) {
                  <mat-option [value]="vehicle.licensePlate">
                    {{vehicle.brand}} {{vehicle.model}} - {{vehicle.licensePlate}}
                  </mat-option>
                }
              </mat-select>
              @if (!selectedClient()) {
                <mat-hint>Primero seleccione un cliente</mat-hint>
              }
            </mat-form-field>

            <!-- Employee Selector -->
            <app-employee-selector formControlName="assignedEmployeeId"></app-employee-selector>

            <!-- Service Type -->
            <mat-form-field>
              <mat-label>Tipo de Servicio</mat-label>
              <mat-select formControlName="serviceType">
                <mat-option [value]="ServiceType.BASIC">Básico</mat-option>
                <mat-option [value]="ServiceType.COMPLETE">Completo</mat-option>
                <mat-option [value]="ServiceType.PREMIUM">Premium</mat-option>
                <mat-option [value]="ServiceType.EXPRESS">Express</mat-option>
              </mat-select>
            </mat-form-field>

            <!-- Price -->
            <mat-form-field>
              <mat-label>Precio</mat-label>
              <input
                matInput
                type="number"
                formControlName="price"
                placeholder="0.00"
                min="0.01"
                step="0.01">
              <span matPrefix>$&nbsp;</span>
            </mat-form-field>

            <!-- Notes -->
            <mat-form-field>
              <mat-label>Observaciones</mat-label>
              <textarea
                matInput
                formControlName="notes"
                rows="3"
                placeholder="Observaciones adicionales...">
              </textarea>
            </mat-form-field>

            <div class="flex gap-2 justify-end mt-4">
              <button mat-button type="button" (click)="onCancel()">Cancelar</button>
              <button
                mat-raised-button
                color="primary"
                type="submit"
                [disabled]="!orderForm.valid || loading()">
                @if (loading()) {
                  <span>Creando...</span>
                } @else {
                  <span>Crear Orden</span>
                }
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .container {
      padding-top: 24px;
    }
  `]
})
export class ServiceOrderFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private washService = inject(WashService);
  private clientService = inject(ClientService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  ServiceType = ServiceType;
  
  orderForm!: FormGroup;
  filteredClients = signal<Client[]>([]);
  selectedClient = signal<Client | null>(null);
  loading = signal(false);

  ngOnInit() {
    this.orderForm = this.fb.group({
      clientSearch: [''],
      clientId: ['', Validators.required],
      vehicleLicensePlate: ['', Validators.required],
      assignedEmployeeId: [''],
      serviceType: [ServiceType.BASIC, Validators.required],
      price: [0, [Validators.required, Validators.min(0.01)]],
      notes: ['']
    });

    this.orderForm.get('clientSearch')?.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(term => {
        if (typeof term === 'string' && term.length >= 2) {
          return this.clientService.searchClients(term);
        }
        return of([]);
      })
    ).subscribe(clients => {
      this.filteredClients.set(clients);
    });
  }

  onClientSelected(client: Client) {
    this.selectedClient.set(client);
    this.orderForm.patchValue({
      clientId: client.id,
      clientSearch: `${client.firstName} ${client.lastName}`,
      vehicleLicensePlate: ''
    });
  }

  onSubmit() {
    if (!this.orderForm.valid) return;

    this.loading.set(true);
    const formValue = this.orderForm.value;
    
    const orderData = {
      clientId: formValue.clientId,
      vehicleLicensePlate: formValue.vehicleLicensePlate,
      serviceType: formValue.serviceType,
      assignedEmployeeId: formValue.assignedEmployeeId || undefined,
      price: formValue.price,
      notes: formValue.notes || undefined
    };

    this.washService.createServiceOrder(orderData).subscribe({
      next: (order) => {
        this.loading.set(false);
        this.snackBar.open('Orden creada exitosamente', 'Cerrar', { duration: 3000 });
        this.router.navigate(['/dashboard', 'services', order.id]);
      },
      error: (err) => {
        this.loading.set(false);
        this.snackBar.open('Error al crear la orden', 'Cerrar', { duration: 3000 });
        console.error('Error creating order:', err);
      }
    });
  }

  onCancel() {
    this.router.navigate(['/dashboard', 'services']);
  }
}
