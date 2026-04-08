import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { ServiceOrder, ServiceStatus, ServiceType } from '../../core/models/models';
import { WashService } from '../../core/services/wash.service';
import { WashBoardComponent } from './wash-board.component';

describe('WashBoardComponent', () => {
  let component: WashBoardComponent;
  let washServiceSpy: jasmine.SpyObj<WashService>;
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

  beforeEach(async () => {
    serviceOrdersSignal = signal<ServiceOrder[]>([...orders]);
    washServiceSpy = jasmine.createSpyObj<WashService>('WashService', ['loadServiceOrders', 'updateStatus'], {
      serviceOrders: serviceOrdersSignal
    });
    washServiceSpy.updateStatus.and.callFake((orderId: string, newStatus: ServiceStatus) => {
      const order = serviceOrdersSignal().find(o => o.id === orderId)!;
      return of({ ...order, status: newStatus });
    });

    await TestBed.configureTestingModule({
      imports: [WashBoardComponent],
      providers: [
        provideNoopAnimations(),
        { provide: WashService, useValue: washServiceSpy }
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(WashBoardComponent);
    component = fixture.componentInstance;
    snackBarOpenSpy = spyOn((component as any).snackBar, 'open');
    fixture.detectChanges();
  });

  it('should load service orders on init', () => {
    expect(washServiceSpy.loadServiceOrders).toHaveBeenCalled();
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
    component.handleStatusChange({ orderId: '1', newStatus: ServiceStatus.IN_PROGRESS });

    expect(washServiceSpy.updateStatus).toHaveBeenCalledWith('1', ServiceStatus.IN_PROGRESS);
    expect(snackBarOpenSpy).toHaveBeenCalledWith('Estado actualizado correctamente', 'OK', { duration: 2000 });
  });

  it('should block invalid transition and show snackbar', () => {
    component.handleStatusChange({ orderId: '1', newStatus: ServiceStatus.COMPLETED });

    expect(washServiceSpy.updateStatus).not.toHaveBeenCalled();
    expect(snackBarOpenSpy).toHaveBeenCalledWith('Transición de estado no válida', 'Cerrar', { duration: 3000 });
  });

  it('should reorder items when dropped in same container', () => {
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

    expect(sameContainerData[2].id).toBe('1');
    expect(washServiceSpy.updateStatus).not.toHaveBeenCalled();
  });
});
