import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { ServiceOrder, ServiceStatus, ServiceType } from '../../core/models/models';
import { InvoiceService } from '../../core/services/invoice.service';
import { WashService } from '../../core/services/wash.service';
import { WashBoardComponent } from './wash-board.component';

describe('WashBoardComponent', () => {
  let component: WashBoardComponent;
  let washServiceSpy: jasmine.SpyObj<WashService>;
  let invoiceServiceSpy: jasmine.SpyObj<InvoiceService>;
  let snackBarOpenSpy: jasmine.Spy;
  let serviceOrdersSignal: ReturnType<typeof signal<ServiceOrder[]>>;

  const orders: ServiceOrder[] = [
    {
      id: '1',
      clientId: 'C1',
      vehicleLicensePlate: 'AA111AA',
      serviceType: ServiceType.BASIC,
      status: ServiceStatus.PENDING,
      assignedEmployeeId: 'E1',
      price: 1000,
      createdAt: '2025-01-01T10:00:00.000Z'
    },
    {
      id: '2',
      clientId: 'C2',
      vehicleLicensePlate: 'BB222BB',
      serviceType: ServiceType.COMPLETE,
      status: ServiceStatus.IN_PROGRESS,
      assignedEmployeeId: 'E2',
      price: 2000,
      createdAt: '2025-01-05T10:00:00.000Z'
    },
    {
      id: '3',
      clientId: 'C3',
      vehicleLicensePlate: 'CC333CC',
      serviceType: ServiceType.PREMIUM,
      status: ServiceStatus.COMPLETED,
      assignedEmployeeId: 'E1',
      price: 3000,
      createdAt: '2025-01-10T10:00:00.000Z'
    }
  ];

  const shiftDateIso = (dateIso: string, days: number): string => {
    const [year, month, day] = dateIso.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    date.setDate(date.getDate() + days);
    const outputYear = date.getFullYear();
    const outputMonth = `${date.getMonth() + 1}`.padStart(2, '0');
    const outputDay = `${date.getDate()}`.padStart(2, '0');
    return `${outputYear}-${outputMonth}-${outputDay}`;
  };

  beforeEach(async () => {
    jasmine.clock().install();
    jasmine.clock().mockDate(new Date(2026, 0, 20, 12, 0, 0));

    serviceOrdersSignal = signal<ServiceOrder[]>([...orders]);
    washServiceSpy = jasmine.createSpyObj<WashService>('WashService', ['loadServiceOrders', 'updateStatus', 'getDashboardStatusDistribution'], {
      serviceOrders: serviceOrdersSignal
    });
    invoiceServiceSpy = jasmine.createSpyObj<InvoiceService>('InvoiceService', ['createInvoice', 'getDashboardDailyRevenue']);

    washServiceSpy.getDashboardStatusDistribution.and.returnValue(of({
      statuses: [
        { status: ServiceStatus.PENDING, count: 1 },
        { status: ServiceStatus.IN_PROGRESS, count: 1 },
        { status: ServiceStatus.COMPLETED, count: 1 },
        { status: ServiceStatus.DELIVERED, count: 0 }
      ],
      totalOrders: 3
    }));
    invoiceServiceSpy.getDashboardDailyRevenue.and.returnValue(of({
      days: 7,
      points: [
        { date: '2026-01-01', totalAmount: 1000, invoiceCount: 1 },
        { date: '2026-01-02', totalAmount: 0, invoiceCount: 0 },
        { date: '2026-01-03', totalAmount: 2000, invoiceCount: 2 }
      ],
      totalAmount: 3000,
      totalInvoices: 3
    }));

    washServiceSpy.updateStatus.and.callFake((orderId: string, newStatus: ServiceStatus) => {
      const order = serviceOrdersSignal().find(o => o.id === orderId)!;
      return of({ ...order, status: newStatus });
    });

    await TestBed.configureTestingModule({
      imports: [WashBoardComponent],
      providers: [
        provideNoopAnimations(),
        { provide: WashService, useValue: washServiceSpy },
        { provide: InvoiceService, useValue: invoiceServiceSpy }
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(WashBoardComponent);
    component = fixture.componentInstance;
    snackBarOpenSpy = spyOn((component as any).snackBar, 'open');
    fixture.detectChanges();
  });

  afterEach(() => {
    jasmine.clock().uninstall();
  });

  it('should load service orders and analytics on init', () => {
    expect(washServiceSpy.loadServiceOrders).toHaveBeenCalled();
    expect(washServiceSpy.getDashboardStatusDistribution).toHaveBeenCalledWith('2026-01-20');
    expect(invoiceServiceSpy.getDashboardDailyRevenue).toHaveBeenCalledWith('2026-01-14', 7);
    expect(component.statusChartData().length).toBe(4);
    expect(component.revenueChartData().length).toBe(7);
  });

  it('should compute unique employees and filtered orders from signals', () => {
    expect(component.uniqueEmployees()).toEqual(['E1', 'E2']);

    component.filterStatus.set(ServiceStatus.IN_PROGRESS);
    expect(component.filteredOrders().map(o => o.id)).toEqual(['2']);

    component.filterServiceType.set(ServiceType.COMPLETE);
    expect(component.filteredOrders().map(o => o.id)).toEqual(['2']);
  });

  it('should clear all filters and show snackbar message', () => {
    component.selectedFilterType.set('status');
    component.filterStatus.set(ServiceStatus.PENDING);
    component.filterEmployee.set('E1');
    component.filterServiceType.set(ServiceType.BASIC);
    component.filterDateFrom.set(new Date('2025-01-01'));
    component.filterDateTo.set(new Date('2025-01-31'));

    component.clearFilters();

    expect(component.selectedFilterType()).toBe('all');
    expect(component.filterStatus()).toBeNull();
    expect(component.filterEmployee()).toBeNull();
    expect(component.filterServiceType()).toBeNull();
    expect(component.filterDateFrom()).toBeNull();
    expect(component.filterDateTo()).toBeNull();
    expect(snackBarOpenSpy).toHaveBeenCalledWith('Filtros limpiados', 'OK', { duration: 2000 });
  });

  it('should update status on valid transition', () => {
    const analyticsReloadCalls = washServiceSpy.getDashboardStatusDistribution.calls.count();

    component.handleStatusChange({ orderId: '1', newStatus: ServiceStatus.IN_PROGRESS });

    expect(washServiceSpy.updateStatus).toHaveBeenCalledWith('1', ServiceStatus.IN_PROGRESS);
    expect(washServiceSpy.getDashboardStatusDistribution.calls.count()).toBe(analyticsReloadCalls + 1);
    expect(invoiceServiceSpy.getDashboardDailyRevenue.calls.count()).toBe(2);
    expect(snackBarOpenSpy).toHaveBeenCalledWith('Estado actualizado correctamente', 'OK', { duration: 2000 });
  });

  it('should move revenue window by 7 days and reload revenue data', () => {
    const firstWindowStart = invoiceServiceSpy.getDashboardDailyRevenue.calls.mostRecent().args[0] as string;

    component.moveRevenueWindow(-component.revenueWindowDays);

    const expectedStart = shiftDateIso(firstWindowStart, -component.revenueWindowDays);
    expect(invoiceServiceSpy.getDashboardDailyRevenue.calls.mostRecent().args).toEqual([expectedStart, 7]);
  });

  it('should reload status distribution when selecting a new date', () => {
    component.onStatusDateSelected(new Date(2026, 0, 15, 10, 0, 0));

    expect(washServiceSpy.getDashboardStatusDistribution.calls.mostRecent().args).toEqual(['2026-01-15']);
  });

  it('should ignore drop in same container', () => {
    const sameContainerData = [...orders];
    const container = { id: ServiceStatus.PENDING, data: sameContainerData };
    const event = {
      previousContainer: container,
      container,
      previousIndex: 0,
      currentIndex: 2,
      item: { data: sameContainerData[0] }
    } as unknown as CdkDragDrop<ServiceOrder[]>;

    component.onDrop(event);

    expect(washServiceSpy.updateStatus).not.toHaveBeenCalled();
  });

  it('should format chart date for daily revenue labels', () => {
    expect(component.formatChartDate('2026-04-16')).toBe('16/04');
  });
});
