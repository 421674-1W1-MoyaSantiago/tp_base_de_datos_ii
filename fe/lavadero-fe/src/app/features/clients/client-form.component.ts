import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { ClientService } from '../../core/services/client.service';
import { Client, Vehicle } from '../../core/models/models';

@Component({
  selector: 'app-client-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatDividerModule
  ],
  template: `
    <div class="page-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>
            <h1>{{ isEditMode() ? 'Editar Cliente' : 'Nuevo Cliente' }}</h1>
          </mat-card-title>
        </mat-card-header>

        <mat-card-content>
          @if (loading()) {
            <div class="loading-container">
              <mat-spinner></mat-spinner>
            </div>
          }

          @if (!loading()) {
            <form [formGroup]="clientForm" (ngSubmit)="onSubmit()">
              <!-- Personal Information Section -->
              <div class="section">
                <h2>Información Personal</h2>
                
                <div class="form-row">
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Nombre</mat-label>
                    <input matInput formControlName="firstName" placeholder="Juan">
                    @if (clientForm.get('firstName')?.hasError('required') && clientForm.get('firstName')?.touched) {
                      <mat-error>El nombre es requerido</mat-error>
                    }
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Apellido</mat-label>
                    <input matInput formControlName="lastName" placeholder="Pérez">
                    @if (clientForm.get('lastName')?.hasError('required') && clientForm.get('lastName')?.touched) {
                      <mat-error>El apellido es requerido</mat-error>
                    }
                  </mat-form-field>
                </div>

                <div class="form-row">
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>DNI</mat-label>
                    <input matInput formControlName="dni" placeholder="12345678">
                    @if (clientForm.get('dni')?.hasError('required') && clientForm.get('dni')?.touched) {
                      <mat-error>El DNI es requerido</mat-error>
                    }
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Teléfono</mat-label>
                    <input matInput formControlName="phone" placeholder="+54 9 11 1234-5678">
                  </mat-form-field>
                </div>

                <div class="form-row">
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Email</mat-label>
                    <input matInput type="email" formControlName="email" placeholder="ejemplo@email.com">
                    @if (clientForm.get('email')?.hasError('required') && clientForm.get('email')?.touched) {
                      <mat-error>El email es requerido</mat-error>
                    }
                    @if (clientForm.get('email')?.hasError('email') && clientForm.get('email')?.touched) {
                      <mat-error>Ingrese un email válido</mat-error>
                    }
                  </mat-form-field>
                </div>
              </div>

              <mat-divider></mat-divider>

              <!-- Vehicles Section -->
              <div class="section">
                <div class="section-header">
                  <h2>Vehículos</h2>
                  <button mat-raised-button 
                          type="button" 
                          color="accent" 
                          (click)="addVehicle()">
                    <mat-icon>add</mat-icon>
                    Agregar Vehículo
                  </button>
                </div>

                <div formArrayName="vehicles">
                  @if (vehicles.length === 0) {
                    <div class="no-vehicles">
                      <mat-icon>directions_car</mat-icon>
                      <p>No hay vehículos agregados. Haga clic en "Agregar Vehículo" para añadir uno.</p>
                    </div>
                  }

                  @for (vehicle of vehicles.controls; track i; let i = $index) {
                    <mat-card class="vehicle-card" [formGroupName]="i">
                      <mat-card-content>
                        <div class="vehicle-header">
                          <h3>Vehículo {{ i + 1 }}</h3>
                          <button mat-icon-button 
                                  type="button" 
                                  color="warn" 
                                  (click)="removeVehicle(i)"
                                  matTooltip="Eliminar vehículo">
                            <mat-icon>delete</mat-icon>
                          </button>
                        </div>

                        <div class="form-row">
                          <mat-form-field appearance="outline" class="full-width">
                            <mat-label>Patente</mat-label>
                            <input matInput formControlName="licensePlate" placeholder="ABC123">
                            @if (vehicle.get('licensePlate')?.hasError('required') && vehicle.get('licensePlate')?.touched) {
                              <mat-error>La patente es requerida</mat-error>
                            }
                            @if (vehicle.get('licensePlate')?.hasError('pattern') && vehicle.get('licensePlate')?.touched) {
                              <mat-error>Formato de patente inválido</mat-error>
                            }
                          </mat-form-field>

                          <mat-form-field appearance="outline" class="full-width">
                            <mat-label>Marca</mat-label>
                            <input matInput formControlName="brand" placeholder="Toyota">
                            @if (vehicle.get('brand')?.hasError('required') && vehicle.get('brand')?.touched) {
                              <mat-error>La marca es requerida</mat-error>
                            }
                          </mat-form-field>
                        </div>

                        <div class="form-row">
                          <mat-form-field appearance="outline" class="full-width">
                            <mat-label>Modelo</mat-label>
                            <input matInput formControlName="model" placeholder="Corolla">
                            @if (vehicle.get('model')?.hasError('required') && vehicle.get('model')?.touched) {
                              <mat-error>El modelo es requerido</mat-error>
                            }
                          </mat-form-field>

                          <mat-form-field appearance="outline" class="full-width">
                            <mat-label>Año</mat-label>
                            <input matInput type="number" formControlName="year" placeholder="2020">
                          </mat-form-field>

                          <mat-form-field appearance="outline" class="full-width">
                            <mat-label>Color</mat-label>
                            <input matInput formControlName="color" placeholder="Rojo">
                          </mat-form-field>
                        </div>
                      </mat-card-content>
                    </mat-card>
                  }
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="actions">
                <button mat-raised-button type="button" (click)="onCancel()">
                  <mat-icon>cancel</mat-icon>
                  Cancelar
                </button>
                <button mat-raised-button 
                        color="primary" 
                        type="submit"
                        [disabled]="clientForm.invalid || saving()">
                  @if (saving()) {
                    <mat-spinner diameter="20"></mat-spinner>
                  }
                  @if (!saving()) {
                    <mat-icon>save</mat-icon>
                  }
                  {{ isEditMode() ? 'Actualizar' : 'Guardar' }}
                </button>
              </div>
            </form>
          }
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .page-container {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    mat-card {
      margin-bottom: 1rem;
    }

    h1 {
      margin: 0;
      font-size: 1.75rem;
      font-weight: 500;
    }

    h2 {
      margin: 0 0 1.5rem 0;
      font-size: 1.25rem;
      font-weight: 500;
      color: #3f51b5;
    }

    h3 {
      margin: 0;
      font-size: 1rem;
      font-weight: 500;
    }

    .loading-container {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 4rem;
    }

    .section {
      padding: 1.5rem 0;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }

    .form-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .full-width {
      width: 100%;
    }

    mat-divider {
      margin: 1.5rem 0;
    }

    .no-vehicles {
      text-align: center;
      padding: 3rem;
      color: rgba(0,0,0,0.54);
      background-color: #f5f5f5;
      border-radius: 8px;
    }

    .no-vehicles mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 1rem;
    }

    .vehicle-card {
      margin-bottom: 1rem;
      background-color: #fafafa;
    }

    .vehicle-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .actions {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
      padding-top: 1.5rem;
    }

    button[type="submit"] mat-spinner {
      display: inline-block;
      margin-right: 8px;
    }

    @media (max-width: 768px) {
      .page-container {
        padding: 1rem;
      }

      .form-row {
        grid-template-columns: 1fr;
      }

      .section-header {
        flex-direction: column;
        align-items: stretch;
        gap: 1rem;
      }

      .actions {
        flex-direction: column-reverse;
      }

      .actions button {
        width: 100%;
      }
    }
  `]
})
export class ClientFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private clientService = inject(ClientService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private snackBar = inject(MatSnackBar);

  clientForm!: FormGroup;
  loading = signal(false);
  saving = signal(false);
  isEditMode = signal(false);
  clientId: string | null = null;

  ngOnInit(): void {
    this.initForm();
    this.checkEditMode();
  }

  initForm(): void {
    this.clientForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      dni: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      vehicles: this.fb.array([])
    });
  }

  get vehicles(): FormArray {
    return this.clientForm.get('vehicles') as FormArray;
  }

  checkEditMode(): void {
    this.clientId = this.route.snapshot.paramMap.get('id');
    if (this.clientId && this.clientId !== 'new') {
      this.isEditMode.set(true);
      this.loadClient(this.clientId);
    }
  }

  loadClient(id: string): void {
    this.loading.set(true);
    this.clientService.getClientById(id).subscribe({
      next: (client) => {
        this.populateForm(client);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading client:', error);
        this.snackBar.open('Error al cargar el cliente', 'Cerrar', { duration: 3000 });
        this.loading.set(false);
        this.router.navigate(['/dashboard', 'clients']);
      }
    });
  }

  populateForm(client: Client): void {
    this.clientForm.patchValue({
      firstName: client.firstName,
      lastName: client.lastName,
      dni: client.dni,
      email: client.email,
      phone: client.phone
    });

    // Add vehicles
    if (client.vehicles && client.vehicles.length > 0) {
      client.vehicles.forEach(vehicle => {
        this.vehicles.push(this.createVehicleFormGroup(vehicle));
      });
    }
  }

  createVehicleFormGroup(vehicle?: Vehicle): FormGroup {
    return this.fb.group({
      licensePlate: [vehicle?.licensePlate || '', [Validators.required, Validators.pattern(/^[A-Z0-9]{6,7}$/i)]],
      brand: [vehicle?.brand || '', Validators.required],
      model: [vehicle?.model || '', Validators.required],
      year: [vehicle?.year || null],
      color: [vehicle?.color || '']
    });
  }

  addVehicle(): void {
    this.vehicles.push(this.createVehicleFormGroup());
  }

  removeVehicle(index: number): void {
    const confirmed = confirm('¿Está seguro de eliminar este vehículo?');
    if (confirmed) {
      this.vehicles.removeAt(index);
    }
  }

  onSubmit(): void {
    if (this.clientForm.invalid) {
      this.clientForm.markAllAsTouched();
      this.snackBar.open('Por favor complete todos los campos requeridos', 'Cerrar', { duration: 3000 });
      return;
    }

    this.saving.set(true);
    const clientData = this.clientForm.value;

    if (this.isEditMode() && this.clientId) {
      this.updateClient(this.clientId, clientData);
    } else {
      this.createClient(clientData);
    }
  }

  createClient(clientData: Partial<Client>): void {
    this.clientService.createClient(clientData).subscribe({
      next: (client) => {
        this.snackBar.open('Cliente creado exitosamente', 'Cerrar', { duration: 3000 });
        this.saving.set(false);
        this.router.navigate(['/dashboard', 'clients', client.id]);
      },
      error: (error) => {
        console.error('Error creating client:', error);
        this.snackBar.open('Error al crear el cliente', 'Cerrar', { duration: 3000 });
        this.saving.set(false);
      }
    });
  }

  updateClient(id: string, clientData: Partial<Client>): void {
    this.clientService.updateClient(id, clientData).subscribe({
      next: (client) => {
        this.snackBar.open('Cliente actualizado exitosamente', 'Cerrar', { duration: 3000 });
        this.saving.set(false);
        this.router.navigate(['/dashboard', 'clients', client.id]);
      },
      error: (error) => {
        console.error('Error updating client:', error);
        this.snackBar.open('Error al actualizar el cliente', 'Cerrar', { duration: 3000 });
        this.saving.set(false);
      }
    });
  }

  onCancel(): void {
    const hasChanges = this.clientForm.dirty;
    if (hasChanges) {
      const confirmed = confirm('¿Está seguro de cancelar? Los cambios no guardados se perderán.');
      if (!confirmed) return;
    }
    
    if (this.isEditMode() && this.clientId) {
      this.router.navigate(['/dashboard', 'clients', this.clientId]);
    } else {
      this.router.navigate(['/dashboard', 'clients']);
    }
  }
}
