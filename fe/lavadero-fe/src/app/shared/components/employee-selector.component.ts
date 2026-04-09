import { Component, forwardRef, inject, Input, Output, EventEmitter, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Observable } from 'rxjs';
import { startWith, map } from 'rxjs/operators';
import { EmployeeService } from '../../core/services/employee.service';
import { Employee, EmployeeRole } from '../../core/models/models';

@Component({
  selector: 'app-employee-selector',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatAutocompleteModule,
    MatInputModule,
    MatProgressSpinnerModule
  ],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => EmployeeSelectorComponent),
    multi: true
  }],
  template: `
    <div class="employee-selector">
      @if (useAutocomplete) {
        <!-- Autocomplete version -->
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>{{ label }}</mat-label>
          <input 
            matInput
            [formControl]="searchControl"
            [matAutocomplete]="auto"
            [placeholder]="placeholder">
          @if (loading()) {
            <mat-spinner matSuffix diameter="20"></mat-spinner>
          }
          <mat-autocomplete 
            #auto="matAutocomplete" 
            [displayWith]="displayEmployee"
            (optionSelected)="onSelectionChange($event.option.value)">
            @for (employee of filteredEmployees$ | async; track employee.id) {
              <mat-option [value]="employee">
                {{ employee.firstName }} {{ employee.lastName }}
                @if (showRole) {
                  <span class="role-badge">{{ getRoleLabel(employee.role) }}</span>
                }
              </mat-option>
            }
          </mat-autocomplete>
        </mat-form-field>
      } @else {
        <!-- Select dropdown version -->
        <mat-form-field appearance="outline" class="full-width" floatLabel="always">
          <mat-label>{{ label }}</mat-label>
          <mat-select 
            [(value)]="value"
            [placeholder]="placeholder"
            (selectionChange)="onSelectionChange($event.value)">
            @if (loading()) {
              <mat-option disabled>
                <mat-spinner diameter="20"></mat-spinner>
                Cargando...
              </mat-option>
            }
            @for (employee of employees(); track employee.id) {
              <mat-option [value]="employee.id">
                {{ employee.firstName }} {{ employee.lastName }}
                @if (showRole) {
                  - {{ getRoleLabel(employee.role) }}
                }
              </mat-option>
            }
            @if (!loading() && employees().length === 0) {
              <mat-option disabled>No hay empleados disponibles</mat-option>
            }
          </mat-select>
        </mat-form-field>
      }
    </div>
  `,
  styles: [`
    .employee-selector {
      width: 100%;
    }

    .full-width {
      width: 100%;
    }

    .role-badge {
      font-size: 0.75rem;
      color: #666;
      margin-left: 0.5rem;
      font-style: italic;
    }

    .full-width ::ng-deep .mat-mdc-select-placeholder {
      color: #64748b !important;
      opacity: 0.95 !important;
      font-weight: 400;
    }

    .full-width ::ng-deep .mat-mdc-floating-label {
      font-weight: 600;
    }

    mat-spinner {
      display: inline-block;
      margin-right: 0.5rem;
    }
  `]
})
export class EmployeeSelectorComponent implements ControlValueAccessor, OnInit {
  private employeeService = inject(EmployeeService);

  @Input() roleFilter?: EmployeeRole;
  @Input() label: string = 'Empleado Asignado';
  @Input() placeholder: string = 'Seleccionar empleado...';
  @Input() useAutocomplete: boolean = false;
  @Input() showRole: boolean = false;
  
  @Output() employeeSelected = new EventEmitter<Employee>();

  employees = signal<Employee[]>([]);
  loading = signal(false);
  value: string = '';

  searchControl = new FormControl('');
  filteredEmployees$!: Observable<Employee[]>;

  onChange = (value: any) => {};
  onTouched = () => {};

  ngOnInit() {
    this.loadEmployees();
    
    if (this.useAutocomplete) {
      this.filteredEmployees$ = this.searchControl.valueChanges.pipe(
        startWith(''),
        map(value => this.filterEmployees(value))
      );
    }
  }

  loadEmployees() {
    this.loading.set(true);

    const request = this.roleFilter
      ? this.employeeService.getEmployeesByRole(this.roleFilter)
      : this.employeeService.getActiveEmployees();

    request.subscribe({
      next: (employees) => {
        this.employees.set(employees);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading employees:', error);
        this.loading.set(false);
      }
    });
  }

  filterEmployees(value: string | Employee | null): Employee[] {
    if (!value || typeof value !== 'string') {
      return this.employees();
    }

    const filterValue = value.toLowerCase();
    return this.employees().filter(employee => {
      const fullName = `${employee.firstName} ${employee.lastName}`.toLowerCase();
      return fullName.includes(filterValue);
    });
  }

  displayEmployee = (employee: Employee | null): string => {
    if (!employee) return '';
    return `${employee.firstName} ${employee.lastName}`;
  }

  onSelectionChange(employeeOrId: Employee | string | null) {
    if (!employeeOrId) return;

    let employeeId: string;
    let employee: Employee | undefined;

    if (typeof employeeOrId === 'string') {
      employeeId = employeeOrId;
      employee = this.employees().find(e => e.id === employeeId);
    } else {
      employeeId = employeeOrId.id || '';
      employee = employeeOrId;
    }

    this.value = employeeId;
    this.onChange(employeeId);
    this.onTouched();

    if (employee) {
      this.employeeSelected.emit(employee);
    }
  }

  getRoleLabel(role: EmployeeRole): string {
    const labels = {
      [EmployeeRole.OPERATOR]: 'Operador',
      [EmployeeRole.ADMIN]: 'Admin',
      [EmployeeRole.CASHIER]: 'Cajero'
    };
    return labels[role] || role;
  }

  writeValue(value: any): void {
    this.value = value || '';
    if (this.useAutocomplete && value) {
      const employee = this.employees().find(e => e.id === value);
      if (employee) {
        this.searchControl.setValue(employee as any, { emitEvent: false });
      }
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    if (isDisabled) {
      this.searchControl.disable();
    } else {
      this.searchControl.enable();
    }
  }
}
