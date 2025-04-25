import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { first } from 'rxjs/operators';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'] // o .css
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  isLoading = false;
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    // Redirige si ya está logueado
    if (this.authService.currentUserValue) {
        this.router.navigate(['/']); // O a la ruta principal de tu app
    }

    this.loginForm = this.fb.group({
      // Define los controles del formulario
      username: ['', [Validators.required, Validators.email]], // Asume email como username, ajusta si no
      password: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    // Lógica adicional al inicializar si es necesaria
  }

  get username() { return this.loginForm.get('username'); }
  get password() { return this.loginForm.get('password'); }

  onSubmit(): void {
    this.errorMessage = null; // Limpia errores previos
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched(); // Marca campos como tocados para mostrar errores
      return; // No envía si el formulario es inválido
    }

    this.isLoading = true; // Muestra indicador de carga

    this.authService.login(this.loginForm.value)
      .pipe(first()) // Toma solo la primera respuesta (éxito o error)
      .subscribe({
        next: () => {
          this.isLoading = false;
          // Redirección manejada por el AuthService o puedes hacerla aquí
          this.router.navigate(['/dashboard']); // Redirige a la ruta deseada post-login
          console.log('Login successful, navigating to dashboard...');
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.message || 'Error en el inicio de sesión.'; // Muestra mensaje de error
          console.error('Login failed:', error);
        }
      });
  }
}
