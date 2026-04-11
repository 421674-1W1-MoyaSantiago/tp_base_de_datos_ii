import { Component, inject, OnInit, ViewChild, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ClientService } from '../../core/services/client.service';
import { Client } from '../../core/models/models';
import { debounceTime, Subject } from 'rxjs';

@Component({
  selector: 'app-client-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatDialogModule
  ],
  template: `
    <div class="page-container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>
            <h1>Gestión de Clientes</h1>
          </mat-card-title>
        </mat-card-header>
        
        <mat-card-content>
          <!-- Search and Actions Bar -->
          <div class="actions-bar">
            <mat-form-field appearance="outline" class="search-field">
              <mat-label>Buscar cliente</mat-label>
              <input matInput 
                     [(ngModel)]="searchTerm"
                     (ngModelChange)="onSearchChange($event)"
                     placeholder="Nombre, DNI, email...">
              <mat-icon matPrefix>search</mat-icon>
            </mat-form-field>
            
            <button mat-raised-button color="primary" class="new-client-btn" (click)="createClient()">
              <mat-icon>add</mat-icon>
              Nuevo Cliente
            </button>
          </div>

          <!-- Loading Spinner -->
          @if (loading()) {
            <div class="loading-container">
              <mat-spinner></mat-spinner>
            </div>
          }

          <!-- Table -->
          @if (!loading()) {
            <div class="table-container">
              <table mat-table [dataSource]="dataSource" matSort class="clients-table">
                
                <!-- Full Name Column -->
                <ng-container matColumnDef="fullName">
                  <th mat-header-cell *matHeaderCellDef mat-sort-header>Nombre Completo</th>
                  <td mat-cell *matCellDef="let client">
                    {{ client.firstName }} {{ client.lastName }}
                  </td>
                </ng-container>

                <!-- DNI Column -->
                <ng-container matColumnDef="dni">
                  <th mat-header-cell *matHeaderCellDef mat-sort-header>DNI</th>
                  <td mat-cell *matCellDef="let client">{{ client.dni }}</td>
                </ng-container>

                <!-- Email Column -->
                <ng-container matColumnDef="email">
                  <th mat-header-cell *matHeaderCellDef mat-sort-header>Email</th>
                  <td mat-cell *matCellDef="let client">{{ client.email }}</td>
                </ng-container>

                <!-- Phone Column -->
                <ng-container matColumnDef="phone">
                  <th mat-header-cell *matHeaderCellDef mat-sort-header>Teléfono</th>
                  <td mat-cell *matCellDef="let client">{{ client.phone || '-' }}</td>
                </ng-container>

                <!-- Vehicles Count Column -->
                <ng-container matColumnDef="vehiclesCount">
                  <th mat-header-cell *matHeaderCellDef mat-sort-header># Vehículos</th>
                  <td mat-cell *matCellDef="let client">
                    <span class="vehicle-badge">{{ client.vehicles?.length || 0 }}</span>
                  </td>
                </ng-container>

                <!-- Actions Column -->
                <ng-container matColumnDef="actions">
                  <th mat-header-cell *matHeaderCellDef>Acciones</th>
                  <td mat-cell *matCellDef="let client">
                    <div class="actions">
                      <button mat-icon-button
                              class="action-icon-btn action-view"
                              (click)="viewClient(client.id)"
                              matTooltip="Ver detalles">
                        <mat-icon>visibility</mat-icon>
                      </button>
                      <button mat-icon-button
                              class="action-icon-btn action-edit"
                              (click)="editClient(client.id)"
                              matTooltip="Editar">
                        <mat-icon>edit</mat-icon>
                      </button>
                      <button mat-icon-button
                              class="action-icon-btn action-delete"
                              (click)="deleteClient(client)"
                              matTooltip="Eliminar">
                        <mat-icon>delete</mat-icon>
                      </button>
                    </div>
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>

                <!-- No Data Row -->
                <tr class="mat-row" *matNoDataRow>
                  <td class="mat-cell" [attr.colspan]="displayedColumns.length">
                    <div class="no-data">
                      <mat-icon>info</mat-icon>
                      <p>No se encontraron clientes</p>
                    </div>
                  </td>
                </tr>
              </table>

              <mat-paginator 
                [pageSizeOptions]="[10, 20, 50, 100]"
                [pageSize]="20"
                showFirstLastButtons>
              </mat-paginator>
            </div>
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

    mat-card {
      border-radius: 12px !important;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06) !important;
      border: 1px solid #f0f0f0 !important;
      margin-bottom: 0;
      background: linear-gradient(135deg, #ffffff 0%, #f9fafb 100%) !important;
    }

    mat-card-header {
      margin-bottom: 20px;
      padding-bottom: 20px;
      border-bottom: 1px solid #f0f0f0;
    }

    h1 {
      margin: 0;
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

    .new-client-btn {
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
    }

    .new-client-btn mat-icon {
      color: #ffffff !important;
      margin-right: 8px !important;
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .new-client-btn:hover {
      background: linear-gradient(135deg, #1e88e5 0%, #1976d2 100%) !important;
      border-color: rgba(21, 101, 192, 0.55) !important;
      box-shadow: 0 10px 20px rgba(25, 118, 210, 0.35) !important;
      transform: translateY(-1px);
    }

    .new-client-btn:active {
      transform: translateY(0);
      box-shadow: 0 4px 10px rgba(25, 118, 210, 0.25) !important;
    }

    .new-client-btn:focus-visible {
      outline: 3px solid rgba(25, 118, 210, 0.25);
      outline-offset: 2px;
    }
    
    .search-field ::ng-deep {
      .mat-mdc-text-field-wrapper {
        border: 1px solid #f0f0f0;
        background: linear-gradient(135deg, #ffffff 0%, #fcfdfe 100%);
        border-radius: 10px;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
        padding: 8px 14px !important;
      }
      
      .mat-mdc-text-field-wrapper:hover {
        border-color: #e5e7eb;
        box-shadow: 0 6px 14px rgba(0, 0, 0, 0.1), inset 0 1px 2px rgba(0, 0, 0, 0.02);
        background: linear-gradient(135deg, #fafbfc 0%, #f8fafc 100%);
      }
      
      &.mat-focused .mat-mdc-text-field-wrapper {
        border-color: #1976d2;
        border-width: 1px;
        box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.12), 0 6px 20px rgba(25, 118, 210, 0.25);
        background: linear-gradient(135deg, #f0f7ff 0%, #f8fafc 100%);
      }
      
      mat-label {
        color: #4b5563 !important;
        font-weight: 600;
        font-size: 0.9rem !important;
        letter-spacing: 0.4px;
      }
      
      mat-icon {
        color: #1976d2 !important;
        margin-right: 8px !important;
      }
      
      .mat-mdc-input-element {
        font-weight: 500;
        letter-spacing: 0.3px;
        opacity: 1 !important;
        visibility: visible !important;
        color: var(--gray-900) !important;
      }
    }

    .loading-container {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 60px 20px;
      min-height: 400px;
    }

    .table-container {
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.08);
      border: 1px solid #f0f0f0;
    }

    .clients-table {
      width: 100%;
      background: white;
      border-collapse: collapse;
    }

    .clients-table ::ng-deep {
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
      letter-spacing: 0.5px;
    }

    .actions {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
      width: 100%;
      justify-content: center;
    }

    .clients-table ::ng-deep .mat-column-actions {
      text-align: center;
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

    .no-data {
      text-align: center;
      padding: 60px 20px;
      color: #757575;
      background: linear-gradient(135deg, #f9fafb 0%, #ffffff 100%);
    }

    .no-data mat-icon {
      font-size: 56px;
      width: 56px;
      height: 56px;
      margin-bottom: 16px;
      color: #bdbdbd;
      opacity: 0.6;
    }

    .no-data p {
      margin: 0;
      font-size: 1.1rem;
      font-weight: 500;
      color: #616161;
    }

    ::ng-deep .mat-mdc-paginator {
      background: linear-gradient(135deg, #f9fafb 0%, #f5f7fa 100%);
      border-top: 1px solid #f0f0f0;
    }

    @media (max-width: 768px) {
      .page-container {
        padding: 16px;
      }

      .actions-bar {
        flex-direction: column;
        align-items: stretch;
        gap: 12px;
      }

      .search-field {
        max-width: 100%;
        width: 100%;
      }

      button[mat-raised-button] {
        width: 100%;
      }

      .new-client-btn {
        justify-content: center;
      }

      .clients-table ::ng-deep {
        .mat-mdc-header-cell,
        .mat-mdc-cell {
          padding: 12px 8px !important;
          font-size: 0.9rem !important;
        }
      }

      .actions {
        gap: 6px;
      }
    }
  `]
})
export class ClientListComponent implements OnInit {
  private clientService = inject(ClientService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = ['fullName', 'dni', 'email', 'phone', 'vehiclesCount', 'actions'];
  dataSource = new MatTableDataSource<Client>([]);
  loading = signal(false);
  searchTerm = '';
  private searchSubject = new Subject<string>();

  ngOnInit(): void {
    this.loadClients();
    
    // Setup search with debounce
    this.searchSubject.pipe(debounceTime(400)).subscribe(term => {
      if (term.trim()) {
        this.searchClients(term);
      } else {
        this.loadClients();
      }
    });
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    
    // Custom sort for full name
    this.dataSource.sortingDataAccessor = (client, property) => {
      switch (property) {
        case 'fullName':
          return `${client.firstName} ${client.lastName}`.toLowerCase();
        case 'vehiclesCount':
          return client.vehicles?.length || 0;
        default:
          return (client as any)[property];
      }
    };
  }

  loadClients(): void {
    this.loading.set(true);
    this.clientService.getClients(0, 100).subscribe({
      next: (response) => {
        const clients = response.content || response;
        this.dataSource.data = clients;
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading clients:', error);
        this.snackBar.open('Error al cargar los clientes', 'Cerrar', { duration: 3000 });
        this.loading.set(false);
      }
    });
  }

  onSearchChange(term: string): void {
    this.searchSubject.next(term);
  }

  searchClients(term: string): void {
    this.loading.set(true);
    this.clientService.searchClients(term).subscribe({
      next: (clients) => {
        this.dataSource.data = clients;
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error searching clients:', error);
        this.snackBar.open('Error al buscar clientes', 'Cerrar', { duration: 3000 });
        this.loading.set(false);
      }
    });
  }

  createClient(): void {
    this.router.navigate(['/dashboard', 'clients', 'new']);
  }

  viewClient(id: string | undefined): void {
    if (id) {
      this.router.navigate(['/dashboard', 'clients', id]);
    }
  }

  editClient(id: string | undefined): void {
    if (id) {
      this.router.navigate(['/dashboard', 'clients', id, 'edit']);
    }
  }

  deleteClient(client: Client): void {
    if (!client.id) return;

    const confirmed = confirm(`¿Está seguro de eliminar al cliente ${client.firstName} ${client.lastName}?`);
    if (confirmed) {
      this.clientService.deleteClient(client.id).subscribe({
        next: () => {
          this.snackBar.open('Cliente eliminado exitosamente', 'Cerrar', { duration: 3000 });
          this.loadClients();
        },
        error: (error) => {
          console.error('Error deleting client:', error);
          this.snackBar.open('Error al eliminar el cliente', 'Cerrar', { duration: 3000 });
        }
      });
    }
  }
}
