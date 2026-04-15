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
                  <ng-container>
                    <mat-icon>login</mat-icon>
                    <span>Ingresar</span>
                  </ng-container>
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
      background:
        radial-gradient(circle at 20% 20%, rgba(255, 193, 7, 0.22) 0%, transparent 40%),
        radial-gradient(circle at 80% 85%, rgba(0, 172, 193, 0.3) 0%, transparent 42%),
        linear-gradient(135deg, #082f49 0%, #0f4c75 52%, #0b3a54 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 28px;
      position: relative;
      overflow: hidden;
    }

    .login-wrapper::before,
    .login-wrapper::after {
      content: '';
      position: absolute;
      border-radius: 999px;
      border: 1px solid rgba(255, 255, 255, 0.14);
      backdrop-filter: blur(1px);
      pointer-events: none;
    }

    .login-wrapper::before {
      width: 420px;
      height: 420px;
      top: -170px;
      left: -130px;
    }

    .login-wrapper::after {
      width: 340px;
      height: 340px;
      bottom: -150px;
      right: -80px;
    }

    .login-container {
      display: grid;
      grid-template-columns: 1fr 1fr;
      max-width: 1000px;
      width: 100%;
      gap: 48px;
      align-items: center;
      position: relative;
      z-index: 1;
    }

    .login-brand {
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
    }

    .brand-content {
      text-align: center;
      max-width: 420px;
    }

    .brand-icon {
      margin-bottom: 26px;
      display: flex;
      justify-content: center;
    }

    .icon-large {
      font-size: 84px !important;
      width: 84px !important;
      height: 84px !important;
      opacity: 0.95;
      filter: drop-shadow(0 8px 20px rgba(0, 0, 0, 0.35));
    }

    .login-brand h1 {
      font-size: 2.75rem;
      font-weight: 700;
      margin: 0 0 12px 0;
      letter-spacing: -0.6px;
      line-height: 1.1;
      text-shadow: 0 6px 24px rgba(0, 0, 0, 0.28);
    }

    .login-brand p {
      font-size: 1.05rem;
      opacity: 0.9;
      margin-bottom: 34px;
      font-weight: 400;
    }

    .brand-features {
      display: flex;
      flex-direction: column;
      gap: 14px;
      align-items: flex-start;
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 14px;
      padding: 16px 18px;
      backdrop-filter: blur(8px);
    }

    .feature {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 0.94rem;
      color: rgba(255, 255, 255, 0.95);
    }

    .feature mat-icon {
      font-size: 20px !important;
      width: 20px !important;
      height: 20px !important;
      color: #ffd166;
    }

    .login-form-container {
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .login-card {
      background: linear-gradient(165deg, rgba(255, 255, 255, 0.96) 0%, rgba(245, 250, 255, 0.95) 100%);
      border-radius: 22px;
      padding: 38px;
      box-shadow:
        0 24px 70px rgba(3, 24, 41, 0.42),
        0 6px 18px rgba(9, 53, 79, 0.18);
      border: 1px solid rgba(255, 255, 255, 0.6);
      width: 100%;
      max-width: 430px;
      position: relative;
    }

    .login-header {
      text-align: center;
      margin-bottom: 30px;
    }

    .login-header h2 {
      font-size: 1.95rem;
      color: #0f3f5d;
      margin-bottom: 6px;
      letter-spacing: -0.3px;
    }

    .login-header p {
      color: #547087;
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
      background-color: #fff1f2;
      color: #9f1239;
      border-left: 4px solid #e11d48;
    }

    .alert-error mat-icon {
      color: #e11d48;
    }

    form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .form-field {
      width: 100%;
    }

    .form-field ::ng-deep .mat-mdc-text-field-wrapper {
      border-radius: 12px;
      background-color: rgba(244, 249, 253, 0.72);
    }

    .form-field ::ng-deep .mdc-notched-outline__leading,
    .form-field ::ng-deep .mdc-notched-outline__notch,
    .form-field ::ng-deep .mdc-notched-outline__trailing {
      border-color: rgba(24, 74, 102, 0.24) !important;
    }

    .form-field ::ng-deep .mat-mdc-form-field:hover .mdc-notched-outline__leading,
    .form-field ::ng-deep .mat-mdc-form-field:hover .mdc-notched-outline__notch,
    .form-field ::ng-deep .mat-mdc-form-field:hover .mdc-notched-outline__trailing {
      border-color: rgba(15, 63, 93, 0.45) !important;
    }

    .form-field ::ng-deep .mat-mdc-form-field.mat-focused .mdc-notched-outline__leading,
    .form-field ::ng-deep .mat-mdc-form-field.mat-focused .mdc-notched-outline__notch,
    .form-field ::ng-deep .mat-mdc-form-field.mat-focused .mdc-notched-outline__trailing {
      border-color: #0284c7 !important;
      border-width: 2px !important;
    }

    .visibility-toggle {
      margin-right: -8px;
    }

    .login-btn {
      height: 50px;
      font-size: 1rem;
      font-weight: 600;
      letter-spacing: 0.35px;
      display: flex;
      gap: 8px;
      justify-content: center;
      align-items: center;
      margin-top: 12px;
      border-radius: 12px;
      background: linear-gradient(120deg, #0ea5a3 0%, #0284c7 52%, #0369a1 100%) !important;
      color: #ffffff !important;
      box-shadow: 0 10px 22px rgba(2, 132, 199, 0.35);
      transition: transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease;
    }

    .login-btn:hover:not([disabled]) {
      transform: translateY(-1px);
      filter: saturate(1.06);
      box-shadow: 0 14px 28px rgba(2, 132, 199, 0.45);
    }

    .login-btn:active:not([disabled]) {
      transform: translateY(0);
    }

    .login-btn mat-icon {
      margin-right: 0;
    }

    .login-btn[disabled] {
      opacity: 0.74;
      box-shadow: none;
    }

    .login-footer {
      text-align: center;
      margin-top: 24px;
      color: #6d879a;
      font-size: 0.875rem;
    }

    @media (max-width: 768px) {
      .login-container {
        grid-template-columns: 1fr;
        gap: 20px;
      }

      .login-brand {
        display: none;
      }

      .login-card {
        padding: 28px 24px;
        max-width: 100%;
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
