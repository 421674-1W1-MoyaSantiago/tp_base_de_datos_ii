import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="login-container">
      <div class="login-card">
        <h1>Lavadero de Autos</h1>
        <h2>Iniciar Sesión</h2>
        
        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="username">Usuario</label>
            <input 
              id="username"
              type="text" 
              formControlName="username"
              placeholder="Ingrese su usuario"
            />
            @if (loginForm.get('username')?.invalid && loginForm.get('username')?.touched) {
              <span class="error">Usuario requerido</span>
            }
          </div>

          <div class="form-group">
            <label for="password">Contraseña</label>
            <input 
              id="password"
              type="password" 
              formControlName="password"
              placeholder="Ingrese su contraseña"
            />
            @if (loginForm.get('password')?.invalid && loginForm.get('password')?.touched) {
              <span class="error">Contraseña requerida</span>
            }
          </div>

          @if (errorMessage()) {
            <div class="alert alert-error">
              {{ errorMessage() }}
            </div>
          }

          <button 
            type="submit" 
            [disabled]="loginForm.invalid || loading()"
            class="btn-primary"
          >
            @if (loading()) {
              Ingresando...
            } @else {
              Ingresar
            }
          </button>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .login-card {
      background: white;
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.1);
      width: 100%;
      max-width: 400px;
    }

    h1 {
      text-align: center;
      color: #667eea;
      margin-bottom: 0.5rem;
    }

    h2 {
      text-align: center;
      color: #333;
      margin-bottom: 2rem;
      font-size: 1.5rem;
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    label {
      display: block;
      margin-bottom: 0.5rem;
      color: #555;
      font-weight: 500;
    }

    input {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 1rem;
    }

    input:focus {
      outline: none;
      border-color: #667eea;
    }

    .error {
      color: #e74c3c;
      font-size: 0.875rem;
      margin-top: 0.25rem;
      display: block;
    }

    .alert-error {
      background: #fee;
      color: #c33;
      padding: 0.75rem;
      border-radius: 4px;
      margin-bottom: 1rem;
    }

    .btn-primary {
      width: 100%;
      padding: 0.75rem;
      background: #667eea;
      color: white;
      border: none;
      border-radius: 4px;
      font-size: 1rem;
      cursor: pointer;
      transition: background 0.3s;
    }

    .btn-primary:hover:not(:disabled) {
      background: #5568d3;
    }

    .btn-primary:disabled {
      opacity: 0.6;
      cursor: not-allowed;
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

  constructor() {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
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
