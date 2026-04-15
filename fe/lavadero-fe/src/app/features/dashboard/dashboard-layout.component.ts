import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';

interface NavItem {
  label: string;
  link: string[];
  icon: string;
  exact: boolean;
  requiredRole?: string;
}

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatSidenavModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatListModule,
    MatMenuModule,
    MatBadgeModule
  ],
  template: `
    <mat-sidenav-container class="dashboard-container">
      <mat-sidenav
        #sidenav
        class="sidebar"
        [mode]="'side'"
        [opened]="!isMobile() || sidenavOpened()"
        [fixedInViewport]="isMobile()"
      >
        <!-- Logo -->
        <div class="sidebar-header">
          <div class="logo-container">
            <div class="logo-icon">
              <mat-icon>local_car_wash</mat-icon>
            </div>
            <div class="logo-text">
              <h2>AutoLavado</h2>
              <p>Gestión</p>
            </div>
          </div>
        </div>

        <!-- Navigation Menu -->
        <nav class="nav-menu" (click)="isMobile() && sidenav.close()">
          <a
            *ngFor="let item of filteredNavItems()"
            [routerLink]="item.link"
            [routerLinkActive]="'active'"
            [routerLinkActiveOptions]="{ exact: item.exact }"
            class="nav-item"
          >
            <mat-icon>{{ item.icon }}</mat-icon>
            <span class="nav-label">{{ item.label }}</span>
          </a>
        </nav>

        <!-- Sidebar Footer -->
        <div class="sidebar-footer">
          <div class="user-card">
            <div class="user-avatar">
              <mat-icon>account_circle</mat-icon>
            </div>
            <div class="user-info">
              <p class="user-name">{{ currentUser()?.firstName }} {{ currentUser()?.lastName }}</p>
              <small class="user-role">{{ currentUser()?.role }}</small>
            </div>
          </div>
          <button
            mat-icon-button
            (click)="logout()"
            class="logout-btn"
            matTooltip="Cerrar sesión"
          >
            <mat-icon>logout</mat-icon>
          </button>
        </div>
      </mat-sidenav>

      <!-- Main Content Area -->
      <mat-sidenav-content class="main-content">
        <!-- Top Toolbar -->
        <mat-toolbar color="primary" class="top-toolbar" sticky>
          <button
            mat-icon-button
            (click)="sidenav.toggle()"
            [attr.aria-label]="'Menu'"
            class="menu-toggle"
          >
            <mat-icon>menu</mat-icon>
          </button>

          <span class="toolbar-title">Dashboard</span>

          <div class="toolbar-spacer"></div>

          <!-- Right Actions -->
          <button mat-icon-button [matMenuTriggerFor]="menu" class="notification-btn">
            <mat-icon
              [matBadge]="3"
              matBadgeColor="warn"
              matBadgeSize="small"
            >
              notifications
            </mat-icon>
          </button>

          <button mat-icon-button [matMenuTriggerFor]="userMenu">
            <mat-icon>more_vert</mat-icon>
          </button>
        </mat-toolbar>

        <!-- Page Content -->
        <div class="page-content">
          <router-outlet></router-outlet>
        </div>
      </mat-sidenav-content>
    </mat-sidenav-container>

    <!-- Notification Menu -->
    <mat-menu #menu="matMenu" class="notification-menu">
      <button mat-menu-item>
        <mat-icon>check_circle</mat-icon>
        <span>3 Servicios completados</span>
      </button>
      <button mat-menu-item>
        <mat-icon>person_add</mat-icon>
        <span>2 Nuevos clientes</span>
      </button>
      <button mat-menu-item>
        <mat-icon>receipt</mat-icon>
        <span>5 Facturas pendientes</span>
      </button>
    </mat-menu>

    <!-- User Menu -->
    <mat-menu #userMenu="matMenu" class="user-menu">
      <button mat-menu-item>
        <mat-icon>settings</mat-icon>
        <span>Configuración</span>
      </button>
      <button mat-menu-item>
        <mat-icon>help</mat-icon>
        <span>Ayuda</span>
      </button>
      <mat-divider></mat-divider>
      <button mat-menu-item (click)="logout()">
        <mat-icon>logout</mat-icon>
        <span>Cerrar sesión</span>
      </button>
    </mat-menu>
  `,
  styles: [`
    :host {
      --primary: #1976d2;
      --primary-light: #42a5f5;
      --primary-dark: #1565c0;
      --gray-50: #fafafa;
      --gray-100: #f5f5f5;
      --gray-150: #f0f0f0;
      --gray-200: #eeeeee;
      --gray-700: #616161;
      --gray-800: #424242;
      --gray-900: #212121;
      --shadow-sm: 0 1px 3px 0 rgba(0, 0, 0, 0.08);
      --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
      --transition-base: 200ms cubic-bezier(0.4, 0, 0.2, 1);
    }

    .dashboard-container {
      height: 100vh;
      background: linear-gradient(135deg, #f5f7fa 0%, #f0f2f5 100%);
    }

    .sidebar {
      width: 280px;
      background: linear-gradient(180deg, #ffffff 0%, #f9fafb 100%) !important;
      border-right: 1px solid #e5e7eb !important;
      color: #212121;
      display: flex;
      flex-direction: column;
      box-shadow: 2px 0 8px rgba(0, 0, 0, 0.06) !important;

      ::ng-deep .mat-divider {
        background-color: #f0f0f0;
      }
    }

    .sidebar-header {
      padding: 20px 16px 24px;
      border-bottom: 1px solid #f0f0f0;
    }

    .logo-container {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .logo-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 48px;
      height: 48px;
      background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
      border-radius: 12px;
      color: white;
      box-shadow: 0 4px 12px rgba(25, 118, 210, 0.3);
      flex-shrink: 0;

      mat-icon {
        font-size: 28px !important;
        width: 28px !important;
        height: 28px !important;
      }
    }

    .logo-text {
      flex: 1;

      h2 {
        font-size: 18px;
        font-weight: 700;
        margin: 0;
        line-height: 1;
        color: #212121;
      }

      p {
        font-size: 12px;
        margin: 4px 0 0 0;
        opacity: 0.7;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        color: #757575;
      }
    }

    .nav-menu {
      flex: 1;
      padding: 16px 8px;
      display: flex;
      flex-direction: column;
      gap: 4px;
      overflow-y: auto;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      color: #616161;
      text-decoration: none;
      border-radius: 8px;
      transition: all var(--transition-base);
      cursor: pointer;
      border-left: 4px solid transparent;
      font-weight: 500;

      mat-icon {
        font-size: 20px !important;
        width: 20px !important;
        height: 20px !important;
      }

      &:hover {
        background: linear-gradient(135deg, #f0f4ff 0%, #e8f0ff 100%);
        color: #1976d2;
        transform: translateX(4px);

        mat-icon {
          color: #1976d2;
        }
      }

      &.active {
        background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
        color: white;
        border-left-color: white;
        font-weight: 600;
        box-shadow: 0 4px 12px rgba(25, 118, 210, 0.3);

        mat-icon {
          color: white;
        }
      }
    }

    .nav-label {
      font-size: 0.95rem;
      font-weight: 500;
    }

    .sidebar-footer {
      padding: 16px;
      border-top: 1px solid #f0f0f0;
      margin-top: auto;
    }

    .user-card {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      background: linear-gradient(135deg, #f0f4ff 0%, #e8f0ff 100%);
      border-radius: 8px;
      margin-bottom: 12px;
      border: 1px solid rgba(25, 118, 210, 0.1);
    }

    .user-avatar {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
      border-radius: 50%;
      color: white;
      flex-shrink: 0;

      mat-icon {
        font-size: 24px !important;
        width: 24px !important;
        height: 24px !important;
      }
    }

    .user-info {
      flex: 1;
      min-width: 0;
    }

    .user-name {
      font-size: 0.9rem;
      font-weight: 600;
      margin: 0;
      color: #212121;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .user-role {
      font-size: 0.8rem;
      opacity: 0.7;
      display: block;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      color: #616161;
    }

    .logout-btn {
      color: #616161;
      width: 100%;
      height: 40px;
      transition: all var(--transition-base);

      &:hover {
        color: #1976d2;
        background: linear-gradient(135deg, #f0f4ff 0%, #e8f0ff 100%);
      }
    }

    .main-content {
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .top-toolbar {
      background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%) !important;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
      height: 64px;
      display: flex;
      align-items: center;
      gap: 16px;

      ::ng-deep .mat-toolbar-row {
        padding: 0 16px;
      }
    }

    .toolbar-title {
      font-size: 1.2rem;
      font-weight: 600;
      margin-left: 16px;
      color: white;
    }

    .toolbar-spacer {
      flex: 1 1 auto;
    }

    .menu-toggle {
      color: white !important;

      @media (min-width: 769px) {
        display: none;
      }
    }

    .page-content {
      flex: 1;
      overflow-y: auto;
      padding: 24px;
      background: linear-gradient(135deg, #f5f7fa 0%, #f0f2f5 100%);
    }

    .notification-btn {
      margin-right: 12px;
    }

    @media (max-width: 768px) {
      .sidebar {
        width: 240px;
      }

      .nav-label {
        display: none;
      }

      .nav-item {
        justify-content: center;
        padding: 12px;
      }

      .sidebar-footer {
        padding: 8px;
      }

      .user-card {
        flex-direction: column;
        padding: 8px;
        margin-bottom: 8px;
        text-align: center;

        .user-info {
          width: 100%;
        }
      }

      .logout-btn {
        width: 100%;
      }

      .page-content {
        padding: 16px;
      }
    }
  `]
})
export class DashboardLayoutComponent {
  private authService = inject(AuthService);

  currentUser = this.authService.currentUser;
  isMobile = signal(window.innerWidth <= 768);
  sidenavOpened = signal(window.innerWidth > 768);

  protected readonly navItems: NavItem[] = [
    { label: 'Dashboard', link: ['/dashboard'], icon: 'dashboard', exact: true },
    { label: 'Clientes', link: ['/dashboard', 'clients'], icon: 'people', exact: false },
    { label: 'Empleados', link: ['/dashboard', 'employees'], icon: 'engineering', exact: false, requiredRole: 'ADMIN' },
    { label: 'Servicios', link: ['/dashboard', 'services'], icon: 'local_car_wash', exact: false },
    { label: 'Facturación', link: ['/dashboard', 'billing'], icon: 'receipt_long', exact: false }
  ];

  filteredNavItems = computed(() => {
    const role = this.currentUser()?.role;
    return this.navItems.filter(item => !item.requiredRole || item.requiredRole === role);
  });

  constructor() {
    window.addEventListener('resize', () => {
      this.isMobile.set(window.innerWidth <= 768);
      if (window.innerWidth > 768) {
        this.sidenavOpened.set(true);
      }
    });
  }

  logout(): void {
    this.authService.logout();
  }
}
