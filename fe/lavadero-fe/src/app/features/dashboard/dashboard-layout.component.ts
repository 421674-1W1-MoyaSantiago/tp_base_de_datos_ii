import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="dashboard-layout">
      <nav class="sidebar">
        <div class="logo">
          <h2>
            <span class="emoji-icon">🚗</span>
            <span>Lavadero</span>
          </h2>
        </div>
        
        <ul class="nav-menu">
          <li *ngFor="let item of navItems">
            <a
              [routerLink]="item.link"
              routerLinkActive="active"
              [routerLinkActiveOptions]="{ exact: item.exact }"
            >
              <span class="icon">
                <span class="emoji-icon">{{ item.icon }}</span>
              </span>
              <span>{{ item.label }}</span>
            </a>
          </li>
        </ul>

        <div class="sidebar-footer">
          <div class="user-info">
            <strong>{{ currentUser()?.firstName }} {{ currentUser()?.lastName }}</strong>
            <small>{{ currentUser()?.role }}</small>
          </div>
          <button type="button" (click)="logout()" class="btn-logout">
            <span class="emoji-icon">🚪</span>
            Cerrar Sesión
          </button>
        </div>
      </nav>

      <div class="main-content">
        <router-outlet></router-outlet>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-layout {
      display: flex;
      height: 100vh;
    }

    .sidebar {
      width: 250px;
      background: #2c3e50;
      color: white;
      display: flex;
      flex-direction: column;
    }

    .logo {
      padding: 1.5rem;
      border-bottom: 1px solid rgba(255,255,255,0.1);
    }

    .logo h2 {
      margin: 0;
      font-size: 1.3rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .nav-menu {
      flex: 1;
      list-style: none;
      padding: 1rem 0;
      margin: 0;
    }

    .nav-menu li a {
      display: flex;
      align-items: center;
      padding: 1rem 1.5rem;
      color: #ecf0f1;
      text-decoration: none;
      transition: background 0.3s;
    }

    .nav-menu li a:hover {
      background: rgba(255,255,255,0.1);
    }

    .nav-menu li a.active {
      background: #3498db;
    }

    .icon {
      margin-right: 0.75rem;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    .emoji-icon {
      font-size: 1rem;
      width: 1.2rem;
      display: inline-block;
      text-align: center;
    }

    .sidebar-footer {
      padding: 1rem;
      border-top: 1px solid rgba(255,255,255,0.1);
    }

    .user-info {
      margin-bottom: 1rem;
      padding: 0.5rem;
    }

    .user-info strong {
      display: block;
    }

    .user-info small {
      color: #95a5a6;
    }

    .btn-logout {
      width: 100%;
      padding: 0.75rem;
      background: #e74c3c;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      transition: background 0.3s;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
    }

    .btn-logout:hover {
      background: #c0392b;
    }

    .main-content {
      flex: 1;
      overflow-y: auto;
      background: #ecf0f1;
    }
  `]
})
export class DashboardLayoutComponent {
  private authService = inject(AuthService);

  currentUser = this.authService.currentUser;
  protected readonly navItems = [
    { label: 'Dashboard', link: ['/dashboard'], icon: '📊', exact: true },
    { label: 'Clientes', link: ['/dashboard', 'clients'], icon: '👥', exact: false },
    { label: 'Empleados', link: ['/dashboard', 'employees'], icon: '🧑‍🔧', exact: false },
    { label: 'Servicios', link: ['/dashboard', 'services'], icon: '🧼', exact: false },
    { label: 'Facturación', link: ['/dashboard', 'billing'], icon: '🧾', exact: false }
  ] as const;

  logout(): void {
    this.authService.logout();
  }
}
