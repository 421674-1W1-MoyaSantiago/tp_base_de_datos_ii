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
      padding: 2rem;
      max-width: 800px;
      margin: 0 auto;
    }

    .header {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .full-width {
      grid-column: 1 / -1;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
    }

    @media (max-width: 768px) {
      .form-grid {
        grid-template-columns: 1fr;
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
