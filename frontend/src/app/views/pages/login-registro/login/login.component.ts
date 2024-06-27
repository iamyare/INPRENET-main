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

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onLogin() {
    this.loading = true;
    this.authService.login(this.loginForm.value.email, this.loginForm.value.password).subscribe({
      next: (response) => {
        setTimeout(() => {
          this.loading = false;
          this.router.navigate(['/dashboard']);
          this.toastr.success('Inicio de sesión exitoso', 'Bienvenido');
        }, 1000); // Retraso de 1 segundo
      },
      error: (err) => {
        setTimeout(() => {
          this.loading = false;
          this.toastr.error('Credenciales incorrectas. Por favor, intente de nuevo.', 'Error de inicio de sesión', {
            closeButton: true,
            timeOut: 3000,
          });
          console.error('Login failed:', err);
        }, 1000); // Retraso de 1 segundo
      }
    });
  }

  redirectOlvidoContrasena() {
    this.router.navigate(['/solicitud-restablecimiento']);
  }
}
