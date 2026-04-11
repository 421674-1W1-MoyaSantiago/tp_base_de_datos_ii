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
    MatTooltipModule
  ],
  template: `
    <div class="page-container">
      <div class="header">
        <h1>Gestión de Empleados</h1>
        <button mat-raised-button color="primary" class="new-employee-btn" (click)="createEmployee()">
          <mat-icon>add</mat-icon>
          Nuevo Empleado
        </button>
      </div>

      <mat-card>
        <mat-card-content>
          <div class="filter-controls">
            <mat-form-field appearance="outline" class="filter-field" floatLabel="always">
              <mat-label>Filtrar por Rol</mat-label>
              <mat-select [(value)]="selectedRole" (selectionChange)="onRoleFilterChange()" placeholder="Seleccione un rol">
                <mat-option [value]="null">
                  <mat-icon>view_module</mat-icon>
                  Todos los Roles
                </mat-option>
                <mat-option [value]="EmployeeRole.OPERATOR">
                  <mat-icon>engineering</mat-icon>
                  Operador
                </mat-option>
                <mat-option [value]="EmployeeRole.ADMIN">
                  <mat-icon>security</mat-icon>
                  Administrador
                </mat-option>
                <mat-option [value]="EmployeeRole.CASHIER">
                  <mat-icon>point_of_sale</mat-icon>
                  Cajero
                </mat-option>
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
                    <button mat-icon-button class="action-icon-btn action-view"
                            (click)="viewEmployee(employee)"
                            matTooltip="Ver detalles">
                      <mat-icon>visibility</mat-icon>
                    </button>
                    <button mat-icon-button class="action-icon-btn action-edit"
                            (click)="editEmployee(employee)"
                            matTooltip="Editar">
                      <mat-icon>edit</mat-icon>
                    </button>
                    <button mat-stroked-button
                            class="action-toggle"
                            [class.active]="employee.active"
                            [class.inactive]="!employee.active"
                            (click)="toggleStatus(employee)"
                            [matTooltip]="employee.active ? 'Desactivar' : 'Activar'">
                      <mat-icon>{{ employee.active ? 'toggle_on' : 'toggle_off' }}</mat-icon>
                      {{ employee.active ? 'Activo' : 'Inactivo' }}
                    </button>
                    <button mat-icon-button class="action-icon-btn action-delete"
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
      padding: 24px 16px;
      max-width: 1400px;
      margin: 0 auto;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      flex-wrap: wrap;
      gap: 16px;
    }

    h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 700;
      color: #212121;
      letter-spacing: -0.5px;
    }

    .new-employee-btn {
      min-height: 46px;
      padding: 0 20px !important;
      border-radius: 10px !important;
      border: 1px solid rgba(21, 101, 192, 0.35) !important;
      background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%) !important;
      color: #ffffff !important;
      font-weight: 700 !important;
      letter-spacing: 0.3px;
      box-shadow: 0 6px 14px rgba(25, 118, 210, 0.28) !important;
      transition: all 180ms cubic-bezier(0.4, 0, 0.2, 1) !important;

      mat-icon {
        color: #ffffff !important;
        margin-right: 8px !important;
        font-size: 20px;
        width: 20px;
        height: 20px;
      }

      &:hover {
        background: linear-gradient(135deg, #1e88e5 0%, #1976d2 100%) !important;
        border-color: rgba(21, 101, 192, 0.55) !important;
        transform: translateY(-1px);
        box-shadow: 0 10px 20px rgba(25, 118, 210, 0.35) !important;
      }

      &:active {
        transform: translateY(0);
        box-shadow: 0 4px 10px rgba(25, 118, 210, 0.25) !important;
      }

      &:focus-visible {
        outline: 3px solid rgba(25, 118, 210, 0.25);
        outline-offset: 2px;
      }
    }

    .filters {
      margin-bottom: 20px;
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
      align-items: center;
      padding: 20px;
      border-radius: 12px;
      background: linear-gradient(135deg, #f9fafb 0%, #ffffff 100%);
      border: 1px solid #f0f0f0;
    }

    .filter-controls {
      margin-bottom: 20px;
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
      align-items: flex-end;
      padding: 20px;
      border-radius: 12px;
      background: linear-gradient(135deg, #f9fafb 0%, #ffffff 100%);
      border: 1px solid #f0f0f0;
    }

    .filter-field {
      min-width: 280px;
      flex: 1;

      .mat-mdc-text-field-wrapper {
        border-color: #d1d5db !important;
      }

      &.mat-focused .mat-mdc-text-field-wrapper {
        border-color: var(--primary) !important;
        box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.12) !important;
      }
    }

    mat-card {
      border-radius: 12px !important;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06) !important;
      border: 1px solid #f0f0f0 !important;
      background: linear-gradient(135deg, #ffffff 0%, #f9fafb 100%) !important;
    }

    .table-container {
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.08);
      border: 1px solid #f0f0f0;
      margin-top: 20px;
    }

    table {
      width: 100%;
      background: white;
      border-collapse: collapse;
    }

    table ::ng-deep {
      .mat-mdc-header-cell {
        background: linear-gradient(135deg, #f5f7fa 0%, #f0f2f5 100%);
        font-weight: 700;
        color: #424242;
        border-bottom: 2px solid #e5e7eb;
        padding: 14px 16px !important;
        font-size: 0.9rem;
        letter-spacing: 0.5px;
      }

      .mat-mdc-cell {
        padding: 14px 16px !important;
        border-bottom: 1px solid #f0f0f0;
        color: #616161;
        font-size: 0.95rem;
      }

      .mat-mdc-row {
        transition: background-color 200ms cubic-bezier(0.4, 0, 0.2, 1);

        &:hover {
          background-color: #f9fafb;

          .mat-mdc-cell {
            background-color: #f9fafb;
          }
        }
      }

      .mat-mdc-row:last-child .mat-mdc-cell {
        border-bottom: none;
      }
    }

    .actions {
      display: flex;
      gap: 8px;
      align-items: center;
      justify-content: center;
      flex-wrap: wrap;
      width: 100%;
    }

    table ::ng-deep {
      .mat-column-actions {
        text-align: center;
      }
    }

    .action-icon-btn {
      width: 34px !important;
      height: 34px !important;
      min-width: 34px !important;
      border-radius: 10px !important;
      border: 1px solid transparent !important;
      transition: all 160ms cubic-bezier(0.4, 0, 0.2, 1) !important;
      display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;
      padding: 0 !important;
      line-height: 1 !important;

      mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
        margin: 0 !important;
        display: block;
        line-height: 18px !important;
      }

      &:hover {
        transform: translateY(-1px);
      }
    }

    .action-view {
      color: #1d4ed8 !important;
      background: #eff6ff !important;
      border-color: #bfdbfe !important;

      &:hover {
        background: #dbeafe !important;
        border-color: #93c5fd !important;
      }
    }

    .action-edit {
      color: #0f766e !important;
      background: #ecfeff !important;
      border-color: #99f6e4 !important;

      &:hover {
        background: #ccfbf1 !important;
        border-color: #5eead4 !important;
      }
    }

    .action-delete {
      color: #b91c1c !important;
      background: #fef2f2 !important;
      border-color: #fecaca !important;

      &:hover {
        background: #fee2e2 !important;
        border-color: #fca5a5 !important;
      }
    }

    .action-toggle {
      min-height: 34px;
      border-radius: 9px !important;
      padding: 0 10px !important;
      font-weight: 700;
      letter-spacing: 0.2px;
      border-width: 1px !important;

      mat-icon {
        margin-right: 4px;
        font-size: 18px;
        width: 18px;
        height: 18px;
      }
    }

    .action-toggle.active {
      background: #ecfdf3 !important;
      color: #166534 !important;
      border-color: #86efac !important;
    }

    .action-toggle.inactive {
      background: #fff7ed !important;
      color: #9a3412 !important;
      border-color: #fdba74 !important;
    }

    .loading, .no-data {
      text-align: center;
      padding: 40px 20px;
      color: #757575;
      background: linear-gradient(135deg, #f9fafb 0%, #ffffff 100%);
      border-radius: 8px;
      margin-top: 16px;
      font-weight: 500;
    }

    .loading {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      font-size: 1rem;
    }

    mat-chip {
      font-size: 0.875rem !important;
      font-weight: 500 !important;
    }

    ::ng-deep .mat-mdc-paginator {
      background: linear-gradient(135deg, #f9fafb 0%, #f5f7fa 100%);
      border-top: 1px solid #f0f0f0;
    }

    @media (max-width: 768px) {
      .page-container {
        padding: 16px;
      }

      .header {
        flex-direction: column;
        align-items: stretch;
      }

      .filters {
        flex-direction: column;
        align-items: stretch;
      }

      .new-employee-btn {
        width: 100%;
        justify-content: center;
      }

      table ::ng-deep {
        .mat-mdc-header-cell,
        .mat-mdc-cell {
          padding: 12px 8px !important;
          font-size: 0.9rem !important;
        }
      }

      .actions {
        gap: 4px;
      }
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
    this.router.navigate(['/dashboard/employees/new']);
  }

  viewEmployee(employee: Employee) {
    this.router.navigate(['/dashboard/employees', employee.id]);
  }

  editEmployee(employee: Employee) {
    this.router.navigate(['/dashboard/employees', employee.id, 'edit']);
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
