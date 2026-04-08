import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipSet, MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { ClientService } from '../../core/services/client.service';
import { WashService } from '../../core/services/wash.service';
import { Client, ServiceOrder, Vehicle } from '../../core/models/models';

@Component({
  selector: 'app-client-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatTabsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDividerModule,
    MatListModule
  ],
  template: `
    <div class="page-container">
      @if (loading()) {
        <div class="loading-container">
          <mat-spinner></mat-spinner>
        </div>
      }

      @if (!loading() && client()) {
        <mat-card class="header-card">
          <mat-card-header>
            <div class="header-content">
              <div class="title-section">
                <h1>{{ client()!.firstName }} {{ client()!.lastName }}</h1>
                <div class="subtitle">
                  <mat-icon>badge</mat-icon>
                  <span>DNI: {{ client()!.dni }}</span>
                </div>
              </div>
              <div class="actions">
                <button mat-raised-button color="accent" (click)="editClient()">
                  <mat-icon>edit</mat-icon>
                  Editar
                </button>
                <button mat-raised-button (click)="goBack()">
                  <mat-icon>arrow_back</mat-icon>
                  Volver
                </button>
              </div>
            </div>
          </mat-card-header>
        </mat-card>

        <mat-card>
          <mat-card-content>
            <mat-tab-group>
              <!-- Personal Info Tab -->
              <mat-tab label="Información Personal">
                <div class="tab-content">
                  <div class="info-section">
                    <h2>Datos Personales</h2>
                    <mat-divider></mat-divider>
                    
                    <div class="info-grid">
                      <div class="info-item">
                        <mat-icon>person</mat-icon>
                        <div class="info-details">
                          <span class="label">Nombre Completo</span>
                          <span class="value">{{ client()!.firstName }} {{ client()!.lastName }}</span>
                        </div>
                      </div>

                      <div class="info-item">
                        <mat-icon>badge</mat-icon>
                        <div class="info-details">
                          <span class="label">DNI</span>
                          <span class="value">{{ client()!.dni }}</span>
                        </div>
                      </div>

                      <div class="info-item">
                        <mat-icon>email</mat-icon>
                        <div class="info-details">
                          <span class="label">Email</span>
                          <span class="value">{{ client()!.email }}</span>
                        </div>
                      </div>

                      <div class="info-item">
                        <mat-icon>phone</mat-icon>
                        <div class="info-details">
                          <span class="label">Teléfono</span>
                          <span class="value">{{ client()!.phone || 'No especificado' }}</span>
                        </div>
                      </div>

                      <div class="info-item">
                        <mat-icon>calendar_today</mat-icon>
                        <div class="info-details">
                          <span class="label">Cliente desde</span>
                          <span class="value">{{ formatDate(client()!.createdAt) }}</span>
                        </div>
                      </div>

                      <div class="info-item">
                        <mat-icon>update</mat-icon>
                        <div class="info-details">
                          <span class="label">Última actualización</span>
                          <span class="value">{{ formatDate(client()!.updatedAt) }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </mat-tab>

              <!-- Vehicles Tab -->
              <mat-tab label="Vehículos">
                <div class="tab-content">
                  <div class="info-section">
                    <div class="section-header">
                      <h2>Vehículos Registrados</h2>
                      <button mat-raised-button color="primary" (click)="addVehicle()">
                        <mat-icon>add</mat-icon>
                        Agregar Vehículo
                      </button>
                    </div>
                    <mat-divider></mat-divider>

                    @if (!client()!.vehicles || client()!.vehicles.length === 0) {
                      <div class="no-data">
                        <mat-icon>directions_car</mat-icon>
                        <p>No hay vehículos registrados para este cliente</p>
                      </div>
                    }

                    @if (client()!.vehicles && client()!.vehicles.length > 0) {
                      <div class="vehicles-grid">
                        @for (vehicle of client()!.vehicles; track vehicle.licensePlate) {
                          <mat-card class="vehicle-card">
                            <mat-card-content>
                              <div class="vehicle-header">
                                <mat-icon color="primary">directions_car</mat-icon>
                                <h3>{{ vehicle.licensePlate }}</h3>
                              </div>
                              <mat-divider></mat-divider>
                              <div class="vehicle-details">
                                <div class="detail-row">
                                  <span class="label">Marca:</span>
                                  <span class="value">{{ vehicle.brand }}</span>
                                </div>
                                <div class="detail-row">
                                  <span class="label">Modelo:</span>
                                  <span class="value">{{ vehicle.model }}</span>
                                </div>
                                @if (vehicle.year) {
                                  <div class="detail-row">
                                    <span class="label">Año:</span>
                                    <span class="value">{{ vehicle.year }}</span>
                                  </div>
                                }
                                @if (vehicle.color) {
                                  <div class="detail-row">
                                    <span class="label">Color:</span>
                                    <span class="value">{{ vehicle.color }}</span>
                                  </div>
                                }
                              </div>
                            </mat-card-content>
                          </mat-card>
                        }
                      </div>
                    }
                  </div>
                </div>
              </mat-tab>

              <!-- Service History Tab -->
              <mat-tab label="Historial de Servicios">
                <div class="tab-content">
                  <div class="info-section">
                    <h2>Historial de Lavados</h2>
                    <mat-divider></mat-divider>

                    @if (loadingHistory()) {
                      <div class="loading-container">
                        <mat-spinner diameter="40"></mat-spinner>
                      </div>
                    }

                    @if (!loadingHistory() && serviceHistory().length === 0) {
                      <div class="no-data">
                        <mat-icon>history</mat-icon>
                        <p>No hay servicios registrados para este cliente</p>
                      </div>
                    }

                    @if (!loadingHistory() && serviceHistory().length > 0) {
                      <div class="table-container">
                        <table mat-table [dataSource]="serviceHistory()" class="history-table">
                          
                          <ng-container matColumnDef="orderNumber">
                            <th mat-header-cell *matHeaderCellDef>Nº Orden</th>
                            <td mat-cell *matCellDef="let order">{{ order.orderNumber || order.id }}</td>
                          </ng-container>

                          <ng-container matColumnDef="vehicle">
                            <th mat-header-cell *matHeaderCellDef>Vehículo</th>
                            <td mat-cell *matCellDef="let order">{{ order.vehicleLicensePlate }}</td>
                          </ng-container>

                          <ng-container matColumnDef="serviceType">
                            <th mat-header-cell *matHeaderCellDef>Tipo de Servicio</th>
                            <td mat-cell *matCellDef="let order">
                              <mat-chip-set>
                                <mat-chip [highlighted]="true">{{ getServiceTypeLabel(order.serviceType) }}</mat-chip>
                              </mat-chip-set>
                            </td>
                          </ng-container>

                          <ng-container matColumnDef="status">
                            <th mat-header-cell *matHeaderCellDef>Estado</th>
                            <td mat-cell *matCellDef="let order">
                              <mat-chip-set>
                                <mat-chip [highlighted]="true" [style.background-color]="getStatusColor(order.status)">
                                  {{ getStatusLabel(order.status) }}
                                </mat-chip>
                              </mat-chip-set>
                            </td>
                          </ng-container>

                          <ng-container matColumnDef="price">
                            <th mat-header-cell *matHeaderCellDef>Precio</th>
                            <td mat-cell *matCellDef="let order">\${{ order.price.toFixed(2) }}</td>
                          </ng-container>

                          <ng-container matColumnDef="date">
                            <th mat-header-cell *matHeaderCellDef>Fecha</th>
                            <td mat-cell *matCellDef="let order">{{ formatDate(order.createdAt) }}</td>
                          </ng-container>

                          <tr mat-header-row *matHeaderRowDef="historyColumns"></tr>
                          <tr mat-row *matRowDef="let row; columns: historyColumns;"></tr>
                        </table>
                      </div>

                      <div class="history-summary">
                        <mat-card>
                          <mat-card-content>
                            <div class="summary-item">
                              <mat-icon>receipt</mat-icon>
                              <div>
                                <span class="summary-label">Total de servicios</span>
                                <span class="summary-value">{{ serviceHistory().length }}</span>
                              </div>
                            </div>
                            <div class="summary-item">
                              <mat-icon>attach_money</mat-icon>
                              <div>
                                <span class="summary-label">Total gastado</span>
                                <span class="summary-value">\${{ calculateTotalSpent() }}</span>
                              </div>
                            </div>
                          </mat-card-content>
                        </mat-card>
                      </div>
                    }
                  </div>
                </div>
              </mat-tab>
            </mat-tab-group>
          </mat-card-content>
        </mat-card>
      }
    </div>
  `,
  styles: [`
    .page-container {
      padding: 2rem;
      max-width: 1400px;
      margin: 0 auto;
    }

    .loading-container {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 4rem;
    }

    .header-card {
      margin-bottom: 1.5rem;
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      width: 100%;
      gap: 2rem;
    }

    .title-section {
      flex: 1;
    }

    h1 {
      margin: 0 0 0.5rem 0;
      font-size: 2rem;
      font-weight: 500;
    }

    .subtitle {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: rgba(0,0,0,0.6);
      font-size: 1rem;
    }

    .subtitle mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .actions {
      display: flex;
      gap: 1rem;
    }

    .tab-content {
      padding: 2rem 1rem;
    }

    .info-section {
      margin-bottom: 2rem;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    h2 {
      margin: 0 0 1rem 0;
      font-size: 1.5rem;
      font-weight: 500;
      color: #3f51b5;
    }

    mat-divider {
      margin-bottom: 1.5rem;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1.5rem;
      margin-top: 1.5rem;
    }

    .info-item {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      padding: 1rem;
      background-color: #f5f5f5;
      border-radius: 8px;
    }

    .info-item mat-icon {
      color: #3f51b5;
      margin-top: 2px;
    }

    .info-details {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      flex: 1;
    }

    .label {
      font-size: 0.875rem;
      color: rgba(0,0,0,0.6);
      font-weight: 500;
    }

    .value {
      font-size: 1rem;
      color: rgba(0,0,0,0.87);
    }

    .vehicles-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 1rem;
      margin-top: 1.5rem;
    }

    .vehicle-card {
      background-color: #fafafa;
    }

    .vehicle-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.75rem;
    }

    .vehicle-header h3 {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 600;
      color: #3f51b5;
    }

    .vehicle-details {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      margin-top: 1rem;
    }

    .detail-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .detail-row .label {
      font-weight: 500;
      color: rgba(0,0,0,0.6);
    }

    .detail-row .value {
      color: rgba(0,0,0,0.87);
    }

    .no-data {
      text-align: center;
      padding: 3rem;
      color: rgba(0,0,0,0.54);
    }

    .no-data mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      margin-bottom: 1rem;
    }

    .no-data p {
      margin: 0;
      font-size: 1.1rem;
    }

    .table-container {
      overflow-x: auto;
      margin-top: 1.5rem;
    }

    .history-table {
      width: 100%;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .history-table th {
      background-color: #f5f5f5;
      font-weight: 600;
    }

    .history-summary {
      margin-top: 2rem;
    }

    .history-summary mat-card {
      background-color: #e3f2fd;
    }

    .history-summary mat-card-content {
      display: flex;
      gap: 3rem;
      justify-content: center;
      padding: 1.5rem;
    }

    .summary-item {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .summary-item mat-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
      color: #1976d2;
    }

    .summary-item div {
      display: flex;
      flex-direction: column;
    }

    .summary-label {
      font-size: 0.875rem;
      color: rgba(0,0,0,0.6);
    }

    .summary-value {
      font-size: 1.5rem;
      font-weight: 600;
      color: #1976d2;
    }

    @media (max-width: 768px) {
      .page-container {
        padding: 1rem;
      }

      .header-content {
        flex-direction: column;
      }

      .actions {
        width: 100%;
        flex-direction: column;
      }

      .actions button {
        width: 100%;
      }

      .info-grid {
        grid-template-columns: 1fr;
      }

      .vehicles-grid {
        grid-template-columns: 1fr;
      }

      .history-summary mat-card-content {
        flex-direction: column;
        gap: 1rem;
      }
    }
  `]
})
export class ClientDetailComponent implements OnInit {
  private clientService = inject(ClientService);
  private washService = inject(WashService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private snackBar = inject(MatSnackBar);

  client = signal<Client | null>(null);
  serviceHistory = signal<ServiceOrder[]>([]);
  loading = signal(false);
  loadingHistory = signal(false);
  historyColumns = ['orderNumber', 'vehicle', 'serviceType', 'status', 'price', 'date'];

  ngOnInit(): void {
    const clientId = this.route.snapshot.paramMap.get('id');
    if (clientId) {
      this.loadClient(clientId);
      this.loadServiceHistory(clientId);
    }
  }

  loadClient(id: string): void {
    this.loading.set(true);
    this.clientService.getClientById(id).subscribe({
      next: (client) => {
        this.client.set(client);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading client:', error);
        this.snackBar.open('Error al cargar el cliente', 'Cerrar', { duration: 3000 });
        this.loading.set(false);
        this.router.navigate(['/dashboard', 'clients']);
      }
    });
  }

  loadServiceHistory(clientId: string): void {
    this.loadingHistory.set(true);
    this.washService.getServiceOrdersByClient(clientId).subscribe({
      next: (orders) => {
        this.serviceHistory.set(orders);
        this.loadingHistory.set(false);
      },
      error: (error) => {
        console.error('Error loading service history:', error);
        this.loadingHistory.set(false);
      }
    });
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-AR', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }

  getServiceTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      'BASIC': 'Básico',
      'COMPLETE': 'Completo',
      'PREMIUM': 'Premium',
      'EXPRESS': 'Express'
    };
    return labels[type] || type;
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'PENDING': 'Pendiente',
      'IN_PROGRESS': 'En Progreso',
      'COMPLETED': 'Completado',
      'DELIVERED': 'Entregado'
    };
    return labels[status] || status;
  }

  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'PENDING': '#ff9800',
      'IN_PROGRESS': '#2196f3',
      'COMPLETED': '#4caf50',
      'DELIVERED': '#9c27b0'
    };
    return colors[status] || '#757575';
  }

  calculateTotalSpent(): string {
    const total = this.serviceHistory().reduce((sum, order) => sum + order.price, 0);
    return total.toFixed(2);
  }

  editClient(): void {
    const clientId = this.client()?.id;
    if (clientId) {
      this.router.navigate(['/dashboard', 'clients', clientId, 'edit']);
    }
  }

  addVehicle(): void {
    const clientId = this.client()?.id;
    if (clientId) {
      this.router.navigate(['/dashboard', 'clients', clientId, 'edit']);
      this.snackBar.open('Edite el cliente para agregar vehículos', 'Cerrar', { duration: 3000 });
    }
  }

  goBack(): void {
    this.router.navigate(['/dashboard', 'clients']);
  }
}
