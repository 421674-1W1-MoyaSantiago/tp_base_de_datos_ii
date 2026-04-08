import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { EmployeeRole, LoginResponse } from '../../core/models/models';
import { AuthService } from '../../core/services/auth.service';
import { LoginComponent } from './login.component';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  const loginResponse: LoginResponse = {
    token: 'token-123',
    type: 'Bearer',
    id: '1',
    username: 'tester',
    firstName: 'Test',
    lastName: 'User',
    role: EmployeeRole.ADMIN
  };

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj<AuthService>('AuthService', ['login']);
    routerSpy = jasmine.createSpyObj<Router>('Router', ['navigate']);
    routerSpy.navigate.and.returnValue(Promise.resolve(true));

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should initialize with invalid form', () => {
    expect(component).toBeTruthy();
    expect(component.loginForm.valid).toBeFalse();
  });

  it('should not submit when form is invalid', () => {
    component.onSubmit();
    expect(authServiceSpy.login).not.toHaveBeenCalled();
    expect(component.loading()).toBeFalse();
  });

  it('should submit credentials and navigate on success', () => {
    authServiceSpy.login.and.returnValue(of(loginResponse));
    component.loginForm.setValue({ username: 'tester', password: 'secret' });

    component.onSubmit();

    expect(authServiceSpy.login).toHaveBeenCalledWith({ username: 'tester', password: 'secret' });
    expect(component.loading()).toBeTrue();
    expect(component.errorMessage()).toBe('');
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  it('should show error message and stop loading on login error', () => {
    authServiceSpy.login.and.returnValue(throwError(() => ({ error: { message: 'Credenciales inválidas' } })));
    component.loginForm.setValue({ username: 'tester', password: 'wrong' });

    component.onSubmit();

    expect(component.loading()).toBeFalse();
    expect(component.errorMessage()).toBe('Credenciales inválidas');
    expect(routerSpy.navigate).not.toHaveBeenCalled();
  });
});
