# 🔍 TABLA COMPARATIVA - Componentes Form

## Características por Componente

| Aspecto | client-form | employee-form | vehicle-form | service-order | invoice-form |
|---------|-------------|---------------|--------------|---------------|--------------|
| **Ubicación** | `clients/` | `employees/` | `clients/` | `services/` | `billing/` |
| **Tipo** | Standalone | Standalone | Dialog | Standalone | Standalone |
| **Appearance** | outline | outline | outline | default | outline |
| **Modo** | Create/Edit | Create/Edit | Create/Edit | Create | Create |

---

## Estructura de Campos

| Componente | Campos | Secciones | Layout | FormArray |
|---|---|---|---|---|
| **client-form** | 5 base | 2 (Personal, Vehículos) | Secciones + grid | ✅ vehicles |
| **employee-form** | 7 | 1 (form-grid) | 2 cols → 1 mobile | ❌ |
| **vehicle-form** | 5 | 1 (dialog-content) | 2 cols | ❌ |
| **service-order** | 7 | 1 (flex column) | Flex vertical | ❌ |
| **invoice-form** | 2 + summary | 2 (Summary, Form) | Grid + Form | ❌ |

---

## Validaciones por Campo

### client-form
```typescript
firstName:     ✓ required
lastName:      ✓ required
dni:           ✓ required
email:         ✓ required, email
phone:         - (optional)
licensePlate:  ✓ required, pattern
brand:         ✓ required
model:         ✓ required
year:          - (numeric, optional)
color:         - (optional)
```

### employee-form
```typescript
firstName:     ✓ required
lastName:      ✓ required
email:         ✓ email (optional)
phone:         - (optional)
username:      ✓ required, minLength:3
role:          ✓ required
password:      ✓ required, minLength:6 (CREATE only)
```

### vehicle-form
```typescript
licensePlate:  ✓ required, pattern, readonly (edit)
brand:         ✓ required
model:         ✓ required
year:          ✓ min:1900, max:currentYear+1
color:         - (optional)
```

### service-order-form
```typescript
clientSearch:  - (for search trigger)
clientId:      ✓ required
vehicleLicensePlate: ✓ required
assignedEmployeeId: - (optional)
serviceType:   ✓ required
price:         ✓ required, min:0.01
notes:         - (optional)
```

### invoice-form
```typescript
paymentMethod: ✓ required (radio)
notes:         - (optional)
```

---

## Material Components Utilizados

### client-form
```typescript
✓ mat-form-field (appearance="outline")
✓ matInput
✓ matButton
✓ matIcon
✓ MatCardModule
✓ MatSnackBarModule
✓ MatProgressSpinnerModule
✓ MatDividerModule
```

### employee-form
```typescript
✓ mat-form-field (appearance="outline")
✓ matInput
✓ matSelect (roles: OPERATOR, ADMIN, CASHIER)
✓ matButton
✓ matIcon (password toggle)
✓ MatCardModule
✓ MatSnackBarModule
```

### vehicle-form
```typescript
✓ mat-form-field (appearance="outline")
✓ matInput
✓ matButton
✓ matIcon
✓ MatCardModule
✓ MatDialogModule
✓ mat-dialog-title
✓ mat-dialog-content
✓ mat-dialog-actions
```

### service-order-form
```typescript
✓ mat-form-field
✓ matInput
✓ matSelect (ServiceType: BASIC, COMPLETE, PREMIUM, EXPRESS)
✓ matAutocomplete (client search)
✓ matButton
✓ MatCardModule
✓ MatSnackBarModule
✓ EmployeeSelectorComponent (custom)
```

### invoice-form
```typescript
✓ mat-form-field
✓ matInput
✓ matRadioButton (CASH, CARD, TRANSFER)
✓ matButton
✓ mat-spinner
✓ MatCardModule
✓ MatSnackBarModule
```

---

## Características RxJS / Async

| Componente | RxJS Patterns | Features |
|---|---|---|
| **client-form** | Subject (search form) | Debounce 400ms |
| **employee-form** | - | Validación condicional password |
| **vehicle-form** | - | Validación dinámica year range |
| **service-order** | switchMap, debounce | Autocomplete con 300ms, min chars: 2 |
| **invoice-form** | - | Display lectura (no editable) |

---

## Estilos CSS

### client-form
```scss
.page-container { max-width: 1200px; }
.section { padding: 1.5rem; }
.form-row { grid: auto-fit minmax(250px, 1fr); gap: 1rem; }
.vehicle-card { background-color: #fafafa; }
.no-vehicles { bg #f5f5f5, centered, color gray }
.actions { flex justify-end gap-1rem }
@media max-width:768px { form-row: 1fr; }
```

### employee-form
```scss
.page-container { max-width: 800px; }
.header { flex items-center gap-1rem }
.form-grid { grid: 2fr / 1fr mobile; gap: 1rem; }
.full-width { grid-column: 1/-1; }
.form-actions { flex justify-end gap-1rem }
```

### vehicle-form
```scss
.vehicle-form-container { min-width: 500px; }
h2 { display: flex align-items-center gap-0.5rem }
.form-content { flex column gap-1rem }
.form-row { grid: 1fr 1fr gap-1rem }
.full-width { width: 100%; }
```

### service-order-form
```scss
.container { padding-top: 24px; }
/* Usa Tailwind CSS classes:
   - flex flex-col gap-4
   - mx-auto p-4 max-w-2xl
   - p-3 bg-blue-50 rounded
*/
```

### invoice-form
```scss
.invoice-form-container { max-width: 900px; }
.order-summary { bg: #f5f5f5; padding: 20px; border-radius: 8px; }
.summary-grid { grid: auto-fit minmax(250px, 1fr); gap: 15px; }
.payment-method-group { flex column gap-10px; }
.amount-display { 
  flex justify-between
  bg: #e3f2fd
  padding: 20px
  border-radius: 8px
}
.amount-value { font-size: 32px; weight: 700; color: #1976d2; }
```

---

## Iconografía Utilizada

### Prefixes en Inputs
```typescript
// client-form
- No hay prefixes

// employee-form
- No hay prefixes visibles

// vehicle-form
✓ confirmation_number (licensePlate)
✓ local_offer (brand)
✓ directions_car (model)
✓ calendar_today (year)
✓ palette (color)

// service-order-form
✓ mat-label solo (no prefixes)

// invoice-form
✓ Sin prefixes visibles
```

### Acciones en Listas
```
👁️  visibility       → Ver detalles
📝  edit             → Editar
🗑️  delete           → Eliminar
⏳  toggle_on/off    → Activar/Desactivar
📄  receipt          → Ver ticket (facturas)
```

---

## Estados y Condicionales

### client-form
```typescript
isEditMode() ? 'Editar Cliente' : 'Nuevo Cliente'
loading() → mat-spinner
saving() → mostrar spinner en submitbutton
vehicles.length === 0 → mostrar mensaje "no hay vehículos"
```

### employee-form
```typescript
isEditMode() ? 'Editar Empleado' : 'Nuevo Empleado'
!isEditMode() → mostrar campo password
hidePassword() → toggle visibility icon
```

### invoice-form
```typescript
loading() → mat-spinner
serviceOrder() ? mostrar summary : error message
submitting() → loading en botón
```

---

## Patrones de Validación

### Mostrar errores condicional
```html
@if (form.get('field')?.hasError('type') && form.get('field')?.touched) {
  <mat-error>Mensaje error</mat-error>
}
```

### Required en mat-form-field
```html
<mat-form-field>
  <input matInput [required]="true" formControlName="field">
  <mat-error>Campo requerido</mat-error>
</mat-form-field>
```

### Select con opciones
```html
<mat-select formControlName="role">
  <mat-option [value]="EmployeeRole.OPERATOR">Operador</mat-option>
  <mat-option [value]="EmployeeRole.ADMIN">Administrador</mat-option>
</mat-select>
```

### Autocomplete
```typescript
[matAutocomplete]="auto"
<mat-autocomplete #auto="matAutocomplete">
  @for (item of filteredItems(); track item.id) {
    <mat-option [value]="item">
      {{ item.label }}
    </mat-option>
  }
</mat-autocomplete>
```

---

## Diferencias Clave

### Layout
- **client-form:** Secciones con dividers
- **employee-form:** Grid de 2 columnas compacto
- **vehicle-form:** Dialog modal compacto
- **service-order:** Flex vertical, componente personalizado
- **invoice-form:** Resumen + formulario separados

### Complejidad
1. **client-form** ⭐⭐⭐⭐⭐ (5/5)
2. **service-order-form** ⭐⭐⭐⭐ (4/5)
3. **employee-form** ⭐⭐⭐ (3/5)
4. **vehicle-form** ⭐⭐ (2/5)
5. **invoice-form** ⭐ (1/5)

### Cantidad de Campos
1. **service-order-form** - 7 campos
2. **employee-form** - 7 campos
3. **client-form** - 5 campos base (+ dinámicos)
4. **vehicle-form** - 5 campos
5. **invoice-form** - 2 campos (+ summary read-only)

### Reusabilidad
- ✅ **client-form:** Standalone, reutilizable
- ✅ **employee-form:** Standalone, reutilizable
- ✅ **vehicle-form:** Dialog, reutilizable como modal
- ✅ **service-order-form:** Usa EmployeeSelectorComponent (custom)
- ✅ **invoice-form:** Standalone, lee datos externos

---

## Patrones de Navegación

| Componente | Acción Success | Acción Cancel | Flujo |
|---|---|---|---|
| **client-form** | `router.navigate(['/dashboard', 'clients'])` | GoBack | Create → List |
| **employee-form** | `router.navigate(['/dashboard', 'employees'])` | GoBack | Create → List |
| **vehicle-form** | `dialogRef.close(vehicle)` | `dialogRef.close()` | Modal ↔ Parent |
| **service-order** | `router.navigate(['/services', id])` | `router.navigate(['/services'])` | Create → Detail |
| **invoice-form** | `router.navigate(['/billing', 'invoices'])` | GoBack | Create → List |

---

## Resumen de Componentes Personalizado

### EmployeeSelectorComponent
- **Ubicación:** `shared/components/employee-selector.component.ts`
- **Uso:** `service-order-form.component.ts`
- **Función:** Select dropdown para asignar empleados
- **Control Name:** assignedEmployeeId (optional)

---

*Análisis detallado: 9 de abril de 2026*
