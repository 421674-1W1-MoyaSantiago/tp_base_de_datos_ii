import { TestBed } from '@angular/core/testing';
import { convertToParamMap, ActivatedRoute, Router } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { Client } from '../../core/models/models';
import { ClientService } from '../../core/services/client.service';
import { ClientFormComponent } from './client-form.component';

describe('ClientFormComponent', () => {
  let component: ClientFormComponent;
  let clientServiceSpy: jasmine.SpyObj<ClientService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let routeId: string | null;

  const baseClient: Client = {
    id: 'client-1',
    firstName: 'Ana',
    lastName: 'Pérez',
    dni: '12345678',
    email: 'ana@test.com',
    phone: '123456789',
    vehicles: [
      {
        licensePlate: 'ABC123',
        brand: 'Toyota',
        model: 'Corolla',
        year: 2020,
        color: 'Rojo'
      }
    ]
  };

  beforeEach(async () => {
    routeId = 'new';
    clientServiceSpy = jasmine.createSpyObj<ClientService>('ClientService', ['getClientById', 'createClient', 'updateClient']);
    routerSpy = jasmine.createSpyObj<Router>('Router', ['navigate']);
    routerSpy.navigate.and.returnValue(Promise.resolve(true));

    const activatedRouteMock: Partial<ActivatedRoute> = {
      snapshot: {
        get paramMap() {
          return convertToParamMap(routeId ? { id: routeId } : {});
        }
      } as ActivatedRoute['snapshot']
    };

    await TestBed.configureTestingModule({
      imports: [ClientFormComponent],
      providers: [
        provideNoopAnimations(),
        { provide: ClientService, useValue: clientServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: activatedRouteMock }
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(ClientFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should initialize required form fields', () => {
    expect(component).toBeTruthy();
    expect(component.clientForm.valid).toBeFalse();
    expect(component.clientForm.get('firstName')?.hasError('required')).toBeTrue();
    expect(component.clientForm.get('email')?.hasError('required')).toBeTrue();
  });

  it('should add and remove vehicles when confirmed', () => {
    component.addVehicle();
    component.addVehicle();
    expect(component.vehicles.length).toBe(2);

    spyOn(window, 'confirm').and.returnValue(true);
    component.removeVehicle(0);

    expect(component.vehicles.length).toBe(1);
  });

  it('should not remove vehicle when confirmation is cancelled', () => {
    component.addVehicle();
    spyOn(window, 'confirm').and.returnValue(false);

    component.removeVehicle(0);

    expect(component.vehicles.length).toBe(1);
  });

  it('should show validation message and avoid save when form is invalid', () => {
    const snackBarOpenSpy = spyOn((component as any).snackBar, 'open');
    component.onSubmit();

    expect(clientServiceSpy.createClient).not.toHaveBeenCalled();
    expect(clientServiceSpy.updateClient).not.toHaveBeenCalled();
    expect(snackBarOpenSpy).toHaveBeenCalledWith(
      'Por favor complete todos los campos requeridos',
      'Cerrar',
      { duration: 3000 }
    );
  });

  it('should create client and navigate in create mode', () => {
    clientServiceSpy.createClient.and.returnValue(of(baseClient));
    component.clientForm.patchValue({
      firstName: 'Ana',
      lastName: 'Pérez',
      dni: '12345678',
      email: 'ana@test.com',
      phone: '123456789'
    });

    component.onSubmit();

    expect(component.saving()).toBeFalse();
    expect(clientServiceSpy.createClient).toHaveBeenCalled();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/dashboard', 'clients', 'client-1']);
  });

  it('should load client and update in edit mode', () => {
    routeId = 'client-1';
    clientServiceSpy.getClientById.and.returnValue(of(baseClient));
    clientServiceSpy.updateClient.and.returnValue(of(baseClient));
    const editFixture = TestBed.createComponent(ClientFormComponent);
    const editComponent = editFixture.componentInstance;
    editFixture.detectChanges();
    editComponent.clientForm.patchValue({ firstName: 'Ana María' });

    editComponent.onSubmit();

    expect(editComponent.isEditMode()).toBeTrue();
    expect(clientServiceSpy.getClientById).toHaveBeenCalledWith('client-1');
    expect(clientServiceSpy.updateClient).toHaveBeenCalledWith(
      'client-1',
      jasmine.objectContaining({ firstName: 'Ana María' })
    );
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/dashboard', 'clients', 'client-1']);
  });
});
