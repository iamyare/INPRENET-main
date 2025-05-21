import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-restablecer-contrasena',
  templateUrl: './restablecer-contrasena.component.html',
  styleUrls: ['./restablecer-contrasena.component.scss']
})
export class RestablecerContrasenaComponent implements OnInit {
  form: FormGroup;
  token: string = '';
  cargando: boolean = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {
    this.form = this.fb.group({
      nuevaContrasena: ['', [Validators.required, Validators.minLength(8)]],
      confirmarContrasena: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.token = this.route.snapshot.paramMap.get('token') || '';
    if (!this.token) {
      this.snackBar.open('Enlace inválido o expirado.', 'Cerrar', {
        duration: 3000
      });
      this.router.navigate(['/recuperar-contrasena']);
    }
  }

  onSubmit(): void {
    if (this.form.invalid || this.form.value.nuevaContrasena !== this.form.value.confirmarContrasena) {
      this.snackBar.open('Las contraseñas no coinciden o el formulario no es válido.', 'Cerrar', {
        duration: 3000
      });
      return;
    }

    this.cargando = true;
    const { nuevaContrasena } = this.form.value;

    this.authService.restablecerContrasena(this.token, nuevaContrasena).subscribe({
      next: () => {
        this.snackBar.open('Contraseña restablecida correctamente.', 'Cerrar', {
          duration: 3000
        });
        this.cargando = false;
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.error('Error al restablecer contraseña:', error);
        this.snackBar.open('No se pudo restablecer la contraseña. Inténtelo más tarde.', 'Cerrar', {
          duration: 3000
        });
        this.cargando = false;
      }
    });
  }
}
