<!-- Componentes Reconstruidos - Ejemplos de Implementación -->

# 📦 Componentes Reutilizables - Ejemplos

## 1. Data Table Mejorada

```typescript
// Usar con Material Table
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';

@Component({
  imports: [MatTableModule, MatPaginatorModule, MatSortModule]
})
export class ClientListComponent {
  displayedColumns: string[] = ['id', 'name', 'email', 'phone', 'actions'];
  
  constructor(private clientService: ClientService) {}
}
```

**Template HTML:**
```html
<div class="table-container">
  <table mat-table [dataSource]="dataSource" matSort class="data-table">
    <!-- ID Column -->
    <ng-container matColumnDef="id">
      <th mat-header-cell *matHeaderCellDef mat-sort-header>ID</th>
      <td mat-cell *matCellDef="let element">{{ element.id }}</td>
    </ng-container>

    <!-- Name Column -->
    <ng-container matColumnDef="name">
      <th mat-header-cell *matHeaderCellDef mat-sort-header>Nombre</th>
      <td mat-cell *matCellDef="let element">
        <strong>{{ element.firstName }} {{ element.lastName }}</strong>
      </td>
    </ng-container>

    <!-- Actions Column -->
    <ng-container matColumnDef="actions">
      <th mat-header-cell *matHeaderCellDef>Acciones</th>
      <td mat-cell *matCellDef="let element">
        <button mat-icon-button matTooltip="Editar" (click)="edit(element)">
          <mat-icon>edit</mat-icon>
        </button>
        <button mat-icon-button matTooltip="Eliminar" (click)="delete(element)">
          <mat-icon color="warn">delete</mat-icon>
        </button>
      </td>
    </ng-container>

    <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
    <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
  </table>

  <mat-paginator [pageSizeOptions]="[5, 10, 25, 100]" showFirstLastButtons></mat-paginator>
</div>
```

**Estilos:**
```scss
.table-container {
  background: white;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  overflow: hidden;
}

table.data-table {
  width: 100%;
  
  thead {
    background-color: var(--gray-100);
    
    th {
      font-weight: 600;
      color: var(--gray-700);
      padding: 16px !important;
    }
  }
  
  tbody tr {
    border-bottom: 1px solid var(--gray-200);
    transition: background-color 0.2s ease;
    
    &:hover {
      background-color: var(--gray-50);
    }
    
    td {
      padding: 12px 16px !important;
      color: var(--gray-800);
    }
  }
}
```

---

## 2. Tarjeta de Estadísticas

```typescript
@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="stat-card" [class]="'stat-' + type">
      <div class="stat-icon">
        <mat-icon>{{ icon }}</mat-icon>
      </div>
      <div class="stat-content">
        <p class="stat-label">{{ label }}</p>
        <h3 class="stat-value">{{ value | number }}</h3>
        <small class="stat-change" [class.positive]="changeIsPositive">
          <mat-icon>{{ changeIsPositive ? 'trending_up' : 'trending_down' }}</mat-icon>
          {{ changePct }}% vs mes anterior
        </small>
      </div>
    </div>
  `,
  styles: [`
    .stat-card {
      background: white;
      border-radius: var(--radius-lg);
      padding: var(--spacing-lg);
      display: flex;
      gap: var(--spacing-lg);
      box-shadow: var(--shadow-md);
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-4px);
        box-shadow: var(--shadow-lg);
      }

      &.stat-primary .stat-icon {
        background: rgba(25, 118, 210, 0.1);
        color: var(--primary);
      }

      &.stat-success .stat-icon {
        background: rgba(76, 175, 80, 0.1);
        color: var(--success);
      }

      &.stat-warning .stat-icon {
        background: rgba(255, 152, 0, 0.1);
        color: var(--warning);
      }

      &.stat-danger .stat-icon {
        background: rgba(244, 67, 54, 0.1);
        color: var(--danger);
      }
    }

    .stat-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 56px;
      height: 56px;
      border-radius: 50%;
      flex-shrink: 0;

      mat-icon {
        font-size: 28px !important;
        width: 28px !important;
        height: 28px !important;
      }
    }

    .stat-content {
      flex: 1;
    }

    .stat-label {
      font-size: 0.9rem;
      color: var(--gray-600);
      margin: 0;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-weight: 600;
    }

    .stat-value {
      font-size: 2rem;
      font-weight: 700;
      margin: 8px 0;
      color: var(--gray-900);
    }

    .stat-change {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 0.85rem;
      color: var(--danger);

      &.positive {
        color: var(--success);
      }

      mat-icon {
        font-size: 16px !important;
        width: 16px !important;
        height: 16px !important;
      }
    }
  `]
})
export class StatCardComponent {
  @Input() icon: string = 'trending_up';
  @Input() label: string = 'Métrica';
  @Input() value: number = 0;
  @Input() changePct: number = 0;
  @Input() type: 'primary' | 'success' | 'warning' | 'danger' = 'primary';

  changeIsPositive = computed(() => this.changePct >= 0);
}
```

---

## 3. Modal de Confirmación

```typescript
import { MatDialogModule, MatDialog } from '@angular/material/dialog';

// En cualquier componente:
constructor(private dialog: MatDialog) {}

deleteItem(id: number): void {
  this.dialog.open(ConfirmDialogComponent, {
    width: '400px',
    data: {
      title: '¿Eliminar elemento?',
      message: '¿Estás seguro de que deseas eliminar este elemento?',
      confirmText: 'Eliminar',
      cancelText: 'Cancelar'
    }
  }).afterClosed().subscribe(result => {
    if (result) {
      // Proceder con eliminación
    }
  });
}
```

---

## 4. Logo Animado con Loader

```typescript
@Component({
  selector: 'app-logo-loader',
  template: `
    <div class="logo-loader">
      <div class="spinner"></div>
      <mat-icon class="logo-icon">local_car_wash</mat-icon>
    </div>
  `,
  styles: [`
    .logo-loader {
      position: relative;
      width: 80px;
      height: 80px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .spinner {
      position: absolute;
      width: 100%;
      height: 100%;
      border: 3px solid rgba(25, 118, 210, 0.1);
      border-top-color: var(--primary);
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    .logo-icon {
      font-size: 48px !important;
      width: 48px !important;
      height: 48px !important;
      color: var(--primary);
      z-index: 1;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `]
})
export class LogoLoaderComponent {}
```

---

## 5. Formulario Mejorado

```typescript
// Estructura de formulario con validación visual
<form [formGroup]="form" (ngSubmit)="submit()" class="form-improved">
  <div class="form-section">
    <h3>Información Personal</h3>
    
    <div class="form-grid">
      <mat-form-field appearance="outline">
        <mat-label>Nombre</mat-label>
        <input matInput formControlName="firstName">
        <mat-icon matPrefix>person</mat-icon>
        @if (getError('firstName')) {
          <mat-error>{{ getError('firstName') }}</mat-error>
        }
      </mat-form-field>

      <mat-form-field appearance="outline">
        <mat-label>Email</mat-label>
        <input matInput type="email" formControlName="email">
        <mat-icon matPrefix>mail</mat-icon>
        @if (getError('email')) {
          <mat-error>{{ getError('email') }}</mat-error>
        }
      </mat-form-field>
    </div>
  </div>

  <div class="form-actions">
    <button mat-raised-button color="primary" type="submit">
      <mat-icon>save</mat-icon>
      <span>Guardar</span>
    </button>
    <button mat-stroked-button type="button" (click)="cancel()">
      <mat-icon>close</mat-icon>
      <span>Cancelar</span>
    </button>
  </div>
</form>
```

**Estilos:**
```scss
.form-improved {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);

  h3 {
    color: var(--gray-900);
    margin: 0;
    padding-bottom: var(--spacing-md);
    border-bottom: 2px solid var(--gray-200);
  }
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--spacing-lg);
}

.form-actions {
  display: flex;
  gap: var(--spacing-md);
  justify-content: flex-end;
  margin-top: var(--spacing-lg);
  padding-top: var(--spacing-lg);
  border-top: 1px solid var(--gray-200);
}
```

---

## 6. Empty State

```typescript
@Component({
  selector: 'app-empty-state',
  template: `
    <div class="empty-state">
      <div class="empty-icon">
        <mat-icon>{{ icon }}</mat-icon>
      </div>
      <h3>{{ title }}</h3>
      <p>{{ message }}</p>
      <button mat-raised-button color="primary" (click)="action()">
        <mat-icon>add</mat-icon>
        <span>{{ actionText }}</span>
      </button>
    </div>
  `,
  styles: [`
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: var(--spacing-2xl);
      text-align: center;
      min-height: 400px;
      color: var(--gray-600);
    }

    .empty-icon {
      font-size: 80px;
      margin-bottom: var(--spacing-lg);
      opacity: 0.5;

      mat-icon {
        font-size: 80px !important;
        width: 80px !important;
        height: 80px !important;
      }
    }

    h3 {
      font-size: 1.5rem;
      color: var(--gray-900);
      margin-bottom: var(--spacing-sm);
    }

    p {
      margin-bottom: var(--spacing-lg);
      max-width: 400px;
    }
  `]
})
export class EmptyStateComponent {
  @Input() icon: string = 'folder_off';
  @Input() title: string = 'Sin datos';
  @Input() message: string = 'No hay elementos para mostrar';
  @Input() actionText: string = 'Crear nuevo';
  @Output() actionClick = new EventEmitter();

  action() {
    this.actionClick.emit();
  }
}
```

---

## 7. Notificaciones/Toasts

```typescript
// En tu componente
constructor(private snackBar: MatSnackBar) {}

showSuccess(message: string) {
  this.snackBar.open(message, '×', {
    duration: 3000,
    horizontalPosition: 'end',
    verticalPosition: 'top',
    panelClass: ['snackbar-success']
  });
}

showError(message: string) {
  this.snackBar.open(message, '×', {
    duration: 5000,
    horizontalPosition: 'end',
    verticalPosition: 'top',
    panelClass: ['snackbar-error']
  });
}
```

**Estilos (en styles.scss):**
```scss
.snackbar-success {
  background-color: var(--success) !important;
  color: white !important;
}

.snackbar-error {
  background-color: var(--danger) !important;
  color: white !important;
}
```

---

Estos ejemplos pueden reutilizarse en todos tus componentes actuales.
Todos siguen la paleta de colores y sistema de espaciado definido.
