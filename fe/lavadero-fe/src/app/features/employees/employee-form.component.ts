import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { EmployeeService } from '../../core/services/employee.service';
import { Employee, EmployeeRole } from '../../core/models/models';

@Component({
  selector: 'app-employee-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatSnackBarModule
  ],
  template: `
    <div class="page-container">
      <div class="header">
        <button mat-icon-button (click)="goBack()">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <h1>{{ isEditMode() ? 'Editar Empleado' : 'Nuevo Empleado' }}</h1>
      </div>

      <mat-card>
        <mat-card-content>
          <form class="employee-form" [formGroup]="employeeForm" (ngSubmit)="onSubmit()">
            <div class="form-grid">
              <mat-form-field appearance="outline" floatLabel="always">
                <mat-label>Nombre</mat-label>
                <input matInput formControlName="firstName" placeholder="Ej: Juan" required>
                @if (employeeForm.get('firstName')?.hasError('required') && 
                     employeeForm.get('firstName')?.touched) {
                  <mat-error>El nombre es requerido</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline" floatLabel="always">
                <mat-label>Apellido</mat-label>
                <input matInput formControlName="lastName" placeholder="Ej: Pérez" required>
                @if (employeeForm.get('lastName')?.hasError('required') && 
                     employeeForm.get('lastName')?.touched) {
                  <mat-error>El apellido es requerido</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline" floatLabel="always">
                <mat-label>Email</mat-label>
                <input matInput type="email" formControlName="email" placeholder="correo@empresa.com">
                @if (employeeForm.get('email')?.hasError('email') && 
                     employeeForm.get('email')?.touched) {
                  <mat-error>Email inválido</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline" floatLabel="always">
                <mat-label>Teléfono</mat-label>
                <input matInput formControlName="phone" placeholder="Ej: 123456789">
                @if (employeeForm.get('phone')?.hasError('pattern') && 
                     employeeForm.get('phone')?.touched) {
                  <mat-error>Solo se permiten números</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline" floatLabel="always">
                <mat-label>Nombre de Usuario</mat-label>
                <input matInput formControlName="username" placeholder="Nombre de usuario" required>
                @if (employeeForm.get('username')?.hasError('required') && 
                     employeeForm.get('username')?.touched) {
                  <mat-error>El nombre de usuario es requerido</mat-error>
                }
                @if (employeeForm.get('username')?.hasError('minlength') && 
                     employeeForm.get('username')?.touched) {
                  <mat-error>Mínimo 3 caracteres</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline" floatLabel="always">
                <mat-label>Rol</mat-label>
                <mat-hint>Seleccioná un perfil para definir permisos</mat-hint>
                <mat-select formControlName="role" required>
                  <mat-option [value]="EmployeeRole.OPERATOR">Operador</mat-option>
                  <mat-option [value]="EmployeeRole.ADMIN">Administrador</mat-option>
                  <mat-option [value]="EmployeeRole.CASHIER">Cajero</mat-option>
                </mat-select>
                @if (employeeForm.get('role')?.hasError('required') && 
                     employeeForm.get('role')?.touched) {
                  <mat-error>El rol es requerido</mat-error>
                }
              </mat-form-field>

              @if (!isEditMode()) {
                <mat-form-field appearance="outline" floatLabel="always" class="full-width">
                  <mat-label>Contraseña</mat-label>
                  <input matInput 
                         [type]="hidePassword() ? 'password' : 'text'" 
                         formControlName="password"
                         placeholder="Mínimo 6 caracteres"
                         required>
                  <button mat-icon-button 
                          matSuffix 
                          type="button"
                          (click)="hidePassword.set(!hidePassword())">
                    <mat-icon>{{ hidePassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
                  </button>
                  @if (employeeForm.get('password')?.hasError('required') && 
                       employeeForm.get('password')?.touched) {
                    <mat-error>La contraseña es requerida</mat-error>
                  }
                  @if (employeeForm.get('password')?.hasError('minlength') && 
                       employeeForm.get('password')?.touched) {
                    <mat-error>Mínimo 6 caracteres</mat-error>
                  }
                </mat-form-field>
              }
            </div>

            <div class="form-actions">
              <button mat-flat-button type="button" class="cancel-btn" (click)="goBack()">
                Cancelar
              </button>
              <button mat-flat-button
                      class="save-btn"
                      type="submit"
                      [disabled]="employeeForm.invalid || loading()">
                @if (loading()) {
                  Guardando...
                } @else {
                  {{ isEditMode() ? 'Actualizar' : 'Crear' }}
                }
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .page-container {
      padding: 24px 16px;
      max-width: 900px;
      margin: 0 auto;
    }

    mat-card {
      border-radius: 18px !important;
      box-shadow: 0 14px 30px rgba(15, 23, 42, 0.08), 0 8px 16px rgba(15, 23, 42, 0.05) !important;
      border: 1px solid #e8edf3 !important;
      background: linear-gradient(160deg, #ffffff 0%, #f8fbff 100%) !important;
    }

    .header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 24px;
      padding-bottom: 16px;
      border-bottom: 2px solid #f0f0f0;

      button {
        color: #757575;
        transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);

        &:hover {
          color: var(--primary);
          background: linear-gradient(135deg, #f0f4ff 0%, #e8f0ff 100%);
        }
      }

      h1 {
        margin: 0;
        font-size: 24px;
        font-weight: 700;
        color: #212121;
        letter-spacing: -0.5px;
      }
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
      padding: 24px;
      border-radius: 16px;
      background: linear-gradient(135deg, #f7faff 0%, #ffffff 58%, #f9fbff 100%);
      border: 1px solid #e7edf7;
    }

    .full-width {
      grid-column: 1 / -1;
    }

    mat-form-field {
      width: 100%;

      ::ng-deep .mat-mdc-form-field-subscript-wrapper {
        min-height: 20px;
      }

      ::ng-deep .mat-mdc-form-field-hint {
        color: #607d8b;
        font-size: 0.78rem;
      }

      ::ng-deep .mat-mdc-input-element::placeholder {
        color: #90a4ae !important;
        opacity: 0.95 !important;
      }

      .mat-mdc-text-field-wrapper {
        border-color: #d8e0eb !important;
        transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);

        &:hover {
          border-color: #b2c2d6 !important;
          box-shadow: 0 2px 8px rgba(40, 63, 90, 0.08) !important;
        }
      }

      &.mat-focused .mat-mdc-text-field-wrapper {
        border-color: var(--primary) !important;
        box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.14), 0 4px 12px rgba(25, 118, 210, 0.14) !important;
      }
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      padding-top: 20px;
      border-top: 1px solid #f0f0f0;
      margin-top: 24px;
      flex-wrap: wrap;

      button {
        min-width: 130px;
        border-radius: 10px !important;
        min-height: 40px;
        transition: all 180ms cubic-bezier(0.4, 0, 0.2, 1);

        &:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      }
    }

    .cancel-btn {
      border: 1px solid #d2dbe7 !important;
      background: #ffffff !important;
      color: #475569 !important;
      font-weight: 700 !important;
    }

    .cancel-btn:hover {
      background: #f8fafc !important;
      border-color: #b8c5d6 !important;
      transform: translateY(-1px);
    }

    .save-btn {
      border: 1px solid rgba(21, 101, 192, 0.4) !important;
      background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%) !important;
      color: #ffffff !important;
      font-weight: 700 !important;
      box-shadow: 0 6px 14px rgba(25, 118, 210, 0.3) !important;
    }

    .save-btn:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 10px 20px rgba(25, 118, 210, 0.36) !important;
      background: linear-gradient(135deg, #1e88e5 0%, #1976d2 100%) !important;
    }

    @media (max-width: 768px) {
      .page-container {
        padding: 16px;
      }

      .form-grid {
        grid-template-columns: 1fr;
        padding: 16px;
      }

      .form-actions {
        flex-direction: column-reverse;
      }

      .form-actions button {
        width: 100%;
      }
    }
  `]
})
export class EmployeeFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private employeeService = inject(EmployeeService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private snackBar = inject(MatSnackBar);

  employeeForm!: FormGroup;
  loading = signal(false);
  isEditMode = signal(false);
  hidePassword = signal(true);
  employeeId: string | null = null;
  
  EmployeeRole = EmployeeRole;

  ngOnInit() {
    this.employeeId = this.route.snapshot.paramMap.get('id');
    this.isEditMode.set(!!this.employeeId);
    this.initForm();

    if (this.isEditMode() && this.employeeId) {
      this.loadEmployee(this.employeeId);
    }
  }

  initForm() {
    this.employeeForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.email]],
      phone: ['', [Validators.pattern('^[0-9]*$')]],
      username: ['', [Validators.required, Validators.minLength(3)]],
      role: ['', [Validators.required]],
      password: ['']
    });

    if (!this.isEditMode()) {
      this.employeeForm.get('password')?.setValidators([
        Validators.required,
        Validators.minLength(6)
      ]);
    }
  }

  loadEmployee(id: string) {
    this.loading.set(true);
    this.employeeService.getEmployeeById(id).subscribe({
      next: (employee) => {
        this.employeeForm.patchValue({
          firstName: employee.firstName,
          lastName: employee.lastName,
          email: employee.email,
          phone: employee.phone,
          username: employee.username,
          role: employee.role
        });
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading employee:', error);
        this.snackBar.open('Error al cargar empleado', 'Cerrar', { duration: 3000 });
        this.loading.set(false);
        this.goBack();
      }
    });
  }

  onSubmit() {
    if (this.employeeForm.invalid) {
      Object.keys(this.employeeForm.controls).forEach(key => {
        this.employeeForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.loading.set(true);
    const employeeData: Partial<Employee> = this.employeeForm.value;

    if (this.isEditMode()) {
      delete employeeData.password;
    }

    const request = this.isEditMode() && this.employeeId
      ? this.employeeService.updateEmployee(this.employeeId, employeeData)
      : this.employeeService.createEmployee(employeeData);

    request.subscribe({
      next: () => {
        this.snackBar.open(
          `Empleado ${this.isEditMode() ? 'actualizado' : 'creado'} correctamente`,
          'Cerrar',
          { duration: 3000 }
        );
        this.goBack();
      },
      error: (error) => {
        console.error('Error saving employee:', error);
        const message = error.error?.message || 
                       `Error al ${this.isEditMode() ? 'actualizar' : 'crear'} empleado`;
        this.snackBar.open(message, 'Cerrar', { duration: 3000 });
        this.loading.set(false);
      }
    });
  }

  goBack() {
    this.router.navigate(['/dashboard/employees']);
  }
}
