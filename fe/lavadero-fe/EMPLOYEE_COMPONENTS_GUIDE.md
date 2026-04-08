# Employee Management Components

## Components Created

### 1. EmployeeListComponent
**Location:** `src/app/features/employees/employee-list.component.ts`

**Features:**
- MatTable with pagination displaying all employees
- Columns: Full Name, Email, Role, Status (Active/Inactive), Actions
- Role filter dropdown (All, Operator, Admin, Cashier)
- Action buttons: View, Edit, Delete
- Toggle button to activate/deactivate employees
- "Nuevo Empleado" button to create new employees
- Responsive design with Material UI

**Routes:**
- List: `/dashboard/employees`
- Create: `/employees/new`
- Edit: `/employees/:id/edit`
- View: `/employees/:id`

---

### 2. EmployeeFormComponent
**Location:** `src/app/features/employees/employee-form.component.ts`

**Features:**
- Create/Edit modes with single component
- Form fields:
  - First Name (required)
  - Last Name (required)
  - Email (optional, validated)
  - Phone (optional)
  - Username (required, min 3 chars)
  - Role (required, dropdown with OPERATOR/ADMIN/CASHIER)
  - Password (required on create only, min 6 chars, hidden on edit)
- Password visibility toggle
- Form validation with error messages
- Cancel and Save buttons
- Success/error notifications via MatSnackBar

---

### 3. EmployeeSelectorComponent
**Location:** `src/app/shared/components/employee-selector.component.ts`

**Features:**
- Reusable component for selecting employees
- Two modes: MatSelect (default) or MatAutocomplete
- Filter by role (optional)
- Display active employees only (or by role)
- Implements ControlValueAccessor for reactive forms integration
- Event emitter for selection changes

**Usage Examples:**

#### Basic Usage (MatSelect)
```typescript
<app-employee-selector
  label="Seleccionar Empleado"
  placeholder="Elegir empleado..."
  (employeeSelected)="onEmployeeSelected($event)">
</app-employee-selector>
```

#### With Role Filter
```typescript
<app-employee-selector
  [roleFilter]="EmployeeRole.OPERATOR"
  label="Operador Asignado"
  (employeeSelected)="assignOperator($event)">
</app-employee-selector>
```

#### Autocomplete Mode
```typescript
<app-employee-selector
  [useAutocomplete]="true"
  [showRole]="true"
  label="Buscar Empleado"
  placeholder="Escribe para buscar..."
  (employeeSelected)="onEmployeeSelected($event)">
</app-employee-selector>
```

#### In Reactive Forms (Service Order Form)
```typescript
// In component.ts
this.serviceForm = this.fb.group({
  assignedEmployeeId: [''],
  // other fields...
});

// In template
<form [formGroup]="serviceForm">
  <app-employee-selector
    formControlName="assignedEmployeeId"
    [roleFilter]="EmployeeRole.OPERATOR"
    label="Operador Asignado">
  </app-employee-selector>
</form>
```

**@Input Properties:**
- `roleFilter?: EmployeeRole` - Filter employees by role
- `label: string` - Field label (default: "Empleado Asignado")
- `placeholder: string` - Placeholder text
- `useAutocomplete: boolean` - Use autocomplete instead of select (default: false)
- `showRole: boolean` - Show role badge next to name (default: false)

**@Output Events:**
- `employeeSelected: EventEmitter<Employee>` - Emits when an employee is selected

---

## Implementation Details

### Angular 20 Features Used
- ✅ Standalone components
- ✅ Signals for reactive state management
- ✅ `@if` and `@for` control flow syntax
- ✅ `inject()` function for dependency injection
- ✅ Angular Material 18+

### Services Used
- `EmployeeService` - All CRUD operations
  - `getEmployees(page, size)` - Paginated list
  - `getActiveEmployees()` - Active employees only
  - `getEmployeesByRole(role)` - Filter by role
  - `getEmployeeById(id)` - Single employee
  - `createEmployee(data)` - Create new
  - `updateEmployee(id, data)` - Update existing
  - `toggleEmployeeStatus(id)` - Activate/deactivate
  - `deleteEmployee(id)` - Delete employee

### Routes Configuration
Updated in `app.routes.ts`:
```typescript
{
  path: 'dashboard',
  children: [
    { path: 'employees', loadComponent: () => EmployeeListComponent }
  ]
},
{
  path: 'employees',
  canActivate: [authGuard],
  children: [
    { path: 'new', loadComponent: () => EmployeeFormComponent },
    { path: ':id/edit', loadComponent: () => EmployeeFormComponent },
    { path: ':id', loadComponent: () => EmployeeFormComponent }
  ]
}
```

---

## Next Steps

To integrate the employee selector in the Service Order Form:

1. Import the component:
```typescript
import { EmployeeSelectorComponent } from '../../shared/components/employee-selector.component';

@Component({
  imports: [
    // ... other imports
    EmployeeSelectorComponent
  ]
})
```

2. Add to your form:
```typescript
this.serviceOrderForm = this.fb.group({
  assignedEmployeeId: [''],
  // ... other fields
});
```

3. Use in template:
```html
<app-employee-selector
  formControlName="assignedEmployeeId"
  [roleFilter]="EmployeeRole.OPERATOR"
  label="Operador Asignado"
  placeholder="Seleccionar operador...">
</app-employee-selector>
```
