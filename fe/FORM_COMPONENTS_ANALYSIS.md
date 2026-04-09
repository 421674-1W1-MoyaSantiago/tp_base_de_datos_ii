# Análisis Detallado de Componentes de Formularios y Listas

**Fecha:** 9 de abril de 2026  
**Workspace:** Lavadero Frontend (Angular standalone)

---

## 📋 Índice de Componentes

1. **Componentes Form (5 totales)**
   - client-form.component.ts
   - employee-form.component.ts
   - vehicle-form.component.ts
   - service-order-form.component.ts
   - invoice-form.component.ts

2. **Componentes List (4 totales)**
   - client-list.component.ts
   - employee-list.component.ts
   - service-list.component.ts
   - invoice-list.component.ts

---

## 1️⃣ client-form.component.ts

### 📍 Ubicación
`src/app/features/clients/client-form.component.ts`

### 📦 Material Imports
```typescript
MatFormFieldModule        // Campos de formulario
MatInputModule           // Inputs de texto
MatButtonModule          // Botones
MatIconModule            // Iconos
MatCardModule            // Contenedor principal
MatSnackBarModule        // Notificaciones
MatProgressSpinnerModule // Indicador de carga
MatDividerModule         // Separadores
```

### 🏗️ Template Structure
- **Appearance:** `outline` (estilo de formulario)
- **Sections principales:**
  1. **Información Personal**
     - FirstName (texto, requerido)
     - LastName (texto, requerido)
     - DNI (texto, requerido)
     - Phone (texto, opcional)
     - Email (email, requerido, con validación)

  2. **Vehículos (Dinámicos - FormArray)**
     - Usar `formArrayName="vehicles"`
     - Se pueden agregar/eliminar vehículos dinámicamente
     - Cada vehículo contiene:
       - licensePlate (entrada de control, no editable en edit mode)
       - brand (requerido)
       - model (requerido)
       - year (número)
       - color (opcional)

### 🎨 Estilos Clave
```scss
.page-container {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
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

.vehicle-card {
  margin-bottom: 1rem;
  background-color: #fafafa;
}

.no-vehicles {
  text-align: center;
  padding: 3rem;
  color: rgba(0,0,0,0.54);
  background-color: #f5f5f5;
  border-radius: 8px;
}

.actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  padding-top: 1.5rem;
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
}
```

### 🔄 Validaciones
- **firstName:** Requerido
- **lastName:** Requerido
- **dni:** Requerido
- **email:** Requerido + validación de formato de email
- **vehicles.licensePlate:** Requerido + patrón específico
- **vehicles.brand:** Requerido
- **vehicles.model:** Requerido

### 💾 Modo de Edición
- **New:** Crea nuevo cliente sin cargadores previos
- **Edit:** Carga los datos existentes desde el ID de la URL

---

## 2️⃣ employee-form.component.ts

### 📍 Ubicación
`src/app/features/employees/employee-form.component.ts`

### 📦 Material Imports
```typescript
MatFormFieldModule       // Campos
MatInputModule          // Inputs
MatSelectModule         // Dropdowns para roles
MatButtonModule         // Botones
MatCardModule           // Contenedor
MatIconModule           // Iconos
MatSnackBarModule       // Notificaciones
```

### 🏗️ Template Structure
**Grid de 2 columnas responsive**
```typescript
.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}
```

**Campos:**
1. FirstName (texto, requerido) - grid column 1
2. LastName (texto, requerido) - grid column 2
3. Email (email, validación) - grid column 1
4. Phone (texto) - grid column 2
5. Username (texto, requerido, minLength: 3) - grid column 1
6. Role (select, requerido) - grid column 2
   - Opciones: OPERATOR, ADMIN, CASHIER
7. Password (text/password, solo en creación) - grid column completa
   - Validaciones en creación: Requerido, minLength: 6
   - Toggle de visibilidad de contraseña

### 🎨 Estilos Clave
```scss
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
```

### 🔄 Validaciones
- **firstName:** Requerido
- **lastName:** Requerido
- **username:** Requerido, minLength: 3
- **email:** Validación de formato (si se proporciona)
- **role:** Requerido
- **password:** (Solo creación) Requerido, minLength: 6

---

## 3️⃣ vehicle-form.component.ts

### 📍 Ubicación
`src/app/features/clients/vehicle-form.component.ts`

### 📦 Material Imports (Dialog)
```typescript
MatFormFieldModule       // Campos
MatInputModule          // Inputs
MatButtonModule         // Botones
MatIconModule           // Iconos
MatCardModule           // Card
MatDialogModule         // Dialog
```

### 🏗️ Template Structure
**Abierto como Modal/Dialog**
```html
<mat-dialog-title>
  <mat-icon>directions_car</mat-icon>
  {{ isEditMode ? 'Editar Vehículo' : 'Nuevo Vehículo' }}
</mat-dialog-title>
```

**Campos:**
1. **licensePlate** (texto)
   - Placeholder: "ABC123 o AB123CD"
   - Readonly en modo edición (no se puede cambiar la patente)
   - Validación de patrón
   - Icon prefix: confirmation_number

2. **Brand + Model** (fila de 2 columnas)
   - brand: Placeholder "Toyota, Ford, Chevrolet..."
   - model: Placeholder "Corolla, Focus, Cruze..."
   - Icon prefix: local_offer y directions_car

3. **Year + Color** (fila de 2 columnas)
   - year: tipo number, min=1900, max=currentYear+1
   - color: Placeholder "Rojo, Azul, Blanco..."
   - Icon prefix: calendar_today y palette

### 🎨 Estilos Clave
```scss
.vehicle-form-container {
  min-width: 500px; /* Para Modal */
}

h2 {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #3f51b5;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.full-width {
  width: 100%;
}
```

### 🔄 Validaciones
- **licensePlate:** Requerido, pattern regex
- **brand:** Requerido
- **model:** Requerido
- **year:** min: 1900, max: currentYear+1

---

## 4️⃣ service-order-form.component.ts

### 📍 Ubicación
`src/app/features/services/service-order-form.component.ts`

### 📦 Material Imports
```typescript
MatCardModule            // Contenedor
MatFormFieldModule       // Campos
MatInputModule          // Inputs
MatSelectModule         // Dropdowns
MatButtonModule         // Botones
MatAutocompleteModule   // Autocompletado para clientes
MatSnackBarModule       // Notificaciones
EmployeeSelectorComponent // Componente personalizado
```

### 🏗️ Template Structure
**Flex layout vertical (gap-4)**

**Campos:**
1. **Client Autocomplete (Búsqueda)**
   - Input tipo autocomplete
   - Busca por nombre o DNI
   - Debounce de 300ms
   - Min caracteres: 2
   - switchMap para búsqueda en tiempo real
   - Muestra: "FirstName LastName - DNI"

2. **Selected Client Display**
   - Mostrado en div bg-blue-50 rounded si está seleccionado
   - Displays: "Cliente seleccionado: FirstName LastName"

3. **Vehicle Select (Disabled sin cliente)**
   - matSelect: vehicleLicensePlate
   - Disabled hasta seleccionar cliente
   - Muestra: "Brand Model - LicensePlate"
   - Hint: "Primero seleccione un cliente"

4. **Employee Selector**
   - Componente personalizado: app-employee-selector
   - Control: assignedEmployeeId

5. **Service Type (Select)**
   - Opciones: BASIC, COMPLETE, PREMIUM, EXPRESS
   - Requerido

6. **Price (Number Input)**
   - Prefix: "$"
   - Validación: min: 0.01, step: 0.01

7. **Notes (Textarea)**
   - Rows: 3
   - Placeholder: "Observaciones adicionales..."

### 🎨 Estilos Clave
```scss
.container {
  padding-top: 24px;
  /* Usa Tailwind CSS classes: flex, flex-col, gap-4, mx-auto, p-4, max-w-2xl */
}
```
**Nota:** Utiliza clases de Tailwind CSS inline

### 🔄 Validaciones
- **clientSearch:** -
- **clientId:** Requerido
- **vehicleLicensePlate:** Requerido
- **serviceType:** Requerido
- **price:** Requerido, min: 0.01

---

## 5️⃣ invoice-form.component.ts

### 📍 Ubicación
`src/app/features/billing/invoice-form.component.ts`

### 📦 Material Imports
```typescript
MatCardModule            // Contenedor
MatFormFieldModule       // Campos
MatInputModule          // Inputs
MatRadioModule          // Radio buttons para método pago
MatButtonModule         // Botones
MatProgressSpinnerModule // Spinner
MatSnackBarModule       // Notificaciones
```

### 🏗️ Template Structure
**Condicional: Carga order si existe**

1. **Order Summary (Grid)**
   - Mostrado si serviceOrder() está disponible
   - Grid: repeat(auto-fit, minmax(250px, 1fr))
   - Items:
     - Número de Orden
     - Cliente (FirstName LastName)
     - Vehículo (licensePlate)
     - Tipo de Servicio
     - Estado
     - **Monto Total** (destacado, color: #1976d2, size: 24px, weight: 600)

2. **Invoice Form Section**
   - **Payment Method (Radio Group)**
     - Opciones: CASH, CARD, TRANSFER
     - Layout: flex vertical
     - Gap: 10px
   
   - **Notes (Textarea)**
     - Opcional
     - Placeholder: "Agregar notas adicionales..."

   - **Amount Display (destacado)**
     - Background: #e3f2fd
     - Padding: 20px
     - Border-radius: 8px
     - Muestra: Label + Monto

### 🎨 Estilos Clave
```scss
.invoice-form-container {
  padding: 20px;
  max-width: 900px;
  margin: 0 auto;
}

.order-summary {
  background: #f5f5f5;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 30px;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 15px;
}

.summary-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.summary-item .label {
  font-size: 12px;
  color: #666;
  text-transform: uppercase;
}

.summary-item .value {
  font-size: 16px;
  font-weight: 500;
  color: #333;
}

.summary-item.amount .value {
  font-size: 24px;
  font-weight: 600;
  color: #1976d2;
}

.payment-method-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin: 15px 0;
}

.amount-display {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #e3f2fd;
  padding: 20px;
  border-radius: 8px;
  margin: 20px 0;
}

.amount-value {
  font-size: 32px;
  font-weight: 700;
  color: #1976d2;
}
```

### 🔄 Validaciones
- **paymentMethod:** Requerido

---

## 🔍 COMPONENTES LIST

---

## 1️⃣ client-list.component.ts

### 📍 Ubicación
`src/app/features/clients/client-list.component.ts`

### 📦 Material Imports
```typescript
MatTableModule           // Tabla de datos
MatPaginatorModule       // Paginación
MatSortModule           // Ordenamiento
MatFormFieldModule      // Campos de búsqueda
MatInputModule          // Input de búsqueda
MatButtonModule         // Botones (nuevo cliente)
MatIconModule           // Iconos
MatCardModule           // Contenedor
MatSnackBarModule       // Notificaciones
MatProgressSpinnerModule // Spinner
MatTooltipModule        // Tooltips en acciones
MatDialogModule         // Para dialogs
```

### 🏗️ Template Structure

#### **Búsqueda/Filtros (Actions Bar)**
```html
<div class="actions-bar">
  <mat-form-field appearance="outline" class="search-field">
    <mat-label>Buscar cliente</mat-label>
    <input matInput 
           [(ngModel)]="searchTerm"
           (ngModelChange)="onSearchChange($event)"
           placeholder="Buscar por nombre, DNI, email...">
    <mat-icon matPrefix>search</mat-icon>
  </mat-form-field>
  
  <button mat-raised-button color="primary" (click)="createClient()">
    <mat-icon>add</mat-icon>
    Nuevo Cliente
  </button>
</div>
```

**Características de búsqueda:**
- Búsqueda en tiempo real con RxJS Subject
- Debounce de 400ms
- Busca por: nombre, DNI, email
- ngModel binding bidireccional

#### **Tabla (MatTable)**
**Columnas:**
1. **fullName** - sort header
2. **dni** - sort header
3. **email** - sort header
4. **phone** - sort header
5. **vehiclesCount** - con badge visual (número de vehículos)
6. **actions** - botones (ver, editar, eliminar)

**Tabla styling:**
```html
<table mat-table [dataSource]="dataSource" matSort class="clients-table">
  <!-- Filas con matRowDef -->
  <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
  <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
  <!-- No data row -->
  <tr class="mat-row" *matNoDataRow>
    <td class="mat-cell" [attr.colspan]="displayedColumns.length">
      <div class="no-data">
        <mat-icon>info</mat-icon>
        <p>No se encontraron clientes</p>
      </div>
    </td>
  </tr>
</table>
```

#### **Paginación**
```html
<mat-paginator 
  [pageSizeOptions]="[10, 20, 50, 100]"
  [pageSize]="20"
  showFirstLastButtons>
</mat-paginator>
```

### 🎨 Estilos Clave
```scss
.page-container {
  padding: 24px 16px;
  max-width: 1400px;
  margin: 0 auto;
}

mat-card {
  border-radius: 12px !important;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1) !important;
  border: 1px solid #f0f0f0 !important;
  background: linear-gradient(135deg, #ffffff 0%, #f9fafb 100%) !important;
}

h1 {
  font-size: 24px;
  font-weight: 700;
  color: #212121;
  letter-spacing: -0.5px;
}

.actions-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  gap: 16px;
  flex-wrap: wrap;
}

.search-field {
  flex: 1;
  min-width: 280px;
  max-width: 500px;
}

.table-container {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.08);
  border: 1px solid #f0f0f0;
}

.clients-table ::ng-deep {
  .mat-mdc-header-cell {
    background: linear-gradient(135deg, #f5f7fa 0%, #f0f2f5 100%);
    font-weight: 700;
    color: #424242;
    border-bottom: 2px solid #e5e7eb;
    padding: 14px 16px !important;
  }

  .mat-mdc-cell {
    padding: 14px 16px !important;
    border-bottom: 1px solid #f0f0f0;
    color: #616161;
  }

  .mat-mdc-row:hover {
    background-color: #f9fafb;
  }
}

.vehicle-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
  color: white;
  border-radius: 16px;
  padding: 6px 14px;
  font-size: 0.875rem;
  font-weight: 600;
  min-width: 36px;
  box-shadow: 0 2px 4px rgba(25, 118, 210, 0.2);
}

.no-data {
  text-align: center;
  padding: 60px 20px;
  color: #757575;
  background: linear-gradient(135deg, #f9fafb 0%, #ffffff 100%);
}

@media (max-width: 768px) {
  .actions-bar {
    flex-direction: column;
    align-items: stretch;
  }

  .search-field {
    width: 100%;
  }
}
```

### 🔄 Características
- **MatSort:** Ordenamiento en encabezados
- **MatPaginator:** Paginación
- **debounceTime(400):** Optimización de búsqueda
- **Custom sorting:** Para fullName y vehiclesCount
- **MatDataSource:** Para gestión de datos

---

## 2️⃣ employee-list.component.ts

### 📍 Ubicación
`src/app/features/employees/employee-list.component.ts`

### 📦 Material Imports
```typescript
MatTableModule           // Tabla de empleados
MatPaginatorModule       // Paginación
MatButtonModule         // Botones
MatIconModule           // Iconos
MatSelectModule         // Dropdown de filtro de roles
MatFormFieldModule      // Campo de filtro
MatChipsModule          // Chips para roles y estado
MatSnackBarModule       // Notificaciones
MatDialogModule         // Dialogs
MatCardModule           // Contenedor
MatSlideToggleModule    // Toggle para activar/desactivar
MatTooltipModule        // Tooltips
```

### 🏗️ Template Structure

#### **Header + Botón Crear**
```html
<div class="header">
  <h1>Gestión de Empleados</h1>
  <button mat-raised-button color="primary" (click)="createEmployee()">
    <mat-icon>add</mat-icon>
    Nuevo Empleado
  </button>
</div>
```

#### **Filtros**
```html
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
```

**Características:**
- Filtro por rol (dropdown)
- Opciones: Todos, Operador, Administrador, Cajero
- Cambio en tiempo real con onRoleFilterChange()

#### **Tabla**
**Columnas:**
1. **fullName** - "FirstName LastName"
2. **email** - Email del empleado (o "N/A")
3. **role** - Mostrado como mat-chip
   - Opciones: OPERATOR, ADMIN, CASHIER
4. **status** - Estado activo/inactivo
   - Chips con colores: accent (activo), default (inactivo)
5. **actions** - Botones de acciones

**Acciones disponibles:**
```html
<div class="actions">
  <!-- Ver -->
  <button mat-icon-button color="primary" matTooltip="Ver detalles">
    <mat-icon>visibility</mat-icon>
  </button>
  
  <!-- Editar -->
  <button mat-icon-button color="accent" matTooltip="Editar">
    <mat-icon>edit</mat-icon>
  </button>
  
  <!-- Toggle Status (Activo/Inactivo) -->
  <mat-slide-toggle 
    [checked]="employee.active"
    (change)="toggleStatus(employee)"
    matTooltip="Desactivar/Activar"
    color="primary">
  </mat-slide-toggle>
  
  <!-- Eliminar -->
  <button mat-icon-button color="warn" matTooltip="Eliminar">
    <mat-icon>delete</mat-icon>
  </button>
</div>
```

#### **Paginación**
```html
<mat-paginator
  [length]="totalElements()"
  [pageSize]="pageSize()"
  [pageIndex]="pageIndex()"
  [pageSizeOptions]="[10, 20, 50]"
  (page)="onPageChange($event)"
  showFirstLastButtons>
</mat-paginator>
```

### 🎨 Estilos (Inferidos del código)
- **Layout**: Flexbox
- **Table styling**: Material Design estándar
- **Responsive**: Adaptable a dispositivos móviles
- **Status colors:**
  - Activo: mat-chip con color="accent"
  - Inactivo: mat-chip sin color

### 🔄 Características
- **Filtro de roles:** Select dropdown
- **Sistema de paginación:** Control total con signals
- **Toggle de estado:** Activar/desactivar empleados
- **Acciones rápidas:** Ver, editar, eliminar

---

## 3️⃣ service-list.component.ts

### 📍 Ubicación
`src/app/features/services/service-list.component.ts`

### 📦 Material Imports
```typescript
MatButtonModule         // Botones
MatCardModule           // Cards para mostrar órdenes
MatChipsModule          // Chips para estados
MatIconModule           // Iconos
MatProgressSpinnerModule // Spinner de carga
MatSnackBarModule       // Notificaciones
```

### 🏗️ Template Structure

#### **Header**
```html
<div class="header">
  <h1>Órdenes de Servicio</h1>
  <button mat-raised-button color="primary" (click)="createOrder()">
    <mat-icon>add</mat-icon>
    Nueva Orden
  </button>
</div>
```

#### **Layout de Cards (No tabla)**
```html
<div class="cards">
  @for (order of sortedOrders(); track order.id) {
    <mat-card>
      <mat-card-content>
        <!-- Card Header con número y estado -->
        <div class="card-header">
          <div>
            <div class="order-number">{{ order.orderNumber || order.id }}</div>
            <div class="meta">{{ order.vehicleLicensePlate }} · {{ order.serviceType }}</div>
          </div>
          <mat-chip [class]="'status-' + order.status">
            {{ order.status }}
          </mat-chip>
        </div>
        
        <!-- Detalles -->
        <div class="details">
          <span>Cliente: {{ order.clientId }}</span>
          <span>Precio: ${{ order.price }}</span>
        </div>
      </mat-card-content>
      
      <!-- Acciones -->
      <mat-card-actions>
        <button mat-button (click)="viewDetail(order)">Ver detalle</button>
        @if (order.status === ServiceStatus.PENDING) {
          <button mat-button color="primary" (click)="changeStatus(order, ServiceStatus.IN_PROGRESS)">
            Iniciar
          </button>
        }
        @if (order.status === ServiceStatus.IN_PROGRESS) {
          <button mat-button color="primary" (click)="changeStatus(order, ServiceStatus.COMPLETED)">
            Completar
          </button>
        }
        @if (order.status === ServiceStatus.COMPLETED) {
          <button mat-button color="primary" (click)="changeStatus(order, ServiceStatus.DELIVERED)">
            Entregar
          </button>
        }
      </mat-card-actions>
    </mat-card>
  } @empty {
    <mat-card><mat-card-content>No hay órdenes de servicio.</mat-card-content></mat-card>
  }
</div>
```

### 🎨 Estilos Clave
```scss
.page-container {
  padding: 1.5rem;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.cards {
  display: grid;
  gap: 1rem;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.order-number {
  font-weight: 600;
}

.meta {
  color: #666;
  font-size: 0.9rem;
}

.details {
  margin-top: 0.75rem;
  display: flex;
  gap: 1rem;
  color: #444;
  font-size: 0.9rem;
}

/* Status Chips */
.status-PENDING {
  background-color: #fff3cd;
  color: #856404;
}

.status-IN_PROGRESS {
  background-color: #cfe2ff;
  color: #084298;
}

.status-COMPLETED {
  background-color: #d1e7dd;
  color: #0f5132;
}

.status-DELIVERED {
  background-color: #d3d3d3;
  color: #383838;
}
```

### 🔄 Características
- **Layout: Card-based** (no tabla)
- **Estados dinámicos:** Cambian botones según estado de la orden
- **Flujo de estados:**
  - PENDING → IN_PROGRESS
  - IN_PROGRESS → COMPLETED
  - COMPLETED → DELIVERED
- **Sorting:** Ordenadas por fecha de creación (más recientes primero)

---

## 4️⃣ invoice-list.component.ts

### 📍 Ubicación
`src/app/features/billing/invoice-list.component.ts`

### 📦 Material Imports
```typescript
MatCardModule            // Contenedor principal
MatTableModule           // Tabla de facturas
MatPaginatorModule       // Paginación
MatButtonModule         // Botones
MatIconModule           // Iconos
MatFormFieldModule      // Campos de filtro
MatSelectModule         // Dropdown de método de pago
MatDatepickerModule     // Rango de fechas
MatNativeDateModule     // Formato de fechas
MatInputModule          // Inputs
MatProgressSpinnerModule // Spinner
```

### 🏗️ Template Structure

#### **Filtros**
```html
<form [formGroup]="filterForm" class="filters">
  <!-- Date Range Picker -->
  <mat-form-field appearance="outline">
    <mat-label>Rango de Fechas</mat-label>
    <mat-date-range-input [rangePicker]="picker">
      <input matStartDate formControlName="fromDate" placeholder="Fecha inicio">
      <input matEndDate formControlName="toDate" placeholder="Fecha fin">
    </mat-date-range-input>
    <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
    <mat-date-range-picker #picker></mat-date-range-picker>
  </mat-form-field>

  <!-- Payment Method Filter -->
  <mat-form-field appearance="outline">
    <mat-label>Método de Pago</mat-label>
    <mat-select formControlName="paymentMethod">
      <mat-option value="">Todos</mat-option>
      <mat-option value="CASH">Efectivo</mat-option>
      <mat-option value="CARD">Tarjeta</mat-option>
      <mat-option value="TRANSFER">Transferencia</mat-option>
    </mat-select>
  </mat-form-field>

  <!-- Filter Actions -->
  <div class="filter-actions">
    <button mat-raised-button color="primary" (click)="applyFilters()">
      Filtrar
    </button>
    <button mat-button (click)="clearFilters()">
      Limpiar
    </button>
  </div>
</form>
```

**Características de filtros:**
- **Date Range Picker:** Rango de fechas con calendar
- **Payment Method Select:** Dropdown con opciones (CASH, CARD, TRANSFER)
- **Botones:** Aplicar filtros y limpiar

#### **Tabla**
**Columnas:**
1. **invoiceNumber** - Número de factura
2. **issuedAt** - Fecha y hora (formato: dd/MM/yyyy HH:mm)
3. **client** - Nombre del cliente
4. **amount** - Monto (con pipe number)
5. **paymentMethod** - Método de pago (label legible)
6. **paymentStatus** - Estado (PENDING, PAID, CANCELLED)
7. **actions** - Botones (ver ticket)

**Table markup:**
```html
<table mat-table [dataSource]="invoices()" class="invoice-table">
  <!-- Columnas definidas con ng-container -->
  <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
  <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
</table>
```

**Styling para columnas:**
```html
<!-- Amount Cell -->
<td mat-cell *matCellDef="let invoice" class="amount-cell">
  \${{ invoice.amount?.toFixed(2) }}
</td>

<!-- Status Badge -->
<td mat-cell *matCellDef="let invoice">
  <span [class]="'status-badge status-' + invoice.paymentStatus?.toLowerCase()">
    {{ getStatusLabel(invoice.paymentStatus) }}
  </span>
</td>
```

#### **Paginación**
Sin ViewChild, controlada por componente

### 🎨 Estilos (Inferidos)
- **Filters layout:** Flexbox horizontal
- **Status badges:** Clases dinámicas basadas en paymentStatus
- **Amount styling:** Display especial con currency
- **Table styling:** Material Design estándar

### 🔄 Características
- **Filtro de rango de fechas:** MatDateRangePicker
- **Filtro de método de pago:** Select dropdown
- **Estados de pago:** PENDING, PAID, CANCELLED
- **Acciones:** Ver ticket (receipt icon)

---

## 📊 Tabla Comparativa de Form Fields

| Componente | appearance | Icons | Validaciones | Layout |
|---|---|---|---|---|
| **client-form** | outline | Mínimos | Muchas | Secciones + grid |
| **employee-form** | outline | Mínimos | Moderadas | Grid 2 cols |
| **vehicle-form** | outline | Sí (5) | Moderadas | Grid 2 cols |
| **service-order-form** | default | No | Moderadas | Flex column |
| **invoice-form** | outline | No | Mínimas | Summary + form |

---

## 🎨 Patrones de Estilos Comunes

### Grid Responsivo
```scss
.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}
```

### Gradient Headers
```scss
.mat-mdc-header-cell {
  background: linear-gradient(135deg, #f5f7fa 0%, #f0f2f5 100%);
  font-weight: 700;
  color: #424242;
  border-bottom: 2px solid #e5e7eb;
}
```

### Card Highlight
```scss
.vehicle-badge, .summary-item.amount .value {
  background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
  color: white;
  border-radius: 16px;
  padding: 6px 14px;
  font-weight: 600;
  box-shadow: 0 2px 4px rgba(25, 118, 210, 0.2);
}
```

---

## 🔐 Material Design Components Utilizados

### Form Controls
- ✅ `mat-form-field` (appearance: outline)
- ✅ `matInput` (text, email, number)
- ✅ `matSelect` (dropdowns)
- ✅ `matAutocomplete` (search)
- ✅ `mat-radio-button` (invoice)
- ✅ `matSuffix` / `matPrefix` (icons en inputs)

### Data Display
- ✅ `mat-table` (client, employee, invoice)
- ✅ `mat-paginator` (paginación)
- ✅ `matSort` (ordenamiento)
- ✅ `mat-chip` (badges de estado)
- ✅ `mat-card` (contenedores)

### Actions
- ✅ `mat-button` (texto)
- ✅ `mat-raised-button` (color, primary, accent, warn)
- ✅ `mat-icon-button` (acciones)

### Feedback
- ✅ `mat-error` (validaciones)
- ✅ `mat-hint` (ayuda)
- ✅ `mat-spinner` (carga)
- ✅`MatSnackBar` (notificaciones)
- ✅ `matTooltip` (tooltips)

### Other
- ✅ `mat-dialog` (vehicle-form)
- ✅ `mat-divider` (separadores)
- ✅ `mat-slide-toggle` (activar/desactivar)
- ✅ `mat-date-range-picker` (intervalos de fechas)

---

## 📝 Validaciones Comunes

### Validators Utilizados
```typescript
Validators.required          // Campo obligatorio
Validators.email            // Email válido
Validators.minLength(n)     // Mínimo de caracteres
Validators.min(n)           // Valor mínimo
Validators.max(n)           // Valor máximo
Validators.pattern(regex)   // Patrón regex
```

### Validaciones por Campo
- **Text inputs:** required, minLength
- **Emails:** required, email
- **Numbers:** required, min, max
- **Selects:** required
- **Patrones:** licensePlate (vehicle)

---

## 🚀 Patrones de RxJS

### Búsqueda con Debounce
```typescript
this.searchSubject.pipe(
  debounceTime(400),
  distinctUntilChanged(),
  switchMap(term => this.service.search(term))
).subscribe(results => { /* ... */ });
```

### Client Autocomplete
```typescript
this.orderForm.get('clientSearch')?.valueChanges.pipe(
  debounceTime(300),
  distinctUntilChanged(),
  switchMap(term => {
    if (term.length >= 2) {
      return this.clientService.searchClients(term);
    }
    return of([]);
  })
).subscribe(clients => {
  this.filteredClients.set(clients);
});
```

---

## 💡 Resumen de Hallazgos

### ✅ Fortalezas
1. **Consistencia:** Todos usan Material Design
2. **Validaciones:** Bien implementadas con mensajes de error
3. **Responsividad:** Grid systems adaptativos
4. **UX:** Iconos prefijos, hints, tooltips
5. **Accesibilidad:** Labels, aria hints, keyboard navigation

### 📌 Patrones Identificados
1. **Appearance:** Todos usan `outline`
2. **Layout:** Grid responsivo para múltiples campos
3. **Sidebars:** Búsqueda y filtros en barras superiores
4. **Paginación:** MatPaginator en listas
5. **Estados:** Chips/badges para indicar estatus

### 🔄 Componentes Reutilizables
- `EmployeeSelectorComponent` (custom)
- Material Design standard components

