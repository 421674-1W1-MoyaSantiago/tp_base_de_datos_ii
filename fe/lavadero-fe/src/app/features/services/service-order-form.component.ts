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
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { debounceTime, distinctUntilChanged } from 'rxjs';

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
    MatIconModule,
    MatSnackBarModule,
    EmployeeSelectorComponent
  ],
  template: `
    <div class="service-order-page">
      <mat-card class="service-order-card">
        <mat-card-header class="service-order-header">
          <mat-card-title>
            <div class="title-row">
              <mat-icon>local_car_wash</mat-icon>
              <span>Nueva Orden de Servicio</span>
            </div>
          </mat-card-title>
          <p class="subtitle">Completá los datos del cliente, vehículo y servicio para registrar una nueva orden.</p>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="orderForm" (ngSubmit)="onSubmit()" class="service-order-form">
            
            <!-- Client Autocomplete -->
            <mat-form-field class="client-search-field" appearance="outline" floatLabel="always">
              <mat-label>Cliente</mat-label>
              <input
                type="text"
                matInput
                formControlName="clientSearch"
                [matAutocomplete]="auto"
                placeholder="Buscar cliente por nombre o DNI">
              <mat-icon matPrefix>person_search</mat-icon>
              <mat-hint>Escriba nombre, DNI o email</mat-hint>
              <mat-autocomplete
                #auto="matAutocomplete"
                class="client-autocomplete-panel"
                (optionSelected)="onClientSelected($event.option.value)">
                @for (client of filteredClients(); track client.id) {
                  <mat-option [value]="client">
                    {{client.firstName}} {{client.lastName}} - {{client.dni}}
                  </mat-option>
                }
              </mat-autocomplete>
            </mat-form-field>

            @if (selectedClient()) {
              <div class="selected-client">
                <mat-icon>verified_user</mat-icon>
                <strong>Cliente seleccionado:</strong> 
                {{selectedClient()?.firstName}} {{selectedClient()?.lastName}}
              </div>
            }

            <!-- Vehicle Select -->
            <mat-form-field appearance="outline" floatLabel="always">
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
            <app-employee-selector
              formControlName="assignedEmployeeId"
              label="Empleado"
              placeholder="Seleccione un empleado">
            </app-employee-selector>

            <!-- Service Type -->
            <mat-form-field appearance="outline" floatLabel="always">
              <mat-label>Tipo de Servicio</mat-label>
              <mat-select formControlName="serviceType">
                <mat-option [value]="ServiceType.BASIC">Básico</mat-option>
                <mat-option [value]="ServiceType.COMPLETE">Completo</mat-option>
                <mat-option [value]="ServiceType.PREMIUM">Premium</mat-option>
                <mat-option [value]="ServiceType.EXPRESS">Express</mat-option>
              </mat-select>
            </mat-form-field>

            <!-- Price -->
            <mat-form-field appearance="outline" floatLabel="always">
              <mat-label>Precio</mat-label>
              <input
                matInput
                type="number"
                formControlName="price"
                placeholder="0.00"
                min="0.01"
                step="0.01">
              <mat-icon matPrefix>payments</mat-icon>
              <span matPrefix>$&nbsp;</span>
            </mat-form-field>

            <!-- Notes -->
            <mat-form-field appearance="outline" floatLabel="always">
              <mat-label>Observaciones</mat-label>
              <textarea
                matInput
                formControlName="notes"
                rows="3"
                placeholder="Observaciones adicionales...">
              </textarea>
              <mat-icon matPrefix>notes</mat-icon>
            </mat-form-field>

            <div class="form-actions">
              <button mat-stroked-button type="button" class="cancel-btn" (click)="onCancel()">
                <mat-icon>arrow_back</mat-icon>
                Cancelar
              </button>
              <button
                mat-raised-button
                color="primary"
                class="create-btn"
                type="submit"
                [disabled]="!orderForm.valid || loading()">
                <mat-icon>{{ loading() ? 'hourglass_top' : 'add_task' }}</mat-icon>
                <span>{{ loading() ? 'Creando...' : 'Crear Orden' }}</span>
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .service-order-page {
      padding: 24px 16px;
      max-width: 900px;
      margin: 0 auto;
    }

    .service-order-card {
      border-radius: 14px !important;
      border: 1px solid #e5e7eb !important;
      box-shadow: 0 12px 28px rgba(15, 23, 42, 0.08) !important;
      background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%) !important;
      overflow: hidden;
    }

    .service-order-header {
      background: linear-gradient(135deg, #f8fbff 0%, #eef5ff 100%);
      border-bottom: 1px solid #e5e7eb;
      padding-bottom: 18px;
      margin-bottom: 4px;
    }

    .title-row {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      font-size: 1.35rem;
      font-weight: 700;
      color: #1f2937;
    }

    .title-row mat-icon {
      color: #1976d2;
      width: 24px;
      height: 24px;
      font-size: 24px;
    }

    .subtitle {
      margin: 8px 0 0;
      color: #6b7280;
      font-size: 0.95rem;
      line-height: 1.45;
    }

    .service-order-form {
      display: grid;
      gap: 16px;
      padding-top: 10px;
    }

    .service-order-form {
      background: linear-gradient(135deg, #ffffff 0%, #f9fbff 100%);
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      padding: 18px;
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.9);
    }

    .service-order-form mat-form-field {
      width: 100%;
    }

    .service-order-form mat-icon[matPrefix] {
      margin-right: 8px;
      color: #1976d2;
      opacity: 0.95;
    }

    .client-search-field ::ng-deep .mat-mdc-text-field-wrapper {
      border: 1.5px solid #bfdbfe !important;
      background: linear-gradient(135deg, #ffffff 0%, #f7fbff 100%) !important;
      box-shadow: 0 4px 12px rgba(30, 64, 175, 0.1) !important;
    }

    .client-search-field ::ng-deep .mat-mdc-form-field-subscript-wrapper {
      margin-top: 6px;
    }

    .client-search-field ::ng-deep .mat-mdc-form-field-hint {
      color: #475569 !important;
      font-weight: 500;
    }

    .client-search-field ::ng-deep .mat-mdc-input-element::placeholder {
      color: #64748b !important;
      opacity: 1 !important;
    }

    :host ::ng-deep .mat-mdc-autocomplete-panel.client-autocomplete-panel {
      background: #ffffff !important;
      border: 1px solid #dbeafe !important;
      border-radius: 12px !important;
      box-shadow: 0 14px 32px rgba(15, 23, 42, 0.14) !important;
      margin-top: 8px;
      padding: 6px;
    }

    :host ::ng-deep .mat-mdc-autocomplete-panel.client-autocomplete-panel .mat-mdc-option {
      border-radius: 8px;
      min-height: 42px !important;
      padding: 10px 12px !important;
      color: #1f2937 !important;
      font-weight: 500;
    }

    :host ::ng-deep .mat-mdc-autocomplete-panel.client-autocomplete-panel .mat-mdc-option:hover,
    :host ::ng-deep .mat-mdc-autocomplete-panel.client-autocomplete-panel .mat-mdc-option.mdc-list-item--selected,
    :host ::ng-deep .mat-mdc-autocomplete-panel.client-autocomplete-panel .mat-mdc-option.mat-mdc-option-active {
      background: #eff6ff !important;
      color: #1d4ed8 !important;
    }

    .service-order-form ::ng-deep .mat-mdc-text-field-wrapper {
      border-radius: 10px !important;
      border: 1px solid #dbe3ee !important;
      background: linear-gradient(135deg, #ffffff 0%, #fcfdff 100%) !important;
      box-shadow: 0 2px 7px rgba(15, 23, 42, 0.04) !important;
    }

    .service-order-form ::ng-deep .mat-mdc-text-field-wrapper:hover {
      border-color: #bfcfe3 !important;
      box-shadow: 0 6px 14px rgba(15, 23, 42, 0.08) !important;
    }

    .service-order-form ::ng-deep .mat-mdc-form-field.mat-focused .mat-mdc-text-field-wrapper {
      border-color: #1976d2 !important;
      box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.14), 0 8px 16px rgba(25, 118, 210, 0.16) !important;
    }

    .service-order-form input::placeholder,
    .service-order-form textarea::placeholder {
      color: #64748b !important;
      opacity: 0.95 !important;
    }

    .selected-client {
      display: flex;
      align-items: center;
      gap: 8px;
      background: linear-gradient(135deg, #e8f1ff 0%, #f3f8ff 100%);
      border: 1px solid #bfdbfe;
      color: #1e3a8a;
      border-radius: 10px;
      padding: 12px 14px;
      font-size: 0.95rem;
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.8);
    }

    .selected-client mat-icon {
      color: #2563eb;
      width: 20px;
      height: 20px;
      font-size: 20px;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 8px;
      padding-top: 14px;
      border-top: 1px solid #e5e7eb;
      flex-wrap: wrap;
    }

    .cancel-btn {
      min-height: 42px;
      border-radius: 10px !important;
      border-color: #cbd5e1 !important;
      color: #475569 !important;
      font-weight: 600 !important;
      background: #ffffff !important;
    }

    .cancel-btn:hover {
      background: #f8fafc !important;
      border-color: #94a3b8 !important;
    }

    .create-btn {
      min-height: 42px;
      border-radius: 10px !important;
      padding: 0 18px !important;
      font-weight: 700 !important;
      letter-spacing: 0.2px;
      box-shadow: 0 8px 18px rgba(25, 118, 210, 0.26) !important;
      border: 1px solid rgba(21, 101, 192, 0.38) !important;
      background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%) !important;
    }

    .create-btn:hover:not(:disabled) {
      background: linear-gradient(135deg, #1e88e5 0%, #1976d2 100%) !important;
      box-shadow: 0 10px 20px rgba(25, 118, 210, 0.34) !important;
      transform: translateY(-1px);
    }

    .create-btn mat-icon,
    .cancel-btn mat-icon {
      margin-right: 6px;
      width: 18px;
      height: 18px;
      font-size: 18px;
    }

    .create-btn:disabled {
      opacity: 0.72;
      box-shadow: none !important;
    }

    @media (max-width: 768px) {
      .service-order-page {
        padding: 16px 12px;
      }

      .title-row {
        font-size: 1.2rem;
      }

      .form-actions {
        flex-direction: column;
      }

      .form-actions button {
        width: 100%;
        justify-content: center;
      }
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
  allClients = signal<Client[]>([]);
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

    this.loadClientsForAutocomplete();

    this.orderForm.get('clientSearch')?.valueChanges.pipe(
      debounceTime(200),
      distinctUntilChanged()
    ).subscribe(term => {
      const searchTerm = typeof term === 'string' ? term : '';
      const localClients = this.filterClients(searchTerm);
      this.filteredClients.set(localClients);

      const normalized = searchTerm.trim();
      if (normalized.length >= 2) {
        this.clientService.searchClients(normalized).subscribe({
          next: (remoteClients) => {
            const merged = this.mergeClients(localClients, remoteClients || []);
            this.filteredClients.set(merged.slice(0, 20));
          },
          error: () => {
            // Keep local results when remote search fails.
          }
        });
      }
    });
  }

  private loadClientsForAutocomplete(): void {
    this.clientService.getClients(0, 100).subscribe({
      next: (response) => {
        const clients = this.extractClients(response);
        this.allClients.set(clients);
        this.filteredClients.set(clients.slice(0, 15));
      },
      error: () => {
        this.snackBar.open('No se pudieron cargar los clientes para la búsqueda', 'Cerrar', { duration: 3000 });
      }
    });
  }

  private extractClients(response: any): Client[] {
    if (Array.isArray(response)) {
      return response;
    }

    if (Array.isArray(response?.content)) {
      return response.content;
    }

    return [];
  }

  private filterClients(term: string): Client[] {
    const normalized = term.trim().toLowerCase();
    const source = this.allClients();

    if (!normalized) {
      return source.slice(0, 15);
    }

    return source
      .filter((client) => {
        const fullName = `${client.firstName} ${client.lastName}`.toLowerCase();
        const dni = (client.dni || '').toLowerCase();
        const email = (client.email || '').toLowerCase();
        return fullName.includes(normalized) || dni.includes(normalized) || email.includes(normalized);
      })
      .slice(0, 20);
  }

  private mergeClients(localClients: Client[], remoteClients: Client[]): Client[] {
    const mergedMap = new Map<string, Client>();

    for (const client of [...localClients, ...remoteClients]) {
      const key = client.id || client.dni;
      if (key) {
        mergedMap.set(key, client);
      }
    }

    return Array.from(mergedMap.values());
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
