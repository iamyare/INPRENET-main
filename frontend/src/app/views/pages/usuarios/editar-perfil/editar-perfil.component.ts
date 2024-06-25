import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-editar-perfil',
  templateUrl: './editar-perfil.component.html',
  styleUrls: ['./editar-perfil.component.scss']
})
export class EditarPerfilComponent implements OnInit {
  perfilForm: FormGroup;
  contrasenaForm: FormGroup;
  correo!: string;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {
    this.perfilForm = this.fb.group({
      nombre: [{ value: '', disabled: true }, Validators.required],
      correo: [{ value: '', disabled: true }, Validators.required],
      puesto: [{ value: '', disabled: true }, Validators.required],
      centroTrabajo: [{ value: '', disabled: true }, Validators.required],
      telefono: [{ value: '', disabled: true }, Validators.required],
      // Otros campos que se quieran mostrar
    });

    this.contrasenaForm = this.fb.group({
      nuevaContrasena: ['', Validators.required],
      confirmarContrasena: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.correo = this.authService.obtenerCorreoDelToken()!;
    this.obtenerPerfil();
  }

  obtenerPerfil(): void {
    this.authService.obtenerPerfil(this.correo).subscribe({
      next: (perfil: any) => {
        console.log(perfil);

        this.perfilForm.patchValue({
          nombre: perfil.empleadoCentroTrabajo.empleado.nombreEmpleado,
          correo: perfil.empleadoCentroTrabajo.correo_1,
          puesto: perfil.empleadoCentroTrabajo.nombrePuesto,
          centroTrabajo: perfil.empleadoCentroTrabajo.centroTrabajo.nombre_centro_trabajo,
          telefono: perfil.empleadoCentroTrabajo.centroTrabajo.telefono_1,
          // Otros campos que se quieran mostrar
        });
        this.perfilForm.get('nombre')!.disable();
        this.perfilForm.get('correo')!.disable();
        this.perfilForm.get('puesto')!.disable();
        this.perfilForm.get('centroTrabajo')!.disable();
        this.perfilForm.get('telefono')!.disable();
      },
      error: (err: any) => {
        this.snackBar.open('Error al obtener el perfil del usuario', 'Cerrar', {
          duration: 3000,
        });
      }
    });
  }

  cambiarContrasena(): void {
    if (this.contrasenaForm.value.nuevaContrasena !== this.contrasenaForm.value.confirmarContrasena) {
      this.snackBar.open('Las contraseñas no coinciden', 'Cerrar', {
        duration: 3000,
      });
      return;
    }

    this.authService.cambiarContrasena(this.correo, this.contrasenaForm.value.nuevaContrasena).subscribe({
      next: () => {
        this.snackBar.open('Contraseña cambiada con éxito', 'Cerrar', {
          duration: 3000,
        });
        this.contrasenaForm.reset();
      },
      error: (err: any) => {
        this.snackBar.open('Error al cambiar la contraseña', 'Cerrar', {
          duration: 3000,
        });
      }
    });
  }
}
