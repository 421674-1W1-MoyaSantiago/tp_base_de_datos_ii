import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule
  ],
  template: `
    <div class="login-wrapper">
      <div class="login-container">
        <!-- Left Side - Branding -->
        <div class="login-brand">
          <div class="brand-content">
            <div class="brand-icon">
              <mat-icon class="icon-large">local_car_wash</mat-icon>
            </div>
            <h1>AutoLavado</h1>
            <p>Sistema de Gestión Inteligente</p>
            <div class="brand-features">
              <div class="feature">
                <mat-icon>check_circle</mat-icon>
                <span>Gestión de Clientes</span>
              </div>
              <div class="feature">
                <mat-icon>check_circle</mat-icon>
                <span>Control de Servicios</span>
              </div>
              <div class="feature">
                <mat-icon>check_circle</mat-icon>
                <span>Facturación Automatizada</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Side - Login Form -->
        <div class="login-form-container">
          <div class="login-card">
            <div class="login-header">
              <h2>Bienvenido</h2>
              <p>Ingresa tus credenciales para acceder</p>
            </div>

            @if (errorMessage()) {
              <div class="alert alert-error">
                <mat-icon>error</mat-icon>
                <span>{{ errorMessage() }}</span>
              </div>
            }

            <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
              <mat-form-field appearance="outline" class="form-field">
                <mat-label>Usuario</mat-label>
                <input
                  matInput
                  id="username"
                  type="text"
                  formControlName="username"
                  placeholder="juan.oliveira"
                />
                <mat-icon matPrefix>person</mat-icon>
                @if (loginForm.get('username')?.invalid && loginForm.get('username')?.touched) {
                  <mat-error>Usuario requerido</mat-error>
                }
              </mat-form-field>

              <mat-form-field appearance="outline" class="form-field">
                <mat-label>Contraseña</mat-label>
                <input
                  matInput
                  id="password"
                  [type]="showPassword() ? 'text' : 'password'"
                  formControlName="password"
                  placeholder="••••••••"
                />
                <mat-icon matPrefix>lock</mat-icon>
                <button
                  mat-icon-button
                  matSuffix
                  type="button"
                  (click)="togglePasswordVisibility()"
                  class="visibility-toggle"
                >
                  <mat-icon>{{ showPassword() ? 'visibility' : 'visibility_off' }}</mat-icon>
                </button>
                @if (loginForm.get('password')?.invalid && loginForm.get('password')?.touched) {
                  <mat-error>Contraseña requerida</mat-error>
                }
              </mat-form-field>

              <button
                mat-raised-button
                color="primary"
                class="login-btn"
                type="submit"
                [disabled]="loginForm.invalid || loading()"
              >
                @if (loading()) {
                  <mat-spinner diameter="20"></mat-spinner>
                  <span>Ingresando...</span>
                } @else {
                  <mat-icon>login</mat-icon>
                  <span>Ingresar</span>
                }
              </button>
            </form>

            <div class="login-footer">
              <p>¿Necesitas ayuda? Contacta al administrador</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-wrapper {
      min-height: 100vh;
      background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }

    .login-container {
      display: grid;
      grid-template-columns: 1fr 1fr;
      max-width: 1000px;
      width: 100%;
      gap: 40px;
      align-items: center;
    }

    .login-brand {
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
    }

    .brand-content {
      text-align: center;
    }

    .brand-icon {
      margin-bottom: 30px;
      display: flex;
      justify-content: center;
    }

    .icon-large {
      font-size: 80px !important;
      width: 80px !important;
      height: 80px !important;
      opacity: 0.9;
    }

    .login-brand h1 {
      font-size: 2.5rem;
      font-weight: 700;
      margin: 0 0 10px 0;
      letter-spacing: -0.5px;
    }

    .login-brand p {
      font-size: 1.1rem;
      opacity: 0.9;
      margin-bottom: 40px;
      font-weight: 300;
    }

    .brand-features {
      display: flex;
      flex-direction: column;
      gap: 15px;
      align-items: flex-start;
    }

    .feature {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 0.95rem;

      mat-icon {
        font-size: 20px !important;
        width: 20px !important;
        height: 20px !important;
      }
    }

    .login-form-container {
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .login-card {
      background: white;
      border-radius: 16px;
      padding: 40px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      width: 100%;
      max-width: 400px;
    }

    .login-header {
      text-align: center;
      margin-bottom: 30px;
    }

    .login-header h2 {
      font-size: 1.8rem;
      color: #1976d2;
      margin-bottom: 8px;
    }

    .login-header p {
      color: #757575;
      font-size: 0.95rem;
    }

    .alert {
      padding: 12px 16px;
      border-radius: 8px;
      margin-bottom: 20px;
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .alert-error {
      background-color: #ffebee;
      color: #c62828;
      border-left: 4px solid #f44336;

      mat-icon {
        color: #f44336;
      }
    }

    form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .form-field {
      width: 100%;

      ::ng-deep .mat-mdc-form-field {
        width: 100%;
      }
    }

    .visibility-toggle {
      margin-right: -8px;
    }

    .login-btn {
      height: 48px;
      font-size: 1rem;
      font-weight: 600;
      letter-spacing: 0.5px;
      display: flex;
      gap: 8px;
      justify-content: center;
      align-items: center;
      margin-top: 12px;

      mat-icon {
        margin-right: 0;
      }
    }

    .login-footer {
      text-align: center;
      margin-top: 24px;
      color: #9e9e9e;
      font-size: 0.875rem;
    }

    @media (max-width: 768px) {
      .login-container {
        grid-template-columns: 1fr;
        gap: 30px;
      }

      .login-brand {
        display: none;
      }

      .login-card {
        padding: 30px;
      }

      .login-brand h1 {
        font-size: 2rem;
      }
    }
  `]
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  loginForm: FormGroup;
  loading = signal(false);
  errorMessage = signal('');
  showPassword = signal(false);

  constructor() {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword.update(v => !v);
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.loading.set(true);
      this.errorMessage.set('');

      this.authService.login(this.loginForm.value).subscribe({
        next: () => {
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          this.loading.set(false);
          this.errorMessage.set(error.error?.message || 'Error al iniciar sesión');
        }
      });
    }
  }
}
