import { Routes } from '@angular/router';

export const BILLING_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./invoice-list.component').then(m => m.InvoiceListComponent)
  },
  {
    path: 'new',
    loadComponent: () => import('./invoice-form.component').then(m => m.InvoiceFormComponent)
  },
  {
    path: 'invoice-ticket/:id',
    loadComponent: () => import('./invoice-ticket.component').then(m => m.InvoiceTicketComponent)
  },
  {
    path: 'sales-report',
    loadComponent: () => import('./sales-report.component').then(m => m.SalesReportComponent)
  }
];
