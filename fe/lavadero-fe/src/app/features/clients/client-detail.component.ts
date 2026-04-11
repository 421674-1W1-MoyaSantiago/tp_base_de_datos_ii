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
                <button mat-flat-button class="btn-edit" (click)="editClient()">
                  <mat-icon>edit</mat-icon>
                  Editar
                </button>
                <button mat-flat-button class="btn-back" (click)="goBack()">
                  <mat-icon>arrow_back</mat-icon>
                  Volver
                </button>
              </div>
            </div>
          </mat-card-header>
        </mat-card>

        <mat-card class="content-card">
          <mat-card-content>
            <mat-tab-group class="client-tabs" animationDuration="200ms">
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
                      <button mat-flat-button class="add-vehicle-btn" (click)="addVehicle()">
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
                                <mat-chip [highlighted]="true" [class]="'status-chip status-' + order.status">
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
                        <mat-card class="summary-card">
                          <mat-card-content>
                            <div class="stats-grid">
                              <div class="stat-item">
                                <div class="stat-icon-wrap">
                                  <mat-icon>receipt_long</mat-icon>
                                </div>
                                <div class="stat-content">
                                  <span class="summary-label">Total de servicios</span>
                                  <span class="summary-value">{{ serviceHistory().length }}</span>
                                </div>
                              </div>

                              <div class="stat-item">
                                <div class="stat-icon-wrap">
                                  <mat-icon>payments</mat-icon>
                                </div>
                                <div class="stat-content">
                                  <span class="summary-label">Total gastado</span>
                                  <span class="summary-value">\${{ calculateTotalSpent() }}</span>
                                </div>
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
      padding: 24px 16px;
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
      border-radius: 16px !important;
      border: 1px solid #e5ebf4 !important;
      box-shadow: 0 12px 28px rgba(15, 23, 42, 0.08) !important;
      background: linear-gradient(160deg, #ffffff 0%, #f8fbff 100%) !important;
    }

    .content-card {
      border-radius: 16px !important;
      border: 1px solid #e5ebf4 !important;
      box-shadow: 0 12px 28px rgba(15, 23, 42, 0.07) !important;
      background: linear-gradient(160deg, #ffffff 0%, #f8fbff 100%) !important;
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
      font-size: 1.9rem;
      font-weight: 700;
      color: #0f172a;
    }

    .subtitle {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #64748b;
      font-size: 0.96rem;
      font-weight: 600;
    }

    .subtitle mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .actions {
      display: flex;
      gap: 0.7rem;
    }

    .actions button,
    .add-vehicle-btn {
      min-height: 40px;
      border-radius: 10px !important;
      font-weight: 700 !important;
      letter-spacing: 0.2px;
    }

    .btn-edit {
      border: 1px solid rgba(21, 101, 192, 0.42) !important;
      background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%) !important;
      color: #ffffff !important;
      box-shadow: 0 6px 14px rgba(25, 118, 210, 0.3) !important;
    }

    .btn-edit:hover {
      transform: translateY(-1px);
      box-shadow: 0 10px 20px rgba(25, 118, 210, 0.36) !important;
      background: linear-gradient(135deg, #1e88e5 0%, #1976d2 100%) !important;
    }

    .btn-edit mat-icon {
      color: #ffffff !important;
    }

    .btn-back {
      border: 1px solid #d2dbe7 !important;
      background: #ffffff !important;
      color: #475569 !important;
    }

    .btn-back:hover {
      background: #f8fafc !important;
      border-color: #b8c5d6 !important;
    }

    .add-vehicle-btn {
      border: 1px solid rgba(21, 101, 192, 0.4) !important;
      background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%) !important;
      color: #ffffff !important;
      box-shadow: 0 6px 14px rgba(25, 118, 210, 0.3) !important;
    }

    .add-vehicle-btn:hover {
      transform: translateY(-1px);
      box-shadow: 0 10px 20px rgba(25, 118, 210, 0.36) !important;
    }

    .tab-content {
      padding: 0.9rem 0.4rem 0.4rem;
    }

    .info-section {
      margin-bottom: 0;
      border: 1px solid #e3ebf5;
      border-radius: 14px;
      padding: 18px;
      background: linear-gradient(160deg, #ffffff 0%, #f8fbff 100%);
      box-shadow: 0 8px 16px rgba(15, 23, 42, 0.05);
    }

    ::ng-deep .client-tabs {
      display: block;
      border-radius: 14px;
      --mat-tab-header-divider-color: transparent;
      border-bottom: 0 !important;
    }

    ::ng-deep .client-tabs .mat-mdc-tab-header {
      border: 1px solid #dce6f3 !important;
      border-bottom: 0 !important;
      background: linear-gradient(135deg, #f8fbff 0%, #f1f6fc 100%);
      border-radius: 12px;
      padding: 6px;
      margin-bottom: 14px;
      box-shadow: none !important;
      outline: none !important;
    }

    ::ng-deep .client-tabs .mat-mdc-tab-label-container,
    ::ng-deep .client-tabs .mat-mdc-tab-list,
    ::ng-deep .client-tabs .mat-mdc-tab-list-container,
    ::ng-deep .client-tabs .mat-mdc-tab-header-pagination,
    ::ng-deep .client-tabs .mat-mdc-tab-header-pagination-before,
    ::ng-deep .client-tabs .mat-mdc-tab-header-pagination-after {
      border-bottom: 0 !important;
    }

    ::ng-deep .client-tabs .mat-mdc-tab-header,
    ::ng-deep .client-tabs .mat-mdc-tab-header-pagination,
    ::ng-deep .client-tabs .mat-mdc-tab-header-pagination-before,
    ::ng-deep .client-tabs .mat-mdc-tab-header-pagination-after,
    ::ng-deep .client-tabs .mat-mdc-tab-header::before,
    ::ng-deep .client-tabs .mat-mdc-tab-header::after,
    ::ng-deep .client-tabs .mdc-tab-indicator,
    ::ng-deep .client-tabs .mdc-tab-indicator__content,
    ::ng-deep .client-tabs .mat-mdc-tab-body-wrapper,
    ::ng-deep .client-tabs .mat-mdc-tab-body-content {
      border: none !important;
      box-shadow: none !important;
      outline: none !important;
    }

    ::ng-deep .client-tabs .mat-mdc-tab {
      min-height: 44px;
      border-radius: 9px;
      transition: all 180ms cubic-bezier(0.4, 0, 0.2, 1);
    }

    ::ng-deep .client-tabs .mat-mdc-tab:hover:not(.mdc-tab--active) {
      background: rgba(25, 118, 210, 0.08);
    }

    ::ng-deep .client-tabs .mat-mdc-tab .mdc-tab__text-label {
      font-weight: 700;
      color: #475569;
      letter-spacing: 0.2px;
      font-size: 0.96rem;
    }

    ::ng-deep .client-tabs .mat-mdc-tab.mdc-tab--active {
      background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
      box-shadow: 0 6px 14px rgba(25, 118, 210, 0.3);
    }

    ::ng-deep .client-tabs .mat-mdc-tab.mdc-tab--active .mdc-tab__text-label {
      color: #ffffff;
    }

    ::ng-deep .client-tabs .mdc-tab-indicator__content--underline {
      display: none;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    h2 {
      margin: 0 0 1rem 0;
      font-size: 1.25rem;
      font-weight: 700;
      color: #1e293b;
      position: relative;
      padding-left: 12px;
    }

    h2::before {
      content: '';
      position: absolute;
      left: 0;
      top: 4px;
      height: calc(100% - 8px);
      width: 4px;
      border-radius: 999px;
      background: linear-gradient(180deg, #1976d2 0%, #1565c0 100%);
    }

    mat-divider {
      margin-bottom: 1.5rem;
      border-color: #e2eaf4;
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
      background: linear-gradient(135deg, #f8fbff 0%, #f1f7ff 100%);
      border-radius: 12px;
      border: 1px solid #e2eaf4;
      box-shadow: 0 4px 12px rgba(15, 23, 42, 0.04);
    }

    .info-item mat-icon {
      color: #1976d2;
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
      color: #64748b;
      font-weight: 600;
    }

    .value {
      font-size: 1rem;
      color: #1f2937;
      font-weight: 600;
    }

    .vehicles-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 1rem;
      margin-top: 1.5rem;
    }

    .vehicle-card {
      border-radius: 12px !important;
      border: 1px solid #e2eaf4 !important;
      background: linear-gradient(140deg, #ffffff 0%, #f8fbff 100%) !important;
      box-shadow: 0 8px 16px rgba(15, 23, 42, 0.06) !important;
      transition: transform 180ms cubic-bezier(0.4, 0, 0.2, 1), box-shadow 180ms cubic-bezier(0.4, 0, 0.2, 1);
    }

    .vehicle-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 14px 24px rgba(15, 23, 42, 0.1) !important;
    }

    .vehicle-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.75rem;
    }

    .vehicle-header h3 {
      margin: 0;
      font-size: 1.1rem;
      font-weight: 600;
      color: #1e3a8a;
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
      font-weight: 600;
      color: #64748b;
    }

    .detail-row .value {
      color: #1f2937;
      font-weight: 600;
    }

    .no-data {
      text-align: center;
      padding: 2.2rem 1.2rem;
      color: #64748b;
      border: 1px dashed #cdd9e8;
      border-radius: 12px;
      background: linear-gradient(140deg, #f8fbff 0%, #f2f7fc 100%);
    }

    .no-data mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      margin-bottom: 1rem;
      color: #94a3b8;
    }

    .no-data p {
      margin: 0;
      font-size: 1.02rem;
      font-weight: 600;
    }

    .table-container {
      overflow-x: auto;
      margin-top: 1.5rem;
      border: 1px solid #e3ebf5;
      border-radius: 12px;
      box-shadow: 0 8px 16px rgba(15, 23, 42, 0.05);
    }

    .history-table {
      width: 100%;
      box-shadow: none;
      background: #ffffff;
    }

    .history-table th {
      background: linear-gradient(135deg, #f6f9fd 0%, #eef4fb 100%);
      font-weight: 600;
      color: #334155;
    }

    .history-table td {
      color: #334155;
    }

    .history-summary {
      margin-top: 2rem;
    }

    .summary-card {
      border-radius: 12px !important;
      border: 1px solid #dce8f6 !important;
      background: linear-gradient(140deg, #f7fbff 0%, #edf5ff 100%) !important;
      box-shadow: 0 8px 16px rgba(15, 23, 42, 0.06) !important;
    }

    .summary-card mat-card-content {
      padding: 1rem !important;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 12px;
    }

    .stat-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 14px;
      border-radius: 12px;
      border: 1px solid #dbe7f6;
      background: linear-gradient(145deg, #ffffff 0%, #f4f8ff 100%);
      box-shadow: 0 4px 10px rgba(15, 23, 42, 0.05);
    }

    .stat-icon-wrap {
      width: 40px;
      height: 40px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: 10px;
      background: linear-gradient(135deg, #e8f1ff 0%, #dbeafe 100%);
      border: 1px solid #c8dcf6;
      flex-shrink: 0;
    }

    .stat-icon-wrap mat-icon {
      font-size: 22px;
      width: 22px;
      height: 22px;
      color: #1976d2;
    }

    .stat-content {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .summary-label {
      font-size: 0.875rem;
      color: #64748b;
      font-weight: 600;
    }

    .summary-value {
      font-size: 1.8rem;
      font-weight: 700;
      color: #1976d2;
      line-height: 1.1;
    }

    .status-chip {
      border-radius: 999px !important;
      font-size: 0.74rem !important;
      font-weight: 700 !important;
      letter-spacing: 0.35px;
      text-transform: uppercase;
      border: 1px solid transparent;
      min-height: 26px;
    }

    .status-PENDING {
      background: #fef3c7 !important;
      color: #92400e !important;
      border-color: #fcd34d !important;
    }

    .status-IN_PROGRESS {
      background: #dbeafe !important;
      color: #1d4ed8 !important;
      border-color: #93c5fd !important;
    }

    .status-COMPLETED {
      background: #dcfce7 !important;
      color: #166534 !important;
      border-color: #86efac !important;
    }

    .status-DELIVERED {
      background: #e2e8f0 !important;
      color: #334155 !important;
      border-color: #cbd5e1 !important;
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

      .stats-grid {
        grid-template-columns: 1fr;
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
