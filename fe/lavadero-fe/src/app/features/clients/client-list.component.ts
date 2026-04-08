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
                     placeholder="Buscar por nombre, DNI, email...">
              <mat-icon matPrefix>search</mat-icon>
            </mat-form-field>
            
            <button mat-raised-button color="primary" (click)="createClient()">
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
                    <button mat-icon-button 
                            color="primary" 
                            (click)="viewClient(client.id)"
                            matTooltip="Ver detalles">
                      <mat-icon>visibility</mat-icon>
                    </button>
                    <button mat-icon-button 
                            color="accent" 
                            (click)="editClient(client.id)"
                            matTooltip="Editar">
                      <mat-icon>edit</mat-icon>
                    </button>
                    <button mat-icon-button 
                            color="warn" 
                            (click)="deleteClient(client)"
                            matTooltip="Eliminar">
                      <mat-icon>delete</mat-icon>
                    </button>
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
      padding: 2rem;
      max-width: 1400px;
      margin: 0 auto;
    }

    mat-card {
      margin-bottom: 1rem;
    }

    mat-card-header {
      margin-bottom: 1rem;
    }

    h1 {
      margin: 0;
      font-size: 1.75rem;
      font-weight: 500;
    }

    .actions-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .search-field {
      flex: 1;
      min-width: 300px;
      max-width: 500px;
    }

    .loading-container {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 4rem;
    }

    .table-container {
      overflow-x: auto;
    }

    .clients-table {
      width: 100%;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .clients-table th {
      background-color: #f5f5f5;
      font-weight: 600;
    }

    .vehicle-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background-color: #3f51b5;
      color: white;
      border-radius: 12px;
      padding: 4px 12px;
      font-size: 0.875rem;
      font-weight: 500;
      min-width: 30px;
    }

    .no-data {
      text-align: center;
      padding: 3rem;
      color: rgba(0,0,0,0.54);
    }

    .no-data mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 1rem;
    }

    .no-data p {
      margin: 0;
      font-size: 1.1rem;
    }

    @media (max-width: 768px) {
      .page-container {
        padding: 1rem;
      }

      .actions-bar {
        flex-direction: column;
        align-items: stretch;
      }

      .search-field {
        max-width: 100%;
      }

      button[mat-raised-button] {
        width: 100%;
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
