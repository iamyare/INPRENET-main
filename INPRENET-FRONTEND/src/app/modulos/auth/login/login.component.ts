import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  loginForm: FormGroup;
  loading: boolean = false;
  passwordVisible: boolean = false; // Variable para controlar la visibilidad de la contraseña

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      rememberMe: [false]
    });

    this.loadStoredEmail();
  }

  loadStoredEmail(): void {
    const storedEmail = localStorage.getItem('email');
    if (storedEmail) {
      this.loginForm.patchValue({
        email: storedEmail,
        rememberMe: true
      });
    }
  }

  onLogin() {
    this.loading = true;
    const { email, password, rememberMe } = this.loginForm.value;

    this.authService.login(email, password).subscribe({
      next: (response) => {
        if (rememberMe) {
          localStorage.setItem('email', email);
        } else {
          localStorage.removeItem('email');
        }

        setTimeout(() => {
          this.loading = false;
          this.router.navigate(['/home']);
          this.toastr.success('Inicio de sesión exitoso', 'Bienvenido');
        }, 1000);
      },
      error: (err) => {
        setTimeout(() => {
          this.loading = false;
          if (err.status === 401) {
            this.toastr.error('Credenciales incorrectas. Por favor, intente de nuevo.', 'Error de inicio de sesión', {
              closeButton: true,
              timeOut: 3000,
            });
          } else {
            this.toastr.error('Ocurrió un error. Por favor, intente de nuevo.', 'Error');
            console.error('Login failed:', err);
          }
        }, 1000);
      }
    });
  }

  togglePasswordVisibility(): void {
    this.passwordVisible = !this.passwordVisible; // Cambia el estado de visibilidad de la contraseña
  }

  redirectOlvidoContrasena() {
    this.router.navigate(['/solicitud-restablecimiento']);
  }
}
