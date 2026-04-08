import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { EmployeeService } from '../../core/services/employee.service';
import { Employee, EmployeeRole } from '../../core/models/models';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatFormFieldModule,
    MatChipsModule,
    MatSnackBarModule,
    MatDialogModule,
    MatCardModule,
    MatSlideToggleModule,
    MatTooltipModule
  ],
  template: `
    <div class="page-container">
      <div class="header">
        <h1>Gestión de Empleados</h1>
        <button mat-raised-button color="primary" (click)="createEmployee()">
          <mat-icon>add</mat-icon>
          Nuevo Empleado
        </button>
      </div>

      <mat-card>
        <mat-card-content>
          <div class="filters">
            <mat-form-field>
              <mat-label>Filtrar por Rol</mat-label>
              <mat-select [(value)]="selectedRole" (selectionChange)="onRoleFilterChange()">
                <mat-option [value]="null">Todos</mat-option>
                <mat-option [value]="EmployeeRole.OPERATOR">Operador</mat-option>
                <mat-option [value]="EmployeeRole.ADMIN">Administrador</mat-option>
                <mat-option [value]="EmployeeRole.CASHIER">Cajero</mat-option>
              </mat-select>
            </mat-form-field>
          </div>

          <div class="table-container">
            <table mat-table [dataSource]="employees()" class="mat-elevation-z0">
              <!-- Full Name Column -->
              <ng-container matColumnDef="fullName">
                <th mat-header-cell *matHeaderCellDef>Nombre Completo</th>
                <td mat-cell *matCellDef="let employee">
                  {{employee.firstName}} {{employee.lastName}}
                </td>
              </ng-container>

              <!-- Email Column -->
              <ng-container matColumnDef="email">
                <th mat-header-cell *matHeaderCellDef>Email</th>
                <td mat-cell *matCellDef="let employee">{{employee.email || 'N/A'}}</td>
              </ng-container>

              <!-- Role Column -->
              <ng-container matColumnDef="role">
                <th mat-header-cell *matHeaderCellDef>Rol</th>
                <td mat-cell *matCellDef="let employee">
                  <mat-chip [highlighted]="true">{{getRoleLabel(employee.role)}}</mat-chip>
                </td>
              </ng-container>

              <!-- Status Column -->
              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef>Estado</th>
                <td mat-cell *matCellDef="let employee">
                  @if (employee.active) {
                    <mat-chip color="accent" highlighted>Activo</mat-chip>
                  } @else {
                    <mat-chip>Inactivo</mat-chip>
                  }
                </td>
              </ng-container>

              <!-- Actions Column -->
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Acciones</th>
                <td mat-cell *matCellDef="let employee">
                  <div class="actions">
                    <button mat-icon-button color="primary" 
                            (click)="viewEmployee(employee)"
                            matTooltip="Ver detalles">
                      <mat-icon>visibility</mat-icon>
                    </button>
                    <button mat-icon-button color="accent" 
                            (click)="editEmployee(employee)"
                            matTooltip="Editar">
                      <mat-icon>edit</mat-icon>
                    </button>
                    <mat-slide-toggle 
                      [checked]="employee.active"
                      (change)="toggleStatus(employee)"
                      [matTooltip]="employee.active ? 'Desactivar' : 'Activar'"
                      color="primary">
                    </mat-slide-toggle>
                    <button mat-icon-button color="warn" 
                            (click)="deleteEmployee(employee)"
                            matTooltip="Eliminar">
                      <mat-icon>delete</mat-icon>
                    </button>
                  </div>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
            </table>
          </div>

          @if (totalElements() > 0) {
            <mat-paginator
              [length]="totalElements()"
              [pageSize]="pageSize()"
              [pageIndex]="pageIndex()"
              [pageSizeOptions]="[10, 20, 50]"
              (page)="onPageChange($event)"
              showFirstLastButtons>
            </mat-paginator>
          }

          @if (loading()) {
            <div class="loading">Cargando empleados...</div>
          }

          @if (!loading() && employees().length === 0) {
            <div class="no-data">No se encontraron empleados</div>
          }
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .page-container {
      padding: 2rem;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    .filters {
      margin-bottom: 1rem;
    }

    .table-container {
      overflow-x: auto;
    }

    table {
      width: 100%;
    }

    .actions {
      display: flex;
      gap: 0.5rem;
      align-items: center;
    }

    .loading, .no-data {
      text-align: center;
      padding: 2rem;
      color: #666;
    }

    mat-chip {
      font-size: 0.875rem;
    }
  `]
})
export class EmployeeListComponent implements OnInit {
  private employeeService = inject(EmployeeService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  employees = signal<Employee[]>([]);
  loading = signal(false);
  selectedRole: EmployeeRole | null = null;
  
  pageIndex = signal(0);
  pageSize = signal(20);
  totalElements = signal(0);

  displayedColumns = ['fullName', 'email', 'role', 'status', 'actions'];
  EmployeeRole = EmployeeRole;

  ngOnInit() {
    this.loadEmployees();
  }

  loadEmployees() {
    this.loading.set(true);
    
    const request = this.selectedRole 
      ? this.employeeService.getEmployeesByRole(this.selectedRole)
      : this.employeeService.getEmployees(this.pageIndex(), this.pageSize());

    request.subscribe({
      next: (response: any) => {
        if (this.selectedRole) {
          this.employees.set(response);
          this.totalElements.set(response.length);
        } else {
          this.employees.set(response.content || []);
          this.totalElements.set(response.totalElements || 0);
        }
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading employees:', error);
        this.snackBar.open('Error al cargar empleados', 'Cerrar', { duration: 3000 });
        this.loading.set(false);
      }
    });
  }

  onRoleFilterChange() {
    this.pageIndex.set(0);
    this.loadEmployees();
  }

  onPageChange(event: PageEvent) {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.loadEmployees();
  }

  getRoleLabel(role: EmployeeRole): string {
    const labels = {
      [EmployeeRole.OPERATOR]: 'Operador',
      [EmployeeRole.ADMIN]: 'Administrador',
      [EmployeeRole.CASHIER]: 'Cajero'
    };
    return labels[role] || role;
  }

  createEmployee() {
    this.router.navigate(['/employees/new']);
  }

  viewEmployee(employee: Employee) {
    this.router.navigate(['/employees', employee.id]);
  }

  editEmployee(employee: Employee) {
    this.router.navigate(['/employees', employee.id, 'edit']);
  }

  toggleStatus(employee: Employee) {
    if (!employee.id) return;

    this.employeeService.toggleEmployeeStatus(employee.id).subscribe({
      next: (updated) => {
        const index = this.employees().findIndex(e => e.id === employee.id);
        if (index !== -1) {
          const updatedEmployees = [...this.employees()];
          updatedEmployees[index] = updated;
          this.employees.set(updatedEmployees);
        }
        this.snackBar.open(
          `Empleado ${updated.active ? 'activado' : 'desactivado'} correctamente`,
          'Cerrar',
          { duration: 3000 }
        );
      },
      error: (error) => {
        console.error('Error toggling employee status:', error);
        this.snackBar.open('Error al cambiar estado del empleado', 'Cerrar', { duration: 3000 });
        this.loadEmployees();
      }
    });
  }

  deleteEmployee(employee: Employee) {
    if (!employee.id) return;

    if (confirm(`¿Está seguro de eliminar al empleado ${employee.firstName} ${employee.lastName}?`)) {
      this.employeeService.deleteEmployee(employee.id).subscribe({
        next: () => {
          this.snackBar.open('Empleado eliminado correctamente', 'Cerrar', { duration: 3000 });
          this.loadEmployees();
        },
        error: (error) => {
          console.error('Error deleting employee:', error);
          this.snackBar.open('Error al eliminar empleado', 'Cerrar', { duration: 3000 });
        }
      });
    }
  }
}
