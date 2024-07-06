import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-restablecer-contrasena',
  templateUrl: './restablecer-contrasena.component.html',
  styleUrls: ['./restablecer-contrasena.component.scss']
})
export class RestablecerContrasenaComponent {
  resetPasswordForm: FormGroup;
  token: string;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {
    this.token = this.route.snapshot.paramMap.get('token') || '';

    this.resetPasswordForm = this.fb.group({
      nuevaContrasena: ['', [Validators.required, Validators.minLength(8)]],
      confirmarContrasena: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  onSubmit() {
    if (this.resetPasswordForm.invalid) {
      this.snackBar.open('Formulario inválido', 'Cerrar', {
        duration: 3000,
      });
      return;
    }

    if (this.resetPasswordForm.value.nuevaContrasena !== this.resetPasswordForm.value.confirmarContrasena) {
      this.snackBar.open('Las contraseñas no coinciden', 'Cerrar', {
        duration: 3000,
      });
      return;
    }

    this.authService.restablecerContrasena(this.token, this.resetPasswordForm.value.nuevaContrasena).subscribe({
      next: (response) => {
        this.snackBar.open(response.message, 'Cerrar', {
          duration: 3000,
        });
      },
      error: (error) => {
        this.snackBar.open('Error al restablecer la contraseña', 'Cerrar', {
          duration: 3000,
        });
        console.error(error);
      }
    });
  }
}
