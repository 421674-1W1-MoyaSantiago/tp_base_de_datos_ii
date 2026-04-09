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
          <form [formGroup]="employeeForm" (ngSubmit)="onSubmit()">
            <div class="form-grid">
              <mat-form-field appearance="outline">
                <mat-label>Nombre</mat-label>
                <input matInput formControlName="firstName" required>
                @if (employeeForm.get('firstName')?.hasError('required') && 
                     employeeForm.get('firstName')?.touched) {
                  <mat-error>El nombre es requerido</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Apellido</mat-label>
                <input matInput formControlName="lastName" required>
                @if (employeeForm.get('lastName')?.hasError('required') && 
                     employeeForm.get('lastName')?.touched) {
                  <mat-error>El apellido es requerido</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Email</mat-label>
                <input matInput type="email" formControlName="email">
                @if (employeeForm.get('email')?.hasError('email') && 
                     employeeForm.get('email')?.touched) {
                  <mat-error>Email inválido</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Teléfono</mat-label>
                <input matInput formControlName="phone">
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Nombre de Usuario</mat-label>
                <input matInput formControlName="username" required>
                @if (employeeForm.get('username')?.hasError('required') && 
                     employeeForm.get('username')?.touched) {
                  <mat-error>El nombre de usuario es requerido</mat-error>
                }
                @if (employeeForm.get('username')?.hasError('minlength') && 
                     employeeForm.get('username')?.touched) {
                  <mat-error>Mínimo 3 caracteres</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Rol</mat-label>
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
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Contraseña</mat-label>
                  <input matInput 
                         [type]="hidePassword() ? 'password' : 'text'" 
                         formControlName="password" 
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
              <button mat-button type="button" (click)="goBack()">
                Cancelar
              </button>
              <button mat-raised-button 
                      color="primary" 
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
      border-radius: 12px !important;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06) !important;
      border: 1px solid #f0f0f0 !important;
      background: linear-gradient(135deg, #ffffff 0%, #f9fafb 100%) !important;
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
      border-radius: 12px;
      background: linear-gradient(135deg, #f9fafb 0%, #ffffff 100%);
      border: 1px solid #f0f0f0;
    }

    .full-width {
      grid-column: 1 / -1;
    }

    mat-form-field {
      width: 100%;

      .mat-mdc-text-field-wrapper {
        border-color: #d1d5db !important;
        transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);

        &:hover {
          border-color: #bdbdbd !important;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05) !important;
        }
      }

      &.mat-focused .mat-mdc-text-field-wrapper {
        border-color: var(--primary) !important;
        box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.12) !important;
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
        transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);

        &[color="primary"] {
          box-shadow: 0 2px 8px rgba(25, 118, 210, 0.2);

          &:hover:not(:disabled) {
            box-shadow: 0 8px 16px rgba(25, 118, 210, 0.3);
            transform: translateY(-2px);
          }
        }

        &:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      }
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
      phone: [''],
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
    this.router.navigate(['/employees']);
  }
}
