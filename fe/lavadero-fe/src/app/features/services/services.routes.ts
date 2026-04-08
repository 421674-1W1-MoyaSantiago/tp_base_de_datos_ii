import { Routes } from '@angular/router';

export const SERVICE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./service-list.component').then(m => m.ServiceListComponent)
  },
  {
    path: 'new',
    loadComponent: () => import('./service-order-form.component').then(m => m.ServiceOrderFormComponent)
  },
  {
    path: ':id',
    loadComponent: () => import('./service-order-detail.component').then(m => m.ServiceOrderDetailComponent)
  }
];
