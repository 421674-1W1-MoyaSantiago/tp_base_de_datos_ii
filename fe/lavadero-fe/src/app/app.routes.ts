import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login.component';
import { DashboardLayoutComponent } from './features/dashboard/dashboard-layout.component';
import { WashBoardComponent } from './features/dashboard/wash-board.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  {
      path: 'dashboard',
      component: DashboardLayoutComponent,
      canActivate: [authGuard],
      children: [
        { path: '', component: WashBoardComponent },
        { path: 'clients', loadComponent: () => import('./features/clients/client-list.component').then(m => m.ClientListComponent) },
        { path: 'clients/new', loadComponent: () => import('./features/clients/client-form.component').then(m => m.ClientFormComponent) },
        { path: 'clients/:id/edit', loadComponent: () => import('./features/clients/client-form.component').then(m => m.ClientFormComponent) },
        { path: 'clients/:id', loadComponent: () => import('./features/clients/client-detail.component').then(m => m.ClientDetailComponent) },
        { path: 'employees', loadComponent: () => import('./features/employees/employee-list.component').then(m => m.EmployeeListComponent) },
        { path: 'employees/new', loadComponent: () => import('./features/employees/employee-form.component').then(m => m.EmployeeFormComponent) },
        { path: 'employees/:id/edit', loadComponent: () => import('./features/employees/employee-form.component').then(m => m.EmployeeFormComponent) },
        { path: 'employees/:id', loadComponent: () => import('./features/employees/employee-form.component').then(m => m.EmployeeFormComponent) },
        { path: 'services', loadChildren: () => import('./features/services/services.routes').then(m => m.SERVICE_ROUTES) },
        { path: 'billing', loadComponent: () => import('./features/billing/invoice-list.component').then(m => m.InvoiceListComponent) }
      ]
  },
  { path: 'employees', redirectTo: '/dashboard/employees', pathMatch: 'full' },
  { path: 'employees/new', redirectTo: '/dashboard/employees/new', pathMatch: 'full' },
  { path: 'employees/:id/edit', redirectTo: '/dashboard/employees/:id/edit', pathMatch: 'full' },
  { path: 'employees/:id', redirectTo: '/dashboard/employees/:id', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }
];
